/**
 * Build Phase - Builds Hugo site
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function buildPhase(input, logger) {
  logger.info('Starting Hugo build');

  const rootDir = config.paths.root;
  const publicDir = config.paths.public;

  // Clean public directory
  if (fs.existsSync(publicDir)) {
    logger.info('Cleaning public directory');
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  // Run Hugo build
  logger.info('Running hugo --gc --minify');

  const result = await runCommand('hugo', ['--gc', '--minify'], rootDir, logger);

  if (result.exitCode !== 0) {
    return {
      status: 'failed',
      outputDir: publicDir,
      stats: null,
      errors: [result.stderr || 'Hugo build failed'],
      stdout: result.stdout
    };
  }

  // Parse build stats from output
  const stats = parseBuildStats(result.stdout);

  // Verify output
  const outputExists = fs.existsSync(publicDir);
  const indexExists = fs.existsSync(path.join(publicDir, 'index.html'));

  if (!outputExists || !indexExists) {
    return {
      status: 'failed',
      outputDir: publicDir,
      stats,
      errors: ['Build output not found or incomplete']
    };
  }

  logger.info('Build completed successfully', stats);

  return {
    status: 'success',
    outputDir: publicDir,
    stats,
    errors: [],
    warnings: stats.warnings || []
  };
}

function runCommand(command, args, cwd, logger) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      shell: true,
      env: { ...process.env, HUGO_ENVIRONMENT: 'production' }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      logger.debug(data.toString().trim());
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

function parseBuildStats(output) {
  const stats = {
    pagesGenerated: 0,
    buildTime: 'unknown',
    warnings: []
  };

  // Parse pages count
  const pagesMatch = output.match(/Pages\s+\|\s+(\d+)/);
  if (pagesMatch) {
    stats.pagesGenerated = parseInt(pagesMatch[1], 10);
  }

  // Parse build time
  const timeMatch = output.match(/Built in (\d+\s*m?s)/);
  if (timeMatch) {
    stats.buildTime = timeMatch[1];
  }

  // Extract warnings
  const warnMatches = output.match(/WARN.*/g);
  if (warnMatches) {
    stats.warnings = warnMatches;
  }

  return stats;
}

module.exports = { buildPhase };
