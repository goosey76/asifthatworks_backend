// test_jarvi_advanced_injection.js
// Advanced test framework for Jarvi request injection
// Demonstrates custom response injection, error handling, and edge cases

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Advanced Mock LLM with response sequencing and error injection
class AdvancedMockLLM {
  constructor() {
    this.responses = [];
    this.callIndex = 0;
    this.shouldThrowError = false;
    this.errorMessage = '';
  }

  setResponses(responses) {
    this.responses = responses;
    this.callIndex = 0;
  }

  setErrorMode(shouldThrow, message = 'LLM Service Error') {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }

  async generateContent(model, prompt) {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    if (this.callIndex >= this.responses.length) {
      throw new Error('No more mock responses available');
    }

    const response = this.responses[this.callIndex];
    this.callIndex++;
    return response;
  }

  reset() {
    this.responses = [];
    this.callIndex = 0;
    this.shouldThrowError = false;
  }
}

// Mock Memory Service
class AdvancedMockMemory {
  constructor() {
    this.storedConversations = [];
    this.shouldFailMemory = false;
  }

  async getConversationHistory(userId, agentId, limit) {
    if (this.shouldFailMemory) {
      throw new Error('Memory service timeout');
    }
    return [];
  }

  async getForeverBrain(userId) {
    return [];
  }

  async getUserGoals(userId) {
    return [];
  }

  async getUserPreference(userId, type) {
    return null;
  }

  async storeConversation(userId, agentId, messages) {
    this.storedConversations.push({ userId, agentId, messages });
    return true;
  }

  reset() {
    this.storedConversations = [];
    this.shouldFailMemory = false;
  }
}

// Mock Agent Service
class AdvancedMockAgent {
  async getAgentConfig(agentName) {
    return {
      id: `test-${agentName.toLowerCase()}-id`,
      name: agentName,
      type: 'intent_analyzer'
    };
  }
}

// Advanced test scenarios
const ADVANCED_SCENARIOS = [
  {
    name: 'Malformed JSON Response Handling',
    userMessage: 'Create an event',
    mockResponse: '{ invalid json }',
    expectedBehavior: 'Should treat as plain text response',
    shouldDelegate: false
  },
  {
    name: 'JSON with Extra Text',
    userMessage: 'What can Murphy do?',
    mockResponse: 'Here is the response: {"Recipient":"Murphy","RequestType":"get_goals","Message":"What can Murphy do?"}',
    expectedBehavior: 'Should extract JSON and delegate',
    shouldDelegate: true
  },
  {
    name: 'Empty Message Handling',
    userMessage: '',
    mockResponse: 'This should not be called',
    expectedBehavior: 'Should return empty message response',
    shouldDelegate: false
  },
  {
    name: 'Very Long User Message',
    userMessage: 'Create an event ' + 'with a very long description '.repeat(50),
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'create_event',
      Message: 'Create an event with a very long description'
    }),
    expectedBehavior: 'Should handle long messages',
    shouldDelegate: true
  },
  {
    name: 'Special Characters in Message',
    userMessage: 'Create event: "Meeting" @ 2pm & discuss $$$',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'create_event',
      Message: 'Create event: "Meeting" @ 2pm & discuss $$$'
    }),
    expectedBehavior: 'Should handle special characters',
    shouldDelegate: true
  },
  {
    name: 'Unicode Characters',
    userMessage: 'Create event: Café ☕ Meeting 🤝',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'create_event',
      Message: 'Create event: Café ☕ Meeting 🤝'
    }),
    expectedBehavior: 'Should handle unicode',
    shouldDelegate: true
  },
  {
    name: 'Delegation with Null Message',
    userMessage: 'Test',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'create_event',
      Message: null
    }),
    expectedBehavior: 'Should not delegate with null message (invalid delegation)',
    shouldDelegate: false
  },
  {
    name: 'Multiple Consecutive Requests',
    userMessage: 'First request',
    mockResponse: 'First response',
    expectedBehavior: 'Should handle multiple sequential calls',
    shouldDelegate: false
  }
];

// Error scenario tests
const ERROR_SCENARIOS = [
  {
    name: 'LLM Service Timeout',
    userMessage: 'Create an event',
    shouldThrowError: true,
    errorMessage: 'LLM generateContent timeout after 30000ms',
    expectedFallback: true
  },
  {
    name: 'Memory Service Failure',
    userMessage: 'Show my tasks',
    shouldThrowError: false,
    memoryFailure: true,
    expectedFallback: true // Should still work with fallback memory and return response
  }
];

