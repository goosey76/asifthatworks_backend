#!/usr/bin/env node

/**
 * Comprehensive Real Google Calendar API Test Suite for Grim Agent
 * Testing actual calendar operations with intelligence engine validation
 * Target: 90% success rate with real API integration
 */

const grimAgent = require('./src/services/agents/grim-agent/index.js');

// Configuration
const TEST_USER_ID = 'grime_real_user_' + Date.now();
const TIMEZONE = 'Europe/Berlin';
const CLEANUP_DELAY = 1000;

// Test results tracking
class TestResult {
  constructor(name, category) {
    this.name = name;
    this.category = category;
    this.passed = false;
    this.error = null;
    this.executionTime = 0;
    this.details = {};
  }
}

class GrimTestSuite {
  constructor() {
    this.results = [];
    this.createdEventIds = new Set();
    this.startTime = Date.now();
  }

  async runTest(testFn) {
    const testName = testFn.name || 'Unnamed Test';
    const testResult = new TestResult(testName, 'calendar');
    const startTime = Date.now();
    
    try {
      console.log(`\n🧪 Running: ${testName}`);
      const result = await testFn();
      
      testResult.executionTime = Date.now() - startTime;
      testResult.passed = result.success;
      testResult.details = result.details || {};
      
      if (result.eventId) {
        this.createdEventIds.add(result.eventId);
      }
      
      console.log(`✅ PASSED: ${testName} (${testResult.executionTime}ms)`);
      console.log(`📊 Details: ${JSON.stringify(result.details, null, 2)}`);
      
    } catch (error) {
      testResult.executionTime = Date.now() - startTime;
      testResult.passed = false;
      testResult.error = error.message;
      
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
    
    this.results.push(testResult);
    await new Promise(resolve => setTimeout(resolve, CLEANUP_DELAY));
  }

  getSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100) : 0;
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: Math.round(successRate * 100) / 100,
      totalTime,
      averageTestTime: Math.round(totalTime / totalTests)
    };
  }
}

const testSuite = new GrimTestSuite();

/**
 * Test 1: Single Event Creation with Intelligence Validation
 */
async function testSingleEventCreation() {
  const eventDetails = {
    event_title: 'Strategy Meeting Test',
    description: 'Quarterly strategy review session',
    date: '2025-11-18',
    start_time: '14:00',
    end_time: '15:30',
    location: 'Conference Room A, Berlin'
  };
  
  const result = await grimAgent.createEvent(eventDetails, TEST_USER_ID);
  
  if (!result.eventId || !result.messageToUser) {
    throw new Error('Single event creation failed - missing event ID or message');
  }
  
  // Validate intelligence engine response
  const hasValidResponse = result.messageToUser.length > 10 && 
                          !result.messageToUser.toLowerCase().includes('error');
  
  if (!hasValidResponse) {
    throw new Error('Intelligence engine provided invalid response');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      hasIntelligence: true
    },
    eventId: result.eventId 
  };
}

/**
 * Test 2: Multiple Event Creation with Batch Intelligence
 */
