const { MongoClient } = require('mongodb');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost.js')


main = async () => {
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
    console.log('data',data, "\n\n\\")
    console.log('parser',parser)
    let parsed = await parser(data)
    console.log('parsed',parsed)
    client.close()
}
main()