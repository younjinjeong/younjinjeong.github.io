// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration for RYONGJIN's Blog E2E Tests
 */
module.exports = defineConfig({
  testDir: './e2e/tests',

  /* Run tests sequentially to avoid overwhelming Hugo server */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Use single worker to avoid overwhelming Hugo server */
  workers: 1,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report' }],
    ['json', { outputFile: 'e2e/test-results.json' }],
    ['list']
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:1313',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',

    /* Navigation timeout */
    navigationTimeout: 60000,

    /* Action timeout */
    actionTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: 'hugo server -D --bind 0.0.0.0 -p 1313',
    url: 'http://localhost:1313',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Output folder for test artifacts */
  outputDir: 'e2e/test-results',

  /* Timeout for each test */
  timeout: 60000,

  /* Expect timeout */
  expect: {
    timeout: 15000,
  },
});