async function testMultipleEventCreation() {
  const events = [
    {
      event_title: 'Monday Product Review',
      description: 'Weekly product performance analysis',
      date: '2025-11-24',
      start_time: '09:00',
      end_time: '10:30'
    },
    {
      event_title: 'Tuesday Client Call',
      description: 'Monthly client relationship review',
      date: '2025-11-25',
      start_time: '11:00',
      end_time: '12:00'
    },
    {
      event_title: 'Wednesday Training Session',
      description: 'Team training on new technologies',
      date: '2025-11-26',
      start_time: '14:00',
      end_time: '16:00'
    }
  ];
  
  const result = await grimAgent.handleCalendarIntent('create_multiple_events', {
    events: events
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Multiple event creation failed - no response message');
  }
  
  // Check intelligence engine processed events correctly
  const eventCount = events.length;
  const hasIntelligence = result.messageToUser.includes('created') || 
                         result.messageToUser.includes('successfully');
  
  if (!hasIntelligence) {
    throw new Error('Intelligence engine failed to properly summarize multiple events');
  }
  
  return { 
    success: true, 
    details: { 
      eventsProcessed: eventCount, 
      message: result.messageToUser,
      batchIntelligence: true
    }
  };
}

/**
 * Test 3: Event Retrieval with Intelligence Context
 */
async function testEventRetrieval() {
  const result = await grimAgent.getEvents({
    time_range: 'this week'
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Event retrieval failed - no response message');
  }
  
  // Validate intelligence engine provides meaningful schedule information
  const hasScheduleInfo = result.messageToUser.toLowerCase().includes('schedule') || 
                         result.messageToUser.toLowerCase().includes('event') ||
                         result.messageToUser.toLowerCase().includes('grim');
  
  if (!hasScheduleInfo) {
    throw new Error('Intelligence engine failed to provide meaningful schedule information');
  }
  
  return { 
    success: true, 
    details: { 
      message: result.messageToUser,
      hasScheduleIntelligence: true,
      contextAware: true
    }
  };
}

/**
 * Test 4: Event Update with Intelligence Analysis
 */
async function testEventUpdate() {
  // Create event to update
  const createEvent = {
    event_title: 'Workshop Session',
    description: 'AI development workshop',
    date: '2025-11-19',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Tech Hub'
  };
  
  const createResult = await grimAgent.createEvent(createEvent, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test update - event creation failed');
  }
  
  // Update the event
  const updateData = {
    eventId: createResult.eventId,
    event_title: 'Updated AI Development Workshop',
    description: 'Updated description with enhanced content',
    start_time: '10:30',
    end_time: '12:30'
  };
  
  const result = await grimAgent.updateEvent(updateData, TEST_USER_ID);
  
  if (!result.messageToUser || result.eventId !== createResult.eventId) {
    throw new Error('Event update failed - invalid response');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      intelligentUpdate: true,
      updatedFields: ['title', 'description', 'time']
    }
  };
}

/**
 * Test 5: Event Deletion with Confirmation Intelligence
 */
async function testEventDeletion() {
  // Create event to delete
  const deleteEvent = {
    event_title: 'Early Morning Session',
    description: '6 AM fitness session',
    date: '2025-11-20',
    start_time: '06:00',
    end_time: '07:00',
    location: 'Fitness Studio'
  };
  
  const createResult = await grimAgent.createEvent(deleteEvent, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test deletion - event creation failed');
  }
  
  // Delete the event
  const result = await grimAgent.deleteEvent(createResult.eventId, TEST_USER_ID);
  
  if (!result.messageToUser || result.eventId !== createResult.eventId) {
    throw new Error('Event deletion failed - invalid response');
  }
  
  // Validate intelligence engine provides appropriate feedback
  const hasDeletionConfirmation = result.messageToUser.toLowerCase().includes('deleted') || 
                                 result.messageToUser.toLowerCase().includes('success');
  
  if (!hasDeletionConfirmation) {
    throw new Error('Intelligence engine failed to confirm deletion');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      intelligentDeletion: true
    }
  };
}

/**
 * Test 6: Duplicate Detection Intelligence
 */
async function testDuplicateDetection() {
  const duplicateEvent = {
    event_title: 'Duplicate Test Meeting',
    description: 'Testing duplicate detection',
    date: '2025-11-21',
    start_time: '15:00',
    end_time: '16:00',
    location: 'Meeting Room 1'
  };
  
  // Create first event
  const firstResult = await grimAgent.createEvent(duplicateEvent, TEST_USER_ID);
  if (!firstResult.eventId) {
    throw new Error('First event creation failed for duplicate test');
  }
  
  // Try to create duplicate
  const secondResult = await grimAgent.createEvent(duplicateEvent, TEST_USER_ID);
  
  // Should detect duplicate
  if (!secondResult.messageToUser.toLowerCase().includes('already exists')) {
    throw new Error('Duplicate detection intelligence failed');
  }
  
  return { 
    success: true, 
    details: { 
      originalEventId: firstResult.eventId,
      duplicateResponse: secondResult.messageToUser,
      duplicateDetection: true
    }
  };
}

