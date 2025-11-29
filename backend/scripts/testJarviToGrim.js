#!/usr/bin/env node

// testJarviToGrim.js - End-to-end test for Jarvi to Grim communication

require('dotenv').config({ path: '../.env' });

const jarviService = require('../src/services/jarvi-service');
const agentService = require('../src/services/agent-service');
const userService = require('../src/services/user-service');

// Use real user data from Supabase database
const mockUser = {
  id: '982bb1bf-539c-4b1f-8d1a-714600fff81d', // Real user ID from Supabase
  email: 'trashbot7676@gmail.com',
  phone_number: '+491621808878',
  created_at: '2025-11-03T13:04:24.996099+00:00'
};

// Mock message payload
const mockMessagePayload = {
  from: mockUser.phone_number,
  messageText: 'Create a team meeting for tomorrow at 2 PM',
  status: 'active',
  message: {
    id: 'mock-message-id',
    from: mockUser.phone_number,
    text: 'Create a team meeting for tomorrow at 2 PM',
    timestamp: new Date().toISOString()
  }
};

async function testJarviToGrimFlow() {
  console.log('=== Testing Complete Jarvi to Grim Communication Flow ===\n');

  try {
    // Step 1: Mock the user lookup
    console.log('Step 1: Simulating user lookup...');
    const user = mockUser; // Using our real user from Supabase
    console.log(`✅ User found: ${user.email} (${user.id})\n`);

    // Step 2: Test Jarvi Intent Analysis
    console.log('Step 2: Testing Jarvi intent analysis...');
    const jarviResponse = await jarviService.analyzeIntent({ 
      userId: user.id, 
      text: mockMessagePayload.messageText 
    });

    console.log('📊 Jarvi Response:');
    console.log(`   Response to User: "${jarviResponse.responseToUser}"`);
    console.log(`   Delegation JSON:`, JSON.stringify(jarviResponse.delegationJson, null, 2));
    console.log(`   Intent Analysis:`, JSON.stringify(jarviResponse.intentAnalysis, null, 2));
    console.log('');

    // Step 3: Test Delegation to Agent Service
    if (jarviResponse.delegationJson) {
      console.log('Step 3: Testing delegation to Agent Service...');
      const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
      
      const agentName = Recipient.toLowerCase(); // 'grim' or 'murphy'
      const intent = RequestType.toLowerCase().replace(' ', '_'); // e.g., 'create_event'
      const entities = { message: Message }; // Pass the original message as an entity

      console.log(`📤 Delegating to: ${agentName} with intent: ${intent}`);
      console.log(`📝 Message: "${Message}"`);

      const delegationResult = await agentService.delegateTask(intent, entities, user.id);
      
      console.log('📥 Delegation Result:');
      console.log(`   Message to User: "${delegationResult.messageToUser}"`);
      console.log(`   Event ID: ${delegationResult.eventId}`);
      console.log('');

      // Step 4: Verify the response structure
      console.log('Step 4: Verifying response structure...');
      
      if (delegationResult.messageToUser) {
        console.log('✅ Message to user present');
      } else {
        console.log('❌ Missing message to user');
      }

      if (delegationResult.eventId) {
        console.log('✅ Event ID present for tracking');
      } else {
        console.log('ℹ️  No event ID (expected for some operations like get_event)');
      }

      console.log('');

      // Step 5: Simulate response back through messenger service
      console.log('Step 5: Simulating response back to user...');
      console.log(`📱 Response to WhatsApp user: "${delegationResult.messageToUser}"`);
      
      console.log('\n=== Full Communication Flow Test Complete ===');
      
      return {
        success: true,
        jarviResponse,
        delegationResult,
        fullFlowWorking: true
      };

    } else {
      console.log('❌ No delegation JSON from Jarvi - this should be an action request');
      return { success: false, error: 'No delegation from Jarvi' };
    }

  } catch (error) {
    console.error('❌ Error during flow test:', error);
    return { success: false, error: error.message };
  }
}

// Test different types of calendar requests
async function testAllCalendarOperations() {
  console.log('=== Testing All Calendar Operations ===\n');

  const testCases = [
    {
      name: 'Create Event',
      message: 'Schedule a project meeting for Friday at 3 PM',
      expectedIntent: 'create_event'
    },
    {
      name: 'Get Events',
      message: 'Show me my events for today',
      expectedIntent: 'get_event'
    },
    {
      name: 'Update Event',
      message: 'Change the meeting time to 4 PM',
      expectedIntent: 'update_event'
    },
    {
      name: 'Delete Event',
      message: 'Cancel the weekly team meeting',
      expectedIntent: 'delete_event'
    }
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`--- Testing: ${testCase.name} ---`);
    
    try {
      const jarviResponse = await jarviService.analyzeIntent({ 
        userId: mockUser.id, 
        text: testCase.message 
      });

      if (jarviResponse.delegationJson) {
        const actualIntent = jarviResponse.delegationJson.RequestType.toLowerCase().replace(' ', '_');
        
        if (actualIntent === testCase.expectedIntent) {
          console.log(`✅ ${testCase.name}: Correctly identified as "${actualIntent}"`);
          results.push({ testCase: testCase.name, success: true, intent: actualIntent });
        } else {
          console.log(`❌ ${testCase.name}: Expected "${testCase.expectedIntent}" but got "${actualIntent}"`);
          results.push({ testCase: testCase.name, success: false, intent: actualIntent, expected: testCase.expectedIntent });
        }
      } else {
        console.log(`❌ ${testCase.name}: No delegation generated`);
        results.push({ testCase: testCase.name, success: false, error: 'No delegation' });
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Error - ${error.message}`);
      results.push({ testCase: testCase.name, success: false, error: error.message });
    }
    
    console.log('');
  }

  console.log('=== Test Summary ===');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.testCase}: SUCCESS`);
    } else {
      console.log(`❌ ${result.testCase}: FAILED - ${result.error || `Got "${result.intent}" instead of "${result.expected}"`}`);
    }
  });

  return results;
}

// Main execution
async function main() {
  console.log('🧪 Starting Comprehensive Jarvi to Grim Communication Tests\n');
  
  // Test the full flow
  const flowResult = await testJarviToGrimFlow();
  
  if (flowResult.success) {
    console.log('\n🎉 Full communication flow test PASSED\n');
  } else {
    console.log('\n💥 Full communication flow test FAILED\n');
  }

  // Test all calendar operations
  const operationResults = await testAllCalendarOperations();
  
  const successCount = operationResults.filter(r => r.success).length;
  const totalCount = operationResults.length;
  
  console.log(`\n📊 Final Results: ${successCount}/${totalCount} operation tests passed`);

  if (successCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED - Jarvi and Grim are communicating properly!');
  } else {
    console.log('⚠️  Some tests failed - review the results above');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testJarviToGrimFlow, testAllCalendarOperations };
