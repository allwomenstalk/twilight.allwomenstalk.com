#!/bin/bash

# Update lambda
echo "Updating lambda..."
cp -r ../src/ ./nodejs/src
echo "Copying node modules..."
# cp -r ../node_modules/ ./nodejs/node_modules
echo "Copying eleventy.js..."
cp ../.eleventy.js ./nodejs/.eleventy.js

# Clean up 
rm ./nodejs/src/_data/posts.json
rm ./nodejs/src/_data/archives.json
rm ./nodejs/src/_data/popular.json
# Clean up unused templates 
rm -rf ./nodejs/src/json/
rm -rf ./nodejs/src/archives/

cp -r ../helpers/ ./nodejs/helpers


echo "Update completed successfully!"

echo "Building and deploying lambda..."
cd nodejs

zip -r ../function.zip . 

aws lambda update-function-code \
    --function-name NJKPostLambdaGithubSAM \
    --zip-file fileb://../function.zip > /dev/null 2>&1 &

echo "Deploy completed successfully!"
echo "Cleaning up..."

# rm -rf ../nodejs/src
# rm -rf ../nodejs/helpers