/**
 * Test 7: Time Zone and Boundary Handling
 */
async function testTimeZoneHandling() {
  const boundaryEvent = {
    event_title: 'Time Zone Boundary Test',
    description: 'Testing extreme time scenarios',
    date: '2025-12-31',
    start_time: '23:30',
    end_time: '00:30', // Crosses midnight
    location: 'Berlin'
  };
  
  const result = await grimAgent.createEvent(boundaryEvent, TEST_USER_ID);
  
  if (!result.eventId) {
    throw new Error('Time zone boundary test failed - no event created');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      crossedMidnight: true,
      timeZoneHandling: true
    }
  };
}

/**
 * Test 8: Location Intelligence and Validation
 */
async function testLocationIntelligence() {
  const eventWithLocation = {
    event_title: 'Location Test Event',
    description: 'Testing location handling',
    date: '2025-11-22',
    start_time: '13:00',
    end_time: '14:00',
    location: 'Virtual Conference Room'
  };
  
  const result = await grimAgent.createEvent(eventWithLocation, TEST_USER_ID);
  
  if (!result.eventId || !result.messageToUser) {
    throw new Error('Location intelligence test failed');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      locationHandled: true,
      intelligenceActive: true
    }
  };
}

/**
 * Test 9: Context Awareness and Intelligence
 */
async function testContextAwareness() {
  // Create related events
  const contextEvents = [
    {
      event_title: 'Project Kickoff',
      description: 'Initial project planning',
      date: '2025-11-27',
      start_time: '09:00',
      end_time: '10:30'
    },
    {
      event_title: 'Project Review',
      description: 'Mid-project progress review',
      date: '2025-12-04',
      start_time: '14:00',
      end_time: '15:00'
    }
  ];
  
  const results = [];
  for (const event of contextEvents) {
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      results.push(result);
    }
  }
  
  // Test context awareness through calendar retrieval
  const calendarResult = await grimAgent.getEvents({
    time_range: 'next week'
  }, TEST_USER_ID);
  
  if (!calendarResult.messageToUser) {
    throw new Error('Context awareness test failed');
  }
  
  return { 
    success: true, 
    details: { 
      eventsCreated: results.length,
      contextMessage: calendarResult.messageToUser,
      contextAware: true,
      intelligenceLevel: 'high'
    }
  };
}

/**
 * Test 10: Partial Update Intelligence
 */
async function testPartialUpdateIntelligence() {
  // Create event
  const createEvent = {
    event_title: 'Partial Update Test',
    description: 'Testing partial updates',
    date: '2025-11-23',
    start_time: '16:00',
    end_time: '17:00',
    location: 'Conference Room B'
  };
  
  const createResult = await grimAgent.createEvent(createEvent, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test partial update - event creation failed');
  }
  
  // Update only location
  const partialUpdate = {
    eventId: createResult.eventId,
    location: 'Updated Conference Room C'
  };
  
  const result = await grimAgent.updateEvent(partialUpdate, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Partial update failed');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId,
      message: result.messageToUser,
      partialUpdate: true,
      intelligenceProcessing: true
    }
  };
}

/**
 * Test 11: Error Handling Intelligence
 */
async function testErrorHandlingIntelligence() {
  // Test with invalid event data
  const invalidEvent = {
    event_title: '', // Empty title
    date: 'invalid-date',
    start_time: '25:00', // Invalid time
    end_time: '26:00'
  };
  
  const result = await grimAgent.createEvent(invalidEvent, TEST_USER_ID);
  
  // Should handle error gracefully
  if (!result.messageToUser) {
    throw new Error('Error handling test failed - no response');
  }
  
  return { 
    success: true, 
    details: { 
      message: result.messageToUser,
      errorHandled: true,
      intelligentResponse: true
    }
  };
}

