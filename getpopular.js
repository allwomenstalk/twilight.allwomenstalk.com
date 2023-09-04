const { MongoClient } = require('mongodb');
const moment = require('moment');
const fs = require('fs');
require('dotenv').config()
const uri = process.env.MONGODB_URI;

const parser = require(fs.realpathSync('.') + "/helpers/parserarchive.js");

const client = new MongoClient(uri, { useUnifiedTopology: true });

let path = './src/_data/popular.json'
let arr = []

function SaveData(name, arr) {
  fs.writeFile(name,JSON.stringify(arr,null,2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}

async function run () {

  try {
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('keywords');

    const pipeline = [
  {
    '$group': {
      '_id': '$name', 
      'query': {
        '$addToSet': '$query'
      }, 
      'clicks': {
        '$sum': '$clicks'
      }
    }
  }, {
    '$sort': {
      'clicks': -1
    }
  }, {
    '$limit': 124
  }, {
    '$lookup': {
      'from': 'posts', 
      'localField': '_id', 
      'foreignField': 'post_name', 
      'as': 'post'
    }
  }, {
    '$match': {
      'post.0': {
        '$exists': true
      }
    }
  }, {
    '$lookup': {
      'from': 'users', 
      'localField': 'post.author', 
      'foreignField': '_id', 
      'as': 'author'
    }
  }, {
    '$project': {
      '_id': {
        '$arrayElemAt': [
          '$post._id', 0
        ]
      }, 
      'post_title': {
        '$arrayElemAt': [
          '$post.post_title', 0
        ]
      }, 
      'post_date': {
        '$arrayElemAt': [
          '$post.post_date', 0
        ]
      }, 
      'author': {
        '$arrayElemAt': [
          '$author', 0
        ]
      }, 
      'post_name': {
        '$arrayElemAt': [
          '$post.post_name', 0
        ]
      }, 
      'super_categories': {
        '$arrayElemAt': [
          '$post.super_categories', 0
        ]
      }, 
      'blog': {
        '$arrayElemAt': [
          '$post.blog', 0
        ]
      }, 
      'image_url': {
        '$arrayElemAt': [
          '$post.image_url', 0
        ]
      },
      'keywords': '$query'
    }
  }
];


    const cursor = await collection.aggregate(pipeline);
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
    await client.close();
  }
};



if (require.main === module) {
  console.log("Running getpopular.js")
  run().catch(console.dir);
}

// module.exports = run 