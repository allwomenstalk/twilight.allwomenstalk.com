# Monitor regulary. 

- Lighthouse score after each feature 
- Schema validity and relevancy 

# Ads 

https://developers.google.com/doubleclick-gpt/samples/display-test-ad
https://developers.google.com/publisher-tag/samples/infinite-content?hl=en
https://developers.google.com/publisher-tag/samples/control-sra-batching?hl=en


# windty 🌬️

Windty is a basic template using 11ty and Tailwind, and deploys to github pages.

## How to use
1. [Create a new repo from windty’s template](https://github.com/distantcam/windty/generate), or [clone this one](https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/cloning-a-repository)
2. Install dependencies: `npm install`
3. Start development: `npm start`
4. See your website at http://localhost:8080/
5. To build the release version: `npm run build`
6. When ready, push to GitHub and the action will build and publish your site to [GitHub Pages](https://docs.github.com/en/free-pro-team@latest/github/working-with-github-pages)


# build css seperatetly
NODE_ENV=production npx postcss src/styles/*.css --dir src/_includes/partials

# build alpine 
npx esbuild ./src/js/alpine.js --outfile=./_site/js/alpine.js  --bundle --target=es2018 --minify
npx esbuild ./src/js/assets/elaborate.js --outfile=./_site/js/elaborate.js  --bundle --target=es2018 --minify
aws s3 cp _site/js/elaborate.js s3://allwomenstalk.com/js/
aws cloudfront create-invalidation --distribution-id ELXAREN8U9B5R --paths "/js/*"     

&& rm -f src/_data/cache.json 
to delete cache file on build. 

## Lighthouse test 
aws s3 cp _site s3://allwomenstalk.com/lighthousetest/ --recursive

## Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id ELXAREN8U9B5R --paths "/lighthousetest/*"
aws cloudfront create-invalidation --distribution-id ELXAREN8U9B5R --paths "/product-insight-eurikas-groundbreakin-innovations-ifa-2023/*"



Post formats to check 
- iframes 
- youtube 
- gifs 
- instagram embed



To update archivces 
> node getarchives.js 
> npm run build 
> sh archiveupload.sh

node getarchives.js && npm run build && sh archiveupload.sh


Batch update: 
node batchS3generator.js {creates batch files in folder /batch }
sh batchbuild.sh (uploads to s3 and starts builds)

to clean current files 
aws s3 rm s3://11tycode/batch/ --recursive

Batch build spec

    version: 0.2

    phases:
    build:
        commands:
        - echo $batch
        - aws s3 cp $batch ./src/_data/posts.json
        - aws s3 rm $batch
        - npm install
        - echo '[]' > ./src/_data/archives.json
        - export NODE_OPTIONS=--max_old_space_size=4096
        - npm run build 
        - sh postupload.sh
