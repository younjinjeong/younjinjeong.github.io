/**
 * Report Generator - Creates comprehensive reports from orchestration results
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ReportGenerator {
  constructor(reportsDir) {
    this.reportsDir = reportsDir;
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  }

  generate(state, totalDuration) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const phases = state.phases || {};

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${totalDuration}s`,
      status: this._calculateOverallStatus(phases),
      task: state.task,
      environment: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
      },
      phases: phases,
      summary: this._generateSummary(phases)
    };

    // Save JSON report
    const jsonPath = path.join(this.reportsDir, `cycle-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save markdown report
    const mdPath = path.join(this.reportsDir, `cycle-${timestamp}.md`);
    fs.writeFileSync(mdPath, this._generateMarkdown(report));

    // Update latest symlink (as JSON file for compatibility)
    const latestPath = path.join(this.reportsDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));

    return { jsonPath, mdPath, report };
  }

  _calculateOverallStatus(phases) {
    const phaseNames = Object.keys(phases);
    if (phaseNames.length === 0) return 'no-phases';

    const criticalPhases = ['plan', 'implement', 'build'];
    for (const phase of criticalPhases) {
      if (phases[phase] && phases[phase].status === 'failed') {
        return 'failed';
      }
    }

    const allPassed = phaseNames.every(p => phases[p].status === 'success');
    return allPassed ? 'success' : 'partial';
  }

  _generateSummary(phases) {
    const phaseNames = Object.keys(phases);
    const passed = phaseNames.filter(p => phases[p].status === 'success').length;
    const failed = phaseNames.filter(p => phases[p].status === 'failed').length;

    const testPhase = phases.test;
    const reviewPhase = phases.review;

    return {
      phasesRun: phaseNames.length,
      phasesPassed: passed,
      phasesFailed: failed,
      testsTotal: testPhase?.testResults?.total || 0,
      testsPassed: testPhase?.testResults?.passed || 0,
      reviewScore: reviewPhase?.review?.score || null
    };
  }

  _generateMarkdown(report) {
    let md = `# Orchestration Report\n\n`;
    md += `**Timestamp:** ${report.timestamp}\n`;
    md += `**Duration:** ${report.duration}\n`;
    md += `**Status:** ${report.status === 'success' ? '✅ Success' : '❌ Failed'}\n\n`;

    if (report.task) {
      md += `## Task\n\n${report.task}\n\n`;
    }

    md += `## Phase Results\n\n`;
    md += `| Phase | Status | Duration |\n`;
    md += `|-------|--------|----------|\n`;

    for (const [name, result] of Object.entries(report.phases)) {
      const status = result.status === 'success' ? '✅' : '❌';
      md += `| ${name} | ${status} ${result.status} | ${result.duration}s |\n`;
    }

    md += `\n## Summary\n\n`;
    md += `- Phases Run: ${report.summary.phasesRun}\n`;
    md += `- Phases Passed: ${report.summary.phasesPassed}\n`;
    md += `- Phases Failed: ${report.summary.phasesFailed}\n`;

    if (report.summary.testsTotal > 0) {
      md += `- Tests: ${report.summary.testsPassed}/${report.summary.testsTotal} passed\n`;
    }

    if (report.summary.reviewScore !== null) {
      md += `- Review Score: ${report.summary.reviewScore}/100\n`;
    }

    return md;
  }
}

module.exports = { ReportGenerator };
