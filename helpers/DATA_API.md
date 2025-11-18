# Data API Helper Documentation

## Overview

The `dataApi.js` module provides a simple interface for executing MongoDB aggregation pipelines through a custom REST API. This helper abstracts the HTTP communication layer, making it easy to query your database from anywhere in your application.

## Setup

### Environment Variables

Add these variables to your `.env` file:

```env
DATA_API_URL=https://your-api-endpoint.com
DATA_API_KEY=your-api-key
DATA_API_SECRET=your-api-secret
```

### Installation

The module requires these dependencies:

```bash
npm install axios dotenv
```

## Usage

### Basic Import

```javascript
const { aggregate } = require('./helpers/dataApi');
```

### Method: `aggregate(cluster, database, collection, pipeline)`

Executes a MongoDB aggregation pipeline on the specified collection.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cluster` | string | Database cluster identifier (currently unused but reserved for future use) |
| `database` | string | Name of the database to query |
| `collection` | string | Name of the collection to query |
| `pipeline` | array | MongoDB aggregation pipeline array |

#### Returns

- **Success**: Returns the aggregation results as an array
- **No Results**: Returns an empty array `[]` when no documents match
- **Error**: Throws an error with details from the API response

#### Example Usage

```javascript
const { aggregate } = require('./helpers/dataApi');

async function getRecentPosts() {
  try {
    const pipeline = [
      { $match: { status: 'published' } },
      { $sort: { publishDate: -1 } },
      { $limit: 10 },
      { $project: { title: 1, slug: 1, publishDate: 1 } }
    ];

    const results = await aggregate(
      'main-cluster',  // cluster (reserved for future use)
      'blog',          // database name
      'posts',         // collection name
      pipeline         // aggregation pipeline
    );

    return results;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
}
```

## Common Use Cases

### 1. Filtering and Sorting

```javascript
const pipeline = [
  { $match: { category: 'technology', published: true } },
  { $sort: { views: -1 } },
  { $limit: 20 }
];

const topTechPosts = await aggregate(null, 'mydb', 'posts', pipeline);
```

### 2. Grouping and Counting

```javascript
const pipeline = [
  { $group: { 
    _id: '$category', 
    count: { $sum: 1 },
    avgViews: { $avg: '$views' }
  }},
  { $sort: { count: -1 } }
];

const categoryStats = await aggregate(null, 'mydb', 'posts', pipeline);
```

### 3. Lookup (Join) Operations

```javascript
const pipeline = [
  { $match: { _id: postId } },
  { $lookup: {
    from: 'authors',
    localField: 'authorId',
    foreignField: '_id',
    as: 'author'
  }},
  { $unwind: '$author' }
];

const postWithAuthor = await aggregate(null, 'mydb', 'posts', pipeline);
```

### 4. Date Range Queries

```javascript
const pipeline = [
  { $match: { 
    publishDate: { 
      $gte: new Date('2024-01-01'),
      $lte: new Date('2024-12-31')
    }
  }},
  { $sort: { publishDate: -1 } }
];

const posts2024 = await aggregate(null, 'mydb', 'posts', pipeline);
```

### 5. Text Search with Projection

```javascript
const pipeline = [
  { $match: { $text: { $search: 'javascript tutorial' } } },
  { $project: { 
    title: 1, 
    excerpt: 1, 
    score: { $meta: 'textScore' } 
  }},
  { $sort: { score: { $meta: 'textScore' } } },
  { $limit: 10 }
];

const searchResults = await aggregate(null, 'mydb', 'posts', pipeline);
```

## Error Handling

The module handles errors gracefully:

- **404 with "No aggregation results found"**: Returns empty array `[]`
- **Other errors**: Throws error with API response details

### Recommended Error Handling Pattern

```javascript
async function safeQuery() {
  try {
    const results = await aggregate(null, 'mydb', 'posts', pipeline);
    
    if (results.length === 0) {
      console.log('No results found');
      return [];
    }
    
    return results;
  } catch (error) {
    console.error('Query failed:', error.message);
    // Handle error appropriately for your use case
    // - Return default data
    // - Show error message to user
    // - Retry the request
    return [];
  }
}
```

## Integration Examples

### In Eleventy Data Files

```javascript
// _data/recentPosts.js
const { aggregate } = require('../helpers/dataApi');

module.exports = async function() {
  const pipeline = [
    { $match: { published: true } },
    { $sort: { date: -1 } },
    { $limit: 5 }
  ];
  
  return await aggregate(null, 'blog', 'posts', pipeline);
};
```

### In API Routes

```javascript
// api/posts.js
const { aggregate } = require('../helpers/dataApi');

exports.handler = async (event) => {
  const category = event.queryStringParameters?.category;
  
  const pipeline = category 
    ? [{ $match: { category } }]
    : [];
  
  pipeline.push({ $sort: { date: -1 } });
  pipeline.push({ $limit: 50 });
  
  const posts = await aggregate(null, 'blog', 'posts', pipeline);
  
  return {
    statusCode: 200,
    body: JSON.stringify(posts)
  };
};
```

### In Build Scripts

```javascript
// scripts/generateSitemap.js
const { aggregate } = require('../helpers/dataApi');

async function generateSitemap() {
  const pipeline = [
    { $match: { published: true } },
    { $project: { slug: 1, updatedAt: 1 } }
  ];
  
  const posts = await aggregate(null, 'blog', 'posts', pipeline);
  
  // Generate sitemap XML from posts
  // ...
}

generateSitemap();
```

## API Endpoint Requirements

Your API endpoint should:

1. Accept POST requests at `/aggregate`
2. Expect JSON payload with:
   ```json
   {
     "database": "string",
     "collection": "string",
     "pipeline": []
   }
   ```
3. Return JSON response with:
   ```json
   {
     "result": []
   }
   ```
4. Return 404 with message "No aggregation results found" when no results

## Tips & Best Practices

1. **Always use try-catch**: Wrap aggregate calls in try-catch blocks
2. **Limit results**: Use `$limit` in your pipeline to avoid large payloads
3. **Project only needed fields**: Use `$project` to reduce data transfer
4. **Index your queries**: Ensure MongoDB indexes support your `$match` conditions
5. **Cache when possible**: Consider caching results for frequently accessed data
6. **Validate pipeline**: Test pipelines in MongoDB Compass before using in code
7. **Handle empty results**: Check for empty arrays in your application logic

## Debugging

Enable detailed logging by checking console output:

```javascript
// The module logs:
// - API URL being called
// - Request payload
// - "No aggregation results found" when returning empty array
// - Error details when requests fail
```

## Future Enhancements

The `cluster` parameter is currently unused but reserved for:
- Multi-cluster support
- Cluster-specific routing
- Load balancing across database clusters

## Related Files

- `getposts_api.js` - Example usage for fetching posts
- `getpostdatapi.js` - Example usage for fetching post data
- `getarchives.js` - Example usage for archive queries
