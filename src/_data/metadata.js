module.exports =
{
  "title": "Allwomenstalk",
  "description": "Stay ahead, stay chic. Trusted guides on beauty, wellness, fashion, and everything that defines today's empowered woman.",
  "host": "https://allwomenstalk.com",
  "generator": "Eleventy",
  "NODE_ENV": process.env.ELEVENTY_PRODUCTION? "production" : "development",
  "year": new Date().getFullYear(),
  "date":  new Date().toLocaleDateString(),
  "version": "2.0.0",
  "pages": [
      {
          "name": "Contact us",
          "url": "https://allwomenstalk.com/contact.html"
      },
      {
          "name": "Article Placements",
          "url": "https://allwomenstalk.com/order"
      },
      {
          "name": "Advertising Opportunities",
          "url": "https://allwomenstalk.com/ads.html"
      },
      {
          "name": "Privacy Policy",
          "url": "https://allwomenstalk.com/policy.html"
      },
      {
          "name": "Terms of Service",
          "url": "https://allwomenstalk.com/tos.html"
      }
  ],
  profilebg: "https://images.unsplash.com/photo-1549248264-3cc5e6fc43e0"
}
