# RYONGJIN's Blog - Hugo Blog Project

This is a Hugo-based static blog hosted on GitHub Pages at https://blog.younjinjeong.io/

## Core Concepts

### 1. Hugo Static Site Generator
- **Hugo Version**: 0.128.0 (extended version for Sass support)
- **Base URL**: https://blog.younjinjeong.io/
- **Language**: Korean/English (multilingual support)
- **Markdown Handler**: Goldmark with GitHub-flavored markdown

### 2. Project Structure

```
├── config.toml          # Main Hugo configuration
├── content/             # Blog posts and pages
│   ├── about.md        # About page
│   └── posts/          # Blog posts organized by category
│       ├── Tech/       # Technical articles
│       ├── k-pop/      # K-pop related posts
│       └── thoughts/   # Personal thoughts
├── layouts/            # Custom theme templates
│   ├── index.html      # Homepage showing latest post
│   ├── _default/       # Default templates
│   └── partials/       # Reusable components
├── static/             # Static assets
│   ├── css/           # Custom CSS (pipboy.css theme)
│   ├── fonts/         # Custom fonts (DungGeunMo)
│   ├── images/        # Images and media
│   └── js/            # JavaScript files
└── public/            # Generated static site (gitignored)
```

### 3. Theme: Pipboy Terminal Style
- **Design**: Fallout-inspired terminal UI with green monospace aesthetic
- **Primary Color**: `--pipboy-green: #4caf50`
- **Font Stack**: DungGeunMo (Korean), Nanum Gothic Coding, VT323
- **Features**:
  - Terminal cursor animation
  - Boot screen effect
  - TV channel change sound effect
  - Glow text effects

### 4. Key Features

#### Homepage
- Displays the latest blog post in full
- Terminal-style prompt indicator
- Link to all posts archive

#### Comments System
- **Provider**: Giscus (GitHub Discussions)
- **Repository**: younjinjeong/younjinjeong.github.io
- **Theme**: transparent_dark (custom pipboy theme)
- **Mapping**: pathname-based

#### Content Organization
- **Permalinks**: `/:year/:month/:title/`
- **Taxonomies**: tags, authors
- **Pagination**: 15 posts per page

### 5. GitHub Pages Deployment

#### Automated Deployment
- **Workflow**: `.github/workflows/hugo.yml`
- **Trigger**: Push to main branch
- **Process**:
  1. Install Hugo extended (v0.128.0)
  2. Install Dart Sass for CSS processing
  3. Clean and build site with `hugo --minify`
  4. Create CNAME file for custom domain
  5. Deploy to GitHub Pages

#### Custom Domain
- **Domain**: blog.younjinjeong.io
- **CNAME**: Automatically generated during build

### 6. Development Commands

```bash
# Local development
hugo server -D

# Build for production
hugo --gc --minify --baseURL "https://blog.younjinjeong.io/"

# Create new post
hugo new posts/category/post-name.md
```

### 7. Important Files

- `config.toml`: Main configuration with site settings, Giscus config, and markup options
- `layouts/index.html`: Homepage template showing latest post
- `static/css/pipboy.css`: Custom Pipboy terminal theme styles
- `.github/workflows/hugo.yml`: GitHub Actions deployment workflow
- `layouts/CNAME`: Custom domain configuration

### 8. Security & Analytics
- **Google Analytics**: G-LF5W12M5RW
- **robots.txt**: Enabled for SEO
- **Sitemap**: Auto-generated at `/sitemap.xml`

### 9. Special Considerations
- Korean language optimization with custom fonts and spacing
- Mobile-responsive design considerations
- Accessibility with proper heading structure
- Performance optimization with font preloading

## Notes for AI Assistants
- The site uses a custom Pipboy theme inspired by Fallout games
- Content is primarily in Korean with some English posts
- The public/ directory is gitignored and auto-generated
- CNAME file must be created in public/ during build for custom domain
- The site automatically deploys on push to main branch