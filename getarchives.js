const { MongoClient } = require('mongodb');
const fs = require('fs');
const moment = require('moment');
require('dotenv').config();


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });
const postperpage = 258;
const path = './src/_data/archives.json'
const categoriespath = './src/_data/categories.json'

async function getCategories() {
    const database = client.db('aws');
    const collection = database.collection('categories');
    return collection.find({}).toArray();
}

async function getPostsForCategory(categoryId) {
    const database = client.db('aws');
    const collection = database.collection('posts');

    const pipeline = [
        {
            $match: {
                super_categories: categoryId,
                'host': /allwomenstalk.com/,
                // 'post_date': { $gt: new Date('2016-01-01') }
            }
        },
        {
            $sort: { post_date: -1 }
        },
        {
            $limit: postperpage
        },
        {
            $lookup: {
                from: 'users',  // Assuming the collection containing authors' data is named 'users'
                localField: 'author',
                foreignField: '_id',
                as: 'author'
            }
        },
        {
            $unwind: '$author'
        },
        {
            $project: {
                post_title: 1,
                post_date: 1,
                author: 1,
                post_name: 1,
                super_categories: 1,
                blog: 1,
                image_url: 1,
                host: 1
            }
        }
    ];

    return collection.aggregate(pipeline).toArray();
}


async function main() {
    try {
        await client.connect();

        const categories = await getCategories();
        SaveData(categoriespath, categories);
        const groupedPosts = {};

        for (const category of categories) {
            console.log(`Processing category: ${category.name} (ID: ${category._id})`);
            const posts = await getPostsForCategory(category._id);
            console.log(`.... Found ${posts.length} posts`);
            const transformedPosts = posts.map(post => transformPost(post));
            groupedPosts[category._id] = transformedPosts;
        }

        groupedPosts['all'] = Object.values(groupedPosts).flat().slice(0, postperpage);
        SaveData(path, groupedPosts);

    } finally {
        await client.close();
    }
}

function transformPost(item) {
      var temp = {};
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
    return temp;
}

function SaveData(name, arr) {
    fs.writeFileSync(name, JSON.stringify(arr, null, 2));
    console.log('Data saved to', name);
}

main();
