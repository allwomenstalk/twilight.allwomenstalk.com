# remove any posts
echo "[]" > src/_data/posts.json

# get popular posts
node getpopular.js
# get archive posts
node getarchives.js

# build
npm run build

# upload
sh archiveupload.sh
