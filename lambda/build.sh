#!/bin/bash

# Update lambda
echo "Updating lambda..."
cp -r ../src/ ./nodejs/src
echo "Copying node modules..."
# cp -r ../node_modules/ ./nodejs/node_modules
echo "Copying eleventy.js..."
cp ../.eleventy.js ./nodejs/.eleventy.js

# Clean up large data files that aren't needed for lambda
rm -f ./nodejs/src/_data/posts.json
rm -f ./nodejs/src/_data/archives.json
rm -f ./nodejs/src/_data/popular.json
rm -f ./nodejs/src/_data/debug.json
rm -f ./nodejs/src/_data/quizzes.json
rm -f ./nodejs/src/_data/mixlist.json
rm -f ./nodejs/src/_data/faqs.json
rm -f ./nodejs/src/_data/popularlist.json
rm -f ./nodejs/src/_data/polldata.json
# Clean up unused templates and static files
rm -rf ./nodejs/src/json/
rm -rf ./nodejs/src/archives/
rm -rf ./nodejs/src/static/

# Remove old helpers to avoid caching issues
rm -rf ./nodejs/helpers

cp -r ../helpers/ ./nodejs/helpers


echo "Update completed successfully!"

# Load environment variables from .env file
source ../.env

echo "Installing dependencies..."
cd nodejs
# Touch package.json to force cache invalidation
touch package.json
npm install

echo "Building and deploying lambda..."
# Remove old zip file to ensure fresh build
rm -f ../function.zip

# Create zip excluding unnecessary files
zip -r ../function.zip . \
    -x "*.DS_Store" \
    -x ".aws-sam/*" \
    -x "*.log" \
    -x "test/*" \
    -x "*.md"

# Check zip size
echo "Zip file size:"
ls -lh ../function.zip

# Update function code with publish flag to create new version
aws lambda update-function-code \
    --function-name NJKPostLambdaGithubSAM \
    --zip-file fileb://../function.zip \
    --publish

# Update environment variables
aws lambda update-function-configuration \
    --function-name NJKPostLambdaGithubSAM \
    --environment Variables="{DATA_API_URL=$DATA_API_URL,DATA_API_KEY=$DATA_API_KEY,DATA_API_SECRET=$DATA_API_SECRET,GITHUB_TOKEN=$GITHUB_TOKEN}" > /dev/null 2>&1 &

echo "Deploy completed successfully!"
# echo "Cleaning up..."

# rm -rf ../nodejs/src
# rm -rf ../nodejs/helpers
