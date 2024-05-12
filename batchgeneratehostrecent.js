const { MongoClient } = require('mongodb');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
require('dotenv').config();

const parser = require('./helpers/parser.js');
const pipelinePost = require('./helpers/pipelinePost.js');

// Validate command line argument or environment variable for host
const host = process.argv[2] || process.env.HOST;
if (!host) {
    console.log('Usage: node batchgeneratehost.js <host>');
    process.exit(1);
}
console.log('Host:', host);

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Batch process configuration
const batchSize = 10; // Number of documents per batch
console.log('Batch Size:', batchSize);
const databaseName = 'aws';
const collectionName = 'posts'; // or 'MaterializedPosts'

let marker = null; // Marker for last processed document
let filter = { '$match': { 'host': host } }; // Filter for the aggregation pipeline

const startTime = new Date();
exec('rm -rf ./batch/*'); // Clean the batch directory before starting
console.log('Start Time:', startTime);
let run = 0;

async function generateBatch() {
    run++;
    console.log(`Run ${run}`);

    console.log('Connecting to MongoDB');
    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    const pipeline = [
        filter,
        { $sort: { post_modified: -1 } },
        { $limit: batchSize },
        ...pipelinePost  // Remove if using MaterializedPosts
        // Add additional pipeline stages if needed
    ];

    if (marker) {
        pipeline.unshift({ $match: { _id: { $gt: marker } } });
    }

    const result = await collection.aggregate(pipeline).toArray();
    if (result.length > 0) {
        marker = result[result.length - 1]._id;
        const parsed = result.map(parser);
        fs.writeFileSync('./_marker.json', JSON.stringify({ lastPostId: marker }));

        console.log(`Generated batch. Last post ID: ${marker}`);

        // Write the posts.json file and make a build
        fs.writeFileSync(`./src/_data/posts.json`, JSON.stringify(parsed, null, 2));
        await runEleventyBuild();

        // Optional: Uncomment to automatically continue with the next batch
        // await generateBatch();
    } else {
        logCompletion();
    }

    await client.close();
}

async function runEleventyBuild() {
    const buildStartTime = new Date();
    console.log('Running Eleventy build...');
    await exec('npm run build');
    console.log('Eleventy build completed.');
    const buildEndTime = new Date();
    const buildDuration = (buildEndTime - buildStartTime) / 1000;
    console.log(`Build Time (seconds): ${buildDuration}`);
}

function logCompletion() {
    const endTime = new Date();
    const duration = (endTime - startTime) / 60000; // Duration in minutes

    console.log('No more documents to process. Batch generation completed.');
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log(`Duration (minutes): ${duration}`);
}

// Start the batch generation process
generateBatch();
