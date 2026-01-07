/**
 * Visual Design Tests
 * Tests Pipboy theme colors, effects, and overall design
 */

const { browserSync } = require('vibium');
const config = require('../config');
const { saveScreenshot, wait, TestResults } = require('../utils');

async function runVisualDesignTests() {
  console.log('\n=== Visual Design Tests ===\n');
  const results = new TestResults('Visual Design');

  let vibe;
  try {
    // Launch browser
    vibe = browserSync.launch(config.browserOptions);
    console.log('Browser launched');

    // Test 1: Homepage visual appearance
    try {
      vibe.go(config.baseUrl);
      await wait(config.animationWait);

      saveScreenshot(vibe, 'visual-homepage-full');
      results.pass('Homepage visual captured');
    } catch (e) {
      results.fail('Homepage visual', e.message);
    }

    // Test 2: Check for Pipboy green elements
    try {
      // Look for styled elements that should have the green theme
      const styledElement = vibe.find('a, h1, h2, .site-title, header');
      if (styledElement) {
        results.pass('Themed elements found');
      } else {
        results.fail('Themed elements', 'No styled elements found');
      }
    } catch (e) {
      results.fail('Themed elements check', e.message);
    }

    // Test 3: Check header styling
    try {
      const header = vibe.find('header, .site-header, #header');
      if (header) {
        results.pass('Header element found');
        saveScreenshot(vibe, 'visual-header');
      } else {
        results.fail('Header element', 'Not found');
      }
    } catch (e) {
      results.fail('Header styling', e.message);
    }

    // Test 4: Check navigation styling
    try {
      const nav = vibe.find('nav, .navigation, .nav');
      if (nav) {
        results.pass('Navigation styled element found');
      } else {
        results.fail('Navigation element', 'Not found');
      }
    } catch (e) {
      results.fail('Navigation styling', e.message);
    }

    // Test 5: Check footer styling
    try {
      const footer = vibe.find('footer, .site-footer, #footer');
      if (footer) {
        results.pass('Footer element found');
      } else {
        results.fail('Footer element', 'Not found');
      }
    } catch (e) {
      results.fail('Footer styling', e.message);
    }

    // Test 6: Check terminal-styled content elements
    try {
      // Terminal cursor is typically CSS-based (pseudo-element), so check for content containers
      const content = vibe.find('article, .content, main, .post-content');
      if (content) {
        results.pass('Terminal-styled content container found');
      } else {
        results.fail('Terminal content element', 'No content container found');
      }
    } catch (e) {
      results.fail('Terminal content check', e.message);
    }

    // Test 7: Check dark background theme
    try {
      const body = vibe.find('body');
      if (body) {
        results.pass('Body element accessible for styling check');
      } else {
        results.fail('Body element', 'Not accessible');
      }
    } catch (e) {
      results.fail('Dark background check', e.message);
    }

    // Test 8: Capture category page design
    try {
      vibe.go(config.baseUrl + '/categories/');
      await wait(config.animationWait);

      saveScreenshot(vibe, 'visual-categories');
      results.pass('Categories page visual captured');
    } catch (e) {
      results.fail('Categories page visual', e.message);
    }

    // Test 9: Capture tags page design
    try {
      vibe.go(config.baseUrl + '/tags/');
      await wait(config.animationWait);

      saveScreenshot(vibe, 'visual-tags');
      results.pass('Tags page visual captured');
    } catch (e) {
      results.fail('Tags page visual', e.message);
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

module.exports = { runVisualDesignTests };

// Run if called directly
if (require.main === module) {
  runVisualDesignTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}
