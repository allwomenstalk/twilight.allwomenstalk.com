# Data API - Cloudflare Worker Implementation Guide

## Overview

Your Data API is a Cloudflare Worker that serves as a secure proxy between your applications and MongoDB. It provides a REST API endpoint for executing MongoDB aggregation pipelines without exposing database credentials to client applications.

**Worker URL**: `https://data-api.azo.workers.dev`

## Architecture

```
Client Application (Node.js/Browser)
         ↓
    HTTP POST Request
         ↓
Cloudflare Worker (data-api.azo.workers.dev)
         ↓
    MongoDB Atlas
         ↓
    Response Data
```

## API Endpoint

### POST /aggregate

Executes a MongoDB aggregation pipeline on the specified collection.

**URL**: `https://data-api.azo.workers.dev/aggregate`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
X-API-Key: your-api-key (optional)
X-API-Secret: your-api-secret (optional)
```

**Request Body**:
```json
{
  "database": "string",
  "collection": "string",
  "pipeline": []
}
```

**Success Response**:
```json
{
  "result": [],
  "success": true
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "success": false
}
```

## Implementation Examples

### 1. Using Native HTTPS (Node.js)

```javascript
const https = require('https');

async function callDataAPI(database, collection, pipeline) {
  const data = JSON.stringify({
    database,
    collection,
    pipeline
  });

  const url = new URL('/aggregate', 'https://data-api.azo.workers.dev');
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.DATA_API_KEY,
      'X-API-Secret': process.env.DATA_API_SECRET
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseBody);
          resolve(response);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Usage
const pipeline = [
  { $match: { status: 'published' } },
  { $sort: { date: -1 } },
  { $limit: 10 }
];

const response = await callDataAPI('blog', 'posts', pipeline);
const posts = response.result;
```

### 2. Using Axios (Node.js)

```javascript
const axios = require('axios');

