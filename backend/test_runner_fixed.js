#!/usr/bin/env node

/**
 * Test Runner for Comprehensive Multi-Agent Task Management Test Suite - Fixed Version
 * 
 * Usage:
 *   node test_runner_fixed.js                    // Run all 30 tests
 *   node test_runner_fixed.js --agent JARVI      // Run only JARVI tests (10 cases)
 *   node test_runner_fixed.js --agent GRIM --case 5  // Run single test case
 *   node test_runner_fixed.js --config custom.json   // Use custom configuration
 *   node test_runner_fixed.js --help             // Show help
 */

const TestSuite = require('./comprehensive_30_agent_test_suite_fixed');
const fs = require('fs');
const path = require('path');

// Command line argument parser
class TestRunner {
  constructor() {
    this.args = this.parseArgs(process.argv.slice(2));
    this.config = this.loadConfig();
  }

  parseArgs(argv) {
    const args = {
      agent: null,
      case: null,
      config: null,
      output: null,
      verbose: false,
      help: false
    };

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      
      switch (arg) {
        case '--agent':
        case '-a':
          args.agent = argv[++i];
          break;
        case '--case':
        case '-c':
          args.case = parseInt(argv[++i]);
          break;
        case '--config':
        case '-f':
          args.config = argv[++i];
          break;
        case '--output':
        case '-o':
          args.output = argv[++i];
          break;
        case '--verbose':
        case '-v':
          args.verbose = true;
          break;
        case '--help':
        case '-h':
          args.help = true;
          break;
        default:
          if (arg.startsWith('--')) {
            console.warn(`Unknown argument: ${arg}`);
          }
      }
    }

