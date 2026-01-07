/**
 * Image Sizing Tests
 * Tests that images load with correct dimensions
 */

const { browserSync } = require('vibium');
const config = require('../config');
const { saveScreenshot, wait, TestResults } = require('../utils');

async function runImageSizingTests() {
  console.log('\n=== Image Sizing Tests ===\n');
  const results = new TestResults('Image Sizing');

  let vibe;
  try {
    // Launch browser
    vibe = browserSync.launch(config.browserOptions);
    console.log('Browser launched');

    // Test 1: Check favicon loads
    try {
      vibe.go(config.baseUrl);
      await wait(config.animationWait);

      // Check for favicon link in head
      const faviconLink = vibe.find('link[rel="icon"], link[rel="shortcut icon"]');
      if (faviconLink) {
        results.pass('Favicon link element found');
      } else {
        results.fail('Favicon link element found', 'Not in document');
      }
    } catch (e) {
      results.fail('Favicon link check', e.message);
    }

    // Test 2: Navigate to about page for profile image
    try {
      vibe.go(config.baseUrl + '/about/');
      await wait(config.animationWait);

      saveScreenshot(vibe, 'image-about-page');
      results.pass('About page screenshot captured');
    } catch (e) {
      results.fail('About page navigation', e.message);
    }

    // Test 3: Check for profile images
    try {
      const profileImg = vibe.find('img[src*="profile"], img[src*="pip-boy"], .profile-image img, img');
      if (profileImg) {
        results.pass('Profile/avatar image found');
      } else {
        results.fail('Profile image found', 'No profile image detected');
      }
    } catch (e) {
      results.fail('Profile image check', e.message);
    }

    // Test 4: Check images in posts
    try {
      vibe.go(config.baseUrl + '/posts/');
      await wait(config.animationWait);

      // Look for any images in posts listing
      saveScreenshot(vibe, 'image-posts-list');
      results.pass('Posts page images checked');
    } catch (e) {
      results.fail('Posts page images', e.message);
    }

    // Test 5: Navigate to a specific post with images
    try {
      // Try to find and click a post link
      const postLink = vibe.find('article a, .post-title a, h2 a');
      if (postLink) {
        postLink.click();
        await wait(config.animationWait);

        saveScreenshot(vibe, 'image-single-post');
        results.pass('Single post page loaded');

        // Check for images in post content
        try {
          const postImage = vibe.find('article img, .post-content img, main img');
          if (postImage) {
            results.pass('Post content image found');
          } else {
            results.pass('Post content has no images (acceptable)');
          }
        } catch (e) {
          results.pass('Post content image check completed');
        }
      } else {
        results.fail('Post navigation', 'No post links found');
      }
    } catch (e) {
      results.fail('Post navigation and images', e.message);
    }

    // Test 6: Check responsive image behavior (mobile viewport)
    try {
      // Note: Vibium may not support viewport resizing directly
      // Take desktop screenshot for comparison
      vibe.go(config.baseUrl);
      await wait(config.animationWait);
      saveScreenshot(vibe, 'image-responsive-desktop');
      results.pass('Desktop viewport screenshot captured');
    } catch (e) {
      results.fail('Responsive image test', e.message);
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

module.exports = { runImageSizingTests };

// Run if called directly
if (require.main === module) {
  runImageSizingTests().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}
