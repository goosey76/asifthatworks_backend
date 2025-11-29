/**
 * Comprehensive Multi-Agent Task Management Test Suite
 * 
 * This test suite validates the sequential task management workflow for all three agents:
 * - JARVI: Intent analysis and delegation
 * - GRIM: Calendar and event management  
 * - MURPHY: Task management and execution
 * 
 * Each test case follows the mandatory sequence:
 * CREATE → UPDATE → DELETE
 * 
 * Test Coverage: 30 total test cases (10 per agent)
 */

const TestSuite = {
  // Test configuration
  config: {
    totalTestCases: 30,
    testsPerAgent: 10,
    agents: ['JARVI', 'GRIM', 'MURPHY'],
    timeout: 30000,
    baseUserId: 'test-user-' + Date.now(),
    baseDate: new Date(),
    retryAttempts: 3
  },

  // Test results tracking
  results: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    performance: {
      jarvi: { totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 },
      grim: { totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 },
      murphy: { totalTime: 0, avgTime: 0, minTime: Infinity, maxTime: 0 }
    },
    agentResults: {
      jarvi: { tests: [], summary: { passed: 0, failed: 0 } },
      grim: { tests: [], summary: { passed: 0, failed: 0 } },
      murphy: { tests: [], summary: { passed: 0, failed: 0 } }
    }
  },

  // Validation utilities
  validators: {
    // Check if task exists before operations
    async validateTaskExists(agent, taskId, userId) {
      try {
        let existingTasks = [];
        
        if (agent === 'MURPHY') {
          const murphyAgent = require('./src/services/agents/murphy-agent');
          const result = await murphyAgent.getTasks({}, userId);
          existingTasks = result.tasks || [];
        } else if (agent === 'GRIM') {
          const grimAgent = require('./src/services/agents/grim-agent');
          const result = await grimAgent.getEvents({ range: 'all' }, userId);
          existingTasks = result.events || [];
        }
        
        return existingTasks.some(task => task.id === taskId || task.taskId === taskId);
      } catch (error) {
        console.error(`Validation error for ${agent}:`, error.message);
        return false;
      }
    },

    // Validate task data integrity
    validateTaskData(taskData, expectedProperties = []) {
      const required = ['id', 'title', 'userId', ...expectedProperties];
      return required.every(prop => taskData.hasOwnProperty(prop));
    },

    // Check operation sequence integrity
    validateOperationSequence(operations) {
      const expectedSequence = ['create', 'update', 'delete'];
      return operations.every((op, index) => op.type === expectedSequence[index]);
    }
  },

  // Error handling and rollback utilities
  rollback: {
    // Rollback task creation
    async rollbackCreate(agent, taskId, userId) {
      try {
        if (agent === 'MURPHY') {
          const murphyAgent = require('./src/services/agents/murphy-agent');
          await murphyAgent.deleteTask({ taskId }, userId);
        } else if (agent === 'GRIM') {
          const grimAgent = require('./src/services/agents/grim-agent');
          await grimAgent.deleteEvent(taskId, userId);
        }
        console.log(`Rolled back task creation: ${taskId}`);
        return true;
      } catch (error) {
        console.error(`Rollback failed for ${agent}:`, error.message);
        return false;
      }
    },

    // Rollback task update
    async rollbackUpdate(agent, taskId, originalData, userId) {
      try {
        if (agent === 'MURPHY') {
          const murphyAgent = require('./src/services/agents/murphy-agent');
          await murphyAgent.updateTask({ taskId, ...originalData }, userId);
        } else if (agent === 'GRIM') {
          const grimAgent = require('./src/services/agents/grim-agent');
          await grimAgent.updateEvent(taskId, originalData, userId);
        }
        console.log(`Rolled back task update: ${taskId}`);
        return true;
      } catch (error) {
        console.error(`Rollback update failed for ${agent}:`, error.message);
        return false;
      }
    }
  },

  // Performance monitoring
  performance: {
    startTimer() {
      return process.hrtime.bigint();
    },

    endTimer(startTime) {
      const endTime = process.hrtime.bigint();
      return Number(endTime - startTime) / 1000000; // Convert to milliseconds
    },

    recordTiming(agent, duration) {
      const perf = TestSuite.results.performance[agent.toLowerCase()];
      perf.totalTime += duration;
      perf.minTime = Math.min(perf.minTime, duration);
      perf.maxTime = Math.max(perf.maxTime, duration);
      perf.avgTime = perf.totalTime / (TestSuite.results.agentResults[agent.toLowerCase()].tests.length + 1);
    }
  },

  // Feedback capture for Test Case 1
  feedbackCapture: {
    detailed: {
      timestamp: null,
      userInteractions: [],
      systemResponses: [],
      performanceMetrics: {},
      errorLogs: [],
      operationFlow: []
    },

    recordInteraction(type, data) {
      this.detailed.userInteractions.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });
    },

    recordSystemResponse(response) {
      this.detailed.systemResponses.push({
        response,
        timestamp: new Date().toISOString()
      });
    },

    recordOperation(type, result) {
      this.detailed.operationFlow.push({
        operation: type,
        result,
        timestamp: new Date().toISOString()
      });
    },

    getDetailedReport() {
      return {
        testCase: 1,
        timestamp: this.detailed.timestamp || new Date().toISOString(),
        userInteractions: this.detailed.userInteractions.length,
        systemResponses: this.detailed.systemResponses.length,
        operationFlow: this.detailed.operationFlow.length,
        performanceMetrics: this.detailed.performanceMetrics,
        errorLogs: this.detailed.errorLogs.length,
        detailedFlow: this.detailed.operationFlow
      };
    }
  },

  // Test execution core
  async executeTestCase(agent, testNumber, scenario = {}) {
    const testId = `${agent}_TEST_${testNumber}`;
    const userId = `${TestSuite.config.baseUserId}-${agent.toLowerCase()}`;
    const startTime = TestSuite.performance.startTimer();
    
    let testResult = {
      testId,
      agent,
      testNumber,
      status: 'pending',
      operations: [],
      errors: [],
      performance: {},
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`\n🧪 Executing ${testId}: ${scenario.name || 'Standard Test'}`);
      
      // Test Case 1: Detailed feedback capture
      if (testNumber === 1) {
        TestSuite.feedbackCapture.detailed.timestamp = new Date().toISOString();
        TestSuite.feedbackCapture.recordInteraction('test_start', { agent, testId });
      }

      // STEP 1: CREATE TASK (Mandatory first operation)
      console.log(`   📝 Step 1: Creating task for ${agent}`);
      const createResult = await TestSuite.executeCreateOperation(agent, testNumber, scenario, userId);
      testResult.operations.push(createResult);
      
      if (!createResult.success) {
        throw new Error(`Create operation failed: ${createResult.error}`);
      }

      const taskId = createResult.taskId;
      if (testNumber === 1) {
        TestSuite.feedbackCapture.recordOperation('create', createResult);
      }

      // Validate task exists before proceeding
      const taskExists = await TestSuite.validators.validateTaskExists(agent, taskId, userId);
      if (!taskExists) {
        throw new Error(`Task validation failed: Created task ${taskId} does not exist`);
      }

      // STEP 2: UPDATE TASK (Only after successful create)
      console.log(`   ✏️ Step 2: Updating task ${taskId}`);
      const updateResult = await TestSuite.executeUpdateOperation(agent, testNumber, scenario, userId, taskId);
      testResult.operations.push(updateResult);
      
      if (!updateResult.success) {
        // Rollback on update failure
        console.log(`   🔄 Rolling back due to update failure`);
        await TestSuite.rollback.rollbackCreate(agent, taskId, userId);
        throw new Error(`Update operation failed: ${updateResult.error}`);
      }

      if (testNumber === 1) {
        TestSuite.feedbackCapture.recordOperation('update', updateResult);
      }

      // STEP 3: DELETE TASK (Only after successful update)
      console.log(`   🗑️ Step 3: Deleting task ${taskId}`);
      const deleteResult = await TestSuite.executeDeleteOperation(agent, testNumber, scenario, userId, taskId);
      testResult.operations.push(deleteResult);
      
      if (!deleteResult.success) {
        // Rollback on delete failure
        console.log(`   🔄 Rolling back due to delete failure`);
        await TestSuite.rollback.rollbackUpdate(agent, taskId, createResult.originalData, userId);
        throw new Error(`Delete operation failed: ${deleteResult.error}`);
      }

      if (testNumber === 1) {
        TestSuite.feedbackCapture.recordOperation('delete', deleteResult);
      }

      // Test completed successfully
      testResult.status = 'passed';
      TestSuite.results.passed++;
      console.log(`   ✅ ${testId} PASSED`);

      if (testNumber === 1) {
        TestSuite.feedbackCapture.recordInteraction('test_completed', { status: 'passed' });
      }

    } catch (error) {
      testResult.status = 'failed';
      testResult.errors.push(error.message);
      TestSuite.results.failed++;
      console.log(`   ❌ ${testId} FAILED: ${error.message}`);
      
      if (testNumber === 1) {
        TestSuite.feedbackCapture.detailed.errorLogs.push({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Record performance metrics
    const duration = TestSuite.performance.endTimer(startTime);
    testResult.performance = { duration };
    TestSuite.performance.recordTiming(agent, duration);

    // Store test result
    TestSuite.results.agentResults[agent.toLowerCase()].tests.push(testResult);
    TestSuite.results.total++;

    return testResult;
  },

  // Operation executors
  async executeCreateOperation(agent, testNumber, scenario, userId) {
    const operation = { type: 'create', success: false, taskId: null };
    
    try {
      let result;
      
      switch (agent) {
        case 'JARVI':
          result = await TestSuite.executeJarviCreate(scenario, userId);
          break;
        case 'GRIM':
          result = await TestSuite.executeGrimCreate(scenario, userId);
          break;
        case 'MURPHY':
          result = await TestSuite.executeMurphyCreate(scenario, userId);
          break;
        default:
          throw new Error(`Unknown agent: ${agent}`);
      }

      operation.success = result.success;
      operation.taskId = result.taskId;
      operation.originalData = result.data;
      operation.message = result.message;
      
    } catch (error) {
      operation.error = error.message;
    }
    
    return operation;
  },

  async executeUpdateOperation(agent, testNumber, scenario, userId, taskId) {
    const operation = { type: 'update', success: false, taskId };
    
    try {
      let result;
      
      switch (agent) {
        case 'JARVI':
          result = await TestSuite.executeJarviUpdate(scenario, userId, taskId);
          break;
        case 'GRIM':
          result = await TestSuite.executeGrimUpdate(scenario, userId, taskId);
          break;
        case 'MURPHY':
          result = await TestSuite.executeMurphyUpdate(scenario, userId, taskId);
          break;
        default:
          throw new Error(`Unknown agent: ${agent}`);
      }

      operation.success = result.success;
      operation.updatedData = result.data;
      operation.message = result.message;
      
    } catch (error) {
      operation.error = error.message;
    }
    
    return operation;
  },

  async executeDeleteOperation(agent, testNumber, scenario, userId, taskId) {
    const operation = { type: 'delete', success: false, taskId };
    
    try {
      let result;
      
      switch (agent) {
        case 'JARVI':
          result = await TestSuite.executeJarviDelete(scenario, userId, taskId);
          break;
        case 'GRIM':
          result = await TestSuite.executeGrimDelete(scenario, userId, taskId);
          break;
        case 'MURPHY':
          result = await TestSuite.executeMurphyDelete(scenario, userId, taskId);
          break;
        default:
          throw new Error(`Unknown agent: ${agent}`);
      }

      operation.success = result.success;
      operation.message = result.message;
      
    } catch (error) {
      operation.error = error.message;
    }
    
    return operation;
  },

  // Agent-specific operation implementations
  async executeJarviCreate(scenario, userId) {
    const jarviAgent = require('./src/services/agents/jarvi-agent');
    
    const messagePayload = {
      userId,
      message: scenario.intent || "Add a new task to my list",
      conversation_context: []
    };

    const result = await jarviAgent.analyzeIntent(messagePayload);
    
    return {
      success: !result.error,
      taskId: `jarvi_${Date.now()}`,
      data: { intent: messagePayload.message, result },
      message: result.response || "Intent analyzed successfully"
    };
  },

  async executeJarviUpdate(scenario, userId, taskId) {
    const jarviAgent = require('./src/services/agents/jarvi-agent');
    
    const delegationJson = {
      Recipient: 'MURPHY',
      RequestType: 'update_task',
      Message: { taskId, updates: scenario.updates || {} }
    };

    const result = await jarviAgent.delegateTask(delegationJson, {}, userId);
    
    return {
      success: !result.error,
      data: { delegation: delegationJson, result },
      message: "Delegation updated successfully"
    };
  },

  async executeJarviDelete(scenario, userId, taskId) {
    const jarviAgent = require('./src/services/agents/jarvi-agent');
    
    const delegationJson = {
      Recipient: 'MURPHY',
      RequestType: 'delete_task',
      Message: { taskId }
    };

    const result = await jarviAgent.delegateTask(delegationJson, {}, userId);
    
    return {
      success: !result.error,
      data: { delegation: delegationJson, result },
      message: "Delegation deleted successfully"
    };
  },

  async executeGrimCreate(scenario, userId) {
    const grimAgent = require('./src/services/agents/grim-agent');
    
    const eventDetails = {
      title: scenario.title || `Test Event ${Date.now()}`,
      startTime: scenario.startTime || new Date(Date.now() + 3600000).toISOString(),
      endTime: scenario.endTime || new Date(Date.now() + 7200000).toISOString(),
      description: scenario.description || 'Test event for comprehensive testing'
    };

    const result = await grimAgent.createEvent(eventDetails, userId);
    
    return {
      success: !result.error,
      taskId: result.eventId || `grim_event_${Date.now()}`,
      data: eventDetails,
      message: result.messageToUser || result.response || "Event created successfully"
    };
  },

  async executeGrimUpdate(scenario, userId, taskId) {
    const grimAgent = require('./src/services/agents/grim-agent');
    
    const updates = {
      title: scenario.updatedTitle || `Updated Event ${taskId}`,
      description: scenario.updatedDescription || 'Updated test event'
    };

    const result = await grimAgent.updateEvent(taskId, updates, userId);
    
    return {
      success: !result.error,
      data: updates,
      message: result.messageToUser || result.response || "Event updated successfully"
    };
  },

  async executeGrimDelete(scenario, userId, taskId) {
    const grimAgent = require('./src/services/agents/grim-agent');
    
    const result = await grimAgent.deleteEvent(taskId, userId);
    
    return {
      success: !result.error,
      message: result.messageToUser || result.response || "Event deleted successfully"
    };
  },

  async executeMurphyCreate(scenario, userId) {
    const murphyAgent = require('./src/services/agents/murphy-agent');
    
    const taskDetails = {
      title: scenario.title || `Test Task ${Date.now()}`,
      description: scenario.description || 'Test task for comprehensive testing',
      priority: scenario.priority || 'medium'
    };

    const result = await murphyAgent.createTask(taskDetails, userId);
    
    return {
      success: !result.error,
      taskId: result.taskId || `murphy_task_${Date.now()}`,
      data: taskDetails,
      message: result.messageToUser || result.response || "Task created successfully"
    };
  },

  async executeMurphyUpdate(scenario, userId, taskId) {
    const murphyAgent = require('./src/services/agents/murphy-agent');
    
    const updates = {
      taskId,
      title: scenario.updatedTitle || `Updated Task ${taskId}`,
      description: scenario.updatedDescription || 'Updated test task',
      priority: scenario.updatedPriority || 'high'
    };

    const result = await murphyAgent.updateTask(updates, userId);
    
    return {
      success: !result.error,
      data: updates,
      message: result.messageToUser || result.response || "Task updated successfully"
    };
  },

  async executeMurphyDelete(scenario, userId, taskId) {
    const murphyAgent = require('./src/services/agents/murphy-agent');
    
    const taskDetails = { taskId };
    const result = await murphyAgent.deleteTask(taskDetails, userId);
    
    return {
      success: !result.error,
      message: result.messageToUser || result.response || "Task deleted successfully"
    };
  },

  // Test scenario generators for Test Cases 2-10
  generateScenarios(agent, testNumber) {
    const scenarios = {
      // JARVI scenarios
      JARVI: [
        { name: 'Intent Analysis Task Creation', intent: 'create_task' },
        { name: 'Intent Analysis Task Update', intent: 'update_task' },
        { name: 'Intent Analysis Task Deletion', intent: 'delete_task' },
        { name: 'Complex Intent Delegation', intent: 'complex_task_management' },
        { name: 'Multi-Agent Coordination', intent: 'coordinate_agents' },
        { name: 'Error Handling Intent', intent: 'invalid_operation' },
        { name: 'Batch Intent Processing', intent: 'batch_operations' },
        { name: 'Context-Aware Delegation', intent: 'context_aware_delegation' },
        { name: 'Performance Intent Test', intent: 'performance_test' },
        { name: 'Recovery Intent Test', intent: 'recovery_operation' }
      ],
      // GRIM scenarios  
      GRIM: [
        { name: 'Single Event Creation', title: 'Team Meeting', startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 90000000).toISOString() },
        { name: 'Recurring Event Test', title: 'Weekly Standup', startTime: new Date(Date.now() + 172800000).toISOString(), endTime: new Date(Date.now() + 180000000).toISOString() },
        { name: 'Location-Based Event', title: 'Client Meeting', startTime: new Date(Date.now() + 259200000).toISOString(), endTime: new Date(Date.now() + 266400000).toISOString(), location: 'Office' },
        { name: 'Full Day Event', title: 'Conference Day', startTime: new Date(Date.now() + 345600000).toISOString(), endTime: new Date(Date.now() + 353600000).toISOString() },
        { name: 'Event with Description', title: 'Workshop Session', startTime: new Date(Date.now() + 432000000).toISOString(), endTime: new Date(Date.now() + 439200000).toISOString(), description: 'Training workshop' },
        { name: 'Quick Meeting', title: 'Coffee Chat', startTime: new Date(Date.now() + 518400000).toISOString(), endTime: new Date(Date.now() + 520800000).toISOString() },
        { name: 'Multi-Day Event', title: 'Project Kickoff', startTime: new Date(Date.now() + 604800000).toISOString(), endTime: new Date(Date.now() + 622800000).toISOString() },
        { name: 'Priority Event', title: 'Client Presentation', startTime: new Date(Date.now() + 691200000).toISOString(), endTime: new Date(Date.now() + 698400000).toISOString(), priority: 'high' },
        { name: 'Virtual Meeting', title: 'Remote Workshop', startTime: new Date(Date.now() + 777600000).toISOString(), endTime: new Date(Date.now() + 784800000).toISOString(), location: 'Virtual' },
        { name: 'Buffer Event', title: 'Travel Time', startTime: new Date(Date.now() + 864000000).toISOString(), endTime: new Date(Date.now() + 868800000).toISOString() }
      ],
      // MURPHY scenarios
      MURPHY: [
        { name: 'Simple Task Creation', title: 'Buy groceries' },
        { name: 'High Priority Task', title: 'Submit report', priority: 'high' },
        { name: 'Task with Description', title: 'Review code', description: 'Review pull request #123' },
        { name: 'Multi-Step Task', title: 'Complete project', description: 'Finish all deliverables' },
        { name: 'Deadline Task', title: 'Tax filing', dueDate: new Date(Date.now() + 7776000000).toISOString() },
        { name: 'Recurring Task', title: 'Weekly review', recurring: 'weekly' },
        { name: 'Complex Task', title: 'Organize event', description: 'Plan and execute company event', priority: 'high' },
        { name: 'Quick Task', title: 'Email response' },
        { name: 'Collaborative Task', title: 'Team sync', assignees: ['team'] },
        { name: 'Long-term Task', title: 'Learn new skill', description: 'Master advanced concepts', priority: 'medium' }
      ]
    };

    return scenarios[agent]?.[testNumber - 1] || { name: `Standard ${agent} Test ${testNumber}` };
  },

  // Main test execution orchestrator
  async runComprehensiveTestSuite() {
    console.log('🚀 Starting Comprehensive 30-Agent Test Suite');
    console.log('=' .repeat(60));
    
    const startTime = TestSuite.performance.startTimer();

    try {
      // Execute tests for each agent
      for (const agent of TestSuite.config.agents) {
        console.log(`\n📋 Testing Agent: ${agent}`);
        console.log('-'.repeat(40));
        
        for (let testNumber = 1; testNumber <= TestSuite.config.testsPerAgent; testNumber++) {
          const scenario = TestSuite.generateScenarios(agent, testNumber);
          await TestSuite.executeTestCase(agent, testNumber, scenario);
          
          // Add delay between tests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const totalDuration = TestSuite.performance.endTimer(startTime);
      
      // Generate comprehensive results
      const results = TestSuite.generateTestReport(totalDuration);
      
      console.log('\n🏁 Test Suite Execution Completed');
      console.log('='.repeat(60));
      console.log(results.summary);
      
      return results;

    } catch (error) {
      console.error('❌ Test Suite Execution Failed:', error);
      throw error;
    }
  },

  // Comprehensive test report generation
  generateTestReport(totalDuration) {
    const { results } = TestSuite;
    
    // Update summary statistics
    for (const agent of TestSuite.config.agents) {
      const agentKey = agent.toLowerCase();
      const agentResult = results.agentResults[agentKey];
      agentResult.summary.passed = agentResult.tests.filter(t => t.status === 'passed').length;
      agentResult.summary.failed = agentResult.tests.filter(t => t.status === 'failed').length;
    }

    // Performance benchmarks
    const performanceReport = {
      totalExecutionTime: totalDuration,
      averageTimePerTest: totalDuration / results.total,
      agentPerformance: {}
    };

    for (const agent of TestSuite.config.agents) {
      const agentKey = agent.toLowerCase();
      const perf = results.performance[agentKey];
      performanceReport.agentPerformance[agent] = {
        totalTests: results.agentResults[agentKey].tests.length,
        totalTime: perf.totalTime,
        averageTime: perf.avgTime,
        minTime: perf.minTime === Infinity ? 0 : perf.minTime,
        maxTime: perf.maxTime
      };
    }

    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.total,
        passed: results.passed,
        failed: results.failed,
        successRate: ((results.passed / results.total) * 100).toFixed(2) + '%',
        totalDuration: totalDuration + 'ms'
      },
      detailedResults: results.agentResults,
      performance: performanceReport,
      testCase1Feedback: TestSuite.feedbackCapture.getDetailedReport(),
      errorSummary: results.errors,
      recommendations: TestSuite.generateRecommendations()
    };

    return report;
  },

  // Generate improvement recommendations
  generateRecommendations() {
    const recommendations = [];
    const { results } = TestSuite;

    // Performance recommendations
    for (const agent of TestSuite.config.agents) {
      const agentKey = agent.toLowerCase();
      const perf = results.performance[agentKey];
      
      if (perf.avgTime > 5000) {
        recommendations.push({
          category: 'performance',
          agent,
          message: `${agent} average response time (${perf.avgTime.toFixed(2)}ms) exceeds 5s threshold`,
          priority: 'high'
        });
      }
    }

    // Success rate recommendations
    for (const agent of TestSuite.config.agents) {
      const agentKey = agent.toLowerCase();
      const agentResult = results.agentResults[agentKey];
      const successRate = (agentResult.summary.passed / agentResult.tests.length) * 100;
      
      if (successRate < 90) {
        recommendations.push({
          category: 'reliability',
          agent,
          message: `${agent} success rate (${successRate.toFixed(2)}%) below 90% threshold`,
          priority: 'high'
        });
      }
    }

    return recommendations;
  }
};

// Export for use in other modules
module.exports = TestSuite;

// Run the test suite if executed directly
if (require.main === module) {
  TestSuite.runComprehensiveTestSuite()
    .then(results => {
      console.log('\n📊 Final Test Results:');
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}