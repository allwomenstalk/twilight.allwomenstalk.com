const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { aggregate } = require('./helpers/dataApi');
require('dotenv').config();

const parser = require('./helpers/parser.js');
const pipelinePost = require('./helpers/pipelinePost.js');

// Check if command line argument is provided
const host = process.argv.length >= 3 ? process.argv[2] : process.env.HOST;

if (!host) {
  console.log('Usage: node batchgeneratehost.js <host>');
  process.exit(1);
}

console.log('Host:', host);

// Check for specific post ID in environment variables
const specificPostId = process.env.POST_ID;
console.log('Specific Post ID:', specificPostId);

// Batch size
const batchSize = 500; 
console.log('Batch Size:', batchSize);

let marker = null; // Marker to keep track of the last processed document
const filter = [
  { '$match': { 'host': host } }
];

const startTime = new Date();
exec('rm -rf ./batch/*'); // Clean the batch directory before starting
console.log('Start Time:', startTime);
let run = 0;

async function generateBatch() {
  run++;
  console.log(`Run ${run}`);

  let pipeline;
  if (specificPostId) {
    pipeline = [
      { $match: { _id: new ObjectId(specificPostId) } },
      ...pipelinePost
    ];
  } else {
    pipeline = [
      ...filter,
      { $sort: { _id: 1 } },
      { $limit: batchSize },
      ...pipelinePost
    ];

    if (marker) {
      stage = {
        $match: {
          $expr: {
            $gt: [
              '$_id',
              { $toObjectId: marker }
            ]
          }
        }
      }
      pipeline.unshift(stage);
    }
  }

  // console.log('Pipeline:', JSON.stringify(pipeline, null, 2));
  const result = await aggregate('Cluster0', 'aws', 'posts', pipeline);
  console.log('Posts in results:', result.length);

  if (result.length > 0) {
    const lastIndex = result.length - 1;
    const lastPostId = result[lastIndex]._id.toString();
    const parsed = result.map(parser);

    fs.writeFileSync(`./batch/posts_${run}.json`, JSON.stringify(parsed, null, 2));
    fs.writeFileSync('./_marker.json', JSON.stringify({ lastPostId }));
    console.log(`Generated batch. Last post ID: ${lastPostId}`);

    fs.writeFileSync(`./src/_data/posts.json`, JSON.stringify(parsed, null, 2));
    await runEleventyBuild(); // Initiate 11ty build

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

generateBatch();
