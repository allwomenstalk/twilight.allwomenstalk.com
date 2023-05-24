const { MongoClient } = require('mongodb');
const moment = require('moment');
const fs = require('fs');
const { group } = require('console');
// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb+srv://admin:23tyHjwbnqp21@cluster0.jfcrg.gcp.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });
const month = new Date().getMonth() + 1;
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const marr = [
  ...months.slice(month >= 3 ? 12 : month - 3),
  ...months.slice(month - 3 < 0 ? 0 : month - 3, month),
];
console.log('curent month:', marr);

// settings 
let path = './_mongodb.json'
const postperpage = 53;

try {
  var arr = JSON.parse(fs.readFileSync(path, 'utf8'));
  console.log("Local file",path)
  // var arr = undefined; // comment to use local file, uncomment to use mongodb
} catch (err) {
  console.log("No local ",path)
  var arr = undefined;
}

try {
  var categories = JSON.parse(fs.readFileSync("./src/_data/categories.json", 'utf8'));
} catch (err) {
  console.log("Can't load categories")
}

module.exports = async () => {
  
  if (arr) return arr 
  console.log('Getting Posts from MongoDB')
  try {
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('categories');

    const pipeline = [
      {
        $sort: {
          followers_count: -1,
        },
      },
      {
        $lookup: {
          from: 'posts',
          as: 'post',
          let: {
            id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      '$regexMatch': {
                        'input': '$host', 
                        'regex': 'allwomenstalk.com'
                      }
                    },
                    { $eq: ['$super_categories', ['$$id']] },
                    { $gt: ['$post_date', new Date('2016-01-01')] },
                    { $gt: ['$post_modified', new Date('2018-01-01')] },
                  ],
                },
              },
            },
            // { $sample: { size: 49 } },
            { $sort: { post_date: -1 } },
            { $limit: postperpage },
            {
              $project: {
                _id: 1,
                post_title: 1,
                post_date: 1,
                author: 1,
                post_name: 1,
                super_categories: 1,
                blog: 1,
                image_url: 1,
                host:1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$post',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$post',
        },
      },
      {
        $sort: {
          post_date: -1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: {
          path: '$author',
        },
      },
    ];

    /* simple list from posts collection
    const cursor = await collection.find(query, options);

    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }
    */

    const cursor = await collection.aggregate(pipeline);
    const arr = [];
    await cursor.forEach((item) => {
      const temp = {};
      temp.id = item._id;
      temp.slug = item.post_name;
      temp.tags = [item.super_categories[0]]; 
      //moving form tags to category 
      temp.category = item.super_categories[0]
      temp.url = `https://allwomenstalk.com/${item.post_name}`;
      temp.title = item.post_title.replace(/[^a-zA-Z0-9_.-\s]*/g,''); //removeing all emoji;
      temp.fulldate = item.post_date;
      temp.date = moment(item.post_date).format('MMM DD');
      temp.author = { name: item.author.first_name.replace('_', ''), id: item.author._id };
      temp.image = item.image_url;
      temp.imageresize = item.image_url.replace('img.', 'resize.img.');
      // temp.content = item.post_content;
      temp.host = item.host
      temp.url = `https://${item.host}/${item.post_name}/`;
      arr.push(temp);
    });
    const groupedPosts = groupPostsByCategory(arr);
    // console.log(groupedPosts);
    groupedPosts['all'] = arr.slice(0,postperpage)
    SaveData(path,groupedPosts)
    return groupedPosts;
  } finally {
    await client.close();
  }
};

function SaveData(name, arr) {
  fs.writeFile(name,JSON.stringify(arr,null,2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
}

function groupPostsByCategory(posts) {
  const groupedPosts = {};

  posts.forEach(post => {
    const category = post.category;

    if (!groupedPosts[category]) {
      groupedPosts[category] = [];
    }

    groupedPosts[category].push(post);
  });

  return groupedPosts;
}