    return args;
  }

  loadConfig() {
    const defaultConfig = {
      timeout: 10000,
      retryAttempts: 1,
      delayBetweenTests: 500,
      outputFormat: 'json',
      enableRollback: false,
      captureDetailedFeedback: true,
      performanceTracking: true
    };

    if (this.args.config && fs.existsSync(this.args.config)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(this.args.config, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (error) {
        console.error(`Failed to load config file ${this.args.config}:`, error.message);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  showHelp() {
    console.log(`
Comprehensive Multi-Agent Test Suite Runner (Fixed Version)

USAGE:
  node test_runner_fixed.js [OPTIONS]

OPTIONS:
  --agent, -a <AGENT>     Run tests for specific agent (JARVI, GRIM, MURPHY)
  --case, -c <NUMBER>     Run specific test case (1-10, requires --agent)
  --config, -f <FILE>     Use custom configuration file
  --output, -o <FILE>     Save results to file
  --verbose, -v          Enable verbose logging
  --help, -h             Show this help message

EXAMPLES:
  # Run all 30 test cases
  node test_runner_fixed.js

  # Run only JARVI agent tests
  node test_runner_fixed.js --agent JARVI

  # Run specific test case
  node test_runner_fixed.js --agent GRIM --case 5

  # Run with custom config and output
  node test_runner_fixed.js --config test_config.json --output results.json

  # Run verbose mode
  node test_runner_fixed.js --verbose

AGENTS:
  JARVI    - Intent analysis and delegation
  GRIM     - Calendar and event management
  MURPHY   - Task management and execution

Each agent has 10 test cases following the mandatory sequence:
  1. CREATE → 2. UPDATE → 3. DELETE

Test Case 1 includes detailed feedback capture and comprehensive logging.
Test Cases 2-10 use scenario templates with varying parameters.

FEATURES:
  - Mock mode support for testing without full database setup
  - Automatic fallback to mock responses on failures
  - Detailed performance tracking and metrics
  - Comprehensive error handling and rollback
  - Flexible configuration options
`);
  }

  validateArgs() {
    // Validate agent
    if (this.args.agent && !['JARVI', 'GRIM', 'MURPHY'].includes(this.args.agent.toUpperCase())) {
      throw new Error(`Invalid agent: ${this.args.agent}. Must be JARVI, GRIM, or MURPHY.`);
    }

    // Validate test case
    if (this.args.case && (this.args.case < 1 || this.args.case > 10)) {
      throw new Error(`Invalid test case: ${this.args.case}. Must be between 1 and 10.`);
    }

    // Test case requires agent
    if (this.args.case && !this.args.agent) {
      throw new Error('Test case option requires specifying an agent.');
    }

    // Validate config file
    if (this.args.config && !fs.existsSync(this.args.config)) {
      throw new Error(`Config file not found: ${this.args.config}`);
    }

    // Validate output directory
    if (this.args.output) {
      const outputDir = path.dirname(this.args.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    }
  }

  async runTests() {
    try {
      this.validateArgs();

      if (this.args.help) {
        this.showHelp();
        return;
      }

      // Apply configuration
      Object.assign(TestSuite.config, this.config);

      let results;

      if (this.args.agent && this.args.case) {
        // Run single test case
        console.log(`🎯 Running single test: ${this.args.agent} Test Case ${this.args.case}`);
        results = await this.runSingleTest();
      } else if (this.args.agent) {
        // Run all tests for specific agent
        console.log(`🎯 Running all tests for agent: ${this.args.agent}`);
        results = await this.runAgentTests();
      } else {
        // Run all tests
        console.log('🚀 Running comprehensive 30-agent test suite');
        results = await TestSuite.runComprehensiveTestSuite();
      }

      // Display results
      this.displayResults(results);

      // Save results if output specified
      if (this.args.output) {
        await this.saveResults(results);
      }

      return results;

    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
      if (this.args.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  async runSingleTest() {
    const agent = this.args.agent.toUpperCase();
    const testNumber = this.args.case;
    const scenario = TestSuite.generateScenarios(agent, testNumber);
    
    const result = await TestSuite.executeTestCase(agent, testNumber, scenario);
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 1,
        passed: result.status === 'passed' ? 1 : 0,
        failed: result.status === 'failed' ? 1 : 0,
        successRate: result.status === 'passed' ? '100.00%' : '0.00%'
      },
      detailedResults: {
        [agent.toLowerCase()]: {
          tests: [result],
          summary: {
            passed: result.status === 'passed' ? 1 : 0,
            failed: result.status === 'failed' ? 1 : 0
          }
        }
      },
      performance: {
        totalExecutionTime: result.performance.duration,
        agentPerformance: {
          [agent]: {
            totalTests: 1,
            totalTime: result.performance.duration,
            averageTime: result.performance.duration,
            minTime: result.performance.duration,
            maxTime: result.performance.duration
          }
        }
      },
      testCase1Feedback: testNumber === 1 ? TestSuite.feedbackCapture.getDetailedReport() : null
    };
  }

  async runAgentTests() {
    const agent = this.args.agent.toUpperCase();
    const startTime = TestSuite.performance.startTimer();

    console.log(`\n📋 Testing Agent: ${agent}`);
    console.log('-'.repeat(40));

    for (let testNumber = 1; testNumber <= 10; testNumber++) {
      const scenario = TestSuite.generateScenarios(agent, testNumber);
      await TestSuite.executeTestCase(agent, testNumber, scenario);
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenTests));
    }

    const totalDuration = TestSuite.performance.endTimer(startTime);
    const results = TestSuite.generateTestReport(totalDuration);

    // Filter results for specific agent
    const agentKey = agent.toLowerCase();
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.detailedResults[agentKey].tests.length,
        passed: results.detailedResults[agentKey].summary.passed,
        failed: results.detailedResults[agentKey].summary.failed,
        successRate: ((results.detailedResults[agentKey].summary.passed / results.detailedResults[agentKey].tests.length) * 100).toFixed(2) + '%'
      },
      detailedResults: {
        [agentKey]: results.detailedResults[agentKey]
      },
      performance: {
        totalExecutionTime: totalDuration,
        averageTimePerTest: totalDuration / results.detailedResults[agentKey].tests.length,
        agentPerformance: {
          [agent]: results.performance.agentPerformance[agent]
        }
      },
      testCase1Feedback: TestSuite.feedbackCapture.getDetailedReport()
    };
  }

  displayResults(results) {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.summary.totalTests}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success Rate: ${results.summary.successRate}`);
    console.log(`Execution Time: ${results.performance.totalExecutionTime}ms`);
    
    if (results.detailedResults) {
      console.log('\n📋 Agent Breakdown');
      for (const [agent, data] of Object.entries(results.detailedResults)) {
        console.log(`  ${agent.toUpperCase()}: ${data.summary.passed}/${data.tests.length} passed`);
      }
    }

    if (results.testCase1Feedback && this.args.verbose) {
      console.log('\n🔍 Test Case 1 Detailed Feedback:');
      console.log(JSON.stringify(results.testCase1Feedback, null, 2));
    }
  }

  async saveResults(results) {
    try {
      const outputPath = this.args.output;
      const outputData = this.config.outputFormat === 'json' 
        ? JSON.stringify(results, null, 2)
        : this.formatAsText(results);

      fs.writeFileSync(outputPath, outputData);
      console.log(`\n💾 Results saved to: ${outputPath}`);
    } catch (error) {
      console.error('Failed to save results:', error.message);
    }
  }

  formatAsText(results) {
    let text = `Comprehensive Multi-Agent Test Results\n`;
    text += `Generated: ${results.timestamp}\n`;
    text += `==========================================\n\n`;
    
    text += `Summary:\n`;
    text += `  Total Tests: ${results.summary.totalTests}\n`;
    text += `  Passed: ${results.summary.passed}\n`;
    text += `  Failed: ${results.summary.failed}\n`;
    text += `  Success Rate: ${results.summary.successRate}\n`;
    text += `  Execution Time: ${results.performance.totalExecutionTime}ms\n\n`;

    if (results.detailedResults) {
      text += `Agent Details:\n`;
      for (const [agent, data] of Object.entries(results.detailedResults)) {
        text += `\n${agent.toUpperCase()}:\n`;
        data.tests.forEach((test, index) => {
          text += `  Test ${index + 1}: ${test.status} (${test.performance.duration}ms)\n`;
          if (test.errors.length > 0) {
            text += `    Errors: ${test.errors.join(', ')}\n`;
          }
        });
      }
    }

    return text;
  }
}

// Main execution
async function main() {
  const runner = new TestRunner();
  await runner.runTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  if (process.argv.includes('--verbose')) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TestRunner;