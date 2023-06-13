const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

const parser = require(fs.realpathSync('.') + "/helpers/parser.js");
const mongopipelines = require('./pipelines.js');
const pipelinePost = require('./pipelinePost.js');

const month = new Date().getMonth() + 1;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const marr = [
  ...months.slice(month >= 3 ? 12 : month - 3),
  ...months.slice(month - 3 < 0 ? 0 : month - 3, month),
];

try {
  var arr = JSON.parse(fs.readFileSync('./src/_data/cache.json', 'utf8'));
  console.log("Local file found");
} catch (err) {
  console.log("No local file");
}

module.exports = async () => {
  if (arr) {
    console.log("Post Count: ", arr.length);
    return arr;
  }
  try {
    console.log("Connecting to MongoDB");
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('posts');

    const limitperbuild = process.env.NODE_ENV === "production" ? 10000 : 100;
    const filter = global[process.env.PIPE ? process.env.PIPE : 'pipeline_category'];
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
    fs.writeFileSync('./src/_data/cache.json', JSON.stringify(arr, null, 4));

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
