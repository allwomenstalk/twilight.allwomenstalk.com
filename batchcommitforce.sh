#!/bin/bash

# Check if a domain parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi

DOMAIN=$1

# Change directory to the specified domain
cd _site/$DOMAIN

# Initialize a new git repository
git init

# Add a remote repository
git remote add origin https://github.com/allwomenstalk/$DOMAIN.git

# Stage all changes
git add .

# Commit the changes
git commit -m "Whole site update"

# Push the changes to the remote repository forcefully
git push origin main --force
