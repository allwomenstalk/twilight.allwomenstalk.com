[Container] 2025/08/19 07:46:59.023935 Running on CodeBuild On-demand
[Container] 2025/08/19 07:46:59.023961 Waiting for agent ping
[Container] 2025/08/19 07:46:59.124893 Waiting for DOWNLOAD_SOURCE
[Container] 2025/08/19 07:47:03.621736 Phase is DOWNLOAD_SOURCE
[Container] 2025/08/19 07:47:03.624347 CODEBUILD_SRC_DIR=/codebuild/output/src201312639/src/github.com/allwomenstalk/archives
[Container] 2025/08/19 07:47:03.625412 YAML location is /codebuild/readonly/buildspec.yml
[Container] 2025/08/19 07:47:03.627369 Setting HTTP client timeout to higher timeout for Github and GitHub Enterprise sources
[Container] 2025/08/19 07:47:03.627441 Processing environment variables
[Container] 2025/08/19 07:47:03.767440 No runtime version selected in buildspec.
[Container] 2025/08/19 07:47:03.795842 Moving to directory /codebuild/output/src201312639/src/github.com/allwomenstalk/archives
[Container] 2025/08/19 07:47:03.795872 Cache is not defined in the buildspec
[Container] 2025/08/19 07:47:03.831628 Skip cache due to: no paths specified to be cached
[Container] 2025/08/19 07:47:03.831999 Registering with agent
[Container] 2025/08/19 07:47:03.869562 Phases found in YAML: 2
[Container] 2025/08/19 07:47:03.869581  INSTALL: 1 commands
[Container] 2025/08/19 07:47:03.869584  BUILD: 12 commands
[Container] 2025/08/19 07:47:03.869968 Phase complete: DOWNLOAD_SOURCE State: SUCCEEDED
[Container] 2025/08/19 07:47:03.869981 Phase context status code:  Message: 
[Container] 2025/08/19 07:47:03.968011 Entering phase INSTALL
[Container] 2025/08/19 07:47:03.999734 Running command npm install
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated rimraf@2.7.1: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
npm warn deprecated puppeteer@22.15.0: < 24.9.0 is no longer supported

added 653 packages, and audited 654 packages in 26s

160 packages are looking for funding
  run `npm fund` for details

1 high severity vulnerability

Some issues need review, and may require choosing
a different dependency.

Run `npm audit` for details.

[Container] 2025/08/19 07:47:35.711193 Phase complete: INSTALL State: SUCCEEDED
[Container] 2025/08/19 07:47:35.711237 Phase context status code:  Message: 
[Container] 2025/08/19 07:47:35.743656 Entering phase PRE_BUILD
[Container] 2025/08/19 07:47:35.787464 Phase complete: PRE_BUILD State: SUCCEEDED
[Container] 2025/08/19 07:47:35.787490 Phase context status code:  Message: 
[Container] 2025/08/19 07:47:35.819832 Entering phase BUILD
[Container] 2025/08/19 07:47:35.820997 Running command echo "[]" > src/_data/posts.json

[Container] 2025/08/19 07:47:35.915033 Running command node getpopular.js
Running getpopular.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
The file has been saved!

[Container] 2025/08/19 07:47:37.618869 Running command node getpolls.js
Running getpolls.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
cursor [
  {
    _id: 'nails',
    list: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    _id: 'hair',
    list: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
  },
  { _id: null, list: [ [Object] ] },
  {
    _id: 'makeup',
    list: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
  },
  {
    _id: 'general',
    list: [
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object]
    ]
  },
  {
    _id: 'love',
    list: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
  }
]
The file has been saved as "polls.json"

