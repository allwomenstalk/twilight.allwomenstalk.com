const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const path = './src/_data/quizzes.json'; // Specify the file path for the output JSON file

const client = new MongoClient(uri, { useUnifiedTopology: true });

async function run() {
  let arr = [];

  try {
    console.log('Connecting to MongoDB');
    await client.connect();
    const database = client.db('aws'); // Replace with your database name
    const collection = database.collection('quiz'); // Use the 'poll' collection


    const cursor = await collection.find({}).toArray();
    obj = {};
    // process the cursor and make obj with key = post_id and value whole doc
    cursor.forEach(doc => {
      obj[doc.post_id] = doc;
    });

    // Save the result as 'polls.json'
    fs.writeFileSync(path, JSON.stringify(obj, null, 2));
    console.log("Total Quizzes: ", Object.keys(obj).length);
    console.log('The file has been saved as "quizzes.json"');

    // save post_ids to file _ids.json
    fs.writeFileSync('./helpers/ids.json', JSON.stringify(Object.keys(obj), null, 2));

  } finally {
    await client.close();
  }
}

if (require.main === module) {
  console.log('Running getquizzes.js');
  run().catch(console.dir);
}
