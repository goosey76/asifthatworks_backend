// test_grim_debug_flow.js - Debug Grim's operational vs conversational flow
require('dotenv').config({ path: './.env' });

const grimAgent = require('./src/services/agents/grim-agent');

// Test different scenarios to identify where the flow breaks
async function testGrimFlow() {
  console.log('=== GRIM DEBUG FLOW TEST ===\n');
  
  const testUserId = 'test-user-123';
  
  // Test 1: Operational request with message in entities
  console.log('Test 1: Operational request with message in entities');
  try {
    const result1 = await grimAgent.handleCalendarIntent(
      'create_event',
      { 
        message: 'Schedule a meeting tomorrow at 2pm',
        extractedEntities: {}
      },
      testUserId
    );
    console.log('Result 1:', result1.messageToUser);
  } catch (error) {
    console.error('Test 1 Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Operational request WITHOUT message in entities (like delegation)
  console.log('Test 2: Operational request WITHOUT message in entities (delegation scenario)');
  try {
    const result2 = await grimAgent.handleCalendarIntent(
      'create_event',
      { 
        extractedEntities: { event_title: 'Meeting', date: '2025-11-17', start_time: '14:00', end_time: '15:00' }
      },
      testUserId
    );
    console.log('Result 2:', result2.messageToUser);
  } catch (error) {
    console.error('Test 2 Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: Direct createEvent call
  console.log('Test 3: Direct createEvent call');
  try {
    const result3 = await grimAgent.createEvent(
      { 
        message: 'Schedule a team meeting',
        extractedEntities: {}
      },
      testUserId
    );
    console.log('Result 3:', result3.messageToUser);
  } catch (error) {
    console.error('Test 3 Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 4: Conversational request (should NOT go operational)
  console.log('Test 4: Conversational request');
  try {
    const result4 = await grimAgent.handleCalendarIntent(
      'unknown_intent',
      { 
        message: 'Hey Grim, how are you?'
      },
      testUserId
    );
    console.log('Result 4:', result4.messageToUser);
  } catch (error) {
    console.error('Test 4 Error:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the tests
testGrimFlow().catch(console.error);