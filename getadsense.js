// const { MongoClient } = require('mongodb');
const moment = require('moment');
const fs = require('fs');
const { aggregate } = require('./helpers/dataApi');
require('dotenv').config()
// const uri = process.env.MONGODB_URI;

const parser = require(fs.realpathSync('.') + "/helpers/parserarchive.js");

// const client = new MongoClient(uri, { useUnifiedTopology: true });

let path = './src/_data/adsense.json'
let arr = []

function SaveData(name, arr) {
  fs.writeFile(name,JSON.stringify(arr,null,2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}

async function run () {

  try {
    // await client.connect();
    // const database = client.db('aws');
    // const collection = database.collection('adsense');

    const pipeline = [
        {
          $sort: {
            "Estimated earnings (USD)": -1,
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "slug",
            foreignField: "post_name",
            as: "post",
          },
        },
        {
          $match: {
            "post.0": {
              $exists: true,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "post.author",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $project: {
            _id: {
              $arrayElemAt: ["$post._id", 0],
            },
            post_title: {
              $arrayElemAt: ["$post.post_title", 0],
            },
            url: {
              $arrayElemAt: ["$post.url", 0],
            },
            host: {
              $arrayElemAt: ["$post.host", 0],
            },
            post_date: {
              $arrayElemAt: ["$post.post_date", 0],
            },
            author: {
              $arrayElemAt: ["$author", 0],
            },
            post_name: {
              $arrayElemAt: ["$post.post_name", 0],
            },
            super_categories: {
              $arrayElemAt: [
                "$post.super_categories",
                0,
              ],
            },
            blog: {
              $arrayElemAt: ["$post.blog", 0],
            },
            image_url: {
              $arrayElemAt: ["$post.image_url", 0],
            },
            RPM: "$Page RPM (USD)",
            Revenue: "$Estimated earnings (USD)",
          },
        },
      ];


    // const cursor = await collection.aggregate(pipeline);
    const cursor = await aggregate("Cluster0", "aws", "adsense", pipeline);
    arr = [];
    await cursor.forEach((item) => {
      
      temp = parser(item)

      arr.push(temp);
    });
    // shuffle
    arr.sort(() => Math.random() - 0.5);
    SaveData(path,arr)
    return arr;
  } finally {
    // await client.close();
  }
};



if (require.main === module) {
  console.log("Running getadsense.js")
  run().catch(console.dir);
}

// module.exports = run 