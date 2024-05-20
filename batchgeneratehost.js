const { MongoClient, ObjectId } = require('mongodb');

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { aggregate } = require('./helpers/dataApi');

require('dotenv').config();

const parser = require('./helpers/parser.js');
const pipelinePost = require('./helpers/pipelinePost.js');
const { env } = require('process');

// Check if command line argument is provided
if (process.argv.length >= 3) {
  var host = process.argv[2];
} else {
  // If not, try using the environment variable
  var host = process.env.HOST;
  if (!host) {
    // If environment variable is also not available, log usage and exit
    console.log('Usage: node batchgeneratehost.js <host>');
    process.exit(1);
  }
}

console.log('Host:', host);

// Check for specific post ID in environment variables
const specificPostId = process.env.POST_ID;
console.log('Specific Post ID:', specificPostId);

// Track time
// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, { useUnifiedTopology: true });

const batchSize = 1000; // Number of documents per batch
console.log('Batch Size:', batchSize);

let marker = null; // Marker to keep track of the last processed document
let filter = [
  {
    '$match': {
      'host': host,
    }
  }
]; // Filter to be used in the aggregation pipeline

const startTime = new Date();
exec('rm -rf ./batch/*'); // Clean the batch directory before starting
console.log('Start Time:', startTime);
let run = 0;

async function generateBatch() {
  run++;
  console.log(`Run ${run}`);
  if (!marker) {
    // await exec('npm run clean'); // Clean the _site directory before the first batch
  }

  // console.log('Connecting to MongoDB');
  // await client.connect();
  // const database = client.db('aws');
  // const collection = database.collection('posts'); // or 'MaterializedPosts'
  

  let pipeline;
  if (specificPostId) {
    // If specific post ID is provided, generate only that post
    pipeline = [
      { $match: { _id: new ObjectId(specificPostId) } },
      ...pipelinePost // remove if use MaterializedPosts
    ];
  } else {
    // Otherwise, generate batches for the entire domain
    pipeline = [
      ...filter,
      { $sort: { _id: 1 } },
      { $limit: batchSize },
      ...pipelinePost // remove if use MaterializedPosts
    ];

    if (marker) {
      pipeline.unshift({ $match: { _id: { $gt: marker } } });
    }
  }

  // const result = await collection.aggregate(pipeline).toArray();
  const result = await aggregate('Cluster0', 'aws', 'posts', pipeline);

  if (result.length > 0) {
    const lastIndex = result.length - 1;
    const lastPostId = result[lastIndex]._id;
    const parsed = result.map(parser);
    fs.writeFileSync(`./batch/posts_${run}.json`, JSON.stringify(parsed, null, 2));
    fs.writeFileSync('./_marker.json', JSON.stringify({ lastPostId }));

    console.log(`Generated batch. Last post ID: ${lastPostId}`);

    // Write the posts.json file and make a build
    fs.writeFileSync(`./src/_data/posts.json`, JSON.stringify(parsed, null, 2));
    await runEleventyBuild(); // Initiate 11ty build

    // console.log('Uploading to S3...');
    // await exec('sh postupload.sh');
    // console.log('Upload completed.');

    marker = lastPostId;

    if (!specificPostId) {
      await generateBatch(); // Proceed to the next batch if not generating a specific post
    } else {
      console.log('Specific post generation completed.');
    }
  } else {
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
    const buildStartTime = new Date(); // Record the start time of the build
    console.log('Running Eleventy build...');
    await exec('npm run build');
    console.log('Eleventy build completed.');
    const buildEndTime = new Date(); // Record the end time of the build
    const buildDuration = Math.round((buildEndTime - buildStartTime) / 1000); // Duration in seconds
    console.log('Build Time (seconds):', buildDuration); // Output the build time
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
