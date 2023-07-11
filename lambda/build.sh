#!/bin/bash

# Update lambda
echo "Updating lambda..."
cp -r ../src/ ./nodejs/src
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
sam build
sam deploy

echo "Deploy completed successfully!"
echo "Cleaning up..."

rm -rf ../nodejs/src
rm -rf ../nodejs/helpers
