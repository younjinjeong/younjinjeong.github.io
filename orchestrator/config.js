/**
 * Orchestrator Configuration
 */

const path = require('path');

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  // Phase configuration
  phases: {
    plan: { enabled: true, timeout: 60000 },
    implement: { enabled: true, timeout: 300000 },
    build: { enabled: true, timeout: 120000 },
    test: { enabled: true, timeout: 600000 },
    review: { enabled: true, timeout: 120000 }
  },

  // Phase execution order
  phaseOrder: ['plan', 'implement', 'build', 'test', 'review'],

  // Error handling per phase
  errorHandling: {
    plan: { failureAction: 'stop' },
    implement: { failureAction: 'stop' },
    build: { failureAction: 'stop' },
    test: { failureAction: 'continue' },
    review: { failureAction: 'continue' }
  },

  // Hugo configuration
  hugo: {
    buildCommand: 'hugo --gc --minify',
    serveCommand: 'hugo server -D --bind 0.0.0.0 -p 1313',
    servePort: 1313,
    baseUrl: process.env.E2E_BASE_URL || 'http://localhost:1313'
  },

  // Path configuration
  paths: {
    root: rootDir,
    e2e: path.join(rootDir, 'e2e'),
    reports: path.join(rootDir, 'orchestrator', 'reports'),
    public: path.join(rootDir, 'public')
  },

  // CI detection
  ci: {
    isCI: process.env.CI === 'true',
    outputFormat: process.env.CI === 'true' ? 'json' : 'pretty'
  },

  // Exit codes
  exitCodes: {
    success: 0,
    planFailed: 1,
    implementFailed: 2,
    buildFailed: 3,
    testFailed: 4,
    reviewFailed: 5,
    configError: 10,
    timeoutError: 11
  }
};