// Test runner for advanced scenarios
async function runAdvancedTests() {
  console.log('\n' + '='.repeat(80));
  console.log('JARVI ADVANCED REQUEST INJECTION TEST SUITE');
  console.log('Testing edge cases, error handling, and complex scenarios');
  console.log('='.repeat(80) + '\n');

  const mockLLM = new AdvancedMockLLM();
  const mockMemory = new AdvancedMockMemory();
  const mockAgent = new AdvancedMockAgent();

  // Patch require
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(id) {
    if (id === '../llm-service') return mockLLM;
    if (id === '../memory-service') return mockMemory;
    if (id === '../agents/jarvi-agent') return mockAgent;
    return originalRequire.apply(this, arguments);
  };

  delete require.cache[require.resolve('./src/services/jarvi-service/index.js')];
  const jarviService = require('./src/services/jarvi-service/index.js');

  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  // Test advanced scenarios
  console.log('ADVANCED SCENARIOS:');
  console.log('-'.repeat(80));

  for (const scenario of ADVANCED_SCENARIOS) {
    try {
      mockLLM.reset();
      mockMemory.reset();

      // Skip empty message test - it's handled before LLM call
      if (scenario.userMessage === '') {
        results.push({
          name: scenario.name,
          status: '⊘ SKIP',
          reason: 'Empty message handled at validation layer'
        });
        continue;
      }

      mockLLM.setResponses([scenario.mockResponse]);

      const result = await jarviService.analyzeIntent({
        text: scenario.userMessage,
        userId: 'test-user-advanced'
      });

      const delegated = result.delegationJson !== null;
      const passed = delegated === scenario.shouldDelegate;

      if (passed) {
        passedTests++;
        results.push({
          name: scenario.name,
          status: '✓ PASS',
          behavior: scenario.expectedBehavior,
          delegated: delegated
        });
      } else {
        failedTests++;
        results.push({
          name: scenario.name,
          status: '✗ FAIL',
          expected: `shouldDelegate=${scenario.shouldDelegate}`,
          actual: `delegated=${delegated}`,
          behavior: scenario.expectedBehavior
        });
      }
    } catch (error) {
      failedTests++;
      results.push({
        name: scenario.name,
        status: '✗ ERROR',
        error: error.message
      });
    }
  }

  // Print advanced results
  results.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.status} - ${result.name}`);
    if (result.status === '✓ PASS') {
      console.log(`    Behavior: ${result.behavior}`);
      console.log(`    Delegated: ${result.delegated}`);
    } else if (result.status === '✗ FAIL') {
      console.log(`    Expected: ${result.expected}`);
      console.log(`    Actual: ${result.actual}`);
      console.log(`    Behavior: ${result.behavior}`);
    } else if (result.status === '✗ ERROR') {
      console.log(`    Error: ${result.error}`);
    } else if (result.status === '⊘ SKIP') {
      console.log(`    Reason: ${result.reason}`);
    }
  });

  // Test error scenarios
  console.log('\n' + '='.repeat(80));
  console.log('ERROR HANDLING SCENARIOS:');
  console.log('-'.repeat(80));

  const errorResults = [];

  for (const scenario of ERROR_SCENARIOS) {
    try {
      mockLLM.reset();
      mockMemory.reset();

      if (scenario.shouldThrowError) {
        mockLLM.setErrorMode(true, scenario.errorMessage);
      }

      if (scenario.memoryFailure) {
        mockMemory.shouldFailMemory = true;
      }

      const result = await jarviService.analyzeIntent({
        text: scenario.userMessage,
        userId: 'test-user-error'
      });

      const hasFallback = result.responseToUser && result.responseToUser.length > 0;
      const passed = hasFallback === scenario.expectedFallback;

      if (passed) {
        passedTests++;
        errorResults.push({
          name: scenario.name,
          status: '✓ PASS',
          hasFallback: hasFallback,
          response: result.responseToUser?.substring(0, 50) + '...'
        });
      } else {
        failedTests++;
        errorResults.push({
          name: scenario.name,
          status: '✗ FAIL',
          expected: `expectedFallback=${scenario.expectedFallback}`,
          actual: `hasFallback=${hasFallback}`
        });
      }
    } catch (error) {
      failedTests++;
      errorResults.push({
        name: scenario.name,
        status: '✗ ERROR',
        error: error.message
      });
    }
  }

  // Print error results
  errorResults.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.status} - ${result.name}`);
    if (result.status === '✓ PASS') {
      console.log(`    Has Fallback: ${result.hasFallback}`);
      console.log(`    Response: ${result.response}`);
    } else if (result.status === '✗ FAIL') {
      console.log(`    Expected: ${result.expected}`);
      console.log(`    Actual: ${result.actual}`);
    } else if (result.status === '✗ ERROR') {
      console.log(`    Error: ${result.error}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('-'.repeat(80));
  const totalTests = ADVANCED_SCENARIOS.length + ERROR_SCENARIOS.length;
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(80) + '\n');

  // Restore require
  Module.prototype.require = originalRequire;

  return failedTests === 0;
}

// Run tests
runAdvancedTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Advanced test suite error:', error);
    process.exit(1);
  });
