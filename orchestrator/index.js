#!/usr/bin/env node

/**
 * Development Cycle Orchestrator
 * Automates: Plan -> Implement -> Build -> Test -> Review
 */

const config = require('./config');
const { Logger } = require('./lib/logger');
const { StateManager } = require('./lib/state-manager');
const { PhaseRunner } = require('./lib/phase-runner');
const { ReportGenerator } = require('./lib/report-generator');

// Phase handlers
const { planPhase } = require('./phases/plan');
const { implementPhase } = require('./phases/implement');
const { buildPhase } = require('./phases/build');
const { testPhase } = require('./phases/test');
const { reviewPhase } = require('./phases/review');

const PHASES = {
  plan: planPhase,
  implement: implementPhase,
  build: buildPhase,
  test: testPhase,
  review: reviewPhase
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    phases: [],
    task: null,
    startFrom: null,
    dryRun: false,
    verbose: false,
    ci: config.ci.isCI,
    output: config.ci.outputFormat
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--phase' && args[i + 1]) {
      options.phases.push(args[++i]);
    } else if (arg === '--task' && args[i + 1]) {
      options.task = args[++i];
    } else if (arg === '--start-from' && args[i + 1]) {
      options.startFrom = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--ci') {
      options.ci = true;
      options.output = 'json';
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  // Default to all phases if none specified
  if (options.phases.length === 0 && !options.startFrom) {
    options.phases = [...config.phaseOrder];
  }

  return options;
}

function printHelp() {
  console.log(`
Development Cycle Orchestrator

Usage: node orchestrator/index.js [options]

Options:
  --phase <name>      Run specific phase (can be used multiple times)
  --task <desc>       Task description for planning
  --start-from <name> Start from specific phase (includes subsequent phases)
  --dry-run           Show what would happen without executing
  --verbose           Enable verbose logging
  --ci                Enable CI mode (JSON output)
  --output <format>   Output format: pretty | json
  --help              Show this help

Phases: ${config.phaseOrder.join(', ')}

Examples:
  npm run orchestrate                    # Run all phases
  npm run orchestrate -- --phase build   # Run only build phase
  npm run orchestrate -- --phase build --phase test  # Run build and test
  npm run orchestrate -- --start-from test           # Run test and review
  npm run orchestrate -- --task "Add feature X"      # Run with task
`);
}

async function main() {
  const options = parseArgs();
  const logger = new Logger('orchestrator', {
    verbose: options.verbose,
    jsonMode: options.output === 'json'
  });
  const state = new StateManager();
  const runner = new PhaseRunner({ verbose: options.verbose });
  const reportGenerator = new ReportGenerator(config.paths.reports);

  const startTime = Date.now();

  // Print banner
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Development Cycle Orchestrator                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Phases: Plan -> Implement -> Build -> Test -> Review      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Determine phases to run
  let phasesToRun = options.phases;

  if (options.startFrom) {
    const startIndex = config.phaseOrder.indexOf(options.startFrom);
    if (startIndex === -1) {
      logger.error(`Unknown phase: ${options.startFrom}`);
      process.exit(config.exitCodes.configError);
    }
    phasesToRun = config.phaseOrder.slice(startIndex);
  }

  logger.info(`Phases to run: ${phasesToRun.join(' -> ')}`);

  if (options.task) {
    logger.info(`Task: ${options.task}`);
    state.setTask(options.task);
  }

  if (options.dryRun) {
    logger.info('DRY RUN - no changes will be made');
    console.log('\nWould execute phases:', phasesToRun.join(', '));
    process.exit(0);
  }

  // Run phases
  let lastResult = null;
  let failed = false;

  for (const phaseName of phasesToRun) {
    if (!PHASES[phaseName]) {
      logger.error(`Unknown phase: ${phaseName}`);
      continue;
    }

    // Prepare input based on previous phase results
    const input = preparePhaseInput(phaseName, state, options);

    // Run phase
    const result = await runner.run(
      phaseName,
      PHASES[phaseName],
      input,
      config.phases[phaseName]
    );

    // Store result
    state.setPhaseResult(phaseName, result);
    lastResult = result;

    // Check for failure
    if (result.status === 'failed') {
      const errorHandling = config.errorHandling[phaseName];

      if (errorHandling?.failureAction === 'stop') {
        logger.error(`Phase ${phaseName} failed - stopping pipeline`);
        failed = true;
        break;
      } else {
        logger.warn(`Phase ${phaseName} failed - continuing (configured to continue)`);
      }
    }
  }

  // Generate report
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const { report, jsonPath, mdPath } = reportGenerator.generate(state.getState(), totalDuration);

  // Print final summary
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ORCHESTRATION COMPLETE                  ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  const allResults = state.getAllResults();
  for (const [name, result] of Object.entries(allResults)) {
    const status = result.status === 'success' ? '✓' : '✗';
    const padding = ' '.repeat(Math.max(0, 15 - name.length));
    console.log(`║  ${status} ${name}${padding} | ${result.status.padEnd(10)} | ${result.duration}s`);
  }

  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Duration: ${totalDuration}s`);
  console.log(`║  Status: ${report.status}`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log(`\nReport saved: ${jsonPath}`);
  console.log(`Markdown: ${mdPath}`);

  // Exit with appropriate code
  if (failed || report.status === 'failed') {
    process.exit(getExitCode(allResults));
  }

  process.exit(0);
}

function preparePhaseInput(phaseName, state, options) {
  const input = {};

  switch (phaseName) {
    case 'plan':
      input.task = state.getTask() || options.task || 'General maintenance and testing';
      break;

    case 'implement':
      const planResult = state.getPhaseResult('plan');
      input.plan = planResult?.plan || null;
      break;

    case 'build':
      // No specific input needed
      break;

    case 'test':
      const buildResult = state.getPhaseResult('build');
      input.buildOutput = buildResult?.outputDir || null;
      break;

    case 'review':
      const implementResult = state.getPhaseResult('implement');
      input.changedFiles = implementResult?.changedFiles || [];
      break;
  }

  return input;
}

function getExitCode(results) {
  const failedPhases = Object.entries(results)
    .filter(([_, r]) => r.status === 'failed')
    .map(([name]) => name);

  if (failedPhases.length === 0) return 0;

  const firstFailed = failedPhases[0];
  const phaseIndex = config.phaseOrder.indexOf(firstFailed);

  return phaseIndex + 1; // 1-based exit codes
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(config.exitCodes.configError);
});
