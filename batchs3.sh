#!/bin/bash

# Run the Node.js scripts
node batchgeneratehost.js allwomenstalk.com
node batchgeneratehost.js love.allwomenstalk.com
node batchgeneratehost.js lifestyle.allwomenstalk.com

# Upload the generated files to S3 for each domain
aws s3 cp _site/allwomenstalk.com s3://allwomenstalk.com --recursive
aws s3 cp _site/love.allwomenstalk.com s3://love.allwomenstalk.com --recursive
aws s3 cp _site/lifestyle.allwomenstalk.com s3://lifestyle.allwomenstalk.com --recursive
