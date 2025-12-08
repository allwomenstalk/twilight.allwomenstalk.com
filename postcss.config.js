module.exports = ({ env }) => {
  const isAmp = process.env.TAILWIND_CONFIG === "tailwind.amp.config.js";

  return {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      tailwindcss: isAmp
        ? { config: "tailwind.amp.config.js" } // Force AMP config
        : { config: "tailwind.config.js" },   // Default Tailwind config
      autoprefixer: {},
      cssnano:
        env === "production"
          ? {
              preset: ["default", { 
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
                mergeLonghand: true,
                mergeRules: true,
                minifySelectors: true,
                minifyParams: true,
                minifyFontValues: { removeQuotes: false }
              }],
            }
          : false,
    },
  };
};