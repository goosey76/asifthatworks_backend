#!/usr/bin/env node

// Test script to verify calendar time range and task handling fixes

require('dotenv').config({ path: '../.env' });
const jarviService = require('../src/services/jarvi-service');
const agentService = require('../src/services/agents/jarvi-agent');

const mockUserId = 'test-user-123';

async function testTimeRangeAndTaskHandling() {
  console.log('🧪 Testing Calendar Time Range and Task Handling Fixes\n');
  
  try {
    // Test 1: Tomorrow calendar request
    console.log('1. Testing JARVI → GRIM delegation for "tomorrow" calendar request...');
    const tomorrowResult = await jarviService.analyzeIntent({ 
      userId: mockUserId, 
      text: 'what events do i have tomorrow?' 
    });
    
    console.log('JARVI Response:', tomorrowResult.responseToUser);
    console.log('Delegation JSON:', JSON.stringify(tomorrowResult.delegationJson, null, 2));
    
    if (tomorrowResult.delegationJson && tomorrowResult.delegationJson.Recipient === 'Grim') {
      console.log('✅ Tomorrow calendar request correctly routed to GRIM');
      
      // Test the actual delegation
      const delegationResult = await agentService.delegateTask(
        tomorrowResult.delegationJson.RequestType.toLowerCase().replace(' ', '_'),
        { message: tomorrowResult.delegationJson.Message },
        mockUserId
      );
      
      console.log('GRIM Response (first 200 chars):', delegationResult.response.substring(0, 200) + '...');
      console.log('Response contains "tomorrow":', delegationResult.response.includes('tomorrow'));
      
    } else {
      console.log('❌ Tomorrow calendar request not routed to GRIM properly');
    }
    
    console.log('\n2. Testing JARVI → Murphy delegation for task request...');
    const taskResult = await jarviService.analyzeIntent({ 
      userId: mockUserId, 
      text: 'show me my tasks' 
    });
    
    console.log('JARVI Response:', taskResult.responseToUser);
    console.log('Delegation JSON:', JSON.stringify(taskResult.delegationJson, null, 2));
    
    if (taskResult.delegationJson && taskResult.delegationJson.Recipient === 'Murphy') {
      console.log('✅ Task request correctly routed to Murphy');
      
      // Test the actual delegation
      const delegationResult = await agentService.delegateTask(
        taskResult.delegationJson.RequestType.toLowerCase().replace(' ', '_'),
        { message: taskResult.delegationJson.Message },
        mockUserId
      );
      
      console.log('Murphy Response (first 200 chars):', delegationResult.response.substring(0, 200) + '...');
      
    } else {
      console.log('❌ Task request not routed to Murphy properly');
    }
    
    console.log('\n3. Testing other time ranges...');
    
    // Test "today" request
    const todayResult = await jarviService.analyzeIntent({ 
      userId: mockUserId, 
      text: 'what do I have today?' 
    });
    console.log('✅ "Today" request processed:', todayResult.delegationJson ? 'Routed to agent' : 'Direct response');
    
    // Test "this week" request  
    const weekResult = await jarviService.analyzeIntent({ 
      userId: mockUserId, 
      text: 'show me my schedule this week' 
    });
    console.log('✅ "This week" request processed:', weekResult.delegationJson ? 'Routed to agent' : 'Direct response');
    
    console.log('\n🎉 Time range and task handling test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testTimeRangeAndTaskHandling();
