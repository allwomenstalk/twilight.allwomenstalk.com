# Codebuild 

## version for testing

version: 0.2

phases:
  install:
    commands:
      - echo "Installing dependencies..."
      - npm install
  build:
    commands:
      - git remote -v 
      - git branch --show-current
      - echo "Building the project..."
      - NODE_OPTIONS=--max-old-space-size=4096
      - node getposts_api.js
      - npm run build 
