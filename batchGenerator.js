const { MongoClient } = require('mongodb');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config();

const parser = require('./helpers/parser.js');
const pipelinePost = require('./helpers/pipelinePost.js');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

const batchSize = 1000; // Number of documents per batch

let marker = null; // Marker to keep track of the last processed document
let filter = [
  {
    '$match': {
      'host': new RegExp('allwomenstalk.com')
    }
  }
]; // Filter to be used in the aggregation pipeline

const startTime = new Date();
let run = 0;
async function generateBatch() {
  
  run++;
  console.log(`Run ${run}`);
  if (!marker) {
    
    await exec('npm run clean'); // Clean the _site directory before the first batch
  }

  console.log('Connecting to MongoDB');
  await client.connect();
  const database = client.db('aws');
  const collection = database.collection('posts');

  const pipeline = [
    ...filter,
    { $sort: { _id: 1 } },
    { $limit: batchSize },
    ...pipelinePost
    // Add additional pipeline stages if needed
  ];

  if (marker) {
    pipeline.unshift({ $match: { _id: { $gt: marker } } });
  }

  const result = await collection.aggregate(pipeline).toArray();

  if (result.length > 0) {
    const lastIndex = result.length - 1;
    const lastPostId = result[lastIndex]._id;
    parsed = result.map(parser);
    fs.writeFileSync('./src/_data/posts.json', JSON.stringify(parsed, null, 2));
    fs.writeFileSync('./_marker.json', JSON.stringify({ lastPostId }));

    console.log(`Generated batch. Last post ID: ${lastPostId}`);

    await runEleventyBuild(); // Initiate 11ty build

    marker = lastPostId;

    await generateBatch(); // Proceed to the next batch
  } else {
    console.log('Generating archive...');
    await generateArchive();
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000 / 60); // Duration in minutes

    console.log('No more documents to process. Batch generation completed.');
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Duration (minutes):', duration);
  }

  await client.close();
}

async function runEleventyBuild() {
  try {
    console.log('Running Eleventy build...');
    await exec('npm run build');
    console.log('Eleventy build completed.');
  } catch (error) {
    console.error('Error running Eleventy build:', error);
  }
}


async function generateArchive() {
  try {
    console.log('Running Eleventy build...');
    await exec('node getarchives.js');
    await exec('npm run build');
    console.log('Eleventy build completed.');
  } catch (error) {
    console.error('Error running Eleventy build:', error);
  }
}


// Usage

generateBatch();
