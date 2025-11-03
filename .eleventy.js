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
    if (!date) return ""; // Handle undefined or null date
    try {
      const parsedDate = new Date(date); // Ensure valid Date object
      if (isNaN(parsedDate)) {
        throw new Error("Invalid date");
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(parsedDate);
    } catch (error) {
      console.error("Error formatting date:", error.message, date);
      return ""; // Return empty string on error
    }
  });

  // Add a custom filter to check if date is within the last year
  eleventyConfig.addFilter("isWithinLastYear", function(date) {
    if (!date) return false;
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return false;
      }
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      
      return parsedDate >= oneYearAgo;
    } catch (error) {
      console.error("Error checking date:", error.message, date);
      return false;
    }
  });

  eleventyConfig.addFilter("enhanceLists", function(content) {
    if (typeof content !== "string" || !content.includes("<ul")) {
      return content;
    }

    const wrapperOpen = '<div class="overflow-hidden bg-white shadow rounded-md sm:rounded-lg dark:bg-gray-800/50 dark:shadow-none dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/10">';
    const classRegex = /class=(["'])(.*?)\1/;
    const roleRegex = /\brole\s*=\s*["'][^"']*["']/;
    const baseUlClasses = [
      "not-prose",
      "list-none",
      "divide-y",
      "divide-gray-200",
      "dark:divide-white/10"
    ];
    const baseLiClasses = [
      "px-4",
      "py-4",
      "sm:px-6"
    ];

    const mergeClasses = (attrString, classesToAdd) => {
      if (classRegex.test(attrString)) {
        const match = attrString.match(classRegex);
        const delimiter = match[1];
        const existingClasses = match[2].split(/\s+/).filter(Boolean);
        const classSet = new Set(existingClasses);
        classesToAdd.forEach(cls => classSet.add(cls));
        attrString = attrString.replace(classRegex, `class=${delimiter}${Array.from(classSet).join(" ")}${delimiter}`);
      } else {
        attrString += ` class="${classesToAdd.join(" ")}"`;
      }
      return attrString;
    };

    let enhanced = content.replace(/<ul(\s[^>]*)?>/g, (match, attrs = "") => {
      let attrString = attrs || "";
      attrString = mergeClasses(attrString, baseUlClasses);

      if (!roleRegex.test(attrString)) {
        attrString += ' role="list"';
      }

      return `${wrapperOpen}\n  <ul${attrString}>`;
    });

    enhanced = enhanced.replace(/<\/ul>/g, '  </ul>\n</div>');

    enhanced = enhanced.replace(/<li(\s[^>]*)?>/g, (match, attrs = "") => {
      let attrString = attrs || "";
      attrString = mergeClasses(attrString, baseLiClasses);
      return `<li${attrString}>`;
    });

    return enhanced;
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
