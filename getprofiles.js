// const { MongoClient } = require('mongodb');
const fs = require('fs');
const { aggregate } = require('./helpers/dataApi');

require('dotenv').config();

// const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });

const PROFILE_LIMIT = Number.parseInt(process.env.PROFILE_LIMIT || '300', 10);
const PROFILE_POST_LIMIT = Number.parseInt(process.env.PROFILE_POST_LIMIT || '12', 10);

async function saveCollectionData(collectionName, filePath) {
  try {
    // await client.connect();
    const pipeline = [
      {
        $match: {
          display_name: { $exists: true, $ne: '' }
        }
      },
      {
        $project: {
          _id: 1,
          display_name: 1,
          avatar: 1,
          description: 1
        }
      },
      {
        $sort: { display_name: 1 }
      },
      {
        $limit: PROFILE_LIMIT
      },
      {
        $lookup: {
          from: 'posts',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$userId'] } } },
            { $sort: { post_date: -1 } },
            { $limit: PROFILE_POST_LIMIT },
            { $addFields: { imageresize: { $replaceAll: { input: "$image_url", find: "img.allw.mn", replacement: "resize.allw.mn/400x400" } } } },
            {
              $project: {
                _id: 1,
                title: '$post_title',
                post_title: 1,
                image: '$image_url',
                imageresize: 1,
                url: 1,
                post_name: 1,
                super_categories: 1,
                post_date: 1
              }
            }
          ],
          as: 'posts'
        }
      }
    ];
    // const data = await client.db('aws').collection(collectionName).aggregate(pipeline).toArray();
    const data = await aggregate('cluster1', 'aws', collectionName, pipeline);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Data saved to', filePath);
  } catch (err) {
    console.error(err);
  } finally {
    // await client.close();
  }
}

if (require.main === module) {
  saveCollectionData('users', './src/_data/profiles.json').catch(console.error);
}
