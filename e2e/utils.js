/**
 * E2E Test Utilities
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

/**
 * Ensure screenshot directory exists
 */
function ensureScreenshotDir() {
  const dir = path.resolve(config.screenshotDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Save screenshot with timestamp
 * @param {object} vibe - Vibium browser instance
 * @param {string} name - Screenshot name (will be sanitized)
 * @returns {string|null} - Filepath if successful, null if failed
 */
function saveScreenshot(vibe, name) {
  try {
    const dir = ensureScreenshotDir();
    // Sanitize filename to prevent path traversal
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${safeName}-${timestamp}.png`;
    const filepath = path.join(dir, filename);

    const png = vibe.screenshot();
    if (!png) {
      console.error(`  Screenshot failed: No data returned for ${name}`);
      return null;
    }
    fs.writeFileSync(filepath, png);
    console.log(`  Screenshot saved: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`  Screenshot error for ${name}: ${error.message}`);
    return null;
  }
}

/**
 * Wait for specified milliseconds
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test result tracker
 */
class TestResults {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  pass(testName, message = '') {
    this.tests.push({ name: testName, status: 'PASS', message });
    this.passed++;
    console.log(`  [PASS] ${testName}${message ? ': ' + message : ''}`);
  }

  fail(testName, message = '') {
    this.tests.push({ name: testName, status: 'FAIL', message });
    this.failed++;
    console.log(`  [FAIL] ${testName}${message ? ': ' + message : ''}`);
  }

  summary() {
    console.log(`\n--- ${this.suiteName} Summary ---`);
    console.log(`Total: ${this.tests.length} | Passed: ${this.passed} | Failed: ${this.failed}`);
    return { total: this.tests.length, passed: this.passed, failed: this.failed };
  }
}

/**
 * Wait for an element to appear with retry logic
 * @param {object} vibe - Vibium browser instance
 * @param {string} selector - CSS selector
 * @param {number} timeout - Max wait time in ms (default 10000)
 * @param {number} interval - Check interval in ms (default 500)
 * @returns {object|null} - Element if found, null if timeout
 */
async function waitForElement(vibe, selector, timeout = 10000, interval = 500) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const element = vibe.find(selector);
      if (element) return element;
    } catch (e) {
      // Element not found yet, continue waiting
    }
    await wait(interval);
  }
  return null;
}

module.exports = {
  ensureScreenshotDir,
  saveScreenshot,
  wait,
  waitForElement,
  TestResults
};
