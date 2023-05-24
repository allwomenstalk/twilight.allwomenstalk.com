import os
import boto3

# Initialize the S3 client
s3_client = boto3.client('s3')

# Define the list of domains
domains = [
    "apps.allwomenstalk.com",
    "bags.allwomenstalk.com",
    "beauty.allwomenstalk.com",
    "books.allwomenstalk.com",
    "celebs.allwomenstalk.com",
    "cooking.allwomenstalk.com",
    "diet.allwomenstalk.com",
    "diy.allwomenstalk.com",
    "fashion.allwomenstalk.com",
    "fitness.allwomenstalk.com",
    "food.allwomenstalk.com",
    "funny.allwomenstalk.com",
    "gardening.allwomenstalk.com",
    "hair.allwomenstalk.com",
    "health.allwomenstalk.com",
    "inspiration.allwomenstalk.com",
    "jewelry.allwomenstalk.com",
    "lifestyle.allwomenstalk.com",
    "love.allwomenstalk.com",
    "makeup.allwomenstalk.com",
    "money.allwomenstalk.com",
    "movies.allwomenstalk.com",
    "music.allwomenstalk.com",
    "nails.allwomenstalk.com",
    "paranormal.allwomenstalk.com",
    "parenting.allwomenstalk.com",
    "perfumes.allwomenstalk.com",
    "running.allwomenstalk.com",
    "shoes.allwomenstalk.com",
    "skincare.allwomenstalk.com",
    "streetstyle.allwomenstalk.com",
    "teen.allwomenstalk.com",
    "travel.allwomenstalk.com",
    "twilight.allwomenstalk.com",
    "wedding.allwomenstalk.com",
    "weightloss.allwomenstalk.com"
]

# Copy a file from each domain to S3
for domain in domains:
    file_path = f"keywords/{domain}/keywords.json"
    bucket_name = domain

    # Check if the file exists
    if os.path.isfile(file_path):
        # Upload the file to S3 bucket
        s3_client.upload_file(file_path, bucket_name, "keywords.json")
        print(f"File copied to S3: {file_path}")
    else:
        print(f"File not found: {file_path}")
