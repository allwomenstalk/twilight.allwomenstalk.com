const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const https = require('https');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost.js');

// DATAPI Configuration - using environment variables
const API_URL = process.env.DATA_API_URL;
const API_KEY = process.env.DATA_API_KEY;
const API_SECRET = process.env.DATA_API_SECRET;

const DATAPI_CONFIG = {
  workerUrl: 'https://data-api.azo.workers.dev',
  database: 'aws',
  collection: 'posts',
  apiUrl: API_URL,
  apiKey: API_KEY,
  apiSecret: API_SECRET
};

/**
 * Helper function to make DATAPI requests via Cloudflare Worker
 */
async function callDATAPI(database, collection, pipeline) {
  const data = JSON.stringify({
    cluster: 'cluster1',
    database,
    collection,
    pipeline
  });

  const url = new URL('/aggregate', DATAPI_CONFIG.workerUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include API credentials if available
      ...(DATAPI_CONFIG.apiKey && { 'X-API-Key': DATAPI_CONFIG.apiKey }),
      ...(DATAPI_CONFIG.apiSecret && { 'X-API-Secret': DATAPI_CONFIG.apiSecret })
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseBody);
          console.log('DATAPI Response:', response);
          resolve(response);
        } catch (parseError) {
          console.error('Failed to parse DATAPI response:', parseError);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error('DATAPI request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  // Dynamically import @octokit/rest and Eleventy
  const { Octokit } = await import("@octokit/rest");
  const { Eleventy } = await import("@11ty/eleventy");

  try {
    // Connect to MongoDB
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
          host: { $regex: 'allwomenstalk.com' },
          post_name: postName,
        },
      },
    ];
    pipeline.push(...pipelinePost);
    console.log('pipeline', JSON.stringify(pipeline, null, 2));
    console.log('Fetching data from DATAPI via Cloudflare Worker');
    const response = await callDATAPI(DATAPI_CONFIG.database, DATAPI_CONFIG.collection, pipeline);
    let data = response.result ? response.result[0] : null;

    if (!data) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Post not found' }),
      };
    }
    console.log('data', data);
    console.log('data _id', data._id, '\n\n\\');
    data.post_date = new Date(data.post_date);
    data.post_modified = new Date(data.post_modified);
    let parsed = await parser(data);
    console.log('parsed');

    // Instantiate Eleventy
    console.log('Instantiating Eleventy');
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
    console.log('json', json);


    // Initialize S3 Client
    const s3 = new S3Client({ region: 'us-west-2' });
    const bucketName = data.host;
    console.log('bucketName', bucketName)

    // Save index.html
    const inputPath1 = './src/posts/post.njk';
    const html = json.filter((item) => item.inputPath === inputPath1)[0].content;
    const outputPath1 = `${postName}/index.html`;
    try {
      await saveFileToS3(html, bucketName, outputPath1, s3);
    } catch (error) {
      console.error('Error saving file to S3:', error, 'Not saved to S3');
    }
    console.log('html', html);


    // Save amp.html
    const inputPath2 = './src/posts/amp.njk';
    const amp = json.filter((item) => item.inputPath === inputPath2)[0].content;
    const outputPath2 = `${postName}/amp.html`;
    try {
      await saveFileToS3(amp, bucketName, outputPath2, s3);
    } catch (error) {
      console.error('Error saving file to S3:', error, 'Not saved to S3');
    }
    // await saveFileToS3(amp, bucketName, outputPath2, s3);
    console.log('amp', amp);


    // Push files to GitHub
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = 'allwomenstalk';
    const repo = data.host;

    // updating github repo only for subdomains
    if (repo !== "allwomenstalk.com") {
      await pushFileToGitHub(octokit, owner, repo, outputPath1, html);
      await pushFileToGitHub(octokit, owner, repo, outputPath2, amp);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: event.requestContext && event.requestContext.stage === 'amp' ? amp : html,
    };
  } catch (error) {
    console.error('Error generating post:', error);

    return {
      statusCode: 500,
      body: 'Error generating post',
    };
  }
};

async function saveFileToS3(content, bucketName, outputPath, s3) {

  const params = {
    Bucket: bucketName,
    Key: outputPath,
    Body: content,
    ContentType: 'text/html',
  };
  console.log(`Saving file to S3: ${outputPath}`);
  await s3.send(new PutObjectCommand(params));
  console.log(`File saved to S3: ${outputPath}`);
}

async function pushFileToGitHub(octokit, owner, repo, path, content) {
  const { data: { sha } } = await octokit.repos.getContent({
    owner,
    repo,
    path,
  }).catch(() => ({ data: {} }));

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `Add/update file ${path}`,
    content: Buffer.from(content).toString('base64'),
    sha,
  });

  console.log(`File pushed to GitHub: ${path}`);
}
