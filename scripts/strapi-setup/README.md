# Strapi CMS Setup for RYONGJIN's Blog

## Quick Start

### 1. Create Strapi Project
```bash
npx create-strapi-app@latest blog-cms --quickstart --no-run
cd blog-cms
```

### 2. Apply Content Models
Copy the content type schemas from `content-types/` into your Strapi project:
```
blog-cms/src/api/post/content-types/post/schema.json     <- post.json
blog-cms/src/api/category/content-types/category/schema.json <- category.json
blog-cms/src/api/tag/content-types/tag/schema.json       <- tag.json
blog-cms/src/api/author/content-types/author/schema.json <- author.json
```

Or start Strapi and create them via the admin Content-Type Builder.

### 3. Start Locally
```bash
npm run develop
```
Admin panel: http://localhost:1337/admin

### 4. Configure API Permissions
In Strapi Admin > Settings > Roles > Public:
- Post: find, findOne
- Category: find, findOne
- Tag: find, findOne
- Author: find, findOne

### 5. Deploy to Render
1. Push your Strapi project to a new GitHub repo
2. Go to https://render.com
3. Click "New Blueprint"
4. Connect your Strapi repo
5. Use the `render.yaml` in this directory
6. Deploy

### 6. Create API Token
In Strapi Admin > Settings > API Tokens:
- Name: `github-actions-read`
- Type: Read-only
- Save the token

### 7. Configure GitHub Secrets
In your blog repo > Settings > Secrets:
- `STRAPI_API_URL`: Your deployed Strapi URL (e.g., https://blog-cms-strapi.onrender.com)
- `STRAPI_API_TOKEN`: The read-only API token from step 6

### 8. Configure Strapi Webhook
In Strapi Admin > Settings > Webhooks:
- Name: `GitHub Actions Deploy`
- URL: `https://api.github.com/repos/younjinjeong/younjinjeong.github.io/dispatches`
- Headers: `Authorization: token YOUR_GITHUB_PAT`, `Accept: application/vnd.github.v3+json`
- Body: `{"event_type": "strapi_publish"}`
- Events: Entry publish, Entry unpublish, Entry update

## Content Model Reference

### Post
| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| slug | UID | Auto from title |
| date | DateTime | Required |
| content | Rich Text | Markdown content |
| summary | Text | Optional excerpt |
| comments_enabled | Boolean | Default: true |
| custom_url | String | Optional URL override |
| categories | Relation | Many-to-many |
| tags | Relation | Many-to-many |
| author | Relation | Many-to-one |
