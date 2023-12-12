const { MongoClient } = require('mongodb');
const fs = require('fs');

require('dotenv').config();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true });
const filename = './src/_data/posts.json';

const parser = require(fs.realpathSync('.') + "/helpers/parser.js");
const mongopipelines = require('./helpers/pipelines.js');
const pipelinePost = require('./helpers/pipelinePost.js');


const month = new Date().getMonth() + 1;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const marr = [
  ...months.slice(month >= 3 ? 12 : month - 3),
  ...months.slice(month - 3 < 0 ? 0 : month - 3, month),
];

// default_pipeline = 'pipeline_comments1000plus'
// default_pipeline = 'pipeline_seo_top'
// default_pipeline = 'pipeline_category'
default_pipeline = 'pipeline_host'
// default_pipeline = 'pipeline_faq'
// default_pipeline = 'pipeline_realtime'
// default_pipeline = 'pipeline_name'
// default_pipeline = 'pipeline_filter'
// default_pipeline = "pipeline_recent_updated"
// default_pipeline = "pipeline_recent"
// default_pipeline = "pipeline_related_embeddings"
// default_pipeline = "pipeline_without_h2"

console.log('process.env.PIPE', process.env.PIPE);
console.log('Default pipeline', default_pipeline);

arr = undefined;
try {
  // var arr = JSON.parse(fs.readFileSync(filename, 'utf8'));
  console.log("Local file found");
} catch (err) {
  console.log("No local file");
}

main = async () => {
  if (arr) {
    console.log("Post Count: ", arr.length);
    return arr;
  }
  try {
    console.log("Connecting to MongoDB");
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('posts');

    const limitperbuild = process.env.NODE_ENV === "production" ? 10000 : 10000;
    const filter = global[process.env.PIPE ? process.env.PIPE : default_pipeline];
    console.log('fitler pipeline name:', process.env.PIPE, filter);

    const pipeline = [
      {
        '$match': {
          'host': new RegExp('allwomenstalk.com')
        }
      },
      ...filter,
      { '$limit': limitperbuild },
      ...pipelinePost
    ];

    const cursor = await collection.aggregate(pipeline);
    const arr = [];
    await cursor.forEach((item) => {
      arr.push(parser(item));
    });
    fs.writeFileSync(filename, JSON.stringify(arr, null, 4));

    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log('arr length', arr.length);

    if (arr.length > 0 && process.env.NODE_ENV === "production") {
      var lastpost = arr[arr.length - 1];
      fs.writeFileSync('./_marker.json', JSON.stringify([lastpost.date]));
      console.log('marker updated from', JSON.stringify([arr[0].date]), 'to', JSON.stringify([lastpost.date]));
    }

    return arr;
  } finally {
    await client.close();
  }
};

main() // run the async function
