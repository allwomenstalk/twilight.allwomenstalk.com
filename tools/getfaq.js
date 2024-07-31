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
    const collection = database.collection('faq');

    // Use aggregation pipeline to project fields and then group documents by post_id
    const pipeline = [
      {
        $project: {
          _id: 1,
          post_id: 1,
          list: 1,
        }
      }
    ];

    const faqs = await collection.aggregate(pipeline).toArray();

    console.log(faqs.length, 'FAQ documents have been retrieved.');

    // Create 'faqs' directory if it doesn't exist
    const faqsDir = path.join(__dirname, 'faqs');
    if (!fs.existsSync(faqsDir)) {
      fs.mkdirSync(faqsDir);
    }

    // Save each document to a separate file
    for (const faq of faqs) {
      console.log('Document:', faq._id);
      const postId = faq.post_id;
      console.log('Saving FAQ for post ID:', postId);
      if (!postId) {
        console.error('Post ID is missing.');
        continue;
      }
      const filePath = path.join(faqsDir, `${postId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(faq, null, 2));
    }

    console.log('FAQ documents have been saved to files successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
