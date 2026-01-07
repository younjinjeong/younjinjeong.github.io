/**
 * Test Phase - Runs E2E tests with Vibium
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function testPhase(input, logger) {
  logger.info('Starting test phase');

  const rootDir = config.paths.root;
  const e2eDir = config.paths.e2e;
  const reportPath = path.join(e2eDir, 'screenshots', 'test-report.json');

  // Start Hugo server
  logger.info('Starting Hugo dev server');
  const server = await startHugoServer(rootDir, logger);

  if (!server.success) {
    return {
      status: 'failed',
      testResults: null,
      error: 'Failed to start Hugo server'
    };
  }

  try {
    // Wait for server to be ready
    await waitForServer(config.hugo.baseUrl, logger);

    // Run E2E tests
    logger.info('Running E2E tests');
    const testResult = await runTests(rootDir, logger);

    // Parse results
    let testResults = null;
    if (fs.existsSync(reportPath)) {
      try {
        testResults = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      } catch (e) {
        logger.warn('Failed to parse test report');
      }
    }

    const status = testResult.exitCode === 0 ? 'success' : 'failed';

    return {
      status,
      testResults: testResults ? {
        total: testResults.summary?.total || 0,
        passed: testResults.summary?.passed || 0,
        failed: testResults.summary?.failed || 0,
        passRate: testResults.summary?.passRate || '0%',
        suites: testResults.suites || []
      } : null,
      reportPath,
      screenshotDir: path.join(e2eDir, 'screenshots'),
      stdout: testResult.stdout
    };

  } finally {
    // Stop Hugo server
    logger.info('Stopping Hugo server');
    if (server.process) {
      server.process.kill('SIGTERM');
    }
  }
}

function startHugoServer(cwd, logger) {
  return new Promise((resolve) => {
    const proc = spawn('hugo', ['server', '-D', '--bind', '0.0.0.0', '-p', '1313'], {
      cwd,
      shell: true,
      detached: false
    });

    let started = false;

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Web Server is available') && !started) {
        started = true;
        resolve({ success: true, process: proc });
      }
    });

    proc.stderr.on('data', (data) => {
      logger.debug(`Hugo stderr: ${data.toString().trim()}`);
    });

    proc.on('error', (error) => {
      if (!started) {
        resolve({ success: false, error: error.message });
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        proc.kill();
        resolve({ success: false, error: 'Server start timeout' });
      }
    }, 30000);
  });
}

async function waitForServer(url, logger, maxAttempts = 30) {
  const http = require('http');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      logger.info('Hugo server is ready');
      return true;
    } catch (e) {
      logger.debug(`Waiting for server (attempt ${i + 1}/${maxAttempts})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Server failed to become ready');
}

function runTests(cwd, logger) {
  return new Promise((resolve) => {
    const proc = spawn('npm', ['test'], {
      cwd,
      shell: true,
      env: {
        ...process.env,
        E2E_BASE_URL: config.hugo.baseUrl,
        E2E_HEADLESS: 'true'
      }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      // Stream test output
      process.stdout.write(output);
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });

    proc.on('error', (error) => {
      resolve({ exitCode: 1, stdout, stderr: error.message });
    });
  });
}

module.exports = { testPhase };
