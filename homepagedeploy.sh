#!/usr/bin/env bash
set -euo pipefail

# Build then upload only homepage HTML + shared static CSS/JS.
#
# Usage:
#   ./homepagedeploy.sh                  # defaults to allwomenstalk.com
#   ./homepagedeploy.sh allwomenstalk.com love.allwomenstalk.com

npm run build
./homepageupload.sh "$@"

