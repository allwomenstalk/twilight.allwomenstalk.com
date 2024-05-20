// const { MongoClient } = require('mongodb');
const moment = require('moment');
const fs = require('fs');

const { aggregate } = require('./helpers/dataApi');

require('dotenv').config()


const parser = require(fs.realpathSync('.') + "/helpers/parserarchive.js");

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri, { useUnifiedTopology: true });

let path = './src/_data/popularlist.json'
let arr = []

function SaveData(name, arr) {
  fs.writeFile(name,JSON.stringify(arr,null,2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}

async function run () {

  try {
    // replaceing mogngodb driver with data api
    // await client.connect();
    // const database = client.db('aws');
    // const collection = database.collection('posts');

    pipeline = [
      {
         "$sort":{
            "seo.clicks":-1
         }
      },
      {
        '$lookup': {
          'from': 'users',
          'localField': 'author',
          'foreignField': '_id',
          'as': 'author'
        }
      },
      {
        '$addFields': {
          'author': {
            '$arrayElemAt': ['$author', 0]
          }
        }
      },
      {
         "$limit":125
      }
   ]
  //  potetntially can add keyowrds as well to use as ALT tags

    // const cursor = await collection.aggregate(pipeline);
    const cursor = await aggregate("Cluster0", "aws", "posts", pipeline);
    arr = [];
    await cursor.forEach((item) => {
      
      temp = parser(item)
      temp.stats = item.seo

      arr.push(temp);
    });
    // shuffle
    // arr.sort(() => Math.random() - 0.5);
    SaveData(path,arr)
    return arr;
  } finally {
    // await client.close();
  }
};



if (require.main === module) {
  console.log("Running getpopular.js")
  run().catch(console.dir);
}

// module.exports = run 