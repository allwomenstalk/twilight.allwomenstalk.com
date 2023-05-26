# Monitor regulary. 

- Lighthouse score after each feature 
- Schema validity and relevancy 





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
npx esbuild ./src/js/elaborate.js --outfile=./_site/js/elaborate.js  --bundle --target=es2018 --minify

## Lighthouse test 
aws s3 cp _site s3://allwomenstalk.com/lighthousetest/ --recursive

## Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id ELXAREN8U9B5R --paths "/lighthousetest/*"

