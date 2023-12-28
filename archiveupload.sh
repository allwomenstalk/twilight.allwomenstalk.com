#!/bin/bash

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
    
    # Upload the folder to S3 bucket
    aws s3 cp "_site/$folder" s3://"$folder" --recursive
    aws s3 cp "_site/$folder/images/" s3://"$folder/images/" --recursive
    
    # Uplaod the folder js 
    # aws s3 cp "_site/js" s3://"$folder"/js --recursive
done