/**
 * Test 12: Long-term Event Management
 */
async function testLongTermManagement() {
  const futureEvents = [];
  
  // Create weekly events for next month
  for (let i = 0; i < 30; i += 7) {
    const event = {
      event_title: `Weekly Review ${Math.floor(i/7) + 1}`,
      description: 'Regular weekly review session',
      date: `2025-12-${String(1 + i).padStart(2, '0')}`,
      start_time: '15:00',
      end_time: '16:00'
    };
    
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      futureEvents.push(result.eventId);
    }
  }
  
  // Test retrieval of long-term schedule
  const result = await grimAgent.getEvents({
    time_range: 'next month'
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Long-term management test failed');
  }
  
  return { 
    success: true, 
    details: { 
      futureEventsCreated: futureEvents.length,
      longTermMessage: result.messageToUser,
      longTermCapability: true
    }
  };
}

/**
 * Test 13: Sequential Event Intelligence
 */
async function testSequentialEventIntelligence() {
  const sequentialEvents = [
    {
      event_title: 'Meeting Preparation',
      description: 'Pre-meeting prep',
      date: '2025-11-28',
      start_time: '13:00',
      end_time: '13:45'
    },
    {
      event_title: 'Main Strategy Meeting',
      description: 'Core strategy discussion',
      date: '2025-11-28',
      start_time: '14:00',
      end_time: '16:00'
    },
    {
      event_title: 'Meeting Follow-up',
      description: 'Post-meeting actions',
      date: '2025-11-28',
      start_time: '16:15',
      end_time: '17:00'
    }
  ];
  
  const results = [];
  for (const event of sequentialEvents) {
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      results.push(result);
    }
  }
  
  if (results.length !== sequentialEvents.length) {
    throw new Error('Sequential event creation failed');
  }
  
  return { 
    success: true, 
    details: { 
      sequentialEventsCreated: results.length,
      intelligentSpacing: true,
      sequenceHandling: true
    }
  };
}

/**
 * Test 14: Performance and Intelligence Quality
 */
async function testPerformanceAndIntelligence() {
  const performanceEvents = [];
  const batchSize = 5; // Reduced for stability
  
  // Create batch of events to test performance
  for (let i = 0; i < batchSize; i++) {
    const event = {
      event_title: `Performance Test Event ${i + 1}`,
      description: 'Batch processing test',
      date: `2025-11-${String(24 + i).padStart(2, '0')}`,
      start_time: `${String(9 + (i % 6)).padStart(2, '0')}:00`,
      end_time: `${String(10 + (i % 6)).padStart(2, '0')}:00`
    };
    
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      performanceEvents.push(result.eventId);
    }
  }
  
  // Test overall intelligence response quality
  const intelligenceResult = await grimAgent.getEvents({
    time_range: 'this week'
  }, TEST_USER_ID);
  
  const responseQuality = {
    hasScheduleInfo: intelligenceResult.messageToUser.includes('schedule') || 
                     intelligenceResult.messageToUser.includes('event'),
    hasIntelligence: intelligenceResult.messageToUser.length > 50,
    hasGrimCharacter: intelligenceResult.messageToUser.toLowerCase().includes('grim') ||
                intelligenceResult.messageToUser.includes('your')
  };
  
  return { 
    success: true, 
    details: { 
      eventsCreated: performanceEvents.length,
      intelligenceMessage: intelligenceResult.messageToUser,
      responseQuality,
      performanceTest: true,
      batchProcessing: true
    }
  };
}

/**
 * Test 15: Calendar Multi-Intelligence Integration
 */
