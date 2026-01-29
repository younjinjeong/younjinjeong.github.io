# Local Development with Docker

This guide explains how to build and test the blog locally using Docker containers that mirror the GitHub Actions CI/CD environment.

## Environment Parity

The Docker setup matches the GitHub Actions workflows exactly:

| Component | Version | Source |
|-----------|---------|--------|
| Base OS | Ubuntu 24.04 | `ubuntu-latest` |
| Hugo | 0.128.0 Extended | `.github/workflows/hugo.yml` |
| Dart Sass | 1.69.5 | `.github/workflows/hugo.yml` |
| Node.js | 20.x | `.github/workflows/e2e-tests.yml` |
| Playwright | Latest | `package.json` |

## Prerequisites

- Docker 20.10+
- Docker Compose v2.0+
- (Optional) [act](https://github.com/nektos/act) - for running GitHub Actions locally

## Quick Start

```bash
# Start development server
docker compose up hugo-dev

# Access the site at http://localhost:1313
```

---

## Option 1: Docker Compose (Recommended)

### Development Server

Start the Hugo development server with live reload:

```bash
docker compose up hugo-dev
```

- Access at: http://localhost:1313
- Draft posts enabled (`-D` flag)
- Auto-reload on file changes

### Production Build

Build the site exactly as GitHub Actions does:

```bash
docker compose run --rm hugo-build
```

This runs:
1. Cleans previous build artifacts
2. Runs `hugo --gc --minify`
3. Outputs to `./public/`

### E2E Tests

Run Playwright tests (requires hugo-dev running):

```bash
# Terminal 1: Start Hugo server
docker compose up hugo-dev

# Terminal 2: Run tests
docker compose --profile test up e2e-test
```

Or use the standalone test container (includes its own Hugo server):

```bash
docker compose --profile standalone up e2e-standalone
```

### Full CI Pipeline

Simulate the complete GitHub Actions workflow locally:

```bash
docker compose --profile ci up ci-pipeline
```

This runs:
1. Hugo version verification
2. Clean previous build
3. Production build (`hugo --gc --minify`)
4. E2E tests with Playwright

---

## Option 2: Using `act` (Run GitHub Actions Locally)

[act](https://github.com/nektos/act) runs your GitHub Actions workflows locally using Docker.

### Install act

```bash
# macOS
brew install act

# Linux (via curl)
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Arch Linux
yay -S act
```

### Run Workflows Locally

**Run the Hugo build workflow:**

```bash
act push -j build --workflows .github/workflows/hugo.yml
```

**Run E2E tests workflow:**

```bash
act push -j e2e-tests --workflows .github/workflows/e2e-tests.yml
```

**Run all workflows triggered by push:**

```bash
act push
```

**Dry run (see what would execute):**

```bash
act push -n
```

### act Configuration

Create `.actrc` in the project root for default options:

```bash
# .actrc
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--container-architecture linux/amd64
```

### act with Secrets

If workflows need secrets:

```bash
act push --secret-file .secrets
```

Create `.secrets` file (add to .gitignore):

```
GITHUB_TOKEN=your_token_here
```

---

## Option 3: Manual Docker Commands

### Build Images

```bash
# Build Hugo image
docker build -t blog-hugo -f Dockerfile.hugo .

# Build E2E image
docker build -t blog-e2e -f Dockerfile.e2e .
```

### Run Development Server

```bash
docker run -it --rm \
  -p 1313:1313 \
  -v $(pwd):/src \
  blog-hugo server -D --bind 0.0.0.0
```

### Run Production Build

```bash
docker run --rm \
  -v $(pwd):/src \
  -e HUGO_ENVIRONMENT=production \
  blog-hugo sh -c "hugo --gc --minify"
```

### Run E2E Tests

```bash
# Start Hugo server first
docker run -d --name hugo-server \
  -p 1313:1313 \
  -v $(pwd):/src \
  blog-hugo server -D --bind 0.0.0.0

# Run tests
docker run --rm \
  -v $(pwd):/src \
  --network host \
  -e CI=true \
  blog-e2e npm test

# Cleanup
docker stop hugo-server && docker rm hugo-server
```

---

## Container Reference

### Dockerfile.hugo

Hugo build/serve container matching GitHub Actions:

- **Base:** Ubuntu 24.04
- **Hugo:** 0.128.0 Extended (deb package install)
- **Dart Sass:** 1.69.5
- **Port:** 1313

### Dockerfile.e2e

Playwright E2E test container matching GitHub Actions:

- **Base:** Ubuntu 24.04
- **Node.js:** 20.x
- **Hugo:** 0.128.0 Extended
- **Playwright:** Latest with Chromium

### docker-compose.yml Services

| Service | Profile | Description |
|---------|---------|-------------|
| `hugo-dev` | (default) | Development server with live reload |
| `hugo-build` | build, ci | Production build |
| `e2e-test` | test, ci | E2E tests (depends on hugo-dev) |
| `e2e-standalone` | standalone | E2E tests with built-in Hugo server |
| `ci-pipeline` | ci | Full CI simulation |

---

## Workflow Comparison

### GitHub Actions vs Local Docker

| GitHub Actions Step | Local Docker Equivalent |
|---------------------|-------------------------|
| `actions/checkout@v4` | Volume mount (`.:/src`) |
| `Install Hugo CLI` | `Dockerfile.hugo` RUN step |
| `Install Dart Sass` | `Dockerfile.hugo` RUN step |
| `hugo --gc --minify` | `docker compose run hugo-build` |
| `npm install` | `Dockerfile.e2e` RUN step |
| `playwright install` | `Dockerfile.e2e` RUN step |
| `npm test` | `docker compose up e2e-test` |

---

## Development Workflow

### 1. Start Development

```bash
docker compose up hugo-dev
```

Open http://localhost:1313. Changes auto-reload.

### 2. Create Content

```bash
# Create new post
mkdir -p content/posts/Tech
cat > content/posts/Tech/my-post.md << 'EOF'
---
title: "My Post"
date: 2024-01-01
draft: true
tags: ["example"]
---

Content here...
EOF
```

### 3. Test Changes

```bash
# Quick test with standalone container
docker compose --profile standalone up e2e-standalone
```

### 4. Verify Production Build

```bash
# Build and verify
docker compose --profile build run --rm hugo-build

# Check output
ls -la public/
```

### 5. Full CI Check Before Push

```bash
# Run complete CI pipeline
docker compose --profile ci up ci-pipeline
```

---

## Troubleshooting

### Port 1313 in Use

```bash
docker compose down
# Or use different port
docker compose run -p 8080:1313 hugo-dev
```

### Submodules Not Loaded

```bash
git submodule update --init --recursive
```

### E2E Tests Can't Connect

```bash
# Check hugo-dev health
docker compose ps
docker compose logs hugo-dev

# Test connectivity
curl http://localhost:1313
```

### Clear All Caches

```bash
rm -rf public/ node_modules/
docker compose down -v
docker system prune -f
```

### Permission Issues (Linux)

```bash
sudo usermod -aG docker $USER
# Logout and login again
```

### act Failing

```bash
# Use larger runner image
act push -P ubuntu-latest=catthehacker/ubuntu:full-latest

# Check Docker resources
docker system df
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HUGO_ENVIRONMENT` | `development` | Hugo environment mode |
| `HUGO_CACHEDIR` | `/tmp/hugo_cache` | Hugo cache directory |
| `CI` | `false` | CI mode (affects test retries) |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:1313` | E2E test target |

---

## File Structure

```
.
├── Dockerfile.hugo          # Hugo container (Ubuntu + Hugo + Sass)
├── Dockerfile.e2e           # E2E container (Ubuntu + Node + Hugo + Playwright)
├── docker-compose.yml       # Container orchestration
├── .dockerignore            # Docker build exclusions
├── .actrc                   # act configuration (optional)
├── .secrets                 # act secrets file (gitignored)
└── LOCAL_DEVELOPMENT.md     # This documentation
```

---

## Tips

1. **Use BuildKit** for faster builds:
   ```bash
   DOCKER_BUILDKIT=1 docker compose build
   ```

2. **Parallel builds**:
   ```bash
   docker compose build --parallel
   ```

3. **Watch mode** for continuous testing:
   ```bash
   docker compose --profile test up --watch
   ```

4. **View test reports**:
   ```bash
   npx playwright show-report e2e/playwright-report
   ```
