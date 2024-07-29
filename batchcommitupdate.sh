#!/bin/bash

# Check if a domain parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi

DOMAIN=$1
REPO_URL="https://github.com/allwomenstalk/$DOMAIN.git"

# Check if the directory exists
if [ ! -d "_site/$DOMAIN" ]; then
  echo "Directory _site/$DOMAIN does not exist."
  # crete the directory
  mkdir -p _site/$DOMAIN
fi

# Change directory to the repository
cd _site/$DOMAIN

# Initialize a new git repository if not already initialized
if [ ! -d ".git" ]; then
  git init
  git remote add origin $REPO_URL
fi

# Pull the latest changes from the remote repository
git pull origin main

# Build over the existing files
# npm run build

# Copy the updated files from _site/[domain]
cp -r _site/$DOMAIN/* .

# Stage all changes
git add .

# Commit the changes
git commit -m "Update site with latest changes"

# Push the changes to the remote repository
git push origin main --force

# Explanation:
# 1. Parameter Check: Ensures a domain parameter is provided.
# 2. Directory Check: Verifies that the _site/$DOMAIN directory exists.
# 3. Repository Initialization: Initializes a new git repository if it doesn't already exist and adds the remote repository.
# 4. Pull Changes: Pulls the latest changes from the remote repository.
# 5. Copy Files: Copies the updated files from _site/$DOMAIN to the current directory.
# 6. Stage and Commit: Stages all changes and commits them.
# 7. Push Changes: Pushes the changes to the remote repository forcefully.
