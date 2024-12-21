const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Eleventy = require('@11ty/eleventy');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost.js');
const { aggregate } = require('./helpers/dataApi');

exports.handler = async (event, context) => {
  // Dynamically import @octokit/rest
  const { Octokit } = await import("@octokit/rest");

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
    console.log('Fetching data from MongoDB');
    let data = await aggregate("Cluster0", "aws", "posts", pipeline);
    data = data[0];
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

    await pushFileToGitHub(octokit, owner, repo, outputPath1, html);
    await pushFileToGitHub(octokit, owner, repo, outputPath2, amp);

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
