// const { MongoClient } = require('mongodb');
const fs = require('fs');
const { aggregate } = require('./helpers/dataApi');

require('dotenv').config();

// const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });

async function saveCollectionData(collectionName, filePath) {
  try {
    // await client.connect();
    const pipeline = [
      {
        $lookup: {
          from: 'posts',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$userId'] } } },
            { $sample: { size: 100 } },
            { $addFields: { imageresize: { $replaceAll: { input: "$image_url", find: "img.allw.mn", replacement: "resize.allw.mn/400x400" } } } },
            { $project: { title : '$post_title', imageresize: 1, url: 1 } }
          ],
          as: 'posts'
        }
      }
    ];
    // const data = await client.db('aws').collection(collectionName).aggregate(pipeline).toArray();
    const data = await aggregate('Cluster0', 'aws', collectionName, pipeline);
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
