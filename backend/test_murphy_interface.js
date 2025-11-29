#!/usr/bin/env node

// test_murphy_interface.js - Comprehensive MURPHY Task Manager Test Interface

require('dotenv').config({ path: './.env' });

const murphyAgent = require('./src/services/agent-service/murphy-agent');

// Use the same mock user from existing tests
const mockUser = {
  id: '982bb1bf-539c-4b1f-8d1a-714600fff81d', // Real user ID from Supabase
  email: 'trashbot7676@gmail.com',
  phone_number: '+491621808878',
  created_at: '2025-11-03T13:04:24.996099+00:00'
};

// Test cases covering all major task operations
const testCases = [
  {
    name: 'Create Task - Basic',
    message: 'create task - call doctor to schedule appointment',
    expected: 'should create task with basic description'
  },
  {
    name: 'Create Task - With Due Date',
    message: 'add task - finish project presentation due tomorrow',
    expected: 'should create task with due date'
  },
  {
    name: 'Create Task - Specific Date',
    message: 'create task - buy groceries due 2025-11-15',
    expected: 'should create task with specific date'
  },
  {
    name: 'Get All Tasks',
    message: 'show me my tasks',
    expected: 'should return all active tasks'
  },
  {
    name: 'Get Today Tasks',
    message: 'what tasks do I have today?',
    expected: 'should return today\'s tasks'
  },
  {
    name: 'Update Task - Change Title',
    message: 'update task "call doctor" to "schedule doctor appointment"',
    expected: 'should update task title'
  },
  {
    name: 'Update Task - Change Due Date',
    message: 'update task "buy groceries" due next week',
    expected: 'should update task due date'
  },
  {
    name: 'Delete Task',
    message: 'delete task "finish project presentation"',
    expected: 'should delete task by title'
  },
  {
    name: 'Complete Task',
    message: 'mark task "call doctor" as complete',
    expected: 'should mark task as completed'
  },
  {
    name: 'Urgent Tasks',
    message: 'show me urgent tasks',
    expected: 'should return urgent/overdue tasks'
  }
];

// Manual test runner
async function runMurphyTests() {
  console.log('🧪 MURPHY Task Manager - Comprehensive Test Interface\n');
  console.log('User ID:', mockUser.id);
  console.log('Testing all Google Tasks functionality...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`--- Test ${i + 1}/10: ${testCase.name} ---`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Expected: ${testCase.expected}\n`);
    
    try {
      // Simulate different intents based on message content
      let intent = 'get_task'; // default
      if (testCase.message.toLowerCase().includes('create') || testCase.message.toLowerCase().includes('add')) {
        intent = 'create_task';
      } else if (testCase.message.toLowerCase().includes('update') || testCase.message.toLowerCase().includes('change')) {
        intent = 'update_task';
      } else if (testCase.message.toLowerCase().includes('delete') || testCase.message.toLowerCase().includes('remove')) {
        intent = 'delete_task';
      } else if (testCase.message.toLowerCase().includes('complete') || testCase.message.toLowerCase().includes('mark')) {
        intent = 'complete_task';
      } else if (testCase.message.toLowerCase().includes('show') || testCase.message.toLowerCase().includes('what')) {
        intent = 'get_task';
      }

      const entities = { message: testCase.message };
      
      console.log(`🎯 Intent: ${intent}`);
      const result = await murphyAgent.handleTask(intent, entities, mockUser.id);
      
      console.log('📝 MURPHY Response:');
      console.log(`   "${result}"\n`);
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}\n`);
    }
    
    console.log('=' .repeat(60));
  }
  
  console.log('\n🎯 Manual Testing Instructions:');
  console.log('1. Review each response for accuracy and formatting');
  console.log('2. Check if due dates are parsed correctly');
  console.log('3. Verify task operations (create, update, delete) work properly');
  console.log('4. Test response tone and style consistency');
  console.log('5. Note any missing features or improvements needed\n');
  
  console.log('🔧 Next Steps:');
  console.log('- Fix any issues found');
  console.log('- Enhance with smart features (like GRIM\'s title search)');
  console.log('- Add task completion toggle');
  console.log('- Implement task priorities and categories');
  console.log('- Add WhatsApp-friendly formatting');
  console.log('- Integrate with JARVI for seamless delegation\n');
}

// Interactive testing mode
async function interactiveMode() {
  console.log('🚀 MURPHY Interactive Test Mode\n');
  console.log('Enter your task commands (or "quit" to exit):\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function askQuestion() {
    rl.question('📝 Task Command: ', async (input) => {
      if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        return;
      }

      try {
        // Determine intent from input
        let intent = 'get_task';
        if (input.toLowerCase().includes('create') || input.toLowerCase().includes('add') || input.toLowerCase().includes('make')) {
          intent = 'create_task';
        } else if (input.toLowerCase().includes('update') || input.toLowerCase().includes('change') || input.toLowerCase().includes('edit')) {
          intent = 'update_task';
        } else if (input.toLowerCase().includes('delete') || input.toLowerCase().includes('remove')) {
          intent = 'delete_task';
        } else if (input.toLowerCase().includes('complete') || input.toLowerCase().includes('mark')) {
          intent = 'complete_task';
        } else if (input.toLowerCase().includes('show') || input.toLowerCase().includes('what') || input.toLowerCase().includes('list')) {
          intent = 'get_task';
        }

        const entities = { message: input };
        console.log(`🎯 Intent: ${intent}`);
        
        const result = await murphyAgent.handleTask(intent, entities, mockUser.id);
        
        console.log('📝 MURPHY Response:');
        console.log(`   "${result}"\n`);
        
      } catch (error) {
        console.log(`   💥 ERROR: ${error.message}\n`);
      }
      
      askQuestion(); // Continue asking
    });
  }

  askQuestion();
}

// Main execution
async function main() {
  console.log('🎯 MURPHY Task Manager Test Interface\n');
  console.log('Choose testing mode:');
  console.log('1. Automated Test Suite');
  console.log('2. Interactive Testing');
  console.log('3. Both\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Select mode (1-3): ', async (choice) => {
    rl.close();
    
    switch (choice.trim()) {
      case '1':
        await runMurphyTests();
        break;
      case '2':
        await interactiveMode();
        break;
      case '3':
        await runMurphyTests();
        console.log('\n' + '='.repeat(60) + '\n');
        await interactiveMode();
        break;
      default:
        console.log('❌ Invalid choice. Running automated tests...\n');
        await runMurphyTests();
    }
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMurphyTests, interactiveMode };