// Basic Integration Test for Refactored Task Operations Module
// This test verifies that all modular components work together correctly

const TaskOperations = require('./task-operations');
const { TaskValidator } = require('./validation');
const { TaskResponseFormatter } = require('./formatting');
const { TaskMatchingUtils } = require('./utils');
const SingleTaskCreator = require('./task-operations/single-task-creator');
const TaskCrud = require('./task-operations/task-crud');

// Mock Google Tasks Client for testing
class MockGoogleTasksClient {
  constructor() {
    this.mockTasks = [
      { id: '1', title: 'Buy groceries', due: '2023-12-01T00:00:00.000Z' },
      { id: '2', title: 'Complete project report', due: null },
      { id: '3', title: 'Call doctor', due: '2023-12-05T00:00:00.000Z' }
    ];
  }

  async getTasksClient(userId) {
    return {
      tasks: {
        list: async (params) => ({
          data: { items: this.mockTasks }
        }),
        insert: async (params) => ({
          data: { id: 'new-task-id', ...params.requestBody }
        }),
        patch: async (params) => ({
          data: { id: params.task, ...params.requestBody }
        }),
        delete: async (params) => ({ data: {} })
      }
    };
  }
}

// Mock TaskList Operations
class MockTaskListOperations {
  constructor(googleTasksClient) {
    this.tasksClient = googleTasksClient;
  }

  async getTaskLists(userId) {
    return {
      messageToUser: '📋 Your Task Lists\n\n✅ My Tasks\n\n✨ Stay organized!',
      tasklists: [{ id: 'default', title: 'My Tasks' }],
      success: true
    };
  }

  async createTaskList(tasklistDetails, userId) {
    return {
      messageToUser: `✅ Created task list: ${tasklistDetails.title}`,
      success: true
    };
  }

  async updateTaskList(extractedDetails, userId) {
    return {
      messageToUser: '✅ Updated task list successfully',
      success: true
    };
  }

  async deleteTaskList(extractedDetails, userId) {
    return {
      messageToUser: '✅ Deleted task list successfully',
      success: true
    };
  }

  async getTaskListDetails(extractedDetails, userId) {
    return {
      messageToUser: '📋 Task List Details',
      success: true
    };
  }
}

// Test Suite
class TaskOperationsIntegrationTest {
  constructor() {
    this.mockClient = new MockGoogleTasksClient();
    this.testResults = [];
  }

