const { MongoClient } = require('mongodb');
const fs = require('fs');

require('dotenv').config();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true });
const filename = './src/_data/reviews.json'; // updated filename


let arr = undefined;
try {
  console.log("Local file found");
} catch (err) {
  console.log("No local file");
}

main = async () => {
  if (arr) {
    console.log("Review Count: ", arr.length);
    return arr;
  }
  try {
    console.log("Connecting to MongoDB");
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('reviews'); // point to the reviews collection

    const filter = {}; // Assuming you don't need a specific filter for reviews

    const pipeline = [
      { '$match': filter },
      { '$sample': { 'size': 55 } } // get a sample of 25 documents
    ];

    const cursor = await collection.aggregate(pipeline);
    const arr = [];
    await cursor.forEach((item) => {
      arr.push(item);
    });
    fs.writeFileSync(filename, JSON.stringify(arr, null, 4));

    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log('arr length', arr.length);

    return arr;
  } finally {
    await client.close();
  }
};

main(); // run the async function
