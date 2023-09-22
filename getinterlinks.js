require('dotenv').config();  // Load environment variables from .env file

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI; // Get MongoDB URI from environment variables


async function fetchInterlinks() {
    const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

    try {
        await client.connect();

        const database = client.db('aws'); // This will automatically select the database from the URI.
        const collection = database.collection('PostsInterlink');

        const documents = await collection.find({}).toArray();
        console.log('Fetched interlink documents:', documents.length);
        const ids = documents.map(doc => doc._id.toString()); // Convert ObjectIDs to strings

        const outputFilePath = path.join(__dirname, 'helpers', 'interlinks.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(ids, null, 2));

        console.log('Interlink IDs saved successfully!');
    } catch (err) {
        console.error('Error fetching data:', err);
    } finally {
        await client.close();
    }
}

fetchInterlinks();
