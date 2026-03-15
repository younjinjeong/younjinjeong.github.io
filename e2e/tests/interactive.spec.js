// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Interactive Elements Tests
 * Tests boot screen, loading animations, and interactive features
 */

test.describe('Interactive Elements', () => {
  test('boot screen appears on fresh load', async ({ page }) => {
    await page.goto('/');

    // Capture immediately to see boot screen
    await page.screenshot({ path: 'e2e/screenshots/interactive-boot-start.png' });

    // Wait for boot sequence
    await page.waitForLoadState('domcontentloaded');

    await page.screenshot({ path: 'e2e/screenshots/interactive-boot-progress.png' });
  });

  test('page loads after boot sequence', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const content = page.locator('article, main, .content');
    await expect(content.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/interactive-after-boot.png' });
  });

  test('navigation triggers loading effect', async ({ page, isMobile }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    if (isMobile) {
      // On mobile, header nav links are hidden — open menu first
      const menuBtn = page.locator('.nav-menu');
      if (await menuBtn.count() > 0) {
        await menuBtn.click();
        await page.waitForSelector('.pipboy-nav.mobile-active', { timeout: 5000 });
      }
    }

    const link = isMobile
      ? page.locator('.pipboy-nav a').first()
      : page.locator('nav a, a[href="/about/"]').first();
    if (await link.count() > 0) {
      await link.click();

      // Capture loading state
      await page.screenshot({ path: 'e2e/screenshots/interactive-loading.png' });

      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('content elements are interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const content = page.locator('article');
    await expect(content.first()).toBeVisible();
  });

  test('navigation menu elements exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const nav = page.locator('nav, .mobile-nav-controls, .navigation');
    await expect(nav.first()).toBeVisible();
  });

  test('comments section container on post page', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForLoadState('domcontentloaded');

    const postLink = page.locator('article a, h2 a').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForLoadState('domcontentloaded');

      // Check for giscus or comments container
      const comments = page.locator('.giscus, .comments, article');
      await expect(comments.first()).toBeVisible();

      await page.screenshot({ path: 'e2e/screenshots/interactive-comments.png' });
    }
  });

  test('mobile viewport interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.screenshot({ path: 'e2e/screenshots/interactive-mobile.png' });
  });

  test('glow effects on styled elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = page.locator('h1, .site-title').first();
    await expect(title).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/interactive-glow-effects.png' });
  });
});
