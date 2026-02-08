# Test Post for Strapi CMS / Strapi CMS 테스트 포스트

Use the content below to create a new post in the Strapi admin panel for testing.
아래 내용을 Strapi 관리자 패널에서 새 포스트를 만들 때 사용하세요.

---

## How to create this post in Strapi / Strapi에서 포스트 만드는 방법

1. Go to `https://blog-cms-strapi-3lzr.onrender.com/admin`
   `https://blog-cms-strapi-3lzr.onrender.com/admin` 으로 접속합니다.

2. Click **Content Manager** in the left sidebar
   왼쪽 사이드바에서 **Content Manager** 를 클릭합니다.

3. Click **Post** → **Create new entry**
   **Post** → **Create new entry** 를 클릭합니다.

4. Fill in the fields as follows / 아래와 같이 필드를 입력합니다:

### Field Values / 필드 값

| Field | Value |
|-------|-------|
| **title** | Strapi CMS 연동 테스트 — Testing the CMS Pipeline |
| **slug** | strapi-cms-integration-test |
| **date** | (today's date, e.g. 2026-02-09T00:00:00.000Z) |
| **content** | (paste the content below / 아래 내용을 붙여넣기) |
| **summary** | Strapi CMS와 Hugo 블로그의 연동을 테스트하는 포스트입니다. A test post to verify the Strapi-to-Hugo pipeline works end-to-end. |
| **comments_enabled** | true |
| **categories** | Tech |
| **tags** | strapi, cms, test |
| **author** | younjinjeong |

### Content to paste / 붙여넣을 내용

---

## Strapi CMS 연동 테스트

이 포스트는 **Strapi CMS**와 **Hugo 블로그** 사이의 콘텐츠 파이프라인을 테스트하기 위해 작성되었습니다.

### 이 블로그의 동작 방식

이 블로그는 두 개의 리포지토리로 구성되어 있습니다:

1. **blog-cms** (비공개 리포지토리) — Strapi v5 헤드리스 CMS
   - 포스트 작성 및 편집
   - 카테고리, 태그, 작성자 관리
   - Google Analytics 대시보드
   - Render.com에서 호스팅 (무료 플랜)

2. **younjinjeong.github.io** (공개 리포지토리) — Hugo 정적 사이트
   - Pip-Boy 터미널 테마 (Fallout 스타일)
   - Playwright E2E 테스트
   - GitHub Actions CI/CD
   - GitHub Pages에서 호스팅

### 콘텐츠 흐름

```
Strapi에서 글 작성 → REST API → GitHub Actions → Hugo 빌드 → GitHub Pages 배포
```

Strapi 관리자 패널에서 포스트를 작성하고 **Publish** 버튼을 누르면, GitHub Actions가 Strapi API에서 최신 콘텐츠를 가져와서 Hugo로 빌드한 뒤 GitHub Pages에 배포합니다.

### 기술 스택

| 구성 요소 | 기술 |
|-----------|------|
| CMS | Strapi v5.35.0 |
| 정적 사이트 생성기 | Hugo 0.128.0 (extended) |
| 데이터베이스 | PostgreSQL (Render) |
| 호스팅 (CMS) | Render.com |
| 호스팅 (블로그) | GitHub Pages |
| CI/CD | GitHub Actions |
| 분석 | Google Analytics 4 |

---

## Testing the Strapi CMS Pipeline

This post was written to test the content pipeline between **Strapi CMS** and the **Hugo blog**.

### How This Blog Works

This blog is built with a two-repository architecture:

1. **blog-cms** (private repo) — Strapi v5 headless CMS
   - Write and edit posts
   - Manage categories, tags, and authors
   - Google Analytics dashboard
   - Hosted on Render.com (free tier)

2. **younjinjeong.github.io** (public repo) — Hugo static site
   - Pip-Boy terminal theme (Fallout-inspired)
   - Playwright E2E tests
   - GitHub Actions CI/CD
   - Hosted on GitHub Pages

### Content Flow

```
Write in Strapi → REST API → GitHub Actions → Hugo build → Deploy to GitHub Pages
```

When you write a post in the Strapi admin panel and click **Publish**, GitHub Actions fetches the latest content from the Strapi API, builds the site with Hugo, and deploys it to GitHub Pages.

### Tech Stack

| Component | Technology |
|-----------|------------|
| CMS | Strapi v5.35.0 |
| Static Site Generator | Hugo 0.128.0 (extended) |
| Database | PostgreSQL (Render) |
| Hosting (CMS) | Render.com |
| Hosting (Blog) | GitHub Pages |
| CI/CD | GitHub Actions |
| Analytics | Google Analytics 4 |

### Verifying the Pipeline

If you can see this post on [blog.younjinjeong.io](https://blog.younjinjeong.io), the Strapi CMS integration is working correctly!

이 포스트를 [blog.younjinjeong.io](https://blog.younjinjeong.io)에서 볼 수 있다면, Strapi CMS 연동이 정상적으로 작동하는 것입니다!

---

5. After pasting the content, set the **categories** relation to "Tech" and **tags** to "strapi", "cms", "test"
   내용을 붙여넣은 후, **categories** 관계를 "Tech"로, **tags**를 "strapi", "cms", "test"로 설정합니다.

6. Click **Save** to save as draft, or **Publish** to publish immediately
   **Save**를 클릭하면 초안으로 저장되고, **Publish**를 클릭하면 바로 게시됩니다.

7. After publishing, trigger a Hugo build:
   게시 후 Hugo 빌드를 트리거합니다:
   - Push any change to the blog repo, OR
     블로그 리포지토리에 아무 변경이든 푸시하거나,
   - Run the GitHub Actions workflow manually from the Actions tab
     Actions 탭에서 수동으로 워크플로우를 실행합니다.

8. Check the result at `https://blog.younjinjeong.io`
   `https://blog.younjinjeong.io`에서 결과를 확인합니다.
