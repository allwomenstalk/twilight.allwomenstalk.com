module.exports = {
  content: [
      // AMP Layout & Main AMP Templates
      "./src/posts/amp.njk",
      "./src/_includes/layout/amp.njk",
      "./src/_includes/partials/amp/*.njk",

      // Commonly included partials from AMP template
      "./src/_includes/partials/postmeta.njk",
      "./src/_includes/partials/navigation.njk",
      "./src/_includes/partials/footer.njk",
      "./src/_includes/partials/leaderboard.njk",
      "./src/_includes/partials/adsense.njk",
      "./src/_includes/partials/hero.njk",
    //   "./src/_includes/partials/share.njk",
    //   "./src/_includes/partials/widget.njk",
      "./src/_includes/partials/elaborate.njk",
    //   "./src/_includes/partials/toc.njk",
    //   "./src/_includes/partials/faq-amp.njk",
    //   "./src/_includes/partials/cta.njk",
    //   "./src/_includes/partials/keywords.njk",
    //   "./src/_includes/partials/ads.njk",
    //   "./src/_includes/partials/collections.njk",
    //   "./src/_includes/partials/rating.njk",
    //   "./src/_includes/partials/comments.njk",
    //   "./src/_includes/partials/popular.njk",
    //   "./src/_includes/partials/schema.njk",
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