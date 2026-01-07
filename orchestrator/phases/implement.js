/**
 * Implementation Phase - Executes planned changes
 */

const fs = require('fs');
const path = require('path');

async function implementPhase(input, logger) {
  const { plan } = input;

  if (!plan || !plan.steps) {
    logger.warn('No plan provided, skipping implementation');
    return {
      status: 'success',
      changedFiles: [],
      stepsCompleted: 0,
      stepsTotal: 0,
      message: 'No implementation needed - no plan provided'
    };
  }

  logger.info('Starting implementation phase');
  logger.info(`Plan has ${plan.steps.length} steps`);

  const changedFiles = [];
  let stepsCompleted = 0;
  const errors = [];

  for (const step of plan.steps) {
    logger.info(`Step ${step.id}: ${step.description}`);

    try {
      // Simulate step execution (actual implementation would go here)
      await executeStep(step, logger);
      stepsCompleted++;

      if (step.files && step.files.length > 0) {
        changedFiles.push(...step.files.filter(f => typeof f === 'string'));
      }

      logger.info(`Step ${step.id} completed`);
    } catch (error) {
      logger.error(`Step ${step.id} failed: ${error.message}`);
      errors.push(`Step ${step.id}: ${error.message}`);

      // Continue with other steps unless critical
      if (step.priority === 'high') {
        break;
      }
    }
  }

  const status = errors.length === 0 ? 'success' :
                 stepsCompleted > 0 ? 'partial' : 'failed';

  return {
    status,
    changedFiles: [...new Set(changedFiles)], // Deduplicate
    stepsCompleted,
    stepsTotal: plan.steps.length,
    errors
  };
}

async function executeStep(step, logger) {
  // Simulate work with small delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Log progress
  logger.debug(`Executing: ${step.description}`);

  // For now, this is a verification step
  // In a real implementation, this would make actual code changes

  // Verify files exist if specified
  if (step.files) {
    for (const file of step.files) {
      if (typeof file === 'string' && !file.endsWith('/')) {
        const fullPath = path.resolve(__dirname, '../..', file);
        if (fs.existsSync(fullPath)) {
          logger.debug(`Verified: ${file}`);
        }
      }
    }
  }

  return true;
}

module.exports = { implementPhase };
