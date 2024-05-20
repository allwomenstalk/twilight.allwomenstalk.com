#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Load hosts from JSON file
HOSTS_FILE="./cloudflare/hosts.json"
HOSTS=$(jq -c '.[]' $HOSTS_FILE)

# Define GitHub user and branch
GITHUB_USER="allwomenstalk"
BRANCH="gh-pages" # Change this to the branch you want to deploy to

# Save the original directory
ORIGINAL_DIR=$(pwd)

# Loop through each host
echo "$HOSTS" | while read HOST; do
  # Extract the domain from the JSON object
  DOMAIN=$(echo $HOST | jq -r '.domain')
  
  # Set the build directory for the current host
  BUILD_DIR="_site/$DOMAIN"
  REPO_NAME=$DOMAIN
  REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

  echo "Deploying site to GitHub Pages for $DOMAIN..."

  # Check if repository exists
  if gh repo view "$GITHUB_USER/$REPO_NAME" > /dev/null 2>&1; then
    echo "Repository $REPO_NAME already exists on GitHub."
  else
    # Create a new repository on GitHub
    echo "Creating new repository $REPO_NAME on GitHub."
    gh repo create "$GITHUB_USER/$REPO_NAME" --public --source=. --remote=origin --push
    echo "Repository $REPO_NAME created successfully."
  fi

  # Check if the build directory exists
  if [ ! -d "$BUILD_DIR" ]; then
    echo "Build directory $BUILD_DIR does not exist. Skipping..."
    continue
  fi

  # Navigate to the build directory
  cd $BUILD_DIR

  # Initialize a new git repository if it doesn't exist
  if [ ! -d ".git" ]; then
    git init
  fi

  # Remove any existing remote named origin and add the new one
  if git remote | grep -q origin; then
    git remote remove origin
  fi
  git remote add origin $REPO_URL

  # Add all files to the new repository
  git add .

  # Commit the changes
  if git diff-index --quiet HEAD; then
    echo "Nothing to commit, working tree clean."
  else
    git commit -m "Deploy site to GitHub Pages"
  fi

  # Push the changes to the specified branch, creating it if it doesn't exist
  git push --set-upstream origin $BRANCH --force

  # Return to the original directory
  cd $ORIGINAL_DIR

  # Cleanup: Remove the .git directory to reset the state
  rm -rf $BUILD_DIR/.git

  echo "Deployment complete for $DOMAIN."
done
