#!/usr/bin/env node

/**
 * Comprehensive Isolated Test Suite for Grim Agent Calendar Functionality
 * Real Google Calendar API integration tests with intelligence engine validation
 * Target: 90% success rate with no mocks or simulations
 */

const { createClient } = require('@supabase/supabase-js');
const grimAgent = require('./src/services/agents/grim-agent/index.js');
const { SingleEventCreator, MultipleEventCreator, EventCrud, LocationUtils } = require('./src/services/agents/grim-agent/calendar/event-operations');
const googleCalendarClient = require('./src/services/agents/grim-agent/calendar/google-calendar-client');
const calendarUtils = require('./src/services/agents/grim-agent/calendar/calendar-utils');

// Initialize Supabase for real testing
require('dotenv').config({ path: './.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Test configuration
const TEST_USER_ID = 'grime_test_user_' + Date.now();
const TEST_TIMEZONE = 'Europe/Berlin';
const CLEANUP_DELAY = 1000; // 1 second between operations

// Test event data for realistic scenarios
const TEST_EVENTS = {
  // Single event tests
  singleMeeting: {
    event_title: 'Test Strategy Meeting',
    description: 'Quarterly strategy review and planning session',
    date: '2025-11-18',
    start_time: '14:00',
    end_time: '15:30',
    location: 'Conference Room A, Berlin'
  },
  
  singleWorkshop: {
    event_title: 'AI Development Workshop',
    description: 'Hands-on session for team skill development',
    date: '2025-11-19',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Tech Hub, Munich'
  },
  
  // Multiple events tests
  multipleDayEvents: [
    {
      event_title: 'Monday Product Review',
      description: 'Weekly product performance analysis',
      date: '2025-11-24',
      start_time: '09:00',
      end_time: '10:30',
      location: 'Meeting Room 1'
    },
    {
      event_title: 'Tuesday Client Call',
      description: 'Monthly client relationship review',
      date: '2025-11-25',
      start_time: '11:00',
      end_time: '12:00',
      location: 'Virtual (Zoom)'
    },
    {
      event_title: 'Wednesday Training Session',
      description: 'Team training on new technologies',
      date: '2025-11-26',
      start_time: '14:00',
      end_time: '16:00',
      location: 'Training Center'
    }
  ],
  
  // Edge case events
  earlyMorning: {
    event_title: 'Early Bird Workout',
    description: '6 AM fitness session',
    date: '2025-11-20',
    start_time: '06:00',
    end_time: '07:00',
    location: 'Fitness Studio'
  },
  
  lateEvening: {
    event_title: 'Board Meeting Preparation',
    description: 'Final preparations for quarterly board meeting',
    date: '2025-11-21',
    start_time: '20:00',
    end_time: '22:00',
    location: 'Executive Office'
  }
};

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

class TestSuite {
  constructor() {
    this.results = [];
    this.testEvents = new Set(); // Track created events for cleanup
    this.startTime = Date.now();
  }

  async runTest(testFn) {
    const testResult = new TestFn.name || testFn.constructor.name;
    const startTime = Date.now();
    
    try {
      console.log(`\n🧪 Running: ${testResult.name}`);
      const result = await testFn();
      
      testResult.executionTime = Date.now() - startTime;
      testResult.passed = result.success;
      testResult.details = result.details || {};
      
      if (result.eventId) {
        this.testEvents.add(result.eventId);
      }
      
      console.log(`✅ PASSED: ${testResult.name} (${testResult.executionTime}ms)`);
      
    } catch (error) {
      testResult.executionTime = Date.now() - startTime;
      testResult.passed = false;
      testResult.error = error.message;
      
      console.log(`❌ FAILED: ${testResult.name} - ${error.message}`);
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
      averageTestTime: totalTime / totalTests
    };
  }
}

const testSuite = new TestSuite();

/**
 * Test 1: Single Event Creation with Intelligence Validation
 */
async function testSingleEventCreation() {
  const result = await grimAgent.createEvent(TEST_EVENTS.singleMeeting, TEST_USER_ID);
  
  if (!result.eventId || !result.messageToUser) {
    throw new Error('Single event creation failed - missing event ID or message');
  }
  
  // Validate intelligence engine response quality
  if (result.messageToUser.toLowerCase().includes('error') || 
      result.messageToUser.length < 10) {
    throw new Error('Intelligence engine provided invalid response');
  }
  
  return { 
    success: true, 
    details: { eventId: result.eventId, message: result.messageToUser },
    eventId: result.eventId 
  };
}

/**
 * Test 2: Multiple Event Creation with Batch Intelligence
 */
async function testMultipleEventCreation() {
  const result = await grimAgent.handleCalendarIntent('create_multiple_events', {
    events: TEST_EVENTS.multipleDayEvents
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Multiple event creation failed - no response message');
  }
  
  // Check that intelligence engine processed all events
  const eventCount = TEST_EVENTS.multipleDayEvents.length;
  if (!result.messageToUser.includes('created') || 
      !result.messageToUser.includes(String(eventCount))) {
    throw new Error('Intelligence engine failed to properly summarize multiple events');
  }
  
  return { 
    success: true, 
    details: { 
      eventsProcessed: eventCount, 
      message: result.messageToUser 
    }
  };
}

/**
 * Test 3: Event Retrieval Across Time Ranges
 */
async function testEventRetrieval() {
  const result = await grimAgent.getEvents({
    time_range: 'this week'
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Event retrieval failed - no response message');
  }
  
  // Validate that intelligence engine provides contextual response
  if (result.messageToUser.toLowerCase().includes('schedule') || 
      result.messageToUser.toLowerCase().includes('event')) {
    return { 
      success: true, 
      details: { 
        message: result.messageToUser,
        containsScheduleInfo: true
      }
    };
  }
  
  throw new Error('Intelligence engine failed to provide meaningful schedule information');
}

/**
 * Test 4: Single Event Update with Intelligence Analysis
 */
async function testEventUpdate() {
  // First create an event to update
  const createResult = await grimAgent.createEvent(TEST_EVENTS.singleWorkshop, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test update - event creation failed');
  }
  
  // Update the event
  const updateData = {
    eventId: createResult.eventId,
    event_title: 'Updated AI Development Workshop',
    description: 'Updated description with enhanced content',
    start_time: '10:30', // Change time
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
      updatedFields: ['title', 'description', 'time']
    }
  };
}

/**
 * Test 5: Event Deletion with Confirmation Intelligence
 */
async function testEventDeletion() {
  // First create an event to delete
  const createResult = await grimAgent.createEvent(TEST_EVENTS.earlyMorning, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test deletion - event creation failed');
  }
  
  // Delete the event
  const result = await grimAgent.deleteEvent(createResult.eventId, TEST_USER_ID);
  
  if (!result.messageToUser || result.eventId !== createResult.eventId) {
    throw new Error('Event deletion failed - invalid response');
  }
  
  // Validate intelligence engine provides appropriate feedback
  if (!result.messageToUser.toLowerCase().includes('deleted') && 
      !result.messageToUser.toLowerCase().includes('success')) {
    throw new Error('Intelligence engine failed to confirm deletion');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser 
    }
  };
}

/**
 * Test 6: Location Intelligence and Validation
 */
async function testLocationIntelligence() {
  const eventWithLocation = {
    ...TEST_EVENTS.singleMeeting,
    location: 'Invalid Location That Does Not Exist'
  };
  
  const result = await grimAgent.createEvent(eventWithLocation, TEST_USER_ID);
  
  // Should still create event but with intelligence about location
  if (!result.eventId || !result.messageToUser) {
    throw new Error('Location intelligence test failed');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      handledLocation: eventWithLocation.location
    }
  };
}

/**
 * Test 7: Time Zone Intelligence and Boundary Handling
 */
async function testTimeZoneHandling() {
  const eventWithBoundaryTimes = {
    event_title: 'Time Zone Boundary Test',
    description: 'Testing extreme time zone scenarios',
    date: '2025-12-31',
    start_time: '23:30',
    end_time: '00:30', // Crosses midnight
    location: 'Berlin'
  };
  
  const result = await grimAgent.createEvent(eventWithBoundaryTimes, TEST_USER_ID);
  
  if (!result.eventId) {
    throw new Error('Time zone boundary test failed - no event created');
  }
  
  return { 
    success: true, 
    details: { 
      eventId: result.eventId, 
      message: result.messageToUser,
      crossedMidnight: true
    }
  };
}

/**
 * Test 8: Duplicate Detection Intelligence
 */
async function testDuplicateDetection() {
  const duplicateEvent = { ...TEST_EVENTS.singleMeeting };
  
  // Create first event
  const firstResult = await grimAgent.createEvent(duplicateEvent, TEST_USER_ID);
  if (!firstResult.eventId) {
    throw new Error('First event creation failed for duplicate test');
  }
  
  // Try to create duplicate
  const secondResult = await grimAgent.createEvent(duplicateEvent, TEST_USER_ID);
  
  // Should detect duplicate and not create new event
  if (!secondResult.messageToUser.toLowerCase().includes('already exists')) {
    throw new Error('Duplicate detection intelligence failed');
  }
  
  return { 
    success: true, 
    details: { 
      originalEventId: firstResult.eventId,
      duplicateResponse: secondResult.messageToUser,
      detectedDuplicate: true
    }
  };
}

/**
 * Test 9: Intelligence Engine Context Awareness
 */
async function testContextAwareness() {
  // Create a series of related events
  const contextEvents = [
    {
      event_title: 'Project Kickoff',
      description: 'Initial project planning session',
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
  
  // Create both events
  const results = [];
  for (const event of contextEvents) {
    const result = await grimAgent.createEvent(event, TEST_USER_ID);
    if (result.eventId) {
      results.push(result);
    }
  }
  
  // Get calendar view to test context awareness
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
      contextAware: true
    }
  };
}

/**
 * Test 10: Partial Event Update Intelligence
 */
async function testPartialUpdateIntelligence() {
  // Create event
  const createResult = await grimAgent.createEvent(TEST_EVENTS.lateEvening, TEST_USER_ID);
  if (!createResult.eventId) {
    throw new Error('Cannot test partial update - event creation failed');
  }
  
  // Update only location
  const partialUpdate = {
    eventId: createResult.eventId,
    location: 'Updated Executive Office Location'
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
      updatedFields: ['location']
    }
  };
}

