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
  // shuffle array
  eleventyConfig.addFilter("shuffle", function(array) {
    if (!Array.isArray(array)) {
      return [];
    }
    return array.sort(() => Math.random() - 0.5);
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

  // Add a custom filter to format dates
  eleventyConfig.addFilter("formatDate", function(date) {
    if (!date) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
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
