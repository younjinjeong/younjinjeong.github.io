/**
 * Structured Logger for Orchestrator
 */

class Logger {
  constructor(phaseName = 'orchestrator', options = {}) {
    this.phaseName = phaseName;
    this.verbose = options.verbose || false;
    this.jsonMode = options.jsonMode || false;
  }

  _timestamp() {
    return new Date().toISOString();
  }

  _format(level, message, data = null) {
    if (this.jsonMode) {
      return JSON.stringify({
        timestamp: this._timestamp(),
        level,
        phase: this.phaseName,
        message,
        data
      });
    }

    const prefix = `[${this._timestamp()}] [${level.toUpperCase()}] [${this.phaseName}]`;
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  info(message, data = null) {
    console.log(this._format('info', message, data));
  }

  warn(message, data = null) {
    console.warn(this._format('warn', message, data));
  }

  error(message, error = null) {
    const errorData = error ? { message: error.message, stack: error.stack } : null;
    console.error(this._format('error', message, errorData));
  }

  debug(message, data = null) {
    if (this.verbose) {
      console.log(this._format('debug', message, data));
    }
  }

  progress(percent, message) {
    if (!this.jsonMode) {
      const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
      process.stdout.write(`\r  [${bar}] ${percent}% ${message}`);
      if (percent === 100) console.log('');
    } else {
      this.info(`Progress: ${percent}%`, { message });
    }
  }

  phaseStart(phaseName) {
    console.log('');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log(`║  Phase: ${phaseName.toUpperCase()}`.padEnd(59) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');
  }

  phaseEnd(phaseName, status, duration) {
    const statusIcon = status === 'success' ? '✓' : '✗';
    console.log(`\n  ${statusIcon} ${phaseName} completed: ${status} (${duration}s)`);
  }
}

module.exports = { Logger };