async function callDataAPI(database, collection, pipeline) {
  try {
    const response = await axios.post(
      'https://data-api.azo.workers.dev/aggregate',
      {
        database,
        collection,
        pipeline
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DATA_API_KEY,
          'X-API-Secret': process.env.DATA_API_SECRET
        }
      }
    );
    
    return response.data.result;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
const posts = await callDataAPI('blog', 'posts', [
  { $match: { category: 'tech' } },
  { $limit: 20 }
]);
```

### 3. Using Fetch (Browser/Modern Node.js)

```javascript
async function callDataAPI(database, collection, pipeline) {
  try {
    const response = await fetch('https://data-api.azo.workers.dev/aggregate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key',
        'X-API-Secret': 'your-api-secret'
      },
      body: JSON.stringify({
        database,
        collection,
        pipeline
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
const posts = await callDataAPI('blog', 'posts', [
  { $match: { published: true } },
  { $sort: { views: -1 } }
]);
```

### 4. Reusable API Client Class

```javascript
class DataAPIClient {
  constructor(workerUrl, apiKey, apiSecret) {
    this.workerUrl = workerUrl || 'https://data-api.azo.workers.dev';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async aggregate(database, collection, pipeline) {
    const response = await fetch(`${this.workerUrl}/aggregate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        ...(this.apiSecret && { 'X-API-Secret': this.apiSecret })
      },
      body: JSON.stringify({ database, collection, pipeline })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data.result;
  }

  // Helper method for common queries
  async findOne(database, collection, query) {
    const pipeline = [
      { $match: query },
      { $limit: 1 }
    ];
    const results = await this.aggregate(database, collection, pipeline);
    return results[0] || null;
  }

  async find(database, collection, query, options = {}) {
    const pipeline = [{ $match: query }];
    
    if (options.sort) {
      pipeline.push({ $sort: options.sort });
    }
    
    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }
    
    if (options.skip) {
      pipeline.push({ $skip: options.skip });
    }
    
    return await this.aggregate(database, collection, pipeline);
  }

  async count(database, collection, query) {
    const pipeline = [
      { $match: query },
      { $count: 'total' }
    ];
    const results = await this.aggregate(database, collection, pipeline);
    return results[0]?.total || 0;
  }
}

// Usage
const client = new DataAPIClient(
  'https://data-api.azo.workers.dev',
  process.env.DATA_API_KEY,
  process.env.DATA_API_SECRET
);

// Find one post
const post = await client.findOne('blog', 'posts', { slug: 'my-post' });

// Find multiple posts
const posts = await client.find('blog', 'posts', 
  { category: 'tech' },
  { sort: { date: -1 }, limit: 10 }
);

// Count posts
const count = await client.count('blog', 'posts', { published: true });
```

## Common Use Cases

### 1. Fetch Single Post by Slug

```javascript
const pipeline = [
  { $match: { post_name: 'my-article-slug' } },
  { $limit: 1 }
];

const response = await callDataAPI('aws', 'posts', pipeline);
const post = response.result[0];
```

### 2. Fetch Recent Posts with Pagination

```javascript
const page = 1;
const perPage = 20;

const pipeline = [
  { $match: { published: true } },
  { $sort: { post_date: -1 } },
  { $skip: (page - 1) * perPage },
  { $limit: perPage },
  { $project: {
    title: 1,
    slug: 1,
    excerpt: 1,
    post_date: 1,
    featured_image: 1
  }}
];

const posts = await callDataAPI('aws', 'posts', pipeline);
```

### 3. Search Posts by Category and Tags

```javascript
const pipeline = [
  { $match: {
    category: 'lifestyle',
    tags: { $in: ['fashion', 'beauty'] },
    published: true
  }},
  { $sort: { views: -1 } },
  { $limit: 10 }
];

const posts = await callDataAPI('aws', 'posts', pipeline);
```

### 4. Aggregate Statistics

```javascript
const pipeline = [
  { $match: { published: true } },
  { $group: {
    _id: '$category',
    count: { $sum: 1 },
    totalViews: { $sum: '$views' },
    avgViews: { $avg: '$views' }
  }},
  { $sort: { count: -1 } }
];

const stats = await callDataAPI('aws', 'posts', pipeline);
```

### 5. Complex Join with Lookup

```javascript
const pipeline = [
  { $match: { post_name: 'article-slug' } },
  { $lookup: {
    from: 'authors',
    localField: 'author_id',
    foreignField: '_id',
    as: 'author'
  }},
  { $unwind: '$author' },
  { $lookup: {
    from: 'comments',
    localField: '_id',
    foreignField: 'post_id',
    as: 'comments'
  }},
  { $addFields: {
    commentCount: { $size: '$comments' }
  }},
  { $project: {
    title: 1,
    content: 1,
    'author.name': 1,
    'author.bio': 1,
    commentCount: 1
  }}
];

const postWithDetails = await callDataAPI('aws', 'posts', pipeline);
```

### 6. Date Range Queries

```javascript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');

const pipeline = [
  { $match: {
    post_date: {
      $gte: startDate,
      $lte: endDate
    },
    published: true
  }},
  { $sort: { post_date: -1 } }
];

const posts = await callDataAPI('aws', 'posts', pipeline);
```

### 7. Full-Text Search

```javascript
const pipeline = [
  { $match: {
    $text: { $search: 'javascript tutorial' }
  }},
  { $addFields: {
    score: { $meta: 'textScore' }
  }},
  { $sort: { score: -1 } },
  { $limit: 20 }
];

const searchResults = await callDataAPI('aws', 'posts', pipeline);
```

## Integration Patterns

### In Lambda Functions

```javascript
// lambda/nodejs/app.js
const https = require('https');

const DATAPI_CONFIG = {
  workerUrl: 'https://data-api.azo.workers.dev',
  database: 'aws',
  collection: 'posts',
  apiKey: process.env.DATA_API_KEY,
  apiSecret: process.env.DATA_API_SECRET
};

exports.handler = async (event) => {
  const postName = event.pathParameters.proxy;
  
  const pipeline = [
    { $match: { post_name: postName } },
    { $limit: 1 }
  ];
  
  const response = await callDataAPI(
    DATAPI_CONFIG.database,
    DATAPI_CONFIG.collection,
    pipeline
  );
  
  const post = response.result[0];
  
  if (!post) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Post not found' })
    };
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(post)
  };
};
```

### In Eleventy Data Files

```javascript
// _data/posts.js
const { aggregate } = require('../helpers/dataApi');

module.exports = async function() {
  const pipeline = [
    { $match: { published: true } },
    { $sort: { post_date: -1 } },
    { $limit: 100 }
  ];
  
  return await aggregate(null, 'blog', 'posts', pipeline);
};
```

### In Express API Routes

```javascript
const express = require('express');
const app = express();

app.get('/api/posts/:slug', async (req, res) => {
  try {
    const pipeline = [
      { $match: { slug: req.params.slug } },
      { $limit: 1 }
    ];
    
    const response = await callDataAPI('blog', 'posts', pipeline);
    const post = response.result[0];
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

### In Build Scripts

```javascript
// scripts/generateArchives.js
const fs = require('fs');

async function generateArchives() {
  const pipeline = [
    { $match: { published: true } },
    { $group: {
      _id: {
        year: { $year: '$post_date' },
        month: { $month: '$post_date' }
      },
      posts: { $push: '$$ROOT' },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ];
  
  const archives = await callDataAPI('blog', 'posts', pipeline);
  
  fs.writeFileSync(
    '_data/archives.json',
    JSON.stringify(archives, null, 2)
  );
  
  console.log(`Generated ${archives.length} archive pages`);
}

generateArchives();
```

## Environment Variables

Set these in your `.env` file:

```env
DATA_API_URL=https://data-api.azo.workers.dev
DATA_API_KEY=your-api-key-here
DATA_API_SECRET=your-api-secret-here
```

## Security Best Practices

1. **Never expose credentials in client-side code**
   - Use environment variables for API keys
   - Keep credentials server-side only

2. **Use HTTPS only**
   - The Worker URL uses HTTPS by default
   - Never downgrade to HTTP

3. **Validate input**
   - Sanitize user input before building pipelines
   - Prevent injection attacks

4. **Rate limiting**
   - Implement rate limiting in your application
   - Cache frequently accessed data

5. **Error handling**
   - Don't expose internal errors to clients
   - Log errors for debugging

## Error Handling

```javascript
async function safeAPICall(database, collection, pipeline) {
  try {
    const response = await callDataAPI(database, collection, pipeline);
    
    if (!response.result || response.result.length === 0) {
      console.log('No results found');
      return [];
    }
    
    return response.result;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('Resource not found');
      return [];
    }
    
    if (error.response?.status === 500) {
      console.error('Server error:', error.message);
      // Retry logic or fallback
    }
    
    console.error('API call failed:', error.message);
    throw error;
  }
}
```

## Performance Optimization

### 1. Use Projection to Limit Fields

```javascript
const pipeline = [
  { $match: { published: true } },
  { $project: {
    title: 1,
    slug: 1,
    excerpt: 1,
    // Only fetch needed fields
  }},
  { $limit: 20 }
];
```

### 2. Add Indexes in MongoDB

Ensure your MongoDB collections have indexes on frequently queried fields:
- `post_name`
- `category`
- `post_date`
- `published`

### 3. Cache Results

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(cacheKey, database, collection, pipeline) {
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await callDataAPI(database, collection, pipeline);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

### 4. Batch Requests

Instead of making multiple single-item requests, use `$in` operator:

```javascript
// Bad: Multiple requests
for (const slug of slugs) {
  await callDataAPI('blog', 'posts', [{ $match: { slug } }]);
}

// Good: Single request
const pipeline = [
  { $match: { slug: { $in: slugs } } }
];
const posts = await callDataAPI('blog', 'posts', pipeline);
```

## Debugging

### Enable Detailed Logging

```javascript
async function callDataAPIWithLogging(database, collection, pipeline) {
  console.log('API Request:', {
    database,
    collection,
    pipeline: JSON.stringify(pipeline, null, 2)
  });
  
  const startTime = Date.now();
  
  try {
    const response = await callDataAPI(database, collection, pipeline);
    const duration = Date.now() - startTime;
    
    console.log(`API Response (${duration}ms):`, {
      resultCount: response.result?.length || 0,
      success: response.success
    });
    
    return response;
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}
```

## Testing

### Unit Test Example

```javascript
const assert = require('assert');

describe('Data API', () => {
  it('should fetch posts by category', async () => {
    const pipeline = [
      { $match: { category: 'tech' } },
      { $limit: 5 }
    ];
    
    const posts = await callDataAPI('blog', 'posts', pipeline);
    
    assert(Array.isArray(posts));
    assert(posts.length <= 5);
    posts.forEach(post => {
      assert.strictEqual(post.category, 'tech');
    });
  });
  
  it('should handle empty results', async () => {
    const pipeline = [
      { $match: { slug: 'non-existent-slug' } }
    ];
    
    const posts = await callDataAPI('blog', 'posts', pipeline);
    assert.strictEqual(posts.length, 0);
  });
});
```

## Related Documentation

- [helpers/DATA_API_README.md](helpers/DATA_API_README.md) - Client helper documentation
- [MongoDB Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## Troubleshooting

### Issue: "No results found"
- Check your pipeline syntax
- Verify collection and database names
- Test the pipeline in MongoDB Compass first

### Issue: "Authentication failed"
- Verify API_KEY and API_SECRET are set correctly
- Check environment variables are loaded

### Issue: "Timeout errors"
- Optimize your pipeline (add indexes, use $limit)
- Check MongoDB Atlas performance metrics
- Consider caching frequently accessed data

### Issue: "CORS errors" (browser)
- Ensure Worker has CORS headers configured
- Use server-side proxy for sensitive operations