  log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
    this.testResults.push({ timestamp, status, message });
  }

  async runTests() {
    this.log('🚀 Starting Task Operations Integration Tests', 'TEST');
    
    try {
      await this.testModuleImports();
      await this.testTaskOperationsInitialization();
      await this.testValidationModule();
      await this.testFormattingModule();
      await this.testTaskMatchingModule();
      await this.testMainOrchestrator();
      
      this.log('✅ All integration tests completed successfully!', 'SUCCESS');
      return true;
      
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`, 'ERROR');
      console.error('Test error:', error);
      return false;
    }
  }

  async testModuleImports() {
    this.log('📦 Testing module imports...', 'TEST');
    
    // Test that all modules can be imported
    if (!TaskValidator) throw new Error('TaskValidator not imported');
    if (!TaskResponseFormatter) throw new Error('TaskResponseFormatter not imported');
    if (!TaskMatchingUtils) throw new Error('TaskMatchingUtils not imported');
    if (!TaskOperations) throw new Error('TaskOperations not imported');
    if (!SingleTaskCreator) throw new Error('SingleTaskCreator not imported');
    if (!TaskCrud) throw new Error('TaskCrud not imported');
    
    this.log('✅ All module imports successful', 'SUCCESS');
  }

  async testTaskOperationsInitialization() {
    this.log('🔧 Testing TaskOperations initialization...', 'TEST');
    
    const taskOps = new TaskOperations(this.mockClient);
    
    // Verify that all modular components are initialized
    if (!taskOps.taskValidator) throw new Error('TaskValidator not initialized');
    if (!taskOps.formatter) throw new Error('TaskResponseFormatter not initialized');
    if (!taskOps.taskMatching) throw new Error('TaskMatchingUtils not initialized');
    if (!taskOps.smartOrganization) throw new Error('SmartTaskOrganization not initialized');
    if (!taskOps.singleTaskCreator) throw new Error('SingleTaskCreator not initialized');
    if (!taskOps.taskCrud) throw new Error('TaskCrud not initialized');
    if (!taskOps.batchHandler) throw new Error('BatchOperationsHandler not initialized');
    
    this.log('✅ TaskOperations initialization successful', 'SUCCESS');
    return taskOps;
  }

  async testValidationModule() {
    this.log('🔍 Testing validation module...', 'TEST');
    
    const validator = new TaskValidator();
    
    // Test valid task creation
    const validTask = {
      task_description: 'Test task',
      due_date: '2023-12-01',
      due_time: '14:30'
    };
    
    const validation = validator.validateTaskCreation(validTask);
    if (!validation.isValid) {
      throw new Error('Valid task validation failed: ' + validation.errors.join(', '));
    }
    
    // Test invalid task creation
    const invalidTask = {
      task_description: '', // Empty description should fail
      due_date: 'invalid-date'
    };
    
    const invalidValidation = validator.validateTaskCreation(invalidTask);
    if (invalidValidation.isValid) {
      throw new Error('Invalid task should have failed validation');
    }
    
    this.log('✅ Validation module working correctly', 'SUCCESS');
  }

  async testFormattingModule() {
    this.log('🎨 Testing formatting module...', 'TEST');
    
    const formatter = new TaskResponseFormatter();
    
    // Test task creation response formatting
    const taskDetails = { task_description: 'Test task', due_date: '2023-12-01' };
    const dueText = 'Dec 1, 2023';
    
    const response = formatter.formatTaskCreationResponse(taskDetails, dueText);
    if (!response.includes('Test task')) {
      throw new Error('Task creation response missing task description');
    }
    
    // Test task list formatting
    const tasks = [
      { title: 'Task 1', due: '2023-12-01T00:00:00.000Z' },
      { title: 'Task 2', due: null }
    ];
    
    const mockDateUtils = {
      getFormattedDateForTask: (date) => 'Dec 1, 2023'
    };
    
    const taskListResponse = formatter.formatTaskList(tasks, 'show my tasks', mockDateUtils);
    if (!taskListResponse.includes('Task 1')) {
      throw new Error('Task list response missing task details');
    }
    
    this.log('✅ Formatting module working correctly', 'SUCCESS');
  }

  async testTaskMatchingModule() {
    this.log('🎯 Testing task matching module...', 'TEST');
    
    const taskMatching = new TaskMatchingUtils();
    
    const tasks = [
      { id: '1', title: 'Buy groceries' },
      { id: '2', title: 'Complete project report' },
      { id: '3', title: 'Call doctor' }
    ];
    
    // Test exact matching
    const exactMatch = taskMatching.findBestMatchingTask(tasks, 'Buy groceries');
    if (!exactMatch || exactMatch.id !== '1') {
      throw new Error('Exact task matching failed');
    }
    
    // Test fuzzy matching
    const fuzzyMatches = taskMatching.fuzzySearchTasks(tasks, 'groceries', 0.5);
    if (fuzzyMatches.length === 0) {
      throw new Error('Fuzzy task matching failed');
    }
    
    // Test suggestions
    const suggestions = taskMatching.generateTaskSuggestions(tasks, 'nonexistent task');
    if (!suggestions.includes('Buy groceries')) {
      throw new Error('Task suggestions generation failed');
    }
    
    this.log('✅ Task matching module working correctly', 'SUCCESS');
  }

  async testMainOrchestrator() {
    this.log('🎼 Testing main orchestrator...', 'TEST');
    
    const taskOps = new TaskOperations(this.mockClient);
    
    // Test validation methods
    const userValidation = taskOps.taskValidator.validateUserId('test-user');
    if (!userValidation.isValid) {
      throw new Error('User ID validation failed');
    }
    
    // Test that we can call enhanced matching
    const mockTasks = [{ id: '1', title: 'Test task' }];
    const matches = taskOps.enhancedTaskMatching(mockTasks, { title: 'test' });
    if (!Array.isArray(matches)) {
      throw new Error('Enhanced task matching returned invalid result');
    }
    
    // Test fuzzy search
    const fuzzyResults = taskOps.fuzzySearchTasks(mockTasks, 'test', 0.6);
    if (!Array.isArray(fuzzyResults)) {
      throw new Error('Fuzzy search returned invalid result');
    }
    
    this.log('✅ Main orchestrator working correctly', 'SUCCESS');
  }

  printTestSummary() {
    this.log('📊 Test Summary:', 'SUMMARY');
    this.log(`Total tests run: ${this.testResults.length}`, 'SUMMARY');
    
    const successCount = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const errorCount = this.testResults.filter(r => r.status === 'ERROR').length;
    const testCount = this.testResults.filter(r => r.status === 'TEST').length;
    
    this.log(`✅ Successful: ${successCount}`, 'SUMMARY');
    this.log(`❌ Errors: ${errorCount}`, 'SUMMARY');
    this.log(`🧪 Tests: ${testCount}`, 'SUMMARY');
  }
}

// Run the integration test
async function runIntegrationTest() {
  console.log('🧪 Starting Task Operations Integration Test Suite\n');
  
  const testSuite = new TaskOperationsIntegrationTest();
  const success = await testSuite.runTests();
  
  testSuite.printTestSummary();
  
  if (success) {
    console.log('\n🎉 All integration tests passed! The refactored task operations module is working correctly.');
  } else {
    console.log('\n💥 Some integration tests failed. Please check the error messages above.');
  }
  
  return success;
}

// Export for use in other files
module.exports = {
  TaskOperationsIntegrationTest,
  runIntegrationTest
};

// Run the test if this file is executed directly
if (require.main === module) {
  runIntegrationTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error during testing:', error);
      process.exit(1);
    });
}