const fs = require("fs");
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");

module.exports = function(eleventyConfig) {

  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  }

  // Passthrough
  eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy({ "src/js/assets": "./js/" });

  // Filters
  eleventyConfig.addFilter("cssamp", function(code) {
    return code.replace(/!important/g, "")
              .replace(/@import.*?;/g, "");
    // return new CleanCSS({}).minify(code).styles;
  });
  // slice first n elements of array
  eleventyConfig.addFilter("slicearr", function(array, count) {
    if (!Array.isArray(array)) {
      return [];
    }
    return array.slice(0, count);
  });

  eleventyConfig.addFilter('json', (value) => {
    return JSON.stringify(value);
  });

  // Watch targets
  eleventyConfig.addWatchTarget("./src/styles/");

  var pathPrefix = "";
  if (process.env.GITHUB_REPOSITORY) {
    pathPrefix = process.env.GITHUB_REPOSITORY.split('/')[1];
  }

  return {
    dir: {
      input: "src"
    },
    pathPrefix
  }
};

function htmlminTransform(content, outputPath) {
  if( outputPath.endsWith(".html") ) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}
