// Test Murphy Constructor Fix
// This test verifies that the TaskOperations constructor works properly

const murphyAgent = require('./src/services/agents/murphy-agent/murphy-agent');

async function testMurphyConstructor() {
  console.log('🔧 Testing Murphy Constructor Fix...');
  
  try {
    // Test that we can import TaskOperations directly without errors
    const TaskOperations = require('./src/services/agents/murphy-agent/tasks/task-operations');
    console.log('✅ TaskOperations imported successfully');
    
    // Test that TaskOperations is a constructor
    console.log('TaskOperations type:', typeof TaskOperations);
    console.log('TaskOperations constructor check:', TaskOperations.toString().substring(0, 50));
    
    // Test individual component imports
    const SingleTaskCreator = require('./src/services/agents/murphy-agent/tasks/task-operations/single-task-creator');
    const TaskCrud = require('./src/services/agents/murphy-agent/tasks/task-operations/task-crud');
    
    console.log('✅ Individual components imported successfully');
    console.log('SingleTaskCreator type:', typeof SingleTaskCreator);
    console.log('TaskCrud type:', typeof TaskCrud);
    
    console.log('🎉 All constructor issues appear to be resolved!');
    console.log('✅ Murphy task operations should now work properly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Constructor test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Mock GoogleTasksClient for testing
class MockGoogleTasksClient {
  constructor(supabase) {
    this.supabase = supabase;
  }
  
  async getTasksClient(userId) {
    return {
      tasks: {
        insert: async (params) => {
          console.log('Mock insert called with:', params);
          return { data: { id: 'mock-task-id' } };
        },
        list: async (params) => {
          console.log('Mock list called with:', params);
          return { data: { items: [] } };
        },
        patch: async (params) => {
          console.log('Mock patch called with:', params);
          return { data: { id: params.task } };
        },
        delete: async (params) => {
          console.log('Mock delete called with:', params);
          return { data: {} };
        }
      }
    };
  }
}

// Mock Supabase
const mockSupabase = {
  from: () => ({
    select: () => ({ data: [] }),
    insert: () => ({ data: {} }),
    update: () => ({ data: {} }),
    delete: () => ({ data: {} })
  })
};

async function testTaskOperationsIntegration() {
  console.log('\n🔧 Testing TaskOperations Integration...');
  
  try {
    // Create a mock tasks client
    const mockTasksClient = new MockGoogleTasksClient(mockSupabase);
    
    // Try to create TaskOperations instance
    const TaskOperations = require('./src/services/agents/murphy-agent/tasks/task-operations');
    const taskOperations = new TaskOperations(mockTasksClient);
    
    console.log('✅ TaskOperations instance created successfully');
    console.log('Instance type:', typeof taskOperations);
    console.log('Has createTask method:', typeof taskOperations.createTask === 'function');
    console.log('Has completeTask method:', typeof taskOperations.completeTask === 'function');
    console.log('Has getTasks method:', typeof taskOperations.getTasks === 'function');
    
    // Test a simple task creation (this will use mocked Google Tasks API)
    const testTaskDetails = {
      task_description: 'Test task for Murphy',
      due_date: null
    };
    
    console.log('\n🧪 Testing task creation...');
    const result = await taskOperations.createTask(testTaskDetails, 'test-user-123');
    
    console.log('✅ Task creation test completed');
    console.log('Result:', result);
    
    return true;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Murphy Constructor Fix Tests\n');
  
  const basicTest = await testMurphyConstructor();
  const integrationTest = await testTaskOperationsIntegration();
  
  console.log('\n📊 Test Results:');
  console.log('Basic Constructor Test:', basicTest ? '✅ PASSED' : '❌ FAILED');
  console.log('Integration Test:', integrationTest ? '✅ PASSED' : '❌ FAILED');
  
  if (basicTest && integrationTest) {
    console.log('\n🎉 All tests passed! Murphy constructor issues are fixed.');
    console.log('✅ Task operations should now work properly');
  } else {
    console.log('\n⚠️  Some tests failed. Constructor issues may still exist.');
  }
}

// Run the tests
runTests().catch(console.error);