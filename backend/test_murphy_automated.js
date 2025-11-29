#!/usr/bin/env node

// test_murphy_automated.js - Automated MURPHY Task Manager Test

require('dotenv').config({ path: './.env' });

const murphyAgent = require('./src/services/agent-service/murphy-agent');

const mockUser = {
  id: '982bb1bf-539c-4b1f-8d1a-714600fff81d',
  email: 'trashbot7676@gmail.com',
  phone_number: '+491621808878',
  created_at: '2025-11-03T13:04:24.996099+00:00'
};

async function testMurphyFunctionality() {
  console.log('🧪 MURPHY Task Manager - Automated Test\n');

  const tests = [
    {
      name: 'Get All Tasks',
      intent: 'get_task',
      message: 'show me all my tasks',
      expected: 'should list all tasks'
    },
    {
      name: 'Create Basic Task',
      intent: 'create_task',
      message: 'create task - call doctor',
      expected: 'should create a basic task'
    },
    {
      name: 'Create Task with Due Date',
      intent: 'create_task',
      message: 'add task - finish report due tomorrow',
      expected: 'should create task with due date'
    }
  ];

  for (const test of tests) {
    console.log(`--- ${test.name} ---`);
    console.log(`Message: "${test.message}"`);
    console.log(`Intent: ${test.intent}`);
    
    try {
      const entities = { message: test.message };
      const result = await murphyAgent.handleTask(test.intent, entities, mockUser.id);
      console.log(`✅ Result: "${result}"\n`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
    
    console.log('─'.repeat(50));
  }

  console.log('\n🎯 Analysis:');
  console.log('1. Check if task operations work with Google Tasks API');
  console.log('2. Verify MURPHY\'s persona (casual, friendly)');
  console.log('3. Assess date parsing and extraction');
  console.log('4. Review response formatting for WhatsApp compatibility');
  console.log('5. Identify missing features for enhancement\n');
}

testMurphyFunctionality().catch(console.error);