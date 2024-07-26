require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB');
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('aws');
    const collection = database.collection('videos');

    // Use aggregation pipeline to project fields and then group documents by post_id
    const pipeline = [
      {
        $project: {
          _id: 1,
          videoId: 1,
          channelTitle: 1,
          description: 1,
        //   publishTime: 1,
        //   publishedAt: 1,
          thumbnails: 1,
          thumbnail: '$thumbnails.medium.url',
          title: 1,
        //   videId: 1,
          post_id: 1,
        //   post_url: 1
        }
      },
      {
        $group: {
          _id: "$post_id",
          videos: { $push: "$$ROOT" }
        }
      }
    ];

    const groupedVideos = await collection.aggregate(pipeline).toArray();

    console.log(groupedVideos.length, 'groups have been created.');

    // Create 'videos' directory if it doesn't exist
    const videosDir = path.join(__dirname, 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir);
    }

    // Save each group to a separate file
    for (const group of groupedVideos) {
      console.log('Group:', group._id);
      const postId = group._id;
      console.log('Saving videos for post ID:', postId);
      if (!postId) {
        console.error('Post ID is missing.');
        continue;
      }
      const filePath = path.join(videosDir, `${postId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(group.videos, null, 2));
    }

    console.log('Documents have been grouped and saved to files successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
