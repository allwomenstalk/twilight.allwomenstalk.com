const { aggregate } = require('./helpers/dataApi');
const pipelinePost = require('./helpers/pipelinePost.js');

require('dotenv').config()

postName = "fun-things-to-do-to-have-the-best-weekend-ever"

async function  main() {
    pipeline = [
        {
            $match: {
              host: { $regex: 'allwomenstalk.com' },
              post_name: postName,
            },
          },
    ]
    console.log('pipeline', JSON.stringify(pipeline, null, 2));

    const cursor = await aggregate("Cluster0", "aws", "posts", pipeline);
    console.log("cursor",cursor)
}

main()