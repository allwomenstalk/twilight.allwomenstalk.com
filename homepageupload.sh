#!/usr/bin/env bash
set -euo pipefail

# Upload only the homepage HTML + shared static CSS/JS to an S3 bucket named after the host.
#
# Usage:
#   ./homepageupload.sh                  # defaults to allwomenstalk.com
#   ./homepageupload.sh allwomenstalk.com love.allwomenstalk.com
#
# Optional env vars:
#   SITE_DIR=_site

SITE_DIR="${SITE_DIR:-_site}"

if [[ $# -gt 0 ]]; then
  HOSTS=("$@")
else
  HOSTS=(
    "allwomenstalk.com"
    "lifestyle.allwomenstalk.com"
    "love.allwomenstalk.com"
  )
fi

CSS_GLOB=("$SITE_DIR"/*.css)
JS_DIR="$SITE_DIR/js"
IMAGES_DIR="$SITE_DIR/images"

for host in "${HOSTS[@]}"; do
  src_index="$SITE_DIR/$host/index.html"
  if [[ ! -f "$src_index" ]]; then
    echo "Missing homepage: $src_index (skipping $host)"
    continue
  fi

  echo "Uploading homepage for $host..."
  aws s3 cp "$src_index" "s3://$host/index.html" --only-show-errors

  echo "Uploading shared CSS for $host..."
  for css in "${CSS_GLOB[@]}"; do
    [[ -f "$css" ]] || continue
    aws s3 cp "$css" "s3://$host/$(basename "$css")" --only-show-errors
  done

  if [[ -d "$JS_DIR" ]]; then
    echo "Uploading shared JS for $host..."
    aws s3 cp "$JS_DIR/" "s3://$host/js/" --recursive --only-show-errors
  fi

  if [[ -d "$IMAGES_DIR" ]]; then
    echo "Uploading images for $host..."
    aws s3 cp "$IMAGES_DIR/" "s3://$host/images/" --recursive --only-show-errors
  fi

  echo "Done: $host"
done