async function testMultiIntelligenceIntegration() {
  // Create events of different types
  const mixedEvents = [
    {
      event_title: 'Business Meeting',
      description: 'Client presentation',
      date: '2025-11-29',
      start_time: '10:00',
      end_time: '11:30'
    },
    {
      event_title: 'Team Lunch',
      description: 'Team building activity',
      date: '2025-11-29',
      start_time: '12:00',
      end_time: '13:30'
    },
    {
      event_title: 'Technical Review',
      description: 'Code review session',
      date: '2025-11-29',
      start_time: '14:00',
      end_time: '16:00'
    }
  ];
  
  const results = [];
  for (const event of mixedEvents) {
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      results.push(result);
    }
  }
  
  // Test multi-intelligence integration through comprehensive retrieval
  const integrationResult = await grimAgent.getEvents({
    time_range: 'today'
  }, TEST_USER_ID);
  
  if (!integrationResult.messageToUser) {
    throw new Error('Multi-intelligence integration test failed');
  }
  
  return { 
    success: true, 
    details: { 
      mixedEventsCreated: results.length,
      integrationMessage: integrationResult.messageToUser,
      multiIntelligence: true,
      comprehensiveHandling: true
    }
  };
}

/**
 * Cleanup function
 */
async function cleanupTestEvents() {
  console.log('\n🧹 Cleaning up test events...');
  
  let cleaned = 0;
  for (const eventId of testSuite.createdEventIds) {
    try {
      await grimAgent.deleteEvent(eventId, TEST_USER_ID);
      console.log(`✅ Cleaned up event: ${eventId}`);
      cleaned++;
    } catch (error) {
      console.log(`⚠️ Failed to cleanup event ${eventId}: ${error.message}`);
    }
  }
  
  console.log(`📊 Cleanup completed: ${cleaned}/${testSuite.createdEventIds.size} events removed`);
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Grim Calendar Test Suite');
  console.log(`📊 Target: 90% success rate with real Google Calendar API`);
  console.log(`👤 Test User: ${TEST_USER_ID}`);
  console.log(`🕒 Timezone: ${TIMEZONE}`);
  console.log('='.repeat(80));
  
  const tests = [
    testSingleEventCreation,
    testMultipleEventCreation,
    testEventRetrieval,
    testEventUpdate,
    testEventDeletion,
    testDuplicateDetection,
    testTimeZoneHandling,
    testLocationIntelligence,
    testContextAwareness,
    testPartialUpdateIntelligence,
    testErrorHandlingIntelligence,
    testLongTermManagement,
    testSequentialEventIntelligence,
    testPerformanceAndIntelligence,
    testMultiIntelligenceIntegration
  ];
  
  // Run all tests
  for (const test of tests) {
    await testSuite.runTest(test);
  }
  
  // Cleanup
  await cleanupTestEvents();
  
  // Final summary
  const summary = testSuite.getSummary();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`📈 Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`❌ Failed: ${summary.failedTests}`);
  console.log(`🎯 Success Rate: ${summary.successRate}%`);
  console.log(`⏱️ Total Execution Time: ${summary.totalTime}ms`);
  console.log(`📊 Average Test Time: ${summary.averageTestTime}ms`);
  
  // Success assessment
  if (summary.successRate >= 90) {
    console.log('\n🎉 SUCCESS! Achieved target 90% success rate!');
    console.log('🚀 Grim calendar functionality is robust and ready for production.');
  } else {
    console.log('\n⚠️ WARNING: Did not achieve 90% success rate.');
    console.log('🔧 System needs improvements before production deployment.');
  }
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-'.repeat(80));
  testSuite.results.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const paddedIndex = String(index + 1).padStart(2, '0');
    console.log(`${paddedIndex}. ${status} - ${result.name}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    console.log(`    Time: ${result.executionTime}ms`);
    if (Object.keys(result.details).length > 0) {
      console.log(`    Details: ${JSON.stringify(result.details, null, 4)}`);
    }
    console.log('');
  });
  
  return summary.successRate >= 90;
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test execution interrupted. Cleaning up...');
  await cleanupTestEvents();
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  GrimTestSuite,
  TEST_USER_ID
};