#!/bin/bash

# Update lambda
echo "Updating lambda..."
cp -r ../src/ ./nodejs/src

# Delete _data/db.js
echo "Deleting _data/db.js..."
rm ./nodejs/src/_data/db.js

echo "Update completed successfully!"

echo "Building and deploying lambda..."
cd nodejs
sam build
sam deploy

echo "Deploy completed successfully!"
echo "Cleaning up..."
cd ..
rm -rf ./nodejs/src

