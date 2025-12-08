module.exports = {
  content: [
      // AMP Layout & Main AMP Templates
      "./src/posts/amp.njk",
      "./src/_includes/layout/amp.njk",
      "./src/_includes/partials/amp/*.njk",

      // Commonly included partials from AMP template
      "./src/_includes/partials/postmeta.njk",
      "./src/_includes/partials/footer.njk",
      "./src/_includes/partials/google.njk",
      "./src/_includes/partials/schema.njk",
  ],
  theme: {
      extend: {},
  },
  corePlugins: {
      preflight: false, // Disable global resets if AMP doesn't need them
  },
  variants: {},
  plugins: [],
};