#!/usr/bin/env python

import boto3
import json

# Load JSON data from hosts.json
with open('hosts.json', 'r') as file:
    hosts = json.load(file)

# Create a resource session with S3
s3 = boto3.resource('s3')

# Function to delete all versions from a bucket
def delete_all_versions(bucket_name, batch_size=100):
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucket_name)
    
    try:
        print(f"Attempting to delete all versions from bucket: {bucket_name}")
        
        versions = list(bucket.object_versions.all())
        total_versions = len(versions)
        print(f"Total versions to delete: {total_versions}")
        
        for i in range(0, total_versions, batch_size):
            end = min(i + batch_size, total_versions)
            batch = versions[i:end]
            # Create a list of dicts required by delete_objects call
            objects_to_delete = [{'Key': v.object_key, 'VersionId': v.id} for v in batch]
            response = bucket.delete_objects(Delete={'Objects': objects_to_delete})
            print(f"Deleted {end} of {total_versions} versions")

        print(f"Successfully deleted all versions from bucket: {bucket_name}")
    except Exception as e:
        print(f"Failed to delete all versions from bucket: {bucket_name}. Error: {e}")

delete_all_versions('allwomenstalk.com')
exit();
# Iterate over each host and their domains
for host in hosts:
    for domain in host['domains']:
        # Generate bucket names from domains and run delete operation
        bucket_name = domain.replace('.pages.dev', '').replace('allwomenstalk-', '').replace('.', '-') + '.allwomenstalk.com'
        delete_all_versions(bucket_name)
