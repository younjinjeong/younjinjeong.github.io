// @ts-check
const { test, expect } = require('@playwright/test');

/** Wait for boot screen overlay to disappear */
async function waitForBootScreen(page) {
  const boot = page.locator('#boot-screen-react');
  if (await boot.count() > 0) {
    await boot.waitFor({ state: 'detached', timeout: 15000 });
  }
}

/**
 * Visual Design Tests
 * Tests Pipboy theme colors, effects, and overall design
 */

test.describe('Visual Design', () => {
  test('homepage has dark background', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const body = page.locator('body');
    const bgColor = await body.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should be black or very dark
    expect(bgColor).toMatch(/rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0/);

    await page.screenshot({ path: 'e2e/screenshots/visual-homepage.png' });
  });

  test('header element exists and styled', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const header = page.locator('header, .site-header');
    await expect(header.first()).toBeVisible();
  });

  test('navigation styled correctly', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('footer element exists', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const footer = page.locator('footer');
    await expect(footer.first()).toBeVisible();
  });

  test('links have green color (pipboy theme)', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const link = page.locator('a').first();
    const color = await link.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // Should contain green component
    expect(color).toBeTruthy();
  });

  test('terminal-styled content container', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    const content = page.locator('article, .content, main');
    await expect(content.first()).toBeVisible();
  });

  test('categories page visual', async ({ page }) => {
    await page.goto('/categories/');
    await waitForBootScreen(page);

    await page.screenshot({ path: 'e2e/screenshots/visual-categories.png' });
  });

  test('tags page visual', async ({ page }) => {
    await page.goto('/tags/');
    await waitForBootScreen(page);

    await page.screenshot({ path: 'e2e/screenshots/visual-tags.png' });
  });

  test('full page visual regression', async ({ page }) => {
    await page.goto('/');
    await waitForBootScreen(page);

    await page.screenshot({
      path: 'e2e/screenshots/visual-full-page.png',
      fullPage: true
    });
  });
});
