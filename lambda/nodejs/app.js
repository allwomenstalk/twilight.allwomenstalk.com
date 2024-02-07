const { MongoClient } = require('mongodb');
const Eleventy = require('@11ty/eleventy');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost.js');
const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  try {
    // Connect to MongoDB
    const uri = 'mongodb+srv://11tyreadonly:HN0hLpLTZD2sAJNG@cluster0.jfcrg.gcp.mongodb.net/?retryWrites=true&w=majority';
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('aws');
    // const collection = db.collection('posts');
    const collection = db.collection('posts');

    // Fetch data from MongoDB
    console.log('event', event);

    const postName = event.pathParameters ? event.pathParameters.proxy : event.rawPath.replace('/', '');
    event.post_name = postName;
    console.log('post_name', postName);

    if (!postName) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: 'No post name',
      };
    }

    const pipeline = [
      {
        $match: {
          host: new RegExp('allwomenstalk.com'),
          post_name: postName,
        },
      },
    ];
    pipeline.push(...pipelinePost);
    console.log('pipeline', pipeline);
    console.log('Fetching data from MongoDB');
    const data = await collection.aggregate(pipeline).next();
    console.log('data', data._id, '\n\n\\');
    let parsed = await parser(data);
    console.log('parsed');

    // Instantiate Eleventy
    console.log('Instantiating Eleventy')
    const elev = new Eleventy('src', '_site', {
      quietMode: false,
      configPath: '.eleventy.js',
      config: function (eleventyConfig) {
        
        eleventyConfig.addGlobalData('posts', [parsed]);
        // making empty arrays for archives and popular
        eleventyConfig.addGlobalData('archives', []);
        eleventyConfig.addGlobalData('popular', []);
      },
    });

    // Set Eleventy production mode
    process.env.ELEVENTY_PRODUCTION = true;

    // Generate the post
    console.log('Generating post');
    const json = await elev.toJSON();

    // console.log('json', json);

    // Close the MongoDB connection
    console.log('Closing MongoDB connection');
    await client.close();

    // Save files to S3
    // const s3 = new AWS.S3();
    // const bucketName = 'health.allwomenstalk.com';

    // Save the first file
    const inputPath1 = './src/posts/post.njk';
    // const outputPath1 = '_site/health.allwomenstalk.com/nutrition-tips-to-feel-better-look-better-and-live-your-best-life/index.html';
    const html = json.filter((item) => item.inputPath === inputPath1)[0].content
    // console.log('html', html);
  
    // const url1 = await saveFileToS3AndGetUrl(data1, bucketName, inputPath1, outputPath1, s3);

    // Save the second file
    const inputPath2 = './src/posts/amp.njk';
    // const outputPath2 = '_site/health.allwomenstalk.com/nutrition-tips-to-feel-better-look-better-and-live-your-best-life/amp.html';
    const amp = json.filter((item) => item.inputPath === inputPath2)[0].content
    // console.log('amp', amp);
    // const url2 = await saveFileToS3AndGetUrl(json, bucketName, inputPath2, outputPath2, s3);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: event.requestContext&&event.requestContext.stage==='amp' ? amp : html,
    };
  } catch (error) {
    console.error('Error generating post:', error);

    return {
      statusCode: 500,
      body: 'Error generating post',
    };
  }
};

async function saveFileToS3AndGetUrl(data, bucketName, inputPath, outputPath, s3) {
  const params = {
    Bucket: bucketName,
    Key: outputPath,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  };

  await s3.putObject(params).promise();
  console.log(`File saved to S3: ${outputPath}`);

  const url = `https://${bucketName}.s3.amazonaws.com/${outputPath}`;
  console.log(`Public URL: ${url}`);

  return url;
}
