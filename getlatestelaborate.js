const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function fetchAndSaveUniquePostIds() {
  try {
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('extensions');

    // Fetch the latest 2000 documents by "date"
    const documents = await collection.find({})
                                       .sort({date: -1})
                                       .limit(2000)
                                       .project({postid: 1, _id: 0})
                                       .toArray();

    // Extracting unique post IDs using a Set to avoid duplicates
    const postIds = [...new Set(documents.map(doc => doc.postid))];

    // Ensuring the './helpers' directory exists
    const dirPath = path.join(__dirname, 'helpers');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // 'recursive: true' ensures that the directory is created if it does not exist
    }

    // Saving the unique post IDs into 'ids.json' within the './helpers' directory
    const filePath = path.join(dirPath, 'ids.json');
    fs.writeFileSync(filePath, JSON.stringify(postIds, null, 2));

    console.log(`Saved ${postIds.length} unique post IDs to ${filePath}`);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await client.close();
  }
}

fetchAndSaveUniquePostIds();
