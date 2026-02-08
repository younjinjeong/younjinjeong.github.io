#!/usr/bin/env node

/**
 * Migrate existing Hugo Markdown posts to Strapi CMS.
 *
 * Usage:
 *   STRAPI_API_URL=http://localhost:1337 STRAPI_API_TOKEN=xxx node scripts/migrate-to-strapi.js
 *
 * This script:
 *   1. Reads all Markdown files from content/posts/
 *   2. Parses YAML front matter
 *   3. Creates Category, Tag, and Author entries in Strapi
 *   4. Creates Post entries with relations
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const CONTENT_DIR = path.resolve(__dirname, '..', 'content', 'posts');

if (!STRAPI_URL) {
  console.error('Error: STRAPI_API_URL environment variable is required');
  process.exit(1);
}

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required (use a full-access token for migration)');
  process.exit(1);
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
  };
}

// --- Front matter parser (no external dependencies) ---

function parseFrontMatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {}, content: fileContent };

  const yamlStr = match[1];
  const content = fileContent.slice(match[0].length).trim();
  const data = parseSimpleYaml(yamlStr);
  return { data, content };
}

function parseSimpleYaml(yaml) {
  const result = {};
  const lines = yaml.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Inline array: key: [val1, val2]
    const inlineArrayMatch = trimmed.match(/^(\w[\w_]*)\s*:\s*\[(.+)\]$/);
    if (inlineArrayMatch) {
      const key = inlineArrayMatch[1];
      const values = inlineArrayMatch[2].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      result[key] = values;
      currentKey = null;
      currentArray = null;
      continue;
    }

    // Key-value: key: "value" or key: value
    const kvMatch = trimmed.match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (kvMatch && !kvMatch[2].trim().startsWith('-')) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim().replace(/^["']|["']$/g, '');
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      result[key] = value;
      currentKey = null;
      currentArray = null;
      continue;
    }

    // Key with no inline value (start of block array)
    const keyOnlyMatch = trimmed.match(/^(\w[\w_]*)\s*:\s*$/);
    if (keyOnlyMatch) {
      currentKey = keyOnlyMatch[1];
      currentArray = [];
      result[currentKey] = currentArray;
      continue;
    }

    // Array item: - value
    const arrayItemMatch = trimmed.match(/^\s+-\s+(.+)$/);
    if (arrayItemMatch && currentArray) {
      currentArray.push(arrayItemMatch[1].replace(/^["']|["']$/g, ''));
      continue;
    }
  }

  return result;
}

// --- Strapi API helpers ---

async function strapiRequest(method, endpoint, body) {
  const url = `${STRAPI_URL}${endpoint}`;
  const opts = { method, headers: headers() };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Strapi ${method} ${endpoint} failed: ${res.status} — ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function findOrCreate(pluralName, name) {
  // Search for existing entry
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const search = await strapiRequest('GET',
    `/api/${pluralName}?filters[slug][$eq]=${encodeURIComponent(slug)}`
  );

  if (search.data && search.data.length > 0) {
    const entry = search.data[0];
    console.log(`    Found existing ${pluralName}: "${name}" (id: ${entry.id})`);
    return entry.id;
  }

  // Create new entry
  const created = await strapiRequest('POST', `/api/${pluralName}`, {
    data: { name, slug }
  });
  console.log(`    Created ${pluralName}: "${name}" (id: ${created.data.id})`);
  return created.data.id;
}

// --- File discovery ---

function findMarkdownFiles(dir) {
  const files = [];

  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  }

  walk(dir);
  return files;
}

// --- Main migration ---

async function migratePost(filePath) {
  const relative = path.relative(CONTENT_DIR, filePath);
  console.log(`\n  Migrating: ${relative}`);

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = parseFrontMatter(raw);

  if (!data.title) {
    console.log('    Skipping: no title in front matter');
    return;
  }

  // Resolve categories
  const categoryIds = [];
  const categories = Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : [];
  for (const cat of [...new Set(categories)]) {
    categoryIds.push(await findOrCreate('categories', cat));
  }

  // Resolve tags
  const tagIds = [];
  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  for (const tag of [...new Set(tags)]) {
    tagIds.push(await findOrCreate('tags', tag));
  }

  // Resolve author
  const authors = Array.isArray(data.authors) ? data.authors : data.authors ? [data.authors] : ['younjinjeong'];
  const authorId = await findOrCreate('authors', authors[0]);

  // Build slug from filename
  const slug = path.basename(filePath, '.md').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Check if post already exists
  const existing = await strapiRequest('GET',
    `/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}`
  );
  if (existing.data && existing.data.length > 0) {
    console.log(`    Skipping: post "${data.title}" already exists (id: ${existing.data[0].id})`);
    return;
  }

  // Create the post
  const postData = {
    data: {
      title: data.title,
      slug: slug,
      date: data.date || new Date().toISOString(),
      content: content,
      comments_enabled: data.comments !== false,
      custom_url: data.url || null,
      categories: categoryIds,
      tags: tagIds,
      author: authorId
    }
  };

  // If draft, do not publish
  if (data.draft === true || data.draft === 'true') {
    postData.data.publishedAt = null;
  }

  const created = await strapiRequest('POST', '/api/posts', postData);
  console.log(`    Created post: "${data.title}" (id: ${created.data.id}, draft: ${data.draft === true})`);
}

async function main() {
  console.log(`\nStrapi Migration: ${STRAPI_URL}`);
  console.log(`Content directory: ${CONTENT_DIR}\n`);

  // Verify Strapi is reachable
  try {
    await strapiRequest('GET', '/api/posts?pagination[pageSize]=1');
  } catch (err) {
    console.error(`Cannot reach Strapi: ${err.message}`);
    process.exit(1);
  }

  const files = findMarkdownFiles(CONTENT_DIR);
  console.log(`Found ${files.length} Markdown files to migrate\n`);

  let migrated = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      await migratePost(file);
      migrated++;
    } catch (err) {
      console.error(`    Error migrating ${path.basename(file)}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} errors`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
