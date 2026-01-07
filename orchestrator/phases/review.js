/**
 * Review Phase - Automated code review
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

async function reviewPhase(input, logger) {
  logger.info('Starting code review phase');

  const { changedFiles } = input;
  const rootDir = config.paths.root;

  // Get files to review
  let filesToReview = [];

  if (changedFiles && changedFiles.length > 0) {
    filesToReview = changedFiles.filter(f =>
      typeof f === 'string' &&
      !f.endsWith('/') &&
      fs.existsSync(path.resolve(rootDir, f))
    );
  }

  // If no changed files, review key files
  if (filesToReview.length === 0) {
    filesToReview = getDefaultReviewFiles(rootDir);
  }

  logger.info(`Reviewing ${filesToReview.length} files`);

  const issues = [];
  let totalScore = 0;

  for (const file of filesToReview) {
    const fullPath = path.resolve(rootDir, file);
    logger.debug(`Reviewing: ${file}`);

    try {
      const fileIssues = await reviewFile(fullPath, file);
      issues.push(...fileIssues);

      // Calculate file score (100 - 5 per issue, min 0)
      const fileScore = Math.max(0, 100 - (fileIssues.length * 5));
      totalScore += fileScore;
    } catch (e) {
      logger.warn(`Could not review ${file}: ${e.message}`);
    }
  }

  const avgScore = filesToReview.length > 0
    ? Math.round(totalScore / filesToReview.length)
    : 100;

  // Generate summary
  const severityCounts = {
    error: issues.filter(i => i.severity === 'error').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length
  };

  const summary = generateSummary(issues, avgScore, severityCounts);

  logger.info('Code review completed', {
    filesReviewed: filesToReview.length,
    issues: issues.length,
    score: avgScore
  });

  return {
    status: severityCounts.error > 0 ? 'failed' : 'success',
    review: {
      filesReviewed: filesToReview.length,
      issues,
      summary,
      score: avgScore,
      severityCounts
    }
  };
}

function getDefaultReviewFiles(rootDir) {
  const files = [];
  const patterns = [
    'package.json',
    'config.toml',
    'e2e/config.js',
    'e2e/run-tests.js',
    'orchestrator/index.js'
  ];

  for (const pattern of patterns) {
    const fullPath = path.join(rootDir, pattern);
    if (fs.existsSync(fullPath)) {
      files.push(pattern);
    }
  }

  return files;
}

async function reviewFile(fullPath, relativePath) {
  const issues = [];
  const ext = path.extname(fullPath);

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    // Check for common issues based on file type
    if (['.js', '.ts'].includes(ext)) {
      issues.push(...reviewJavaScript(lines, relativePath));
    } else if (['.html'].includes(ext)) {
      issues.push(...reviewHTML(lines, relativePath));
    } else if (['.css'].includes(ext)) {
      issues.push(...reviewCSS(lines, relativePath));
    } else if (['.json'].includes(ext)) {
      issues.push(...reviewJSON(content, relativePath));
    }

    // Generic checks
    issues.push(...reviewGeneric(lines, relativePath));

  } catch (e) {
    // File could not be read
  }

  return issues;
}

function reviewJavaScript(lines, file) {
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for console.log (might want to remove in production)
    if (line.includes('console.log') && !file.includes('test')) {
      issues.push({
        file,
        line: lineNum,
        severity: 'info',
        message: 'Consider removing console.log in production code',
        suggestion: 'Use a proper logging library or remove'
      });
    }

    // Check for TODO comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        file,
        line: lineNum,
        severity: 'info',
        message: 'Found TODO/FIXME comment',
        suggestion: 'Address or track this item'
      });
    }

    // Check for very long lines
    if (line.length > 120) {
      issues.push({
        file,
        line: lineNum,
        severity: 'warning',
        message: `Line exceeds 120 characters (${line.length})`,
        suggestion: 'Consider breaking into multiple lines'
      });
    }
  });

  return issues;
}

function reviewHTML(lines, file) {
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for inline styles
    if (line.includes('style="') && !file.includes('partial')) {
      issues.push({
        file,
        line: lineNum,
        severity: 'info',
        message: 'Inline style found',
        suggestion: 'Consider moving to CSS file'
      });
    }
  });

  return issues;
}

function reviewCSS(lines, file) {
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for !important
    if (line.includes('!important')) {
      issues.push({
        file,
        line: lineNum,
        severity: 'warning',
        message: 'Use of !important',
        suggestion: 'Consider increasing specificity instead'
      });
    }
  });

  return issues;
}

function reviewJSON(content, file) {
  const issues = [];

  try {
    JSON.parse(content);
  } catch (e) {
    issues.push({
      file,
      line: 1,
      severity: 'error',
      message: 'Invalid JSON syntax',
      suggestion: e.message
    });
  }

  return issues;
}

function reviewGeneric(lines, file) {
  const issues = [];

  // Check for trailing whitespace
  lines.forEach((line, index) => {
    if (line !== line.trimEnd() && line.trim().length > 0) {
      // Only report first occurrence
      if (!issues.some(i => i.message.includes('trailing whitespace'))) {
        issues.push({
          file,
          line: index + 1,
          severity: 'info',
          message: 'File contains trailing whitespace',
          suggestion: 'Run a formatter to clean up'
        });
      }
    }
  });

  return issues;
}

function generateSummary(issues, score, severityCounts) {
  if (issues.length === 0) {
    return 'No issues found. Code looks good!';
  }

  const parts = [];

  if (severityCounts.error > 0) {
    parts.push(`${severityCounts.error} error(s)`);
  }
  if (severityCounts.warning > 0) {
    parts.push(`${severityCounts.warning} warning(s)`);
  }
  if (severityCounts.info > 0) {
    parts.push(`${severityCounts.info} info item(s)`);
  }

  return `Found ${parts.join(', ')}. Overall score: ${score}/100`;
}

module.exports = { reviewPhase };