[Container] 2025/08/19 07:47:37.830051 Running command node getarchives.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
Data saved to ./src/_data/categories.json
Processing category: All (ID: all)
categoryId all
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Cooking (ID: cooking)
categoryId cooking
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 253 posts
Processing category: Diy (ID: diy)
categoryId diy
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Gardening (ID: gardening)
categoryId gardening
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Beauty (ID: beauty)
categoryId beauty
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Love (ID: love)
categoryId love
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Fitness (ID: fitness)
categoryId fitness
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Food (ID: food)
categoryId food
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Apps (ID: apps)
categoryId apps
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Teen (ID: teen)
categoryId teen
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Perfumes (ID: perfumes)
categoryId perfumes
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Movies (ID: movies)
categoryId movies
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Music (ID: music)
categoryId music
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Paranormal (ID: paranormal)
categoryId paranormal
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 47 posts
Processing category: Health (ID: health)
categoryId health
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Weightloss (ID: weightloss)
categoryId weightloss
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Twilight (ID: twilight)
categoryId twilight
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Shoes (ID: shoes)
categoryId shoes
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Parenting (ID: parenting)
categoryId parenting
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Makeup (ID: makeup)
categoryId makeup
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Skincare (ID: skincare)
categoryId skincare
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Money (ID: money)
categoryId money
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Inspiration (ID: inspiration)
categoryId inspiration
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Wedding (ID: wedding)
categoryId wedding
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Celebs (ID: celebs)
categoryId celebs
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Streetstyle (ID: streetstyle)
categoryId streetstyle
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 231 posts
Processing category: Nails (ID: nails)
categoryId nails
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Running (ID: running)
categoryId running
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 192 posts
Processing category: Lifestyle (ID: lifestyle)
categoryId lifestyle
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Fashion (ID: fashion)
categoryId fashion
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Travel (ID: travel)
categoryId travel
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Diet (ID: diet)
categoryId diet
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Hair (ID: hair)
categoryId hair
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Books (ID: books)
categoryId books
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Jewelry (ID: jewelry)
categoryId jewelry
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Funny (ID: funny)
categoryId funny
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Bags (ID: bags)
categoryId bags
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 258 posts
Processing category: Mindfulness (ID: mindfulness)
categoryId mindfulness
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 70 posts
Processing category: Gifts (ID: gifts)
categoryId gifts
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 79 posts
Processing category: Desserts (ID: desserts)
categoryId desserts
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 66 posts
Processing category: Interior (ID: interior)
categoryId interior
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 57 posts
Processing category: Sleep (ID: sleep)
categoryId sleep
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 31 posts
Processing category: Accessories (ID: accessories)
categoryId accessories
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 102 posts
Processing category: Gadgets (ID: gadgets)
categoryId gadgets
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 61 posts
Processing category: Baking (ID: baking)
categoryId baking
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 67 posts
Processing category: Swimwear (ID: swimwear)
categoryId swimwear
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 40 posts
Processing category: Bodyart (ID: bodyart)
categoryId bodyart
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
.... Found 35 posts
Data saved to ./src/_data/archives.json

[Container] 2025/08/19 07:47:49.875577 Running command node getadsense.js
Running getadsense.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
The file has been saved!

[Container] 2025/08/19 07:47:50.110225 Running command node getprofiles.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
Data saved to ./src/_data/profiles.json

[Container] 2025/08/19 07:47:59.740962 Running command node getmix.js
API URL: https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1
Data saved to ./src/_data/mixlist.json

[Container] 2025/08/19 07:48:00.117242 Running command ls src/_data/
adsense.json
archives.json
categories.json
debug.json
faqs.json
feed.json
gluereview.js
metadata.js
mixlist.json
polldata.json
polls.json
popularlist.json
posts.json
profiles.json
quizzes.json
quotes.json

[Container] 2025/08/19 07:48:00.127969 Running command cat src/index.njk
---
layout: layout/default.njk
url: {{metadata.host}}
---

<!-- Fixed Navigation Menu -->
<nav class="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
    <div class="flex flex-col space-y-1">
        <a href="#header" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Header
        </a>
        <a href="#quick-actions" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Actions
        </a>
        <a href="#categories" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Categories
        </a>
        <a href="#profiles" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            Profiles
        </a>
        <a href="#shopping" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Shopping
        </a>
        <a href="#recent-posts" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Recent Posts
        </a>
        <a href="#post-details" class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Post Details
        </a>
    </div>
</nav>

