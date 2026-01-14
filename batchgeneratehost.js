const { MongoClient, ObjectId } = require('mongodb');
const { spawn } = require('child_process');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { aggregate } = require('./helpers/dataApi');
require('dotenv').config();
const path = require('path');

const parser = require('./helpers/parser.js');
const pipelinePost = require('./helpers/pipelinePost.js');


// Check if command line argument is provided
const host = process.argv.length >= 3 ? process.argv[2] : process.env.HOST;

if (!host) {
  console.log('Usage: node batchgeneratehost.js <host>');
  process.exit(1);
}

console.log('Host:', host);
console.log("Cleaning logs ...");
exec(`rm -rf ./logs/${host}.txt`); // Clean the logs directory before starting

// Check for specific post ID in environment variables
const specificPostId = process.env.POST_ID;
console.log('Specific Post ID:', specificPostId);

// Batch size
const batchSize = 100;
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
        "$match": {
          "$expr": {
            "$gt": [
              { "$toObjectId": "$_id" },
              { "$toObjectId": marker }
            ]
          }
        }
      }
      pipeline.unshift(stage);
    }
  }

  // console.log('Pipeline:', JSON.stringify(pipeline, null, 2));
  let retult = false
  try {
    result = await aggregate('cluster1', 'aws', 'posts', pipeline);
    // console.log("++++++++++++++++++")
    // console.log('result', result)
    console.log("------------------")
    console.log('Posts in results:', result.length);
  } catch (e) {
    console.log("!!!!!!!")
    console.log(e)
  }

  if (result && result.length > 0) {
    const lastIndex = result.length - 1;
    const lastPostId = result[lastIndex]._id.toString();
    console.log('Last post id', lastPostId)
    const parsed = result.map(parser);

    // create batch directory if it's not exits
    if (!fs.existsSync('./batch')) {
      fs.mkdirSync('./batch');
    }

    fs.writeFileSync(`./batch/posts_${run}.json`, JSON.stringify(parsed, null, 2));
    fs.writeFileSync('./_marker.json', JSON.stringify({ lastPostId }));
    console.log(`Generated batch. Last post ID: ${lastPostId}`);

    fs.writeFileSync(`./src/_data/posts.json`, JSON.stringify(parsed, null, 2));
    await runEleventyBuild(host); // Initiate 11ty build

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

async function runEleventyBuild(host) {
  try {
    const buildStartTime = new Date(); // Record the start time of the build
    console.log('Running Eleventy build...');

    const logDir = path.join(__dirname, 'logs');
    const logFile = path.join(logDir, `${host}.txt`);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    logStream.write(`\n\n===== Build started at ${buildStartTime.toISOString()} =====\n`);

    const buildProcess = spawn('npm', ['run', 'build'], { shell: true });

    if (buildProcess.stdout && buildProcess.stderr) {
      buildProcess.stdout.pipe(logStream);
      buildProcess.stderr.pipe(logStream);
    } else {
      console.error('Error: stdout or stderr is undefined.');
      return;
    }

    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build process exited with code ${code}`));
        }
      });
    });

    const buildEndTime = new Date(); // Record the end time of the build
    const buildDuration = Math.round((buildEndTime - buildStartTime) / 1000); // Duration in seconds

    logStream.write(`\n===== Build completed at ${buildEndTime.toISOString()} =====\n`);
    logStream.write(`Build Time (seconds): ${buildDuration}\n`);

    logStream.end();

    console.log('Eleventy build completed.');
    // print out logs 
    console.log('Logs:');
    const logs = fs.readFileSync(logFile, 'utf8');
    console.log(logs);

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

// delete file _marker.json if it's exits 
if (fs.existsSync('./_marker.json')) {
  fs.unlinkSync('./_marker.json');
}

generateBatch();
