#!/bin/bash

# Run node script to get archive ones 
# node getarchives.js

# List of folders
folders=(
    # "allwomenstalk.com"
    "lifestyle.allwomenstalk.com"
    "apps.allwomenstalk.com"
    "bags.allwomenstalk.com"
    "beauty.allwomenstalk.com"
    "books.allwomenstalk.com"
    "celebs.allwomenstalk.com"
    "cooking.allwomenstalk.com"
    "diet.allwomenstalk.com"
    "diy.allwomenstalk.com"
    "fashion.allwomenstalk.com"
    "fitness.allwomenstalk.com"
    "food.allwomenstalk.com"
    "funny.allwomenstalk.com"
    "gardening.allwomenstalk.com"
    "hair.allwomenstalk.com"
    "health.allwomenstalk.com"
    "inspiration.allwomenstalk.com"
    "jewelry.allwomenstalk.com"
    "love.allwomenstalk.com"
    "makeup.allwomenstalk.com"
    "money.allwomenstalk.com"
    "movies.allwomenstalk.com"
    "music.allwomenstalk.com"
    "nails.allwomenstalk.com"
    "paranormal.allwomenstalk.com"
    "parenting.allwomenstalk.com"
    "perfumes.allwomenstalk.com"
    "running.allwomenstalk.com"
    "shoes.allwomenstalk.com"
    "skincare.allwomenstalk.com"
    "streetstyle.allwomenstalk.com"
    "teen.allwomenstalk.com"
    "travel.allwomenstalk.com"
    "twilight.allwomenstalk.com"
    "wedding.allwomenstalk.com"
    "weightloss.allwomenstalk.com"
)

for host in "${folders[@]}"
do
    echo "Processing ${host}"

    # Update the .env file with the current host
    if grep -q "^HOST=" .env; then
        # If HOST exists, replace it
        sed -i "" "s/^HOST=.*/HOST=${host}/" .env
    else
        # If HOST does not exist, append it
        echo "HOST=${host}" >> .env
    fi


    # Run node script to get posts
    node getposts.js pipeline_host
    
    # Remove old site data from AWS S3
    # aws s3 rm s3://${host} --recursive

    # Clean and build the site
    npm run clean
    npm run build

    # Copy new site data to AWS S3, excluding .DS_Store files
    aws s3 cp _site/${host}/ s3://${host}/ --recursive --exclude "*.DS_Store"

done

echo "All processes completed."
