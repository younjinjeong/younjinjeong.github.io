/**
 * Plan Phase - Analyzes task and creates implementation plan
 */

const fs = require('fs');
const path = require('path');

async function planPhase(input, logger) {
  const { task } = input;

  logger.info('Starting plan phase');
  logger.info(`Task: ${task || 'No specific task provided'}`);

  // Analyze the codebase structure
  const rootDir = path.resolve(__dirname, '../..');
  const structure = analyzeStructure(rootDir);

  logger.info('Analyzed codebase structure', {
    contentFiles: structure.content.length,
    layoutFiles: structure.layouts.length
  });

  // Generate plan based on task
  const plan = generatePlan(task, structure);

  logger.info('Plan generated', {
    steps: plan.steps.length,
    affectedFiles: plan.affectedFiles.length
  });

  return {
    status: 'success',
    plan
  };
}

function analyzeStructure(rootDir) {
  const structure = {
    content: [],
    layouts: [],
    static: [],
    config: []
  };

  // Find content files
  const contentDir = path.join(rootDir, 'content');
  if (fs.existsSync(contentDir)) {
    structure.content = findFiles(contentDir, ['.md']);
  }

  // Find layout files
  const layoutsDir = path.join(rootDir, 'layouts');
  if (fs.existsSync(layoutsDir)) {
    structure.layouts = findFiles(layoutsDir, ['.html']);
  }

  // Find static files
  const staticDir = path.join(rootDir, 'static');
  if (fs.existsSync(staticDir)) {
    structure.static = findFiles(staticDir, ['.css', '.js']);
  }

  // Config files
  if (fs.existsSync(path.join(rootDir, 'config.toml'))) {
    structure.config.push('config.toml');
  }

  return structure;
}

function findFiles(dir, extensions, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findFiles(fullPath, extensions, files);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }
  return files;
}

function generatePlan(task, structure) {
  // Default plan for general maintenance/testing
  const steps = [
    {
      id: 1,
      description: 'Verify codebase structure and dependencies',
      files: ['package.json', 'config.toml'],
      priority: 'high'
    },
    {
      id: 2,
      description: 'Run linting and format checks',
      files: structure.layouts.slice(0, 5),
      priority: 'medium'
    },
    {
      id: 3,
      description: 'Build Hugo site and verify output',
      files: ['public/'],
      priority: 'high'
    },
    {
      id: 4,
      description: 'Execute E2E tests for visual verification',
      files: ['e2e/'],
      priority: 'high'
    },
    {
      id: 5,
      description: 'Review test results and generate report',
      files: ['e2e/screenshots/test-report.json'],
      priority: 'medium'
    }
  ];

  // Add task-specific steps if task provided
  if (task) {
    steps.unshift({
      id: 0,
      description: `Analyze and implement: ${task}`,
      files: [],
      priority: 'high'
    });
  }

  return {
    steps,
    affectedFiles: [
      ...structure.layouts.slice(0, 3),
      ...structure.static.slice(0, 2)
    ],
    estimatedComplexity: task ? 'medium' : 'low',
    risks: task ? ['Changes may affect existing functionality'] : []
  };
}

module.exports = { planPhase };
