require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

// Constants
const MONGODB_URI = process.env.MONGODB_URI_ADMIN;
const DB_NAME = 'aws';
const COLLECTION_NAME = 'posts';
const BATCH_SIZE = 1000;  // Adjust the batch size as needed

const createMaterializedView = async (client, lastId) => {
    const db = client.db(DB_NAME);
    console.log(`Processing documents with _id less than ${lastId}`);
    const pipeline = [
        {
            '$match': {
                '_id': {'$lt': lastId},
            }
        },
        {
            '$sort': {'_id': -1}  // Sorting documents by _id in descending order
        },
        {
            '$limit': BATCH_SIZE  // Limiting the number of documents to process in each batch
        },

        {
            $lookup: {
              from: "users",
              localField: "author",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $unwind: {
              path: "$author",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "related_cluster",
              localField: "_id",
              foreignField: "_id",
              as: "clusterlinks",
            },
          },
          {
            $lookup: {
              from: "related_annoy",
              localField: "_id",
              foreignField: "_id",
              as: "related",
            },
          },
          {
            //removing posts without related with false and keep with true
            $unwind: {
              path: "$related",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $set: {
              related: "$related.posts",
              interlink: "$related.interlink",
            },
          },
          {
            $lookup: {
              from: "comments",
              let: {
                postid: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$post", "$$postid"],
                        },
                        {
                          $lt: ["$toxisity", 0.5],
                        },
                      ],
                    },
                  },
                },
                {
                  $sort: {
                    comment_date: -1,
                  },
                },
                // {$limit:10}
                {
                  $sample: {
                    size: 10,
                  },
                },
              ],
              as: "comments",
            },
          },
          {
            $lookup: {
              from: "classify",
              localField: "_id",
              foreignField: "_id",
              as: "classify",
            },
          },
          {
            $unwind: {
              path: "$classify",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "crosslinks",
              localField: "_id",
              foreignField: "post_id",
              as: "crosslinks",
            },
          },
          {
            $lookup: {
              from: "tv",
              localField: "_id",
              foreignField: "post_id",
              as: "videos",
            },
          },
          {
            $lookup: {
              from: "faq",
              localField: "_id",
              foreignField: "post_id",
              as: "faq",
            },
          },
          {
            $addFields: {
              postIdString: {
                $toString: "$_id",
              },
            },
          },
          {
            $lookup: {
              from: "extensions",
              localField: "postIdString",
              foreignField: "postid",
              as: "elaborate",
            },
          },
          {
            $lookup: {
              from: "interlinks",
              let: {
                first_super_category: {
                  $arrayElemAt: ["$super_categories", 0],
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [
                        "$category",
                        "$$first_super_category",
                      ],
                    },
                  },
                },
                {
                  $sample: {
                    size: 1,
                  },
                },
              ],
              as: "interlinks",
            },
          },


        {
            '$merge': {
                'into': 'MaterializedPosts',  // Name of your materialized view collection
                'on': '_id',  // Field(s) to identify unique documents
                'whenMatched': 'replace',  // Replace the existing document in the materialized view
                'whenNotMatched': 'insert'  // Insert if the document does not exist
            }
        }
    ];
    
    // Execute the aggregation pipeline
    await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray();

    // Get the last document processed by this batch
    const lastDocument = await db.collection('MaterializedPosts')
        .find({})
        .sort({ '_id': 1 })
        .limit(1)
        .toArray();

    // Return the _id of the last document, or null if no documents were processed
    return lastDocument.length > 0 ? lastDocument[0]._id : null;
};


const deleteAllDataFromMaterializedView = async (client) => {
  const db = client.db(DB_NAME);
  try {
      const result = await db.collection('MaterializedPosts').deleteMany({});
      console.log(`${result.deletedCount} documents were deleted from the materialized view collection.`);
  } catch (err) {
      console.error('Error occurred while deleting data from the materialized view collection:', err);
  }
};


const recreateIndexesAndDropCollection = async (client) => {
  const db = client.db(DB_NAME);
  const collection = db.collection('MaterializedPosts');

  try {
      // Retrieve the current indexes
      const indexes = await collection.listIndexes().toArray();
      const indexSpecs = indexes
          .filter(index => index.name !== '_id_')  // Exclude the default _id index
          .map(index => ({
              key: index.key,
              name: index.name,
              unique: index.unique || false,
              sparse: index.sparse || false,
          }));

      // Drop the collection
      await collection.drop();
      console.log('Materialized view collection dropped successfully.');

      // Recreate the indexes on the new collection
      if (indexSpecs.length > 0) {
          await db.collection('MaterializedPosts').createIndexes(indexSpecs);
          console.log('Indexes recreated successfully.');
      }
  } catch (err) {
      if (err.codeName === 'NamespaceNotFound') {
          console.log('Materialized view collection does not exist, no need to drop.');
      } else {
          console.error('Error occurred while dropping and recreating indexes:', err);
      }
  }
};


const main = async () => {
    const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        
        // Delete all data from the existing materialized view collection
        await deleteAllDataFromMaterializedView(client);

        // Drop the collection and recreate indexes
        // await recreateIndexesAndDropCollection(client);

        let lastId = new ObjectId('ffffffffffffffffffffffff');


        while (true) {
            console.log(`Processing documents with _id less than ${lastId}`);
            const db = client.db(DB_NAME);
            const remainingDocs = await db.collection(COLLECTION_NAME).countDocuments({
              '_id': {'$lt': lastId},
            });
            console.log(`Remaining documents: ${remainingDocs}`);
            if (remainingDocs === 0) {
                break;
            }

            const lastProcessedId = await createMaterializedView(client, lastId);
            console.log(`Last processed _id: ${lastProcessedId}`);
            if (!lastProcessedId) {
                break;  // No more documents were processed, break the loop
            }
            lastId = lastProcessedId;
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
};

main();