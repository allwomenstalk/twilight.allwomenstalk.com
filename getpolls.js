// const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const path = './src/_data/polls.json'; // Specify the file path for the output JSON file
const { aggregate } = require('./helpers/dataApi');

// const client = new MongoClient(uri, { useUnifiedTopology: true });

async function run() {
  let arr = [];

  try {
    // console.log('Connecting to MongoDB');
    // await client.connect();
    // const database = client.db('aws'); // Replace with your database name
    // const collection = database.collection('polls'); // Use the 'poll' collection

    const pipeline = [
      {
        $group: {
          _id: '$category',
          list: { $push: '$$ROOT' }
        }
      }
    ];

    // const cursor = await collection.aggregate(pipeline).toArray();
    const cursor =  await aggregate("Cluster0", "aws", "polls", pipeline);
    console.log('cursor', cursor);
    obj = {}
    await cursor.forEach((item) => {
      obj[item._id] = item.list;
      // arr.push(item);
    });

    // Save the result as 'polls.json'
    fs.writeFileSync(path, JSON.stringify(obj, null, 2));
    console.log('The file has been saved as "polls.json"');
  } finally {
    // await client.close();
  }
}

if (require.main === module) {
  console.log('Running getpolls.js');
  run().catch(console.dir);
}
