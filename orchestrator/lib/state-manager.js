/**
 * State Manager for cross-phase communication
 */

const fs = require('fs');
const path = require('path');

class StateManager {
  constructor(stateFile = null) {
    this.stateFile = stateFile || path.join(__dirname, '..', 'reports', '.state.json');
    this.state = {
      startTime: new Date().toISOString(),
      task: null,
      phases: {}
    };
  }

  setTask(task) {
    this.state.task = task;
    this._save();
  }

  getTask() {
    return this.state.task;
  }

  setPhaseResult(phaseName, result) {
    this.state.phases[phaseName] = {
      ...result,
      completedAt: new Date().toISOString()
    };
    this._save();
  }

  getPhaseResult(phaseName) {
    return this.state.phases[phaseName] || null;
  }

  getAllResults() {
    return this.state.phases;
  }

  getState() {
    return this.state;
  }

  clear() {
    this.state = {
      startTime: new Date().toISOString(),
      task: null,
      phases: {}
    };
    this._save();
  }

  _save() {
    try {
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      // Log warning instead of silent failure
      console.warn(`[StateManager] Failed to save state: ${e.message}`);
    }
  }

  static loadFromDisk(stateFile) {
    try {
      if (fs.existsSync(stateFile)) {
        const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        const manager = new StateManager(stateFile);
        manager.state = data;
        return manager;
      }
    } catch (e) {
      // Return fresh state on error
    }
    return new StateManager(stateFile);
  }
}

module.exports = { StateManager };
