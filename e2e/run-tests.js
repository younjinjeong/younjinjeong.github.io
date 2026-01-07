#!/usr/bin/env node

/**
 * E2E Test Runner for RYONGJIN's Blog
 * Runs all test suites and generates a summary report
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { ensureScreenshotDir } = require('./utils');

// Import test suites
const { runFontDisplayTests } = require('./tests/font-display.test');
const { runImageSizingTests } = require('./tests/image-sizing.test');
const { runVisualDesignTests } = require('./tests/visual-design.test');
const { runNavigationTests } = require('./tests/navigation.test');
const { runInteractiveTests } = require('./tests/interactive.test');

// Test suite definitions
const TEST_SUITES = [
  { name: 'Font Display', fn: runFontDisplayTests },
  { name: 'Image Sizing', fn: runImageSizingTests },
  { name: 'Visual Design', fn: runVisualDesignTests },
  { name: 'Navigation', fn: runNavigationTests },
  { name: 'Interactive', fn: runInteractiveTests }
];

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      E2E Test Suite - RYONGJIN\'s Blog (Vibium)             ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Testing: Font Display, Image Sizing, Visual Design,       ║');
  console.log('║           Navigation, Interactive Elements                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const startTime = Date.now();
  const results = [];

  // Ensure screenshots directory exists
  ensureScreenshotDir();

  // Run test suites sequentially
  for (let i = 0; i < TEST_SUITES.length; i++) {
    const suite = TEST_SUITES[i];
    console.log(`\n[${i + 1}/${TEST_SUITES.length}] Running ${suite.name} Tests...`);

    const suiteStart = Date.now();
    try {
      const result = await suite.fn();
      results.push({
        name: suite.name,
        duration: `${((Date.now() - suiteStart) / 1000).toFixed(2)}s`,
        ...result
      });
    } catch (e) {
      console.error(`${suite.name} suite failed:`, e.message);
      results.push({
        name: suite.name,
        duration: `${((Date.now() - suiteStart) / 1000).toFixed(2)}s`,
        total: 1,
        passed: 0,
        failed: 1,
        error: e.message
      });
    }
  }

  // Calculate totals
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print final report
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL TEST REPORT                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  results.forEach(r => {
    const status = r.failed === 0 ? '✓' : '✗';
    const padding = ' '.repeat(Math.max(0, 20 - r.name.length));
    console.log(`║  ${status} ${r.name}${padding} | Pass: ${r.passed} | Fail: ${r.failed} | Total: ${r.total}`);
  });

  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed} | Time: ${duration}s`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Generate JSON report with environment info
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    environment: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch()
    },
    summary: {
      total: totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate: totalTests > 0 ? `${((totalPassed / totalTests) * 100).toFixed(1)}%` : '0%'
    },
    suites: results
  };

  const screenshotDir = path.resolve(__dirname, 'screenshots');
  const reportPath = path.join(screenshotDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nTest report saved: ${reportPath}`);
  console.log(`Screenshots saved: ${screenshotDir}/`);

  // Exit with appropriate code
  if (totalFailed > 0) {
    console.log('\n⚠️  Some tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
