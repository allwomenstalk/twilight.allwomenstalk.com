#!/bin/bash

# Start time
start_time=$(date +%s)

# List of folders
folders=(
    "allwomenstalk.com"
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
    "lifestyle.allwomenstalk.com"
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

# Iterate over each folder
for folder in "${folders[@]}"; do
    # Check if the directory is not empty
    if [ "$(ls -A "_site/$folder" 2>/dev/null)" ]; then
        
        # Remove index.html from the folder
        rm -f "_site/$folder/index.html"
        rm -f "_site/$folder/latest.json"
        rm -f "_site/$folder/popular/list.json"
    
        
        # Upload the folder to S3 bucket
        echo "Uploading $folder files to S3 bucket..."
        aws s3 cp "_site/$folder" s3://"$folder" --recursive --quiet
        
        # Upload the folder js 
        aws s3 cp "_site/js" s3://"$folder"/js --recursive
        
        # Delete the folder after upload
        echo "Deleting $folder..."
        rm -rf "_site/$folder"

    else
        echo "$folder is empty or does not exist. Skipping upload..."
    fi
done

# End time
end_time=$(date +%s)

# Duration calculation
duration=$((end_time - start_time))
duration_minutes=$((duration / 60))

echo "Script execution duration: $duration_minutes minutes"