<main
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header Section -->
    <div id="header" class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">AllWomensTalk Dashboard</h1>
        <p class="text-lg text-gray-600">Manage your content, categories, and analytics</p>
    </div>
    <!-- Quick Actions -->
    <div id="quick-actions" class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
                href="allwomenstalk.com"
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0
                                        011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-sm font-medium text-gray-900">Homepage</h3>
                    </div>
                </div>
            </a>
            <a
                href="allwomenstalk.com/trending"
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-sm font-medium text-gray-900">Trending</h3>
                    </div>
                </div>
            </a>
            <a
                href="allwomenstalk.com/popular"
                class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0
                                        00-6.364 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-sm font-medium text-gray-900">Popular</h3>
                    </div>
                </div>
            </a>
            <a href="/gsearch" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-sm font-medium text-gray-900">Google Search</h3>
                    </div>
                </div>
            </a>
        </div>
    </div>
    <!-- Categories Section -->
    <div id="categories" class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Categories</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {% for category in categories %}
                <a
                    href="/{{ category._id }}.allwomenstalk.com"
                    class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">{{ category.name }}</h3>
                            <p class="text-sm text-gray-500 mt-1">{{ category.count }} posts</p>
                            {% if category.description %}
                                <p class="text-sm text-gray-600 mt-2">{{ category.description }}</p>
                            {% endif %}
                        </div>
                        <div class="flex-shrink-0">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {{ category.count }}
                            </span>
                        </div>
                    </div>
                </a>
            {% endfor %}
        </div>
    </div>
    <!-- Profiles Section -->
    {% if (profiles | length) > 0 %}
        <div id="profiles" class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Profiles</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {% for profile in profiles %}
                    <a
                        href="allwomenstalk.com/profile/{{ profile._id }}/"
                        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span class="text-sm font-medium text-indigo-600">{{ profile.display_name | first | upper }}</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <h3 class="text-sm font-medium text-gray-900">{{ profile.display_name }}</h3>
                            </div>
                        </div>
                    </a>
                {% endfor %}
            </div>
        </div>
    {% endif %}
    <!-- Shopping Section -->
    <div id="shopping">
        {% include 'partials/shopping.njk' %}
    </div>
    <!-- Recent Posts Section -->
    <div id="recent-posts" class="mb-12">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Recent Posts</h2>
            <span class="text-sm text-gray-500">{{ posts | length }} posts</span>
        </div>
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {% for post in posts %}
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <div>
                                            <div class="text-sm font-medium text-gray-900">
                                                <a href="{{ post.host }}/{{ post.slug }}" class="hover:text-indigo-600">{{ post.title }}</a>
                                            </div>
                                            <div class="text-sm text-gray-500">{{ post.host }}</div>
                                            {% if post.elaborate["1"] %}
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                    Elaborated
                                                </span>
                                            {% endif %}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {% if post.category %}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {% if post.category.length and post.category.length > 0 %}
                                                {{ post.category[0] }}
                                            {% else %}
                                                {{ post.category }}
                                            {% endif %}
                                        </span>
                                    {% endif %}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ post.date | formatDate }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {% if post.comment_count %}
                                        {{ post.comment_count }}{% else %}0{% endif %}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div class="flex space-x-2">
                                        <a href="{{ post.url }}" class="text-indigo-600 hover:text-indigo-900" title="View Post">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
                                                        0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        </a>
                                        <a href="{{ post.host }}/{{ post.slug }}/amp.html" class="text-green-600 hover:text-green-900" title="AMP Version">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                            </svg>
                                        </a>
                                        <a
                                            href="https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aallwomenstalk.com&page=*{{
                                                post.url }}&breakdown=sap"
                                            class="text-yellow-600 hover:text-yellow-900"
                                            title="Analytics Report">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002
                                                        2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <!-- Post Details Cards (Alternative view) -->
    <div id="post-details" class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Post Details</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {% for post in posts %}
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                                <a href="{{ post.host }}/{{ post.slug }}" class="hover:text-indigo-600">{{ post.title }}</a>
                            </h3>
                            <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span>{{ post.date | formatDate }}</span>
                                <span>
                                    {% if post.comment_count %}
                                        {{ post.comment_count }}{% else %}0{% endif %}
                                    comments</span>
                                {% if post.category %}
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {% if post.category.length and post.category.length > 0 %}
                                            {{ post.category[0] }}
                                        {% else %}
                                            {{ post.category }}
                                        {% endif %}
                                    </span>
                                {% endif %}
                            </div>
                            {% if post.keywords and (post.keywords | length) > 0 %}
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">Keywords:</h4>
                                    <div class="flex flex-wrap gap-1">
                                        {% for kw in post.keywords %}
                                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                {{ kw }}
                                            </span>
                                        {% endfor %}
                                    </div>
                                </div>
                            {% endif %}
                            <div class="flex items-center space-x-4">
                                <a href="{{ post.url }}" class="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                    Open
                                </a>
                                <a href="{{ post.host }}/{{ post.slug }}/amp.html" class="inline-flex items-center text-sm text-green-600 hover:text-green-900">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    AMP
                                </a>
                                <a
                                    href="njk/{{ post.host }}/{{ post.slug }}/"
                                    class="inline-flex items-center text-sm text-purple-600 hover:text-purple-900">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                    </svg>
                                    NJK
                                </a>
                            </div>
                        </div>
                        {% if post.elaborate["1"] %}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Elaborated
                            </span>
                        {% endif %}
                    </div>
                </div>
            {% endfor %}
        </div>
    </div>
