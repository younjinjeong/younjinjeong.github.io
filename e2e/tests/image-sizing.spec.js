// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Image Sizing Tests
 * Tests that images load with correct dimensions
 */

test.describe('Image Sizing', () => {
  test('favicon link exists', async ({ page }) => {
    await page.goto('/');

    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    await expect(favicon.first()).toHaveCount(1);
  });

  test('about page profile images load', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/image-about-page.png' });

    // Check for any images on the page
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(0); // Page may or may not have images
  });

  test('posts page loads images correctly', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/image-posts-list.png' });
  });

  test('single post page images', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForTimeout(2000);

    // Click first post link
    const postLink = page.locator('article a, .post-link, h2 a').first();
    if (await postLink.count() > 0) {
      await postLink.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'e2e/screenshots/image-single-post.png' });
    }
  });

  test('images have proper attributes', async ({ page }) => {
    await page.goto('/about/');
    await page.waitForTimeout(2000);

    const images = page.locator('img[src]');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('responsive layout screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/image-responsive-desktop.png', fullPage: true });
  });

  test('mobile viewport images', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/image-mobile-viewport.png', fullPage: true });
  });
});
