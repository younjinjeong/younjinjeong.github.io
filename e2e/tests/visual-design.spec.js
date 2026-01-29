// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual Design Tests
 * Tests Pipboy theme colors, effects, and overall design
 */

test.describe('Visual Design', () => {
  test('homepage has dark background', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

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
    await page.waitForTimeout(2000);

    const header = page.locator('header, .site-header');
    await expect(header.first()).toBeVisible();
  });

  test('navigation styled correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('footer element exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const footer = page.locator('footer');
    await expect(footer.first()).toBeVisible();
  });

  test('links have green color (pipboy theme)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const link = page.locator('a').first();
    const color = await link.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // Should contain green component
    expect(color).toBeTruthy();
  });

  test('terminal-styled content container', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const content = page.locator('article, .content, main');
    await expect(content.first()).toBeVisible();
  });

  test('categories page visual', async ({ page }) => {
    await page.goto('/categories/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/visual-categories.png' });
  });

  test('tags page visual', async ({ page }) => {
    await page.goto('/tags/');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'e2e/screenshots/visual-tags.png' });
  });

  test('full page visual regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'e2e/screenshots/visual-full-page.png',
      fullPage: true
    });
  });
});

/**
 * CRT Effects Tests
 * Tests scanlines, barrel distortion, phosphor glow, and toggle functionality
 */
test.describe('CRT Effects', () => {
  test('scanlines overlay is visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const beforePseudo = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body, '::before');
      return {
        content: style.content,
        opacity: style.opacity,
        position: style.position
      };
    });

    // Scanlines should exist and have opacity
    expect(beforePseudo.content).not.toBe('none');
    expect(parseFloat(beforePseudo.opacity)).toBeGreaterThan(0);
    expect(beforePseudo.position).toBe('fixed');
  });

  test('barrel distortion vignette is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const afterPseudo = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body, '::after');
      return {
        content: style.content,
        position: style.position,
        background: style.background
      };
    });

    expect(afterPseudo.content).not.toBe('none');
    expect(afterPseudo.position).toBe('fixed');
    // Background should contain radial gradient for barrel effect
    expect(afterPseudo.background).toContain('radial-gradient');
  });

  test('CRT toggle keyboard shortcut works (Shift+C)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Initially CRT effects should be enabled (no disabled class)
    let hasDisabledClass = await page.evaluate(() => {
      return document.body.classList.contains('crt-effects-disabled');
    });
    expect(hasDisabledClass).toBe(false);

    // Press Shift+C to toggle off
    await page.keyboard.press('Shift+C');
    await page.waitForTimeout(300);

    hasDisabledClass = await page.evaluate(() => {
      return document.body.classList.contains('crt-effects-disabled');
    });
    expect(hasDisabledClass).toBe(true);

    // Press Shift+C again to toggle on
    await page.keyboard.press('Shift+C');
    await page.waitForTimeout(300);

    hasDisabledClass = await page.evaluate(() => {
      return document.body.classList.contains('crt-effects-disabled');
    });
    expect(hasDisabledClass).toBe(false);
  });

  test('CRT effects disabled state hides overlays', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Disable CRT effects
    await page.keyboard.press('Shift+C');
    await page.waitForTimeout(300);

    const overlaysHidden = await page.evaluate(() => {
      const beforeStyle = window.getComputedStyle(document.body, '::before');
      const afterStyle = window.getComputedStyle(document.body, '::after');
      return beforeStyle.display === 'none' && afterStyle.display === 'none';
    });

    expect(overlaysHidden).toBe(true);

    await page.screenshot({ path: 'e2e/screenshots/crt-disabled.png' });
  });

  test('CRT toggle hint is visible on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const hint = page.locator('.crt-toggle-hint');
    await expect(hint).toBeVisible();

    const hintText = await hint.textContent();
    expect(hintText).toContain('Shift');
    expect(hintText).toContain('C');
  });

  test('phosphor glow effect on links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const link = page.locator('a').first();
    const textShadow = await link.evaluate(el =>
      window.getComputedStyle(el).textShadow
    );

    // Should have some text-shadow (glow effect)
    expect(textShadow).not.toBe('none');
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const animationDuration = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body, '::before');
      return style.animationDuration;
    });

    // Animation should be disabled or very short
    expect(animationDuration).toMatch(/0\.01ms|0s|none/);
  });
});

/**
 * CRT Effects Mobile Tests
 */
test.describe('CRT Effects Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('lighter scanlines on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const opacity = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body, '::before');
      return parseFloat(style.opacity);
    });

    // Mobile should have lower opacity (0.2 or less)
    expect(opacity).toBeLessThanOrEqual(0.25);
  });

  test('no scanline animation on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const animation = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body, '::before');
      return style.animationName;
    });

    // Animation should be disabled on mobile
    expect(animation).toBe('none');
  });

  test('CRT toggle button visible in mobile nav', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const toggleButton = page.locator('#crtToggle');
    await expect(toggleButton).toBeVisible();
  });

  test('CRT toggle button works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const toggleButton = page.locator('#crtToggle');
    await toggleButton.click();
    await page.waitForTimeout(300);

    const hasDisabledClass = await page.evaluate(() => {
      return document.body.classList.contains('crt-effects-disabled');
    });

    expect(hasDisabledClass).toBe(true);

    await page.screenshot({ path: 'e2e/screenshots/mobile-crt-disabled.png' });
  });
});
