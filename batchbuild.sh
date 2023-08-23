# Get the list of all batch files from the S3 bucket
files=$(aws s3 ls s3://11tycode/batches/ | awk '{print $4}')

for file in $files; do
  echo "Starting build for $file"

  # Trigger AWS CodeBuild. This assumes you have a buildspec.yml that knows how to handle the file.
  # Also, you need to pass the file name or S3 path to the build environment, possibly using environment variables.
  aws codebuild start-build --project-name AllwomenstalkPosts \
                            --environment-variables-override name=batch,value=$file
done
