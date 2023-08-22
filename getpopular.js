const { MongoClient } = require('mongodb');
const moment = require('moment');
const fs = require('fs');
require('dotenv').config()
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true });
const month = new Date().getMonth() + 1;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const marr = [
  ...months.slice(month >= 3 ? 12 : month - 3),
  ...months.slice(month - 3 < 0 ? 0 : month - 3, month),
];
console.log('curent month:', marr);

let path = './src/_data/popular.json'
let arr = []
// return arr;

try {
  arr = JSON.parse(fs.readFileSync(path, 'utf8'));
  console.log("Local file",path)
} catch (err) {
  console.log("No local ",path)
  arr = undefined;
}

function SaveData(name, arr) {
  fs.writeFile(name,JSON.stringify(arr,null,2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}

async function run () {
  // if (arr) return arr 

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
    '$limit': 62
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
      console.log(item.post_name)
     //console.log(item.super_categories)
     if(!item.super_categories) {console.log(item)}
      const temp = {};
      temp.id = item._id;
      temp.slug = item.post_name;
      temp.tags = [item.super_categories[0]];
      temp.category = item.super_categories[0]
      temp.url = `https://allwomenstalk.com/${item.post_name}`;
      temp.title = item.post_title.replace(/[^a-zA-Z0-9_.-\s'"]*/g,''); //removeing all emoji;
      temp.fulldate = item.post_date;
      temp.date = moment(item.post_date).format('MMM DD');
      temp.author = { name: item.author.first_name.replace('_', ''), id: item.author._id };
      temp.image = item.image_url;
      temp.imageresize = item.image_url.replace('img.', 'resize.img.');
      //console.log(item.keywords)
      temp.keyword = item.keywords[Math.floor(Math.random() * 5)]
      // temp.content = item.post_content;
      temp.host = item.host
      temp.url = `${
        (item.blog === 'aws'
          ? 'https://allwomenstalk.com/'
          : `https://${item.blog}.allwomenstalk.com/`) + item.post_name
      }/`;
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