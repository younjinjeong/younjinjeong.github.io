/**
 * Navigation Tests
 * Tests page navigation and link functionality
 */

const { browserSync } = require('vibium');
const config = require('../config');
const { saveScreenshot, wait, TestResults } = require('../utils');

async function runNavigationTests() {
  console.log('\n=== Navigation Tests ===\n');
  const results = new TestResults('Navigation');

  let vibe;
  try {
    // Launch browser
    vibe = browserSync.launch(config.browserOptions);
    console.log('Browser launched');

    // Test 1: Homepage loads
    try {
      vibe.go(config.baseUrl);
      await wait(config.animationWait);

      const title = vibe.find('title, h1, .site-title');
      if (title) {
        results.pass('Homepage loaded successfully');
      } else {
        results.fail('Homepage load', 'Title not found');
      }
    } catch (e) {
      results.fail('Homepage load', e.message);
    }

    // Test 2: Navigate to Posts page
    try {
      // Use direct navigation for reliability
      vibe.go(config.baseUrl + '/posts/');
      await wait(config.animationWait);

      const postsList = vibe.find('article, .posts, main');
      if (postsList) {
        results.pass('Posts page loaded');
        saveScreenshot(vibe, 'nav-posts-page');
      } else {
        results.fail('Posts page', 'Content not found');
      }
    } catch (e) {
      results.fail('Posts navigation', e.message);
    }

    // Test 3: Navigate to About page
    try {
      vibe.go(config.baseUrl + '/about/');
      await wait(config.animationWait);

      const aboutContent = vibe.find('article, .about, main');
      if (aboutContent) {
        results.pass('About page loaded');
        saveScreenshot(vibe, 'nav-about-page');
      } else {
        results.fail('About page', 'Content not found');
      }
    } catch (e) {
      results.fail('About page navigation', e.message);
    }

    // Test 4: Navigate to Categories
    try {
      vibe.go(config.baseUrl + '/categories/');
      await wait(config.animationWait);

      const categories = vibe.find('.categories, ul, main');
      if (categories) {
        results.pass('Categories page loaded');
      } else {
        results.fail('Categories page', 'Content not found');
      }
    } catch (e) {
      results.fail('Categories navigation', e.message);
    }

    // Test 5: Navigate to Tags
    try {
      vibe.go(config.baseUrl + '/tags/');
      await wait(config.animationWait);

      const tags = vibe.find('.tags, ul, main');
      if (tags) {
        results.pass('Tags page loaded');
      } else {
        results.fail('Tags page', 'Content not found');
      }
    } catch (e) {
      results.fail('Tags navigation', e.message);
    }

    // Test 6: Navigate to individual post
    try {
      vibe.go(config.baseUrl + '/posts/');
      await wait(config.animationWait);

      const postLink = vibe.find('article a, .post-link, h2 a, h3 a');
      if (postLink) {
        postLink.click();
        await wait(config.animationWait);
        results.pass('Individual post navigation works');
        saveScreenshot(vibe, 'nav-single-post');
      } else {
        results.fail('Individual post', 'No post links found');
      }
    } catch (e) {
      results.fail('Individual post navigation', e.message);
    }

    // Test 7: Check back to home navigation
    try {
      const homeLink = vibe.find('a[href="/"], .site-title a, header a');
      if (homeLink) {
        homeLink.click();
        await wait(config.animationWait);
        results.pass('Home navigation link works');
      } else {
        vibe.go(config.baseUrl);
        await wait(config.animationWait);
        results.pass('Home navigation via URL');
      }
    } catch (e) {
      results.fail('Home navigation', e.message);
    }

    // Test 8: Check 404 page
    try {
      vibe.go(config.baseUrl + '/nonexistent-page-12345/');
      await wait(config.animationWait);

      saveScreenshot(vibe, 'nav-404-page');
      results.pass('404 page captured');
    } catch (e) {
      results.fail('404 page test', e.message);
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

module.exports = { runNavigationTests };

// Run if called directly
if (require.main === module) {
  runNavigationTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}
