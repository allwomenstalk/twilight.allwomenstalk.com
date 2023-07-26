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


# Function to upload a folder to S3
upload_folder() {
    echo "Uploading $1 to S3 bucket..."
    folder="$1"
    aws s3 cp "_site/$folder" "s3://$folder" --recursive --quiet
    # You can add more commands for uploading other files/folders within the folder here
}

# Set the maximum number of parallel uploads
max_parallel=5

# Iterate over each folder and upload in parallel
for folder in "${folders[@]}"; do
    upload_folder "$folder" &

    # Track the number of parallel uploads and wait if necessary
    parallel_count=$(jobs -p | wc -l)
    if [[ $parallel_count -ge $max_parallel ]]; then
        wait
    fi
done

# Wait for all background jobs to complete
wait

# End time
end_time=$(date +%s)

# Duration calculation
duration=$((end_time - start_time))
duration_minutes=$((duration / 60))

echo "Script execution duration: $duration_minutes minutes"