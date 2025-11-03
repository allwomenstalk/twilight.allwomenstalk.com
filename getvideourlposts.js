const { aggregate } = require('./helpers/dataApi');
const fs = require('fs');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost');
const mongopipelines = require('./helpers/pipelines');
require('dotenv').config();

const filename = './src/_data/posts.json';

console.log('Using pipeline_video_posts for posts with video_url field');

async function run() {
  try {
    console.log("Starting the video posts aggregation process...");
    
    // Build pipeline using the video posts filter
    const filter = pipeline_video_posts;
    if (!filter) {
      console.error('Pipeline "pipeline_video_posts" not found.');
      return;
    }

    const pipeline = [
      {
        $match: {
          host: { $regex: 'allwomenstalk.com' },
        },
      },
      ...filter,
      { $limit: 1000 },
      ...pipelinePost,
    ];

    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

    // Execute aggregation using data API
    const cursor = await aggregate("Cluster0", "aws", "posts", pipeline);

    if (!cursor || cursor.length === 0) {
      console.log("No video posts found.");
      return;
    }

    const results = cursor.map((item) => parser(item)).filter(Boolean);
    console.log(`Total video posts found: ${results.length}`);

    // Write results to file
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`Video posts saved to ${filename} (replacing existing posts.json)`);

    return results;
  } catch (error) {
    console.error("Error during video posts aggregation:", error);
  }
}

if (require.main === module) {
  run().catch(console.dir);
}

module.exports = run;