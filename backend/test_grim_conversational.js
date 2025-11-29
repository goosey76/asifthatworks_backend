#!/usr/bin/env node

/**
 * Test Grim Agent Enhanced Conversational Capabilities
 * Tests the new conversational layer integration and knowledge coordination
 */

const { createClient } = require('@supabase/supabase-js');
const grimAgent = require('./src/services/agents/grim-agent/grim-agent-fixed');
const agentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Grim agent with supabase
const grim = grimAgent(supabase, global.fetch);

const testUserId = 'test-user-grim-conversational';

// Test scenarios for conversational abilities
const testScenarios = [
  {
    name: 'Greeting Test',
    message: 'Hey Grim, how are you doing?',
    expectedType: 'conversational'
  },
  {
    name: 'Capabilities Request',
    message: 'What can you do for me?',
    expectedType: 'conversational'
  },
  {
    name: 'Personality Introduction',
    message: 'Who are you Grim?',
    expectedType: 'conversational'
  },
  {
    name: 'Calendar Inquiry',
    message: 'What\'s on my calendar today?',
    expectedType: 'conversational'
  },
  {
    name: 'Casual Chit Chat',
    message: 'Good afternoon Grim! Thanks for helping me stay organized.',
    expectedType: 'conversational'
  },
  {
    name: 'Time-related Request',
    message: 'When am I free this week?',
    expectedType: 'conversational'
  },
  {
    name: 'Calendar Operation (Control Test)',
    message: 'Create a meeting with John tomorrow at 2 PM',
    expectedType: 'calendar_operation'
  }
];

async function runConversationalTests() {
  console.log('🧪 Testing Grim Agent Enhanced Conversational Capabilities\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`Message: "${scenario.message}"`);
    console.log(`Expected Type: ${scenario.expectedType}`);
    
    try {
      // Test the conversational handling
      const result = await grim.handleEvent('unknown_intent', {
        message: scenario.message,
        conversation_context: []
      }, testUserId, []);
      
      console.log(`Response: "${result.messageToUser}"`);
      console.log(`Event ID: ${result.eventId}`);
      
      // Verify the response
      const isConversational = result.eventId === null && 
                              !result.messageToUser.toLowerCase().includes('error') &&
                              !result.messageToUser.toLowerCase().includes('couldn\'t');
      
      const expectedBehavior = scenario.expectedType === 'conversational' ? isConversational : !isConversational;
      
      if (expectedBehavior) {
        console.log('✅ PASSED');
        passedTests++;
      } else {
        console.log('❌ FAILED - Unexpected response type');
        failedTests++;
      }
      
      // Test knowledge coordination integration
      const calendarKnowledge = grim.getCalendarKnowledgeForAgents(testUserId);
      console.log(`📊 Calendar Knowledge: ${JSON.stringify(calendarKnowledge, null, 2)}`);
      
      // Register with knowledge coordinator
      agentKnowledgeCoordinator.registerAgentWithKnowledge('grim', testUserId, grim);
      
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}`);
      failedTests++;
    }
    
    console.log('─'.repeat(80));
  }
  
  // Test knowledge coordination
  console.log('\n🔄 Testing Knowledge Coordination System\n');
  
  try {
    // Get comprehensive knowledge
    const comprehensiveKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(testUserId);
    console.log('📊 Comprehensive Knowledge:', JSON.stringify(comprehensiveKnowledge, null, 2));
    
    // Get rotated knowledge for coordination
    const rotatedKnowledge = agentKnowledgeCoordinator.getRotatedUserKnowledge('murphy', testUserId);
    console.log('🔄 Rotated Knowledge for Murphy:', JSON.stringify(rotatedKnowledge, null, 2));
    
    // Check health status
    const healthStatus = agentKnowledgeCoordinator.getHealthStatus();
    console.log('🏥 Health Status:', JSON.stringify(healthStatus, null, 2));
    
    console.log('✅ Knowledge coordination tests passed');
    passedTests++;
    
  } catch (error) {
    console.log(`❌ Knowledge coordination test failed: ${error.message}`);
    failedTests++;
  }
  
  // Test conversational method directly
  console.log('\n💬 Testing Direct Conversational Method\n');
  
  try {
    const conversationalResult = await grim.handleConversational(
      'Hello Grim! Tell me about yourself.',
      testUserId,
      []
    );
    
    console.log('Direct Conversational Response:', conversationalResult.messageToUser);
    console.log('Event ID:', conversationalResult.eventId);
    
    if (conversationalResult.eventId === null && conversationalResult.messageToUser.length > 0) {
      console.log('✅ Direct conversational method works correctly');
      passedTests++;
    } else {
      console.log('❌ Direct conversational method failed');
      failedTests++;
    }
    
  } catch (error) {
    console.log(`❌ Direct conversational test failed: ${error.message}`);
    failedTests++;
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Grim agent conversational enhancements are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  // Cleanup
  agentKnowledgeCoordinator.cleanupExpiredKnowledge(1000); // Clean up test data immediately
  
  return failedTests === 0;
}

// Interactive test mode
async function interactiveTest() {
  console.log('\n🎭 Interactive Grim Conversational Test');
  console.log('Type messages to test Grim\'s conversational abilities (type "quit" to exit)\n');
  
  let userInput = '';
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  while (true) {
    userInput = await new Promise(resolve => {
      rl.question('You: ', resolve);
    });
    
    if (userInput.toLowerCase() === 'quit') {
      break;
    }
    
    try {
      const result = await grim.handleEvent('unknown_intent', {
        message: userInput,
        conversation_context: []
      }, testUserId, []);
      
      console.log(`Grim: ${result.messageToUser}\n`);
    } catch (error) {
      console.log(`Grim: Sorry, I encountered an error: ${error.message}\n`);
    }
  }
  
  rl.close();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveTest();
  } else {
    const success = await runConversationalTests();
    process.exit(success ? 0 : 1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  main().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runConversationalTests,
  interactiveTest
};