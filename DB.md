# Database inventory (from code)

This file summarizes database requests and collection structures based on source code inspection. It reflects *observed usage* in this repo, not an authoritative schema from the live DB.

## Access patterns
- **MongoDB Data API wrapper**: `helpers/dataApi.js` is used by several scripts with `aggregate()` targeting `Cluster0` / `aws`.
- **MongoDB driver**: scripts use `MongoClient` with `MONGODB_URI` / `MONGODB_URI_ADMIN`.
- **Atlas App Services (frontend)**: several JS/Nunjucks files call `*.mongodb-api.com` endpoints; those are not direct collection reads but service endpoints.

## Databases & collections

### Database: `aws`

#### `posts`
Observed fields/usage:
- Identity: `_id`, `post_name` (slug), `host`, `blog`
- Content: `post_title`, `post_content` (array), `meta_description`, `meta_title`, `viral_title`
- Taxonomy: `tags` (includes internal tags like `_noads`), `super_categories` (array)
- Media: `image_url`, `video_url`
- Dates: `post_date`, `post_modified`
- Metrics: `comment_count`, `seo` (e.g., `seo.clicks`, `seo.impressions`, `seo.ga_visits`)
- Relations: `author` (ObjectId)
Used in:
- `getarchives.js`, `getposts.js`, `getposts_api.js`, `getpostdatapi.js`, `getpopular.js`, `getadsense.js`
- `helpers/pipelinePost.js` (joins to other collections)

#### `users`
Observed fields/usage:
- Identity: `_id`
- Name: `first_name`, `display_name`
Used in:
- `getarchives.js` (author lookup)
- `getprofiles.js` (profiles + sample posts)
- `helpers/pipelinePost.js` (author lookup)

#### `categories`
Observed fields/usage:
- `_id`, `name`, `description`, `count`, `modified`, `public`
Used in:
- `getarchives.js`, `getarchives_outdated.js`

#### `polls`
Observed fields/usage:
- `category` (used for `$group` key)
- Remaining fields are not referenced directly in code (stored as full document in grouped output)
Used in:
- `getpolls.js`

#### `quiz`
Observed fields/usage (from `src/_data/quizzes.json` output):
- `_id`, `post_id`, `title`, `description`, `questions`, `results`
Used in:
- `getquizzes.js`

#### `reviews`
Observed fields/usage:
- `gsc.impressions` (sort field)
- Other fields not referenced explicitly
Used in:
- `getreviews.js`

#### `videos`
Observed fields/usage:
- `post_id`
- `videoId`, `channelTitle`, `description`, `thumbnails`, `title`
Used in:
- `getvideoposts.js`, `tools/getvideos.js`
- `helpers/pipelinePost.js` (lookup to `videos` by `post_id`)

#### `extensions`
Observed fields/usage:
- `postid` (string)
- `pageNumber`, `publish`, `date`, `response` (array)
Used in:
- `getlatestelaborate.js`, `helpers/pipelinePost.js`

#### `interlinks`
Observed fields/usage:
- `_id`, `category`
Used in:
- `getinterlinks.js`
- `helpers/pipelinePost.js` (match on `category`)

#### `related_annoy`
Observed fields/usage:
- `_id`, `posts`, `interlink`
Used in:
- `helpers/pipelinePost.js`, `batchmaterialize.js`

#### `related_cluster`
Observed fields/usage:
- `_id`
Used in:
- `helpers/pipelinePost.js`, `batchmaterialize.js`

#### `comments`
Observed fields/usage:
- `post` (ObjectId), `toxisity`, `comment_date`
Used in:
- `helpers/pipelinePost.js`, `batchmaterialize.js`

#### `classify`
Observed fields/usage:
- `_id`, `collection` (array)
Used in:
- `helpers/pipelinePost.js`, `batchmaterialize.js`

#### `crosslinks`
Observed fields/usage:
- `post_id`, `page`, `link` (with `original`, `replace`)
Used in:
- `helpers/pipelinePost.js`, `helpers/parser.js`

#### `faq`
Observed fields/usage:
- `post_id`, `list`
Used in:
- `getfaqs.js`, `tools/getfaq.js`
- `helpers/pipelinePost.js`, `batchmaterialize.js`

#### `adsense`
Observed fields/usage:
- `slug`
- `Estimated earnings (USD)`, `Page RPM (USD)`
Used in:
- `getadsense.js` (joined to `posts` via `slug -> post_name`)

#### `bookmarks`
Observed fields/usage:
- Collection is written via App Services client in frontend (`updateOne` by `postid`)
Used in:
- `lambda/nodejs/src/_includes/partials/js.njk`

#### `MaterializedPosts`
Materialized view built from `posts` with joined data:
- `author`, `clusterlinks`, `related`, `comments`, `classify`, `crosslinks`, `videos`, `faq`, `elaborate`, `interlinks`
Used in:
- `batchmaterialize.js`

#### `tv`
Observed fields/usage:
- `post_id` (joined in `batchmaterialize.js`)
Used in:
- `batchmaterialize.js` only

### Database: `gpt`

#### `list`
Observed fields/usage:
- `title`, `slug`, `excerpt`, `outline` (array)
- `host`, `category`, `date`
Used in:
- `tools/infinity/cloud-function.js`

## Atlas App Services / Data API endpoints (non-collection HTTP)
These are service endpoints, not direct collection reads in code:
- `allwomenstalk-ebogu` app: `elaborate`, `newsletter`, `track`, `reaction`, `beacon`, `comments`, `comment`, `rate`, `report`, `stats`, `banner`, `ampform`
- `azoio-evvkb` app: `list`, `trivia`, `create`, `topics`
- `ezali-pcrzc` app: `widget`, `url`

## Notes
- Some collections are referenced only in comments or legacy scripts (e.g., `keywords`). Those are not listed unless actively used.
- The repo uses both direct MongoDB connections and a Data API wrapper. In production, actual schemas may contain more fields.
