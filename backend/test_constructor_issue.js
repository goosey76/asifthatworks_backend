// Simple test to isolate TaskCrud constructor issue
console.log('Testing TaskCrud import and instantiation...');

try {
  // Test importing TaskCrud directly
  console.log('1. Testing TaskCrud import...');
  const TaskCrud = require('./src/services/agents/murphy-agent/tasks/task-operations/task-crud');
  console.log('TaskCrud imported successfully:', typeof TaskCrud);
  
  // Test creating a mock googleTasksClient
  console.log('2. Testing mock client...');
  const mockClient = {
    getTasksClient: () => Promise.resolve({
      tasks: {
        list: () => Promise.resolve({ data: { items: [] } })
      }
    })
  };
  
  // Test instantiating TaskCrud
  console.log('3. Testing TaskCrud instantiation...');
  const taskCrud = new TaskCrud(mockClient);
  console.log('TaskCrud instantiated successfully:', taskCrud.constructor.name);
  
  // Test TaskOperations import
  console.log('4. Testing TaskOperations import...');
  const TaskOperations = require('./src/services/agents/murphy-agent/tasks/task-operations');
  console.log('TaskOperations imported successfully:', typeof TaskOperations);
  
  // Test TaskOperations instantiation
  console.log('5. Testing TaskOperations instantiation...');
  const taskOperations = new TaskOperations(mockClient);
  console.log('TaskOperations instantiated successfully:', taskOperations.constructor.name);
  
  console.log('✅ All tests passed - constructor issue not reproduced');
  
} catch (error) {
  console.error('❌ Constructor issue found:', error.message);
  console.error('Stack trace:', error.stack);
}