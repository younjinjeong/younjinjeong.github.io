# RYONGJIN's Blog

[![Deploy Hugo site to Pages](https://github.com/younjinjeong/younjinjeong.github.io/actions/workflows/hugo.yml/badge.svg)](https://github.com/younjinjeong/younjinjeong.github.io/actions/workflows/hugo.yml)
[![E2E Tests](https://github.com/younjinjeong/younjinjeong.github.io/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/younjinjeong/younjinjeong.github.io/actions/workflows/e2e-tests.yml)

A personal tech blog with a unique **Fallout Pip-Boy terminal theme**, built with Hugo and hosted on GitHub Pages.

**Live Site:** [https://blog.younjinjeong.io](https://blog.younjinjeong.io)

![Blog Screenshot](static/images/blog-screenshot.png)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Static Site Generator** | Hugo 0.128.0 (extended) |
| **Hosting** | GitHub Pages |
| **Custom Domain** | blog.younjinjeong.io |
| **Comments** | Giscus (GitHub Discussions) |
| **E2E Testing** | Vibium (Browser Automation) |
| **CI/CD** | GitHub Actions |
| **Analytics** | Google Analytics 4 |

### Frontend

- **Theme**: Custom Pip-Boy terminal style (Fallout-inspired)
- **CSS**: 1600+ lines of custom styling with CSS variables
- **Fonts**: DungGeunMo (Korean), Monofonto, VT323, Google Fonts
- **Effects**: CRT scanlines, glow effects, boot screen animation

### Development Tools

- **Orchestrator**: Automated development cycle (Plan → Build → Test → Review)
- **E2E Tests**: 38 Vibium-based browser tests
- **Test Coverage**: Font display, image sizing, visual design, navigation, interactive elements

---

## Special Characteristics

### Pip-Boy Terminal Theme

The blog features a unique retro terminal aesthetic inspired by the Fallout video game series:

- **Color Scheme**: Phosphor green (`#41ff00`) on black background
- **Boot Sequence**: Animated initialization screen on first visit
- **Loading Transitions**: TV channel change sound effect between pages
- **Visual Effects**:
  - CRT scanline overlay
  - Text glow and flicker animations
  - Vignette effect
  - Blinking terminal cursor

### Mobile Experience

- Bottom navigation bar with swipe gestures
- Touch-friendly controls
- Responsive design (768px, 480px breakpoints)

### Multilingual Support

- Korean and English content
- Optimized font rendering for Korean characters
- Custom letter-spacing for readability

---

## CI/CD Pipeline

### Deployment Workflow (`hugo.yml`)

Triggered on push to `main` branch:

```
1. Install Hugo 0.128.0 (extended)
2. Install Dart Sass
3. Build site with hugo --gc --minify
4. Create CNAME for custom domain
5. Deploy to GitHub Pages
```

### E2E Test Workflow (`e2e-tests.yml`)

Triggered on push/PR to `main`:

```
1. Setup Node.js 20
2. Install Chrome dependencies
3. Install Hugo & npm dependencies
4. Start Hugo dev server
5. Run 38 Vibium E2E tests
6. Upload screenshots & report artifacts
```

---

## Project Structure

```
├── config.toml              # Hugo configuration
├── content/                 # Blog posts and pages
│   ├── about.md
│   └── posts/
│       ├── Tech/
│       ├── k-pop/
│       └── thoughts/
├── layouts/                 # Custom templates (23 files)
│   ├── _default/
│   ├── partials/
│   └── index.html
├── static/
│   ├── css/pipboy.css      # Main theme (1600+ lines)
│   ├── js/                  # Boot screen, loading, mobile nav
│   ├── fonts/               # DungGeunMo, Monofonto
│   └── sounds/              # TV channel change effect
├── e2e/                     # E2E test suite
│   ├── tests/               # 5 test files, 38 tests
│   └── screenshots/         # Test artifacts
├── orchestrator/            # Development cycle automation
│   ├── phases/              # Plan, Implement, Build, Test, Review
│   └── lib/                 # Utilities
└── .github/workflows/       # CI/CD pipelines
```

---

## Development

### Prerequisites

- Hugo 0.128.0+ (extended version)
- Node.js 20+
- npm

### Local Development

```bash
# Start dev server
hugo server -D

# Run E2E tests (starts server automatically)
npm run cycle:quick

# Full orchestration cycle
npm run orchestrate
```

### Available Scripts

```bash
npm test                 # Run E2E tests
npm run hugo:build       # Build for production
npm run hugo:serve       # Start dev server

npm run orchestrate      # Full cycle (Plan → Build → Test → Review)
npm run cycle:quick      # Quick cycle (Build → Test)
npm run cycle:full       # Full cycle with verbose logging
```

---

## Author

**Younjin Jeong (RYONGJIN)**

- Tech Advisor to CEO @ MegazoneCloud
- Former: CTO @ Focusmedia Korea, SVP @ DBS Bank, Principal @ Pivotal, SA @ AWS

---

## License

ISC
