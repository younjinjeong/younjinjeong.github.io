// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Typography Tests
 * Validates heading hierarchy, code sizing, and font consistency across devices
 */

const ENGLISH_ARTICLE = '/2026/02/why-every-financial-database-needs-a-proper-money-type/';
const KOREAN_ARTICLE = '/2025/07/thinking-about-ai-technologies/';

/** Parse computed fontSize string (e.g. "22px") to number */
function parsePx(value) {
  return parseFloat(value.replace('px', ''));
}

test.describe('Typography — Heading Hierarchy', () => {
  test('content headings decrease in size and all larger than body', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const bodySize = await page.locator('.post-content p').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );

    // Collect heading sizes within .post-content only
    const headingSizes = {};
    for (const level of ['h2', 'h3', 'h4', 'h5', 'h6']) {
      const heading = page.locator(`.post-content ${level}`).first();
      if (await heading.count() > 0) {
        headingSizes[level] = await heading.evaluate(
          el => parseFloat(getComputedStyle(el).fontSize)
        );
      }
    }

    // Every content heading must be larger than body text
    for (const [level, size] of Object.entries(headingSizes)) {
      expect(size, `${level} (${size}px) should be larger than body (${bodySize}px)`).toBeGreaterThan(bodySize);
    }

    // Content headings must decrease: h2 > h3 > h4 > h5 > h6
    const levels = Object.keys(headingSizes).sort();
    for (let i = 0; i < levels.length - 1; i++) {
      const higher = levels[i];
      const lower = levels[i + 1];
      expect(
        headingSizes[higher],
        `${higher} (${headingSizes[higher]}px) should be larger than ${lower} (${headingSizes[lower]}px)`
      ).toBeGreaterThan(headingSizes[lower]);
    }
  });

  test('page title is larger than content headings', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const titleSize = await page.locator('.post > header h1').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );

    const h2 = page.locator('.post-content h2').first();
    if (await h2.count() > 0) {
      const h2Size = await h2.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      expect(titleSize, `title (${titleSize}px) should be >= h2 (${h2Size}px)`).toBeGreaterThanOrEqual(h2Size);
    }
  });

  test('h2/body ratio > 1.5 — proves hierarchy is not flat', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const bodySize = await page.locator('.post-content p').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );

    const h2 = page.locator('.post-content h2').first();
    if (await h2.count() > 0) {
      const h2Size = await h2.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      const ratio = h2Size / bodySize;
      expect(ratio, `h2/body ratio (${ratio.toFixed(2)}) should be > 1.5`).toBeGreaterThan(1.5);
    }
  });
});

test.describe('Typography — Code Sizing', () => {
  test('code blocks use D2Coding font (same as body)', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const codeBlock = page.locator('pre code, .highlight code').first();
    if (await codeBlock.count() > 0) {
      const fontFamily = await codeBlock.evaluate(el => getComputedStyle(el).fontFamily);
      expect(fontFamily.toLowerCase()).toContain('d2coding');
    }
  });

  test('code font size is 75-100% of body text', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const bodySize = await page.locator('.post-content p').first().evaluate(
      el => parseFloat(getComputedStyle(el).fontSize)
    );

    const codeBlock = page.locator('pre code, .highlight code').first();
    if (await codeBlock.count() > 0) {
      const codeSize = await codeBlock.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      const ratio = codeSize / bodySize;
      expect(ratio, `code/body ratio (${ratio.toFixed(2)}) should be >= 0.85`).toBeGreaterThanOrEqual(0.85);
      expect(ratio, `code/body ratio (${ratio.toFixed(2)}) should be <= 1.0`).toBeLessThanOrEqual(1.0);
    }
  });

  test('inline code matches code block size', async ({ page }) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(2000);

    const inlineCode = page.locator('.post-content p code, .post-content li code').first();
    const blockCode = page.locator('pre code, .highlight code').first();

    if (await inlineCode.count() > 0 && await blockCode.count() > 0) {
      const inlineSize = await inlineCode.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      const blockSize = await blockCode.evaluate(el => parseFloat(getComputedStyle(el).fontSize));

      // Inline and block code should be within 2px of each other
      expect(Math.abs(inlineSize - blockSize)).toBeLessThanOrEqual(2);
    }
  });
});

test.describe('Typography — Korean Content', () => {
  test('Korean article uses D2Coding font', async ({ page }) => {
    await page.goto(KOREAN_ARTICLE);
    await page.waitForTimeout(2000);

    const article = page.locator('article[lang="ko"], article.post');
    if (await article.count() > 0) {
      const content = page.locator('.post-content p').first();
      const fontFamily = await content.evaluate(el => getComputedStyle(el).fontFamily);
      expect(
        fontFamily.toLowerCase(),
        `Korean content font-family should include D2Coding`
      ).toContain('d2coding');
    }
  });

  test('Korean article has lang="ko" attribute', async ({ page }) => {
    await page.goto(KOREAN_ARTICLE);
    await page.waitForTimeout(2000);

    const article = page.locator('article[lang="ko"]');
    await expect(article).toHaveCount(1);
  });
});

test.describe('Typography — Visual Regression Screenshots', () => {
  test('English article screenshot', async ({ page, browserName }, testInfo) => {
    await page.goto(ENGLISH_ARTICLE);
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `e2e/screenshots/typography-english-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test('Homepage screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `e2e/screenshots/typography-homepage-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test('Posts list screenshot', async ({ page }, testInfo) => {
    await page.goto('/posts/');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `e2e/screenshots/typography-posts-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
