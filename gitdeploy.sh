#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define variables
BUILD_DIR="_site/gardening.allwomenstalk.com"
REPO_NAME="gardening.allwomenstalk.com"
GITHUB_USER="allwomenstalk"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"
BRANCH="gh-pages" # You can change this to the branch you want to deploy to

# Check if repository exists
if gh repo view "$GITHUB_USER/$REPO_NAME" > /dev/null 2>&1; then
  echo "Repository $REPO_NAME already exists on GitHub."
else
  # Create a new repository on GitHub
  echo "Creating new repository $REPO_NAME on GitHub."
  gh repo create "$GITHUB_USER/$REPO_NAME" --public --source=. --remote=origin --push

  echo "Repository $REPO_NAME created successfully."
fi

# Navigate to the build directory
cd $BUILD_DIR

# Initialize a new git repository if it doesn't exist
if [ ! -d ".git" ]; then
  git init
fi

# Check if the remote origin is set, if not, add it
if ! git remote | grep -q origin; then
  git remote add origin $REPO_URL
fi

# Add all files to the new repository
git add .

# Commit the changes
git commit -m "Deploy site to GitHub Pages"

# Push the changes to the specified branch, creating it if it doesn't exist
git push --set-upstream origin main --force

# Cleanup
cd ..
rm -rf $BUILD_DIR/.git

echo "Deployment complete."
