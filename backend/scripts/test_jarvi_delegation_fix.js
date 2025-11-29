#!/usr/bin/env node

// Test script for JARVI agent delegation fix
// Tests that response objects are properly handled instead of showing [object Object]

require('dotenv').config({ path: '../.env' });
const jarviAgent = require('../src/services/agents/jarvi-agent');

// Mock message payload
const mockMessagePayload = {
  userId: 'test-user-123',
  message: 'create a calendar event for tomorrow at 2pm',
  from: '+1234567890'
};

// Mock delegation JSON for GRIM
const mockDelegationJson = {
  Recipient: 'Grim',
  RequestType: 'create_event',
  Message: 'create a calendar event for tomorrow at 2pm'
};

// Mock delegation JSON for Murphy
const mockMurphyDelegationJson = {
  Recipient: 'Murphy',
  RequestType: 'create_task',
  Message: 'remind me to call dentist'
};

async function testJarviDelegationFix() {
  console.log('🧪 Testing JARVI Agent Delegation Fix\n');
  
  try {
    console.log('1. Testing JARVI → GRIM delegation...');
    const grimResult = await jarviAgent.routeDelegation(mockDelegationJson, mockMessagePayload);
    
    console.log('Result structure:');
    console.log('- Agent:', grimResult.agent);
    console.log('- Response type:', typeof grimResult.response);
    console.log('- Response contains "[object Object]":', grimResult.response.includes('[object Object]'));
    
    if (!grimResult.response.includes('[object Object]')) {
      console.log('✅ GRIM delegation test PASSED - No [object Object] found');
      console.log('Sample response (first 100 chars):', grimResult.response.substring(0, 100) + '...');
    } else {
      console.log('❌ GRIM delegation test FAILED - Still contains [object Object]');
      console.log('Full response:', grimResult.response);
    }
    
    console.log('\n2. Testing JARVI → Murphy delegation...');
    const murphyResult = await jarviAgent.routeDelegation(mockMurphyDelegationJson, mockMessagePayload);
    
    console.log('Result structure:');
    console.log('- Agent:', murphyResult.agent);
    console.log('- Response type:', typeof murphyResult.response);
    console.log('- Response contains "[object Object]":', murphyResult.response.includes('[object Object]'));
    
    if (!murphyResult.response.includes('[object Object]')) {
      console.log('✅ Murphy delegation test PASSED - No [object Object] found');
      console.log('Sample response (first 100 chars):', murphyResult.response.substring(0, 100) + '...');
    } else {
      console.log('❌ Murphy delegation test FAILED - Still contains [object Object]');
      console.log('Full response:', murphyResult.response);
    }
    
    console.log('\n3. Testing delegation randomization...');
    
    // Test multiple times to check randomization
    const responses = [];
    for (let i = 0; i < 3; i++) {
      const randomResult = await jarviAgent.routeDelegation(mockDelegationJson, mockMessagePayload);
      responses.push(randomResult.response);
    }
    
    // Check if we have different responses (randomization working)
    const uniqueResponses = new Set(responses.map(r => r.split('\n\n')[0])); // Extract JARVI part
    console.log(`Unique JARVI responses: ${uniqueResponses.size}/3`);
    
    if (uniqueResponses.size > 1) {
      console.log('✅ Response randomization is working!');
    } else {
      console.log('⚠️ Response randomization may not be working (only 1 unique response)');
    }
    
    console.log('\n🎉 JARVI delegation fix test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testJarviDelegationFix();