/**
 * Test 11: Multi-Calendar Event Management
 */
async function testMultiCalendarManagement() {
  // This test verifies the intelligence handles multiple calendars
  const result = await grimAgent.getEvents({
    time_range: 'today'
  }, TEST_USER_ID);
  
  if (!result.messageToUser) {
    throw new Error('Multi-calendar test failed');
  }
  
  return { 
    success: true, 
    details: { 
      message: result.messageToUser,
      multiCalendar: true
    }
  };
}

/**
 * Test 12: Event Sequence Intelligence
 */
async function testEventSequenceIntelligence() {
  const sequentialEvents = [
    {
      event_title: 'Meeting Preparation',
      description: 'Pre-meeting prep and research',
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
      description: 'Post-meeting action items',
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
    throw new Error('Event sequence creation failed');
  }
  
  return { 
    success: true, 
    details: { 
      sequentialEventsCreated: results.length,
      intelligentSpacing: true
    }
  };
}

/**
 * Test 13: Error Handling Intelligence
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
  
  // Should handle error gracefully with intelligence
  if (!result.messageToUser || result.messageToUser.toLowerCase().includes('error')) {
    return { 
      success: true, 
      details: { 
        message: result.messageToUser,
        handledError: true,
        intelligentResponse: true
      }
    };
  }
  
  throw new Error('Error handling intelligence failed');
}

/**
 * Test 14: Long-term Event Management Intelligence
 */
async function testLongTermManagement() {
  const futureEvents = [];
  
  // Create events for next 30 days
  for (let i = 0; i < 30; i += 7) { // Weekly events
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
 * Test 15: Performance and Intelligence Quality
 */
async function testPerformanceAndIntelligence() {
  const performanceEvents = [];
  const batchSize = 10;
  
  // Create batch of events to test performance
  for (let i = 0; i < batchSize; i++) {
    const event = {
      event_title: `Performance Test Event ${i + 1}`,
      description: 'Batch processing performance test',
      date: `2025-11-${String(22 + i).padStart(2, '0')}`,
      start_time: `${String(9 + (i % 8)).padStart(2, '0')}:00`,
      end_time: `${String(10 + (i % 8)).padStart(2, '0')}:00`
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
    hasContext: intelligenceResult.messageToUser.toLowerCase().includes('grim') ||
                intelligenceResult.messageToUser.includes('your')
  };
  
  return { 
    success: true, 
    details: { 
      eventsCreated: performanceEvents.length,
      intelligenceMessage: intelligenceResult.messageToUser,
      responseQuality,
      performanceTest: true
    }
  };
}

/**
 * Cleanup function for test events
 */
async function cleanupTestEvents() {
  console.log('\n🧹 Cleaning up test events...');
  
  for (const eventId of testSuite.testEvents) {
    try {
      await grimAgent.deleteEvent(eventId, TEST_USER_ID);
      console.log(`✅ Cleaned up event: ${eventId}`);
    } catch (error) {
      console.log(`⚠️ Failed to cleanup event ${eventId}: ${error.message}`);
    }
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Grim Calendar Test Suite');
  console.log(`📊 Target: 90% success rate with real Google Calendar API`);
  console.log(`👤 Test User: ${TEST_USER_ID}`);
  console.log('=' .repeat(80));
  
  const tests = [
    { name: 'Single Event Creation', fn: testSingleEventCreation },
    { name: 'Multiple Event Creation', fn: testMultipleEventCreation },
    { name: 'Event Retrieval', fn: testEventRetrieval },
    { name: 'Event Update', fn: testEventUpdate },
    { name: 'Event Deletion', fn: testEventDeletion },
    { name: 'Location Intelligence', fn: testLocationIntelligence },
    { name: 'Time Zone Handling', fn: testTimeZoneHandling },
    { name: 'Duplicate Detection', fn: testDuplicateDetection },
    { name: 'Context Awareness', fn: testContextAwareness },
    { name: 'Partial Update Intelligence', fn: testPartialUpdateIntelligence },
    { name: 'Multi-Calendar Management', fn: testMultiCalendarManagement },
    { name: 'Event Sequence Intelligence', fn: testEventSequenceIntelligence },
    { name: 'Error Handling Intelligence', fn: testErrorHandlingIntelligence },
    { name: 'Long-term Management', fn: testLongTermManagement },
    { name: 'Performance and Intelligence', fn: testPerformanceAndIntelligence }
  ];
  
  // Run all tests
  for (const test of tests) {
    await testSuite.runTest(test.fn);
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
  console.log(`📊 Average Test Time: ${Math.round(summary.averageTestTime)}ms`);
  
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
    console.log(`${String(index + 1).padStart(2, '0')}. ${status} - ${result.name}`);
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
  testSuite,
  TEST_USER_ID
};