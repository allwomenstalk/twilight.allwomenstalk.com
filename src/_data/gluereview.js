const showdown = require('showdown');
const converter = new showdown.Converter();

list = [
  "We understand how challenging it can be to find the right products that cater to your unique needs and preferences. Whether you're looking for the latest in skincare, fashion finds, or tech gadgets designed with women in mind, our [Product Reviews](https://reviews.allwomenstalk.com) section offers comprehensive insights to help you make informed choices. Dive in and discover products that our community has tried, tested, and truly loved.",
  "Navigating the world of products can be overwhelming. To help you make the best choices, from skincare miracles to fashion must-haves, our [Product Reviews](https://reviews.allwomenstalk.com) section sheds light on what's truly worth it. Let our community guide you through their firsthand experiences.",
  "Ever felt lost amidst a sea of products? We've been there. That's why our [Product Reviews](https://reviews.allwomenstalk.com) section is dedicated to offering you genuine feedback on everything from beauty essentials to the latest tech gadgets. Take a peek and let our community's experiences lead the way.",
  "Making the right product choice can sometimes feel like a gamble. Why leave it to chance? Our [Product Reviews](https://reviews.allwomenstalk.com) section brings you detailed assessments from fellow women who've been in your shoes. Explore their reviews and make confident decisions.",
  "Your time is precious, and so is your hard-earned money. Before diving into your next purchase, explore our [Product Reviews](https://reviews.allwomenstalk.com) section. From beauty treasures to lifestyle gadgets, get the real scoop from our community members who've tried them out.",
  "In a world overflowing with choices, finding the right product can seem daunting. Let us simplify it for you. Dive into our [Product Reviews](https://reviews.allwomenstalk.com) section where you'll find candid insights from women who've explored these products firsthand. Your ideal pick might just be a click away."
]

module.exports = function() {
  return list.map(markdownString => converter.makeHtml(markdownString));
}