// const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();
const { aggregate } = require('./helpers/dataApi');

// const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });

async function saveCollectionData(collectionName, filePath) {
  try {
    // await client.connect();
    // const data = await client.db('aws').collection(collectionName).find({}).toArray();
    const pipeline = [{ $match: {} }];
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
  saveCollectionData('mix', './src/_data/mixlist.json').catch(console.error);
}
