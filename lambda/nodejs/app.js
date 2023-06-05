const { MongoClient } = require('mongodb');
const Eleventy = require('@11ty/eleventy');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost.js')


exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    const uri = 'mongodb+srv://11tyreadonly:HN0hLpLTZD2sAJNG@cluster0.jfcrg.gcp.mongodb.net/?retryWrites=true&w=majority';
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('aws');
    const collection = db.collection('posts');

    // Fetch data from MongoDB
    pipeline = [
      { '$match': { 
          'host': new RegExp('allwomenstalk.com') ,
          post_name:'tips-for-travelling-with-children' 
          }
      },
    ]
    pipeline  = [...pipeline,...pipelinePost]
    const data = await collection.aggregate(pipeline).next()

    console.log('data',data._id, "\n\n\\")
    // console.log('parser',parser)
    let parsed = await parser(data)
    // console.log('parsed',parsed)
    // Instantiate Eleventy
    const elev = new Eleventy( "src", "_site", {
        // --quiet
        quietMode: true,
    
        // --config
        configPath: ".eleventy.js",
    
        config: function(eleventyConfig) {
          // Do some custom Configuration API stuff
          // Works great with eleventyConfig.addGlobalData
          // Pass the MongoDB data to Eleventy
          console.log('data info', data._id, data.post_name)
          eleventyConfig.addGlobalData('db', [parsed]);
        },
      });

    // Generate the post
    const json = await elev.toJSON();


    // Close the MongoDB connection
    await client.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: json[0].content,
    };
  } catch (error) {
    console.error('Error generating post:', error);

    return {
      statusCode: 500,
      body: 'Error generating post',
    };
  }
};
