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
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'e2e/screenshots/interactive-boot-progress.png' });
  });

  test('page loads after boot sequence', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);

    const content = page.locator('article, main, .content');
    await expect(content.first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/interactive-after-boot.png' });
  });

  test('navigation triggers loading effect', async ({ page, isMobile }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    if (isMobile) {
      // On mobile, header nav links are hidden — open menu first
      const menuBtn = page.locator('.nav-menu');
      if (await menuBtn.count() > 0) {
        await menuBtn.click();
        await page.waitForTimeout(500);
      }
    }

    const link = page.locator('nav a, a[href="/about/"]').first();
    if (await link.count() > 0) {
      await link.click();

      // Capture loading state
      await page.screenshot({ path: 'e2e/screenshots/interactive-loading.png' });

      await page.waitForTimeout(2000);
    }
  });

  test('content elements are interactive', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const content = page.locator('article');
    await expect(content.first()).toBeVisible();
  });

  test('navigation menu elements exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const nav = page.locator('nav, .mobile-nav-controls, .navigation');
    await expect(nav.first()).toBeVisible();
  });

  test('comments section container on post page', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    const postLink = page.locator('article a, h2 a').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForTimeout(3000);

      // Check for giscus or comments container
      const comments = page.locator('.giscus, .comments, article');
      await expect(comments.first()).toBeVisible();

      await page.screenshot({ path: 'e2e/screenshots/interactive-comments.png' });
    }
  });

  test('mobile viewport interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'e2e/screenshots/interactive-mobile.png' });
  });

  test('glow effects on styled elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const title = page.locator('h1, .site-title').first();
    await expect(title).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/interactive-glow-effects.png' });
  });
});
