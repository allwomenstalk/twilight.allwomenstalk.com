#!/bin/bash

project_name="AllwomenstalkPostsBuild"
batch_size=100

# Get the list of the most recent builds for the project
build_ids=($(aws codebuild list-builds-for-project --project-name "$project_name" --query 'ids[]' --output text))

# Check if there are build IDs returned
if [ ${#build_ids[@]} -eq 0 ]; then
    echo "No builds found for project $project_name."
    exit 0
fi

# Function to stop builds
stop_builds() {
    for build_id in "$@"; do
        build_status=$(aws codebuild batch-get-builds --ids "$build_id" --query 'builds[].buildStatus' --output text)
        if [ "$build_status" == "IN_PROGRESS" ]; then
            echo "Stopping build: $build_id"
            aws codebuild stop-build --id "$build_id" > /dev/null 2>&1
        fi
    done
}

# Process the builds in batches
total_builds=${#build_ids[@]}
for (( i=0; i<$total_builds; i+=batch_size )); do
    batch_ids=("${build_ids[@]:i:batch_size}")
    stop_builds "${batch_ids[@]}"
done

echo "All ongoing builds have been stopped."
