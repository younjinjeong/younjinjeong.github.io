/**
 * E2E Test Configuration for RYONGJIN's Blog
 */

module.exports = {
  // Base URL for testing - use local Hugo server (supports env override)
  baseUrl: process.env.E2E_BASE_URL || 'http://localhost:1313',

  // Production URL for reference
  productionUrl: 'https://blog.younjinjeong.io',

  // Browser options
  browserOptions: {
    headless: process.env.E2E_HEADLESS !== 'false'
  },

  // Screenshot output directory
  screenshotDir: './e2e/screenshots',

  // Expected values for validation
  expected: {
    // Pipboy theme colors (from pipboy.css CSS variables)
    colors: {
      pipboyGreen: '#41ff00',  // --pipboy-green in CSS
      darkGreen: '#29a000',
      background: '#000000',
      // Alternative green used in some places
      pipboyGreenAlt: '#4caf50'
    },

    // Font families
    fonts: {
      primary: 'DungGeunMo',
      fallback: ['Nanum Gothic Coding', 'VT323', 'Share Tech Mono', 'monospace']
    },

    // Image dimensions
    images: {
      profileSmall: { width: 400, height: 400 },
      favicon16: { width: 16, height: 16 },
      favicon32: { width: 32, height: 32 }
    },

    // Page titles
    titles: {
      home: "RYONGJIN's Blog",
      about: "About"
    }
  },

  // Test timeout in milliseconds
  timeout: 30000,

  // Wait time for animations
  animationWait: 2000
};
