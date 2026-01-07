// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Navigation Tests
 * Tests page navigation and link functionality
 */

test.describe('Navigation', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page).toHaveTitle(/RYONGJIN|Blog/i);
  });

  test('posts page navigates correctly', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    const content = page.locator('article, .posts, main');
    await expect(content.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/nav-posts-page.png' });
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForTimeout(2000);

    const content = page.locator('article, main');
    await expect(content.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/nav-about-page.png' });
  });

  test('categories page loads', async ({ page }) => {
    await page.goto('/categories/');
    await page.waitForTimeout(2000);

    const content = page.locator('main, .categories, ul');
    await expect(content.first()).toBeVisible();
  });

  test('tags page loads', async ({ page }) => {
    await page.goto('/tags/');
    await page.waitForTimeout(2000);

    const content = page.locator('main, .tags, ul');
    await expect(content.first()).toBeVisible();
  });

  test('individual post navigation', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    const postLink = page.locator('article a, .post-link, h2 a, h3 a').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForTimeout(2000);

      const article = page.locator('article, .post-content');
      await expect(article.first()).toBeVisible();

      await page.screenshot({ path: 'e2e/screenshots/nav-single-post.png' });
    }
  });

  test('home navigation works', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForTimeout(2000);

    const homeLink = page.locator('a[href="/"], .site-title a, header a').first();
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/\/$/);
    }
  });

  test('404 page for non-existent URL', async ({ page }) => {
    await page.goto('/nonexistent-page-12345/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/nav-404-page.png' });
  });
});
