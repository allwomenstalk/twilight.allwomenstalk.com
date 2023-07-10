module.exports =
{
  "title": "Allwomenstalk",
  "description": "Find Your Voice, Embrace Your Power",
  "host": "https://allwomenstalk.com",
  "generator": "Eleventy",
  "NODE_ENV": process.env.ELEVENTY_PRODUCTION? "production" : "development",
  "year": new Date().getFullYear(),
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
  ]

}
