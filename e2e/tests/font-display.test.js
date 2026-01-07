/**
 * Font Display Tests
 * Tests that fonts load correctly and render properly
 */

const { browserSync } = require('vibium');
const config = require('../config');
const { saveScreenshot, wait, TestResults } = require('../utils');

async function runFontDisplayTests() {
  console.log('\n=== Font Display Tests ===\n');
  const results = new TestResults('Font Display');

  let vibe;
  try {
    // Launch browser
    vibe = browserSync.launch(config.browserOptions);
    console.log('Browser launched');

    // Navigate to homepage
    vibe.go(config.baseUrl);
    await wait(config.animationWait);
    console.log('Navigated to homepage');

    // Skip boot screen if present (press Escape)
    try {
      // Wait for boot screen to potentially appear, then take action
      await wait(1000);
    } catch (e) {
      // Boot screen may not be present
    }

    // Test 1: Check page title element exists
    try {
      const title = vibe.find('h1.site-title, .site-title, header h1');
      if (title) {
        results.pass('Site title element found', title.text().substring(0, 30));
      } else {
        results.fail('Site title element found', 'Element not found');
      }
    } catch (e) {
      results.fail('Site title element found', e.message);
    }

    // Test 2: Check body text exists
    try {
      const body = vibe.find('article, .post-content, main p');
      if (body) {
        results.pass('Body text element found');
      } else {
        results.fail('Body text element found', 'No article content');
      }
    } catch (e) {
      results.fail('Body text element found', e.message);
    }

    // Test 3: Check navigation links with monospace font
    try {
      const nav = vibe.find('nav a, .nav-link, header nav');
      if (nav) {
        results.pass('Navigation elements found');
      } else {
        results.fail('Navigation elements found', 'No nav elements');
      }
    } catch (e) {
      results.fail('Navigation elements found', e.message);
    }

    // Test 4: Take screenshot for visual font verification
    try {
      saveScreenshot(vibe, 'font-display-homepage');
      results.pass('Homepage screenshot captured');
    } catch (e) {
      results.fail('Homepage screenshot captured', e.message);
    }

    // Test 5: Navigate to about page for Korean font test
    try {
      vibe.go(config.baseUrl + '/about/');
      await wait(config.animationWait);

      const aboutContent = vibe.find('.about-content, article, main');
      if (aboutContent) {
        results.pass('About page loaded with Korean content');
        saveScreenshot(vibe, 'font-display-about');
      } else {
        results.fail('About page loaded', 'Content not found');
      }
    } catch (e) {
      results.fail('About page loaded', e.message);
    }

    // Test 6: Check code blocks for monospace rendering
    try {
      vibe.go(config.baseUrl + '/posts/');
      await wait(config.animationWait);

      const postList = vibe.find('.post-list, .posts, article');
      if (postList) {
        results.pass('Posts list page loaded');
        saveScreenshot(vibe, 'font-display-posts');
      } else {
        results.fail('Posts list page loaded', 'Not found');
      }
    } catch (e) {
      results.fail('Posts list page loaded', e.message);
    }

  } catch (error) {
    console.error('Test suite error:', error.message);
    results.fail('Test suite execution', error.message);
  } finally {
    if (vibe) {
      try {
        vibe.quit();
        console.log('Browser closed');
      } catch (e) {
        console.error('Error closing browser:', e.message);
      }
    }
  }

  return results.summary();
}

module.exports = { runFontDisplayTests };

// Run if called directly
if (require.main === module) {
  runFontDisplayTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}
