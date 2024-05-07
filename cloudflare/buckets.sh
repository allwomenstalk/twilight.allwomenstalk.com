#!/bin/bash
BUCKET=jewelry.allwomenstalk.com

# Delete all versions and delete markers
aws s3api list-object-versions --bucket "$BUCKET" --output text --query 'join(`\n`, [Versions[*].{key:Key,vid:VersionId}, DeleteMarkers[*].{key:Key,vid:VersionId}])' | while read -r key vid; do
    aws s3api delete-object --bucket "$BUCKET" --key "$key" --version-id "$vid"
    echo "Deleted $key version $vid"
done

# Attempt to remove the bucket
# aws s3 rb s3://"$BUCKET" --force
# echo "Bucket $BUCKET removed if empty and no errors"
