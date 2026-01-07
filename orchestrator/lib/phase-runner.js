/**
 * Phase Runner - Wraps phase execution with timing and error handling
 */

const { Logger } = require('./logger');

class PhaseRunner {
  constructor(options = {}) {
    this.options = options;
  }

  async run(phaseName, phaseHandler, input, phaseConfig = {}) {
    const logger = new Logger(phaseName, this.options);
    const startTime = Date.now();
    const timeout = phaseConfig.timeout || 300000;

    logger.phaseStart(phaseName);

    let timeoutId = null;

    try {
      // Create timeout promise with clearable timer
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Phase ${phaseName} timed out after ${timeout}ms`));
        }, timeout);
      });

      // Run phase with timeout
      const result = await Promise.race([
        phaseHandler(input, logger),
        timeoutPromise
      ]);

      // Clear timeout on success
      if (timeoutId) clearTimeout(timeoutId);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      const finalResult = {
        status: result.status || 'success',
        duration,
        ...result
      };

      logger.phaseEnd(phaseName, finalResult.status, duration);
      return finalResult;

    } catch (error) {
      // Clear timeout on error
      if (timeoutId) clearTimeout(timeoutId);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      logger.error(`Phase failed: ${error.message}`, error);
      logger.phaseEnd(phaseName, 'failed', duration);

      return {
        status: 'failed',
        duration,
        error: error.message
      };
    }
  }
}

module.exports = { PhaseRunner };
