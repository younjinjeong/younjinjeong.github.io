#!/usr/bin/env node

/**
 * Fetch content from Strapi CMS and generate Hugo-compatible Markdown files.
 *
 * Usage:
 *   STRAPI_API_URL=https://your-strapi.onrender.com STRAPI_API_TOKEN=xxx node scripts/fetch-strapi-content.js
 *
 * Environment variables:
 *   STRAPI_API_URL   — Base URL of the Strapi instance (required, HTTPS in CI)
 *   STRAPI_API_TOKEN — Read-only API token (optional for public APIs)
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const CONTENT_DIR = path.resolve(__dirname, '..', 'content', 'posts');
const IS_CI = process.env.CI === 'true';

if (!STRAPI_URL) {
  console.log('STRAPI_API_URL not set — skipping Strapi fetch, using local content.');
  process.exit(0);
}

// HTTPS enforcement: require HTTPS in CI, allow HTTP only for localhost
const parsedUrl = new URL(STRAPI_URL);
if (IS_CI && parsedUrl.protocol !== 'https:') {
  console.error('Error: STRAPI_API_URL must use HTTPS in CI environments');
  process.exit(1);
}
if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
  console.warn('Warning: STRAPI_API_URL is not using HTTPS. Use HTTPS in production.');
}

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) h['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  return h;
}

async function fetchJSON(endpoint) {
  const url = `${STRAPI_URL}${endpoint}`;
  console.log(`  Fetching ${endpoint}`);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchJSON(
      `/api/posts?populate=categories,tags,author&pagination[page]=${page}&pagination[pageSize]=25&sort=date:desc`
    );
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Unexpected API response: data.data is not an array');
    }
    posts.push(...data.data);
    const pageCount = data.meta?.pagination?.pageCount ?? 1;
    hasMore = page < pageCount;
    page++;
  }
  return posts;
}

// Sanitize a string for use as a filesystem path component (no traversal)
function sanitizePath(str) {
  return (str || '').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
}

function toFrontMatter(post) {
  const attrs = post.attributes || post;
  const lines = ['---'];

  lines.push(`title: "${(attrs.title || '').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);

  if (attrs.date) {
    const dateStr = String(attrs.date).replace(/[\n\r]/g, '');
    lines.push(`date: ${dateStr}`);
  }

  // Strapi's publishedAt null means draft
  const isDraft = !attrs.publishedAt;
  lines.push(`draft: ${isDraft}`);

  // Author
  const author = attrs.author?.data;
  if (author) {
    const authorSlug = sanitizePath(author.attributes?.slug || author.slug || 'younjinjeong');
    lines.push('authors:');
    lines.push(`  - ${authorSlug}`);
  } else {
    lines.push('authors:');
    lines.push('  - younjinjeong');
  }

  // Tags
  const tags = attrs.tags?.data || [];
  if (tags.length > 0) {
    const tagNames = tags.map(t => String(t.attributes?.name || t.name).replace(/[\[\],\n]/g, ''));
    lines.push(`tags: [${tagNames.join(', ')}]`);
  }

  // Categories
  const categories = attrs.categories?.data || [];
  if (categories.length > 0) {
    const catNames = categories.map(c => String(c.attributes?.name || c.name).replace(/[\[\],\n]/g, ''));
    lines.push(`categories: [${catNames.join(', ')}]`);
  }

  // Comments
  if (attrs.comments_enabled === false) {
    lines.push('comments: false');
  }

  lines.push('---');
  return lines.join('\n');
}

function resolveCategory(post) {
  const attrs = post.attributes || post;
  const categories = attrs.categories?.data || [];
  if (categories.length > 0) {
    return sanitizePath(categories[0].attributes?.name || categories[0].name) || 'uncategorized';
  }
  return 'uncategorized';
}

function resolveFilename(post) {
  const attrs = post.attributes || post;
  const raw = attrs.slug || attrs.title || 'untitled';
  return `${sanitizePath(raw.toLowerCase())}.md`;
}

function writePost(post) {
  const category = resolveCategory(post);
  const filename = resolveFilename(post);
  const attrs = post.attributes || post;

  const dir = path.join(CONTENT_DIR, category);
  // Defense-in-depth: ensure resolved path stays within CONTENT_DIR
  const filepath = path.join(dir, filename);
  if (!filepath.startsWith(CONTENT_DIR)) {
    console.error(`  Skipping: resolved path escapes content directory: ${filename}`);
    return;
  }

  fs.mkdirSync(dir, { recursive: true });

  const content = attrs.content || '';
  const markdown = `${toFrontMatter(post)}\n\n${content}\n`;

  fs.writeFileSync(filepath, markdown, 'utf-8');
  console.log(`  Written: ${path.relative(process.cwd(), filepath)}`);
}

async function main() {
  console.log('\nFetching content from Strapi...\n');

  // Health check
  try {
    await fetchJSON('/api/posts?pagination[pageSize]=1');
  } catch (err) {
    console.error(`Strapi health check failed: ${err.message}`);
    console.error('Checking for cached content fallback...');

    if (fs.existsSync(CONTENT_DIR) && fs.readdirSync(CONTENT_DIR).length > 0) {
      console.log('Using existing cached content. Build will proceed with stale data.');
      process.exit(0);
    }
    console.error('No cached content available. Build cannot proceed.');
    process.exit(1);
  }

  // Clean generated content (preserve .gitkeep if any)
  if (fs.existsSync(CONTENT_DIR)) {
    const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        fs.rmSync(path.join(CONTENT_DIR, entry.name), { recursive: true, force: true });
      }
    }
  }

  // Fetch and write posts
  const posts = await fetchAllPosts();
  console.log(`\nFetched ${posts.length} posts\n`);

  for (const post of posts) {
    writePost(post);
  }

  console.log(`\nDone. ${posts.length} posts written.\n`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
