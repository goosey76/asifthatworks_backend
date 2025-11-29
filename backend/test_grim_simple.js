#!/usr/bin/env node

/**
 * Simple Test for Grim Agent Conversational Layer
 * Tests conversational capabilities without LLM dependencies
 */

const GrimConversational = require('./src/services/agents/grim-agent/conversational/grim-conversational');
const agentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');

// Initialize conversational layer
const grimConversational = new GrimConversational();

const testUserId = 'test-user-conversational';

// Test scenarios for conversational abilities
const testScenarios = [
  {
    name: 'Greeting Test',
    message: 'Hey Grim, how are you doing?',
    shouldHandle: true
  },
  {
    name: 'Capabilities Request',
    message: 'What can you do for me?',
    shouldHandle: true
  },
  {
    name: 'Personality Introduction',
    message: 'Who are you Grim?',
    shouldHandle: true
  },
  {
    name: 'Calendar Inquiry',
    message: 'What\'s on my calendar today?',
    shouldHandle: true
  },
  {
    name: 'Casual Chit Chat',
    message: 'Good afternoon Grim! Thanks for helping me stay organized.',
    shouldHandle: true
  },
  {
    name: 'Time-related Request',
    message: 'When am I free this week?',
    shouldHandle: true
  },
  {
    name: 'Farewell',
    message: 'See you later Grim!',
    shouldHandle: true
  }
];

async function testConversationalLayer() {
  console.log('🧪 Testing Grim Conversational Layer\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const scenario of testScenarios) {
    console.log(`\n📋 Testing: ${scenario.name}`);
    console.log(`Message: "${scenario.message}"`);
    
    try {
      const result = await grimConversational.handleConversational(
        scenario.message,
        testUserId,
        []
      );
      
      console.log(`Response: "${result.messageToUser}"`);
      console.log(`Event ID: ${result.eventId}`);
      
      // Verify conversational response
      const isValidResponse = result.eventId === null && 
                             result.messageToUser && 
                             result.messageToUser.length > 0 &&
                             !result.messageToUser.toLowerCase().includes('error');
      
      if (isValidResponse) {
        console.log('✅ PASSED - Valid conversational response');
        passedTests++;
      } else {
        console.log('❌ FAILED - Invalid response');
        failedTests++;
      }
      
      // Test calendar knowledge methods
      const calendarKnowledge = grimConversational.getCalendarKnowledgeForAgents(testUserId);
      console.log(`📊 Calendar Knowledge:`, {
        totalEvents: calendarKnowledge.calendarSnapshot?.totalEvents || 0,
        hasKnowledge: Object.keys(calendarKnowledge).length > 0
      });
      
    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}`);
      failedTests++;
    }
    
    console.log('─'.repeat(60));
  }
  
  // Test calendar profile methods
  console.log('\n📊 Testing Calendar Knowledge Management\n');
  
  try {
    // Update event activity
    grimConversational.updateEventActivity(testUserId, {
      type: 'create',
      eventTitle: 'Test Meeting',
      eventType: 'meeting',
      location: 'Office',
      completed: false
    });
    
    // Get updated knowledge
    const calendarKnowledge = grimConversational.getCalendarKnowledgeForAgents(testUserId);
    
    console.log('✅ Calendar profile updated successfully');
    console.log('📊 Updated Knowledge:', {
      totalEvents: calendarKnowledge.calendarSnapshot?.totalEvents || 0,
      eventTypes: calendarKnowledge.calendarSnapshot?.favoriteEventTypes?.length || 0
    });
    
    passedTests++;
    
  } catch (error) {
    console.log(`❌ Calendar knowledge test failed: ${error.message}`);
    failedTests++;
  }
  
  // Test conversation context
  console.log('\n💬 Testing Conversation Context\n');
  
  try {
    // Simulate conversation history
    const conversationHistory = [
      { content: 'Hey Grim, how are you?' },
      { content: 'I need to schedule a meeting' }
    ];
    
    await grimConversational.handleConversational(
      'Thanks for the help!',
      testUserId,
      conversationHistory
    );
    
    console.log('✅ Conversation context handled successfully');
    passedTests++;
    
  } catch (error) {
    console.log(`❌ Conversation context test failed: ${error.message}`);
    failedTests++;
  }
  
  // Test interaction recording
  console.log('\n📝 Testing Interaction Recording\n');
  
  try {
    grimConversational.recordInteraction(testUserId, 'test_interaction', {
      message: 'Test message',
      type: 'test'
    });
    
    console.log('✅ Interaction recording works');
    passedTests++;
    
  } catch (error) {
    console.log(`❌ Interaction recording test failed: ${error.message}`);
    failedTests++;
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All conversational tests passed! Grim conversational layer is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  return failedTests === 0;
}

async function testKnowledgeCoordinator() {
  console.log('\n🔄 Testing Knowledge Coordinator Integration\n');
  
  try {
    // Create a mock grim agent with the necessary methods
    const mockGrimAgent = {
      getCalendarKnowledgeForAgents: (userId) => {
        return {
          userId: userId,
          timestamp: new Date().toISOString(),
          calendarSnapshot: {
            totalEvents: 5,
            favoriteEventTypes: [{ type: 'meeting', count: 3 }]
          },
          coordinationHints: {
            bufferTimeNeeded: 15
          }
        };
      }
    };
    
    // Register with knowledge coordinator
    agentKnowledgeCoordinator.registerAgentWithKnowledge('grim', 'test-user', mockGrimAgent);
    
    // Get rotated knowledge
    const rotatedKnowledge = agentKnowledgeCoordinator.getRotatedUserKnowledge('murphy', 'test-user');
    
    console.log('✅ Knowledge coordination works');
    console.log('📊 Rotated Knowledge:', JSON.stringify(rotatedKnowledge, null, 2));
    
    // Get comprehensive knowledge
    const comprehensiveKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge('test-user');
    
    console.log('✅ Comprehensive knowledge retrieval works');
    console.log('📊 Comprehensive:', JSON.stringify(comprehensiveKnowledge, null, 2));
    
    return true;
    
  } catch (error) {
    console.log(`❌ Knowledge coordinator test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Grim Conversational Layer Tests\n');
  
  const conversationalTestsPassed = await testConversationalLayer();
  const knowledgeTestsPassed = await testKnowledgeCoordinator();
  
  console.log('\n🎯 Final Results');
  console.log('═'.repeat(50));
  console.log(`💬 Conversational Tests: ${conversationalTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🔄 Knowledge Tests: ${knowledgeTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallSuccess = conversationalTestsPassed && knowledgeTestsPassed;
  
  if (overallSuccess) {
    console.log('\n🎉 All tests passed! Grim agent enhancements are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  return overallSuccess;
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testConversationalLayer,
  testKnowledgeCoordinator
};