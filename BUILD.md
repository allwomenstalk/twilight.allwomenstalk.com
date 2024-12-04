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



#  Version for full domain update 

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
      - echo "Cleaning and running batchgeneratehost.js for love.allwomenstalk.com..."
      - npm run clean
      - node batchgeneratehost.js love.allwomenstalk.com
      

# With force commit 

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
      - echo "Setting up Git user identity..."
      - git config --global user.email "build@codebuild.amazonaws.com"
      - git config --global user.name "CodeBuild Automation"
      - echo "Building the project..."
      - NODE_OPTIONS=--max-old-space-size=4096
      - echo "Cleaning and running batchgeneratehost.js for the specified host..."
      - npm run clean
      - node batchgeneratehost.js $HOST
      - echo "Setting up repository for force push..."
      - cd _site/$HOST
      - git init
      - git add .
      - git status
      - git commit -m "Automated update - Build ID $CODEBUILD_BUILD_ID"
      - git branch -M main
      - echo "Force pushing to https://<token>@github.com/allwomenstalk/<host>.git"
      - git remote add origin https://$GITHUB_TOKEN@github.com/allwomenstalk/$HOST.git
      - git push -u origin main --force


# Run via CLI on cloud
aws codebuild start-build \
  --project-name AllwomenstalkGitHubRebuild \
  --environment-variables-override name=HOST,value=travel.allwomenstalk.com,type=PLAINTEXT