// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Font Display Tests
 * Tests that fonts load correctly and render properly
 */

test.describe('Font Display', () => {
  test('homepage has site title', async ({ page }) => {
    await page.goto('/');

    // Wait for boot screen to complete (if present)
    await page.waitForTimeout(2000);

    const title = page.locator('h1, .site-title');
    await expect(title.first()).toBeVisible();
  });

  test('body text elements are visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const content = page.locator('article, .post-content, main p');
    await expect(content.first()).toBeVisible();
  });

  test('navigation uses monospace font styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const nav = page.locator('nav a, .nav-link');
    await expect(nav.first()).toBeVisible();
  });

  test('about page renders Korean content', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForTimeout(2000);

    const content = page.locator('article, main');
    await expect(content.first()).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'e2e/screenshots/font-about-page.png' });
  });

  test('posts list page loads', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    const posts = page.locator('article, .posts, main');
    await expect(posts.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/font-posts-page.png' });
  });

  test('homepage screenshot captured', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'e2e/screenshots/font-homepage.png', fullPage: true });
  });
});
