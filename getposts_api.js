const { aggregate } = require('./helpers/dataApi');
const fs = require('fs');
const parser = require('./helpers/parser');
const pipelinePost = require('./helpers/pipelinePost');
const mongopipelines = require('./helpers/pipelines');
require('dotenv').config();

const filename = './src/_data/posts.json';

// Determine default pipeline from arguments or environment variable
const defaultPipeline = process.argv[2] || process.env.PIPELINE;

const limitPerBuild = process.env.NODE_ENV === "production" ? 10000 : 10000;

async function main() {
    try {
        console.log("Starting the aggregation process...");
        
        // Build pipeline
        const filter = global[defaultPipeline];
        if (!filter) {
            console.error(`Pipeline "${defaultPipeline}" not found.`);
            return;
        }

        const pipeline = [
            {
                $match: {
                    host: { $regex: 'allwomenstalk.com' },
                },
            },
            ...filter,
            { $limit: limitPerBuild },
            ...pipelinePost,
        ];

        console.log('Pipeline:', JSON.stringify(pipeline, null, 2));

        // Execute aggregation
        const cursor = await aggregate("Cluster0", "aws", "posts", pipeline);

        if (!cursor || cursor.length === 0) {
            console.log("No posts found.");
            return;
        }

        const results = cursor.map((item) => parser(item));
        console.log(`Processed ${results.length} posts.`);

        // Write results to file
        fs.writeFileSync(filename, JSON.stringify(results, null, 4));

        // Update marker file in production
        if (results.length > 0 && process.env.NODE_ENV === "production") {
            const lastPost = results[results.length - 1];
            fs.writeFileSync('./_marker.json', JSON.stringify([lastPost.date]));
            console.log(
                'Marker updated:',
                JSON.stringify([results[0].date]),
                'to',
                JSON.stringify([lastPost.date])
            );
        }

        return results;
    } catch (err) {
        console.error("Error during aggregation:", err);
    }
}

main();