</main>
[Container] 2025/08/19 07:48:00.137416 Running command npm run build

> windty@1.0.0 build
> run-s build:*


> windty@1.0.0 build:postcss
> cross-env NODE_ENV=production postcss src/styles/*.css --dir src/_includes/partials/css


> windty@1.0.0 build:amp-css
> cross-env NODE_ENV=production TAILWIND_CONFIG=tailwind.amp.config.js postcss src/styles/amp.css --dir src/_includes/partials/css --no-map


> windty@1.0.0 build:eleventy
> cross-env NODE_ENV=production ELEVENTY_PRODUCTION=true eleventy

[11ty] Problem writing Eleventy templates: (more in DEBUG output)
[11ty] 1. Having trouble rendering njk template ./src/index.njk (via TemplateContentRenderError)
[11ty] 2. (./src/index.njk)
[11ty]   TypeError: Cannot read properties of undefined (reading '0') (via Template render error)
[11ty] 
[11ty] Original error stack trace: Template render error: (./src/index.njk)
[11ty]   TypeError: Cannot read properties of undefined (reading '0')
[11ty]     at Object._prettifyError (/codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/nunjucks/src/lib.js:32:11)
[11ty]     at /codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/nunjucks/src/environment.js:464:19
[11ty]     at Template.root [as rootRenderFunc] (eval at _compile (/codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/nunjucks/src/environment.js:527:18), <anonymous>:274:3)
[11ty]     at Template.render (/codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/nunjucks/src/environment.js:454:10)
[11ty]     at /codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/@11ty/eleventy/src/Engines/Nunjucks.js:411:14
[11ty]     at new Promise (<anonymous>)
[11ty]     at /codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/@11ty/eleventy/src/Engines/Nunjucks.js:410:14
[11ty]     at Template._render (/codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/@11ty/eleventy/src/TemplateContent.js:514:28)
[11ty]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
[11ty]     at async Template.renderWithoutLayout (/codebuild/output/src201312639/src/github.com/allwomenstalk/archives/node_modules/@11ty/eleventy/src/Template.js:456:27)
[11ty] Benchmark    671ms  29%     1× (Data) `./src/_data/metadata.js`
[11ty] Copied 7 files / Wrote 0 files in 2.16 seconds (v2.0.1)
ERROR: "build:eleventy" exited with 1.

[Container] 2025/08/19 07:48:09.012360 Command did not exit successfully npm run build exit status 1
[Container] 2025/08/19 07:48:09.017933 Phase complete: BUILD State: FAILED
[Container] 2025/08/19 07:48:09.017953 Phase context status code: COMMAND_EXECUTION_ERROR Message: Error while executing command: npm run build. Reason: exit status 1
[Container] 2025/08/19 07:48:09.049920 Entering phase POST_BUILD
[Container] 2025/08/19 07:48:09.052838 Phase complete: POST_BUILD State: SUCCEEDED
[Container] 2025/08/19 07:48:09.052853 Phase context status code:  Message: 
[Container] 2025/08/19 07:48:09.102838 Set report auto-discover timeout to 5 seconds
[Container] 2025/08/19 07:48:09.102877 Expanding base directory path:  .
[Container] 2025/08/19 07:48:09.105804 Assembling file list
[Container] 2025/08/19 07:48:09.105819 Expanding .
[Container] 2025/08/19 07:48:09.108785 Expanding file paths for base directory .
[Container] 2025/08/19 07:48:09.108799 Assembling file list
[Container] 2025/08/19 07:48:09.108801 Expanding **/*
[Container] 2025/08/19 07:48:09.170761 Found 2 file(s)
[Container] 2025/08/19 07:48:09.170912 Report auto-discover file discovery took 0.068074 seconds
[Container] 2025/08/19 07:48:09.171732 Phase complete: UPLOAD_ARTIFACTS State: SUCCEEDED
[Container] 2025/08/19 07:48:09.171749 Phase context status code:  Message: 