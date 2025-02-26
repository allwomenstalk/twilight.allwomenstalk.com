#!/bin/bash

# Check if a domain parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi

DOMAIN=$1

# Navigate to the specified domain directory
if ! cd "_site/$DOMAIN"; then
  echo "Error: Directory '_site/$DOMAIN' does not exist."
  exit 1
fi

# Initialize a new git repository if it doesn't exist
if [ ! -d ".git" ]; then
  git init
fi

# Add or update the remote repository
REMOTE_URL="https://github.com/allwomenstalk/$DOMAIN.git"
if git remote | grep -q origin; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

# Ensure we're on the main branch
if ! git branch --list | grep -q main; then
  git checkout -b main
else
  git checkout main
fi

# Stage all changes
git add .

# Commit the changes if there are any
if git diff-index --quiet HEAD; then
  echo "No changes to commit."
else
  git commit -m "Whole site update"
fi

# Push the changes to the remote repository forcefully
git push origin main --force