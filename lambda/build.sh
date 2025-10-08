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

# Load environment variables from .env file
source ../.env

echo "Installing dependencies..."
cd nodejs
npm install

echo "Building and deploying lambda..."
zip -r ../function.zip .

# Update function code
aws lambda update-function-code \
    --function-name NJKPostLambdaGithubSAM \
    --zip-file fileb://../function.zip > /dev/null 2>&1

# Update environment variables
aws lambda update-function-configuration \
    --function-name NJKPostLambdaGithubSAM \
    --environment Variables="{DATA_API_URL=$DATA_API_URL,DATA_API_KEY=$DATA_API_KEY,DATA_API_SECRET=$DATA_API_SECRET,GITHUB_TOKEN=$GITHUB_TOKEN}" > /dev/null 2>&1 &

echo "Deploy completed successfully!"
echo "Cleaning up..."

# rm -rf ../nodejs/src
# rm -rf ../nodejs/helpers
