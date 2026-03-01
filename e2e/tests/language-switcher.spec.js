// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Language Switcher Tests
 * Tests bilingual article language switching and browser detection
 */

const EN_ARTICLE = '/2026/03/microfoundry/';
const KO_ARTICLE = '/2026/03/microfoundry-ko/';

test.describe('Language Switcher — Rendering', () => {
  test('English article shows language switcher', async ({ page }) => {
    await page.goto(EN_ARTICLE);
    await page.waitForTimeout(2000);

    const switcher = page.locator('.language-switcher');
    await expect(switcher).toBeVisible();

    // EN should be active (non-link span)
    const activeEn = switcher.locator('.lang-option.active');
    await expect(activeEn).toHaveText('EN');

    // KO should be a clickable link
    const koLink = switcher.locator('a.lang-option[data-lang="ko"]');
    await expect(koLink).toBeVisible();
    await expect(koLink).toHaveAttribute('href', KO_ARTICLE);

    await page.screenshot({ path: 'e2e/screenshots/lang-switcher-en.png' });
  });

  test('Korean article shows language switcher', async ({ page }) => {
    await page.goto(KO_ARTICLE);
    await page.waitForTimeout(2000);

    const switcher = page.locator('.language-switcher');
    await expect(switcher).toBeVisible();

    // KO should be active
    const activeKo = switcher.locator('.lang-option.active');
    await expect(activeKo).toHaveText('KO');

    // EN should be a clickable link
    const enLink = switcher.locator('a.lang-option[data-lang="en"]');
    await expect(enLink).toBeVisible();
    await expect(enLink).toHaveAttribute('href', EN_ARTICLE);
  });

  test('non-bilingual article has no language switcher', async ({ page }) => {
    await page.goto('/2026/02/why-every-financial-database-needs-a-proper-money-type/');
    await page.waitForTimeout(2000);

    const switcher = page.locator('.language-switcher');
    await expect(switcher).toHaveCount(0);
  });
});

test.describe('Language Switcher — Navigation', () => {
  test('clicking KO navigates to Korean version', async ({ page }) => {
    await page.goto(EN_ARTICLE);
    await page.waitForTimeout(2000);

    const koLink = page.locator('.language-switcher a[data-lang="ko"]');
    await koLink.click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(new RegExp(KO_ARTICLE.replace(/\//g, '\\/')));

    // Verify Korean article has lang="ko"
    const article = page.locator('article[lang="ko"]');
    await expect(article).toHaveCount(1);
  });

  test('clicking EN navigates to English version', async ({ page }) => {
    await page.goto(KO_ARTICLE);
    await page.waitForTimeout(2000);

    const enLink = page.locator('.language-switcher a[data-lang="en"]');
    await enLink.click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(new RegExp(EN_ARTICLE.replace(/\//g, '\\/')));
  });
});

test.describe('Language Switcher — Browser Detection', () => {
  test('Korean browser sees suggestion on English article', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'ko-KR' });
    const page = await context.newPage();

    await page.goto(EN_ARTICLE);
    await page.waitForTimeout(3500);

    const suggestion = page.locator('.lang-suggestion.visible');
    await expect(suggestion).toBeVisible();

    const suggestLink = suggestion.locator('a');
    await expect(suggestLink).toHaveAttribute('href', KO_ARTICLE);

    await page.screenshot({ path: 'e2e/screenshots/lang-suggestion-ko-browser.png' });
    await context.close();
  });

  test('English browser sees no suggestion on English article', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();

    await page.goto(EN_ARTICLE);
    await page.waitForTimeout(3500);

    const suggestion = page.locator('.lang-suggestion.visible');
    await expect(suggestion).toHaveCount(0);

    await context.close();
  });

  test('dismiss button hides suggestion', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'ko-KR' });
    const page = await context.newPage();

    await page.goto(EN_ARTICLE);
    await page.waitForTimeout(3500);

    const suggestion = page.locator('.lang-suggestion');
    await expect(suggestion).toBeVisible();

    await suggestion.locator('.dismiss-btn').click();
    await page.waitForTimeout(500);

    await expect(page.locator('.lang-suggestion.visible')).toHaveCount(0);
    await context.close();
  });
});
