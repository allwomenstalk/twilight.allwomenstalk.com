const { MongoClient } = require('mongodb');
const fs = require('fs');
// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb+srv://11tyreadonly:HN0hLpLTZD2sAJNG@cluster0.jfcrg.gcp.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });

// log current path with fs 
console.log('current path',fs.realpathSync('.'))

const parser = require(fs.realpathSync('.')+"/helpers/parser.js")
const mongopipelines = require('./pipelines.js')
const pipelinePost = require('./pipelinePost.js')

const month = new Date().getMonth() + 1;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const marr = [
  ...months.slice(month >= 3 ? 12 : month - 3),
  ...months.slice(month - 3 < 0 ? 0 : month - 3, month),
];

try {
  var arr = JSON.parse(fs.readFileSync('./src/_data/cache.json', 'utf8'));
  console.log("Local file found")
} catch (err) {
  console.log("No local file")
}

// var arr = undefined;


module.exports = async () => {
  if (arr) { 
    console.log("Post Count: ",arr.length)
    return arr 
  }
  try {
    console.log("Connecting to MongoDB")
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('posts');
    
    const limitperbuild = process.env.NODE_ENV==="production"?100:100;
    const filter = global[process.env.PIPE?process.env.PIPE:'pipeline_iframe']
    console.log('fitler pipeline name:',process.env.PIPE, filter)
    // console.log(JSON.stringify(pipeline_marker,null,2))
    const pipeline = [
      {
        '$match': {
          'host': new RegExp('allwomenstalk.com')
        }
      },
      ...filter ,
      {'$limit': limitperbuild},
      ...pipelinePost
    ]
    // console.log('mongodb pipeline:')
    // console.log(JSON.stringify(pipeline,null,4))

    const cursor = await collection.aggregate(pipeline);
    const arr = [];
    await cursor.forEach( (item) => {
      arr.push(parser(item))
    });
    fs.writeFileSync('./src/_data/cache.json', JSON.stringify(arr,null,4));
    // console.log('last id',JSON.stringify([arr.at(-1).id]))
    // (arr.lengh==limitperbuild)?[arr.at(-1).id]:[]
    console.log('process.env.NODE_ENV',process.env.NODE_ENV)
    console.log('arr legnth',arr.length)
    if (arr.length>0 && process.env.NODE_ENV==="production") {  
      var lastpost = arr[arr.length-1]  
      fs.writeFileSync('./_marker.json', JSON.stringify([lastpost.date]))
      console.log('marker updated from',JSON.stringify([arr[0].date]),'to',JSON.stringify([lastpost.date]))
    }
    // console.log(arr)
    return arr;
  } finally {
    await client.close();
  }
};

