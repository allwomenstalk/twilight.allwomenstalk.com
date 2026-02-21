const fs = require('fs');
require('dotenv').config();
const { aggregate } = require('./helpers/dataApi');

const OUTPUT_FILE = './src/_data/comments.json';
const COMMENTS_LIMIT = 400;
const MIN_COMMENT_CHARS = 100;

function normalizeObjectId(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) return value.toLowerCase();
  if (typeof value === 'object' && typeof value.$oid === 'string' && /^[a-fA-F0-9]{24}$/.test(value.$oid)) {
    return value.$oid.toLowerCase();
  }
  return null;
}

function cleanText(value) {
  if (!value) return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, max = 240) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}...`;
}

async function loadRecentComments() {
  const pipeline = [
    {
      $match: {
        comment_content: { $exists: true, $ne: '' },
        comment_approved: 1,
      },
    },
    {
      $match: {
        $expr: {
          $gte: [
            {
              $strLenCP: {
                $trim: {
                  input: { $ifNull: ['$comment_content', ''] },
                },
              },
            },
            MIN_COMMENT_CHARS,
          ],
        },
      },
    },
    { $sort: { comment_date: -1 } },
    { $limit: COMMENTS_LIMIT },
    {
      $project: {
        _id: 1,
        post: 1,
        postid: 1,
        post_id: 1,
        comment_author: 1,
        comment_content: 1,
        comment_date: 1,
      },
    },
  ];

  const rows = await aggregate('cluster1', 'aws', 'comments', pipeline);
  return Array.isArray(rows) ? rows : [];
}

async function loadPostsByObjectIds(ids) {
  if (ids.length === 0) return [];
  const pipeline = [
    { $match: { host: { $regex: 'allwomenstalk.com' } } },
    { $addFields: { id_str: { $toString: '$_id' } } },
    { $match: { id_str: { $in: ids } } },
    {
      $project: {
        _id: 0,
        id_str: 1,
        post_name: 1,
        post_title: 1,
        host: 1,
      },
    },
  ];
  const rows = await aggregate('cluster1', 'aws', 'posts', pipeline);
  return Array.isArray(rows) ? rows : [];
}

async function loadPostsBySlugs(slugs) {
  if (slugs.length === 0) return [];
  const pipeline = [
    {
      $match: {
        host: { $regex: 'allwomenstalk.com' },
        post_name: { $in: slugs },
      },
    },
    {
      $project: {
        _id: 0,
        post_name: 1,
        post_title: 1,
        host: 1,
      },
    },
  ];
  const rows = await aggregate('cluster1', 'aws', 'posts', pipeline);
  return Array.isArray(rows) ? rows : [];
}

async function loadCommentCountsByObjectIds(ids) {
  if (ids.length === 0) return [];
  const pipeline = [
    {
      $match: {
        comment_approved: 1,
      },
    },
    { $addFields: { post_id_str: { $toString: '$post' } } },
    { $match: { post_id_str: { $in: ids } } },
    { $group: { _id: '$post_id_str', count: { $sum: 1 } } },
  ];
  const rows = await aggregate('cluster1', 'aws', 'comments', pipeline);
  return Array.isArray(rows) ? rows : [];
}

async function loadCommentCountsBySlugs(slugs) {
  if (slugs.length === 0) return [];
  const pipeline = [
    {
      $match: {
        comment_approved: 1,
        $or: [{ postid: { $in: slugs } }, { post_id: { $in: slugs } }],
      },
    },
    {
      $group: {
        _id: { $ifNull: ['$postid', '$post_id'] },
        count: { $sum: 1 },
      },
    },
  ];
  const rows = await aggregate('cluster1', 'aws', 'comments', pipeline);
  return Array.isArray(rows) ? rows : [];
}

async function main() {
  try {
    console.log('Loading recent comments...');
    const comments = await loadRecentComments();
    const filteredComments = comments.filter((item) => cleanText(item.comment_content).length >= MIN_COMMENT_CHARS);
    console.log(`Filtered out ${comments.length - filteredComments.length} comments shorter than ${MIN_COMMENT_CHARS} chars`);

    const postObjectIds = new Set();
    const postSlugCandidates = new Set();

    filteredComments.forEach((item) => {
      const objectId = normalizeObjectId(item.post) || normalizeObjectId(item.postid) || normalizeObjectId(item.post_id);
      if (objectId) {
        postObjectIds.add(objectId);
      } else {
        const slugCandidate = String(item.postid || item.post_id || '').trim();
        if (slugCandidate && slugCandidate.length < 120) {
          postSlugCandidates.add(slugCandidate);
        }
      }
    });

    const postsById = await loadPostsByObjectIds(Array.from(postObjectIds));
    const postsBySlug = await loadPostsBySlugs(Array.from(postSlugCandidates));
    const commentCountsById = await loadCommentCountsByObjectIds(Array.from(postObjectIds));
    const commentCountsBySlug = await loadCommentCountsBySlugs(Array.from(postSlugCandidates));

    const postByIdMap = new Map();
    postsById.forEach((post) => {
      postByIdMap.set(String(post.id_str), post);
    });

    const postBySlugMap = new Map();
    postsBySlug.forEach((post) => {
      postBySlugMap.set(String(post.post_name), post);
    });

    const commentCountByIdMap = new Map();
    commentCountsById.forEach((item) => {
      commentCountByIdMap.set(String(item._id), Number(item.count) || 0);
    });

    const commentCountBySlugMap = new Map();
    commentCountsBySlug.forEach((item) => {
      commentCountBySlugMap.set(String(item._id), Number(item.count) || 0);
    });

    const parsed = filteredComments.map((item) => {
      const objectId = normalizeObjectId(item.post) || normalizeObjectId(item.postid) || normalizeObjectId(item.post_id);
      const slugKey = objectId ? null : String(item.postid || item.post_id || '').trim();
      const post = objectId ? postByIdMap.get(objectId) : postBySlugMap.get(slugKey);

      const host = post?.host || 'allwomenstalk.com';
      const postSlug = post?.post_name || slugKey || null;
      const postUrl = postSlug ? `https://${host}/${postSlug}/` : null;

      const parsedDate = item.comment_date ? new Date(item.comment_date) : null;
      const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
      const dateIso = isValidDate ? parsedDate.toISOString() : null;

      const author = cleanText(item.comment_author) || 'Anonymous';
      const content = cleanText(item.comment_content);

      return {
        id: item._id,
        author,
        content,
        excerpt: truncate(content),
        date: dateIso,
        displayDate: isValidDate
          ? parsedDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Unknown date',
        post: {
          title: post?.post_title || 'Open post',
          slug: postSlug,
          host,
          url: postUrl,
          commentCount: objectId
            ? (commentCountByIdMap.get(objectId) || 0)
            : (commentCountBySlugMap.get(slugKey) || 0),
        },
      };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsed, null, 2));
    console.log(`Saved ${parsed.length} comments to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Failed to build comments feed:', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
