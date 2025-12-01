// test_jarvi_request_injection.js
// Test framework for injecting mock responses into Jarvi's request pipeline
// Optimal injection point: parseJarviResponse (line 213 in jarvi-service/index.js)

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Mock LLM Service to inject test responses
class MockLLMService {
  constructor() {
    this.mockResponses = [];
    this.callCount = 0;
  }

  setMockResponse(response) {
    this.mockResponses.push(response);
  }

  async generateContent(model, prompt) {
    if (this.mockResponses.length === 0) {
      throw new Error('No mock responses configured');
    }
    const response = this.mockResponses[this.callCount % this.mockResponses.length];
    this.callCount++;
    return response;
  }

  reset() {
    this.mockResponses = [];
    this.callCount = 0;
  }
}

// Mock Memory Service
class MockMemoryService {
  async getConversationHistory(userId, agentId, limit) {
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
    return true;
  }
}

// Mock Agent Service
class MockAgentService {
  async getAgentConfig(agentName) {
    return {
      id: `test-${agentName.toLowerCase()}-id`,
      name: agentName,
      type: 'intent_analyzer'
    };
  }
}

// Test scenarios with user requests and expected mock responses
const TEST_SCENARIOS = [
  {
    name: 'Greeting Request',
    userMessage: 'Hey Jarvi, how are you?',
    mockResponse: 'Sir, your concern for my well-being is touching, though entirely unnecessary.',
    expectedIntent: 'general_query',
    shouldDelegate: false
  },
  {
    name: 'Capability Request - Jarvi',
    userMessage: 'What can you do?',
    mockResponse: JSON.stringify({
      Recipient: 'JARVI',
      RequestType: 'get_goals',
      Message: 'What can you do?'
    }),
    expectedIntent: 'get_goals',
    shouldDelegate: true
  },
  {
    name: 'Capability Request - Grim',
    userMessage: 'What can Grim do?',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'get_goals',
      Message: 'What can Grim do?'
    }),
    expectedIntent: 'get_goals',
    shouldDelegate: true
  },
  {
    name: 'Calendar Event Creation',
    userMessage: 'Create an event called Meeting at 2pm tomorrow',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'create_event',
      Message: 'Create an event called Meeting at 2pm tomorrow'
    }),
    expectedIntent: 'create_event',
    shouldDelegate: true
  },
  {
    name: 'Task Creation',
    userMessage: 'Add a task to call the doctor',
    mockResponse: JSON.stringify({
      Recipient: 'Murphy',
      RequestType: 'create_task',
      Message: 'Add a task to call the doctor'
    }),
    expectedIntent: 'create_task',
    shouldDelegate: true
  },
  {
    name: 'Calendar Get Request',
    userMessage: 'Show me my calendar for today',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'get_event',
      Message: 'Show me my calendar for today'
    }),
    expectedIntent: 'get_event',
    shouldDelegate: true
  },
  {
    name: 'Task List Request',
    userMessage: 'What tasks do I have?',
    mockResponse: JSON.stringify({
      Recipient: 'Murphy',
      RequestType: 'get_task',
      Message: 'What tasks do I have?'
    }),
    expectedIntent: 'get_task',
    shouldDelegate: true
  },
  {
    name: 'General Knowledge Question',
    userMessage: 'What is the capital of France?',
    mockResponse: 'Sir, the capital of France is Paris. A city of such cultural significance deserves better than your casual inquiry.',
    expectedIntent: 'general_query',
    shouldDelegate: false
  },
  {
    name: 'Update Event Request',
    userMessage: 'Update the title of Break Time to Lunch Break',
    mockResponse: JSON.stringify({
      Recipient: 'Grim',
      RequestType: 'update_event',
      Message: 'Update the title of Break Time to Lunch Break'
    }),
    expectedIntent: 'update_event',
    shouldDelegate: true
  },
  {
    name: 'Delete Task Request',
    userMessage: 'Delete the task about buying groceries',
    mockResponse: JSON.stringify({
      Recipient: 'Murphy',
      RequestType: 'delete_task',
      Message: 'Delete the task about buying groceries'
    }),
    expectedIntent: 'delete_task',
    shouldDelegate: true
  }
];

// Test runner
async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('JARVI REQUEST INJECTION TEST SUITE');
  console.log('Testing optimal injection point: parseJarviResponse()');
  console.log('='.repeat(80) + '\n');

  const mockLLM = new MockLLMService();
  const mockMemory = new MockMemoryService();
  const mockAgent = new MockAgentService();

  // Patch the jarvi-service to use our mocks
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(id) {
    if (id === '../llm-service') {
      return mockLLM;
    }
    if (id === '../memory-service') {
      return mockMemory;
    }
    if (id === '../agents/jarvi-agent') {
      return mockAgent;
    }
    return originalRequire.apply(this, arguments);
  };

  // Clear the require cache to force reload with mocks
  delete require.cache[require.resolve('./src/services/jarvi-service/index.js')];
  const jarviService = require('./src/services/jarvi-service/index.js');

  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const scenario of TEST_SCENARIOS) {
    try {
      // Reset mocks for each test
      mockLLM.reset();
      mockLLM.setMockResponse(scenario.mockResponse);

      // Run the test
      const result = await jarviService.analyzeIntent({
        text: scenario.userMessage,
        userId: 'test-user-123'
      });

      // Validate results
      const intentMatches = result.intentAnalysis.intent === scenario.expectedIntent;
      const delegationMatches = (result.delegationJson !== null) === scenario.shouldDelegate;

      const passed = intentMatches && delegationMatches;

      if (passed) {
        passedTests++;
        results.push({
          name: scenario.name,
          status: '✓ PASS',
          message: scenario.userMessage,
          intent: result.intentAnalysis.intent,
          delegated: result.delegationJson !== null
        });
      } else {
        failedTests++;
        results.push({
          name: scenario.name,
          status: '✗ FAIL',
          message: scenario.userMessage,
          expected: {
            intent: scenario.expectedIntent,
            shouldDelegate: scenario.shouldDelegate
          },
          actual: {
            intent: result.intentAnalysis.intent,
            delegated: result.delegationJson !== null
          }
        });
      }
    } catch (error) {
      failedTests++;
      results.push({
        name: scenario.name,
        status: '✗ ERROR',
        message: scenario.userMessage,
        error: error.message
      });
    }
  }

  // Print results
  console.log('TEST RESULTS:');
  console.log('-'.repeat(80));

  results.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.status} - ${result.name}`);
    console.log(`    Message: "${result.message}"`);

    if (result.status === '✓ PASS') {
      console.log(`    Intent: ${result.intent}`);
      console.log(`    Delegated: ${result.delegated}`);
    } else if (result.status === '✗ FAIL') {
      console.log(`    Expected: intent="${result.expected.intent}", delegate=${result.expected.shouldDelegate}`);
      console.log(`    Actual:   intent="${result.actual.intent}", delegate=${result.actual.delegated}`);
    } else if (result.status === '✗ ERROR') {
      console.log(`    Error: ${result.error}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Tests: ${TEST_SCENARIOS.length}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Success Rate: ${((passedTests / TEST_SCENARIOS.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(80) + '\n');

  // Restore original require
  Module.prototype.require = originalRequire;

  return failedTests === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
