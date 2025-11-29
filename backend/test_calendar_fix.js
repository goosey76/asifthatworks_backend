#!/usr/bin/env node

// test_calendar_fix.js - Specific test for calendar GET request fixes

require('dotenv').config({ path: './.env' });

const jarviService = require('./src/services/jarvi-service');

// Use the same mock user from the existing tests
const mockUser = {
  id: '982bb1bf-539c-4b1f-8d1a-714600fff81d', // Real user ID from Supabase
  email: 'trashbot7676@gmail.com',
  phone_number: '+491621808878',
  created_at: '2025-11-03T13:04:24.996099+00:00'
};

// Test cases that were previously failing
const problematicMessages = [
  {
    name: 'Calendar Check Request 1',
    message: 'check my calendar please can you?',
    expected: 'Should delegate to GRIM as get_event'
  },
  {
    name: 'Calendar Check Request 2', 
    message: 'whats up for my calendar?',
    expected: 'Should delegate to GRIM as get_event'
  },
  {
    name: 'Calendar Check Request 3',
    message: 'can you tell me whats up for today?',
    expected: 'Should delegate to GRIM as get_event'
  }
];

async function testCalendarFix() {
  console.log('🔍 Testing Calendar GET Request Detection Fix\n');
  
  for (const testCase of problematicMessages) {
    console.log(`--- Testing: ${testCase.name} ---`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Expected: ${testCase.expected}\n`);
    
    try {
      const jarviResponse = await jarviService.analyzeIntent({ 
        userId: mockUser.id, 
        text: testCase.message 
      });

      console.log('📊 JARVI Response:');
      console.log(`   Response to User: "${jarviResponse.responseToUser}"`);
      
      if (jarviResponse.delegationJson) {
        console.log(`   ✅ Delegation Generated:`);
        console.log(`      Recipient: ${jarviResponse.delegationJson.Recipient}`);
        console.log(`      RequestType: ${jarviResponse.delegationJson.RequestType}`);
        console.log(`      Message: "${jarviResponse.delegationJson.Message}"`);
        
        // Check if it's correctly delegating to GRIM for calendar GET
        if (jarviResponse.delegationJson.Recipient === 'Grim' && 
            jarviResponse.delegationJson.RequestType === 'Get Event') {
          console.log(`   🎉 SUCCESS: Correctly delegated to GRIM as "Get Event"\n`);
        } else {
          console.log(`   ⚠️  ISSUE: Delegated to ${jarviResponse.delegationJson.Recipient} as "${jarviResponse.delegationJson.RequestType}"\n`);
        }
      } else {
        console.log(`   ❌ FAILED: No delegation generated - JARVI is treating this as general knowledge\n`);
      }
      
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}\n`);
    }
  }
  
  console.log('=== Test Complete ===');
}

// Run the test
testCalendarFix().catch(console.error);