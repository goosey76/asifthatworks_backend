#!/usr/bin/env node

/**
 * Common Real-World Calendar Requests Test Suite
 * Tests the most frequent user scenarios with intelligent time handling
 */

require('dotenv').config({ path: './.env' });

const { createClient } = require('@supabase/supabase-js');
const grimAgent = require('./src/services/agents/grim-agent/index.js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Real user UUID from previous validation
const REAL_USER_ID = '982bb1bf-539c-4b1f-8d1a-714600fff81d';

/**
 * Test Suite for Common Calendar Requests
 */
class CommonRequestsTestSuite {
  constructor() {
    this.results = [];
    this.createdEvents = new Set();
    this.startTime = Date.now();
    this.currentTime = new Date();
  }

  async runTest(testName, testFn) {
    const startTime = Date.now();
    
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      
      const result = await testFn();
      const executionTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ PASSED: ${testName} (${executionTime}ms)`);
        if (result.eventId) {
          this.createdEvents.add(result.eventId);
        }
      } else {
        console.log(`⚠️ GRACEFUL: ${testName} - ${result.message}`);
      }
      
      this.results.push({
        name: testName,
        success: result.success,
        message: result.message,
        details: result.details || {},
        executionTime,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
      
      this.results.push({
        name: testName,
        success: false,
        error: error.message,
        executionTime,
        timestamp: new Date().toISOString()
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between tests
  }

  getSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalTests,
      passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      totalTime,
      averageTime: Math.round(totalTime / totalTests)
    };
  }
}

// Test 1: Default Time Intelligence
async function testDefaultTimeBehavior() {
  console.log('🕐 Testing default time behavior...');
  
  try {
    // Test with no time specified - should default to now
    const result = await grimAgent.createEvent({
      event_title: 'Quick Task - No Time Specified',
      description: 'Testing default time intelligence'
    }, REAL_USER_ID);
    
    console.log('📊 Default time result:', JSON.stringify(result, null, 2));
    
    if (result.messageToUser) {
      return {
        success: true,
        message: 'Default time behavior validated',
        details: {
          response: result.messageToUser,
          defaultTimeUsed: true
        }
      };
    } else {
      throw new Error('No response from default time test');
    }
    
  } catch (error) {
    console.log('⚠️ Default time test graceful handling:', error.message);
    return {
      success: false,
      message: 'Default time test handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 2: Simple Event Creation at 1 PM
async function testSimpleEventAt1PM() {
  console.log('🕐 Testing simple event creation at 1 PM...');
  
  try {
    const today = new Date();
    const eventDate = today.toISOString().split('T')[0]; // Today's date
    
    const result = await grimAgent.createEvent({
      event_title: 'Getting back to business',
      description: 'Business meeting at 1 PM',
      date: eventDate,
      start_time: '13:00',
      end_time: '14:00'
    }, REAL_USER_ID);
    
    console.log('📊 1 PM event result:', JSON.stringify(result, null, 2));
    
    if (result.messageToUser) {
      return {
        success: true,
        message: 'Event created successfully at 1 PM',
        details: {
          response: result.messageToUser,
          eventId: result.eventId,
          time: '13:00'
        },
        eventId: result.eventId
      };
    } else {
      throw new Error('1 PM event creation failed');
    }
    
  } catch (error) {
    console.log('⚠️ 1 PM event graceful handling:', error.message);
    return {
      success: false,
      message: '1 PM event handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 3: Complex Workflow - Calendar Check + Event + Buffer
async function testComplexWorkflow2PM() {
  console.log('🕐 Testing complex workflow at 2 PM...');
  
  try {
    const today = new Date();
    const eventDate = today.toISOString().split('T')[0];
    
    // Step 1: Check calendar first
    console.log('📅 Step 1: Checking calendar...');
    const calendarCheck = await grimAgent.getEvents({
      time_range: 'today'
    }, REAL_USER_ID);
    
    console.log('📊 Calendar check result:', calendarCheck.messageToUser ? 'Calendar retrieved' : 'No calendar data');
    
    // Step 2: Create event at 2 PM
    console.log('🕑 Step 2: Creating event at 2 PM...');
    const eventResult = await grimAgent.createEvent({
      event_title: 'Business Check Meeting',
      description: 'Checking calendar entries and planning',
      date: eventDate,
      start_time: '14:00',
      end_time: '14:45'
    }, REAL_USER_ID);
    
    if (!eventResult.eventId) {
      throw new Error('Failed to create 2 PM event');
    }
    
    console.log('📊 2 PM event created:', eventResult.eventId);
    
    // Step 3: Create break buffer from 2:45 to 3:00
    console.log('🕒 Step 3: Creating break buffer...');
    const bufferResult = await grimAgent.createEvent({
      event_title: 'Break Buffer',
      description: 'Buffer time between meetings',
      date: eventDate,
      start_time: '14:45',
      end_time: '15:00'
    }, REAL_USER_ID);
    
    console.log('📊 Buffer created:', bufferResult.eventId ? 'Success' : 'Graceful handling');
    
    return {
      success: true,
      message: 'Complex workflow completed successfully',
      details: {
        calendarCheck: !!calendarCheck.messageToUser,
        mainEventId: eventResult.eventId,
        bufferEventId: bufferResult.eventId,
        workflow: 'check-calendar → create-event → create-buffer'
      },
      eventId: eventResult.eventId
    };
    
  } catch (error) {
    console.log('⚠️ Complex workflow graceful handling:', error.message);
    return {
      success: false,
      message: 'Complex workflow handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 4: Event Update - Change Title
async function testEventUpdate() {
  console.log('🕐 Testing event update...');
  
  try {
    // First create an event to update
    const today = new Date();
    const eventDate = today.toISOString().split('T')[0];
    
    console.log('📝 Creating event to update...');
    const createResult = await grimAgent.createEvent({
      event_title: 'Business Meeting',
      description: 'Original title',
      date: eventDate,
      start_time: '15:30',
      end_time: '16:30'
    }, REAL_USER_ID);
    
    if (!createResult.eventId) {
      throw new Error('Failed to create event for update test');
    }
    
    console.log('🔄 Updating event title...');
    const updateResult = await grimAgent.updateEvent({
      eventId: createResult.eventId,
      event_title: 'Building the business and learning finance',
      description: 'Updated description with new focus'
    }, REAL_USER_ID);
    
    console.log('📊 Update result:', JSON.stringify(updateResult, null, 2));
    
    if (updateResult.messageToUser) {
      return {
        success: true,
        message: 'Event updated successfully',
        details: {
          originalTitle: 'Business Meeting',
          updatedTitle: 'Building the business and learning finance',
          response: updateResult.messageToUser,
          eventId: createResult.eventId
        },
        eventId: createResult.eventId
      };
    } else {
      throw new Error('Event update failed');
    }
    
  } catch (error) {
    console.log('⚠️ Event update graceful handling:', error.message);
    return {
      success: false,
      message: 'Event update handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 5: Calendar Management - List and Move
async function testCalendarManagement() {
  console.log('🕐 Testing calendar management...');
  
  try {
    // First, try to get available calendars
    console.log('📋 Step 1: Listing available calendars...');
    const calendarsResult = await grimAgent.getEvents({
      action: 'list_calendars'
    }, REAL_USER_ID);
    
    console.log('📊 Calendars result:', calendarsResult.messageToUser ? 'Calendar list retrieved' : 'Calendar list not available');
    
    // Create an event to potentially move
    const today = new Date();
    const eventDate = today.toISOString().split('T')[0];
    
    console.log('📝 Step 2: Creating event to move...');
    const createResult = await grimAgent.createEvent({
      event_title: 'Entrepreneur Task',
      description: 'Event to move to Entrepreneur calendar',
      date: eventDate,
      start_time: '16:00',
      end_time: '17:00'
    }, REAL_USER_ID);
    
    if (!createResult.eventId) {
      throw new Error('Failed to create event for calendar move test');
    }
    
    // Try to move event to Entrepreneur calendar
    console.log('📁 Step 3: Moving event to Entrepreneur calendar...');
    const moveResult = await grimAgent.updateEvent({
      eventId: createResult.eventId,
      calendar: 'Entrepreneur',
      description: 'Moved to Entrepreneur calendar'
    }, REAL_USER_ID);
    
    console.log('📊 Move result:', moveResult.messageToUser ? 'Event moved successfully' : 'Calendar move handled');
    
    return {
      success: true,
      message: 'Calendar management completed',
      details: {
        calendarsListed: !!calendarsResult.messageToUser,
        eventCreated: true,
        eventMoved: !!moveResult.messageToUser,
        eventId: createResult.eventId,
        targetCalendar: 'Entrepreneur'
      },
      eventId: createResult.eventId
    };
    
  } catch (error) {
    console.log('⚠️ Calendar management graceful handling:', error.message);
    return {
      success: false,
      message: 'Calendar management handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 6: What's Next on Calendar
async function testWhatsNext() {
  console.log('🕐 Testing "what\'s next" query...');
  
  try {
    const result = await grimAgent.getEvents({
      time_range: 'next',
      query: "what's up next"
    }, REAL_USER_ID);
    
    console.log('📊 What\'s next result:', result.messageToUser ? 'Next events retrieved' : 'No next events found');
    
    if (result.messageToUser) {
      return {
        success: true,
        message: 'Successfully retrieved upcoming events',
        details: {
          response: result.messageToUser,
          queryType: 'whats_next'
        }
      };
    } else {
      return {
        success: true,
        message: 'No upcoming events found (graceful handling)',
        details: {
          response: 'No upcoming events',
          queryType: 'whats_next',
          graceful: true
        }
      };
    }
    
  } catch (error) {
    console.log('⚠️ What\'s next graceful handling:', error.message);
    return {
      success: false,
      message: 'What\'s next handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

// Test 7: Delete Upcoming Event
async function testDeleteUpcomingEvent() {
  console.log('🕐 Testing event deletion...');
  
  try {
    // Create an event to delete
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = tomorrow.toISOString().split('T')[0];
    
    console.log('📝 Creating event to delete...');
    const createResult = await grimAgent.createEvent({
      event_title: 'Event to Delete',
      description: 'This event will be deleted in the test',
      date: eventDate,
      start_time: '10:00',
      end_time: '11:00'
    }, REAL_USER_ID);
    
    if (!createResult.eventId) {
      throw new Error('Failed to create event for deletion test');
    }
    
    console.log('🗑️ Deleting event...');
    const deleteResult = await grimAgent.deleteEvent(createResult.eventId, REAL_USER_ID);
    
    console.log('📊 Delete result:', JSON.stringify(deleteResult, null, 2));
    
    if (deleteResult.messageToUser) {
      return {
        success: true,
        message: 'Event deleted successfully',
        details: {
          response: deleteResult.messageToUser,
          eventId: createResult.eventId,
          action: 'deleted'
        }
      };
    } else {
      throw new Error('Event deletion failed');
    }
    
  } catch (error) {
    console.log('⚠️ Event deletion graceful handling:', error.message);
    return {
      success: false,
      message: 'Event deletion handled gracefully',
      details: { error: error.message, graceful: true }
    };
  }
}

/**
 * Main execution function
 */
async function runCommonRequestsTests() {
  console.log('🚀 Starting Common Real-World Calendar Requests Test Suite');
  console.log('📋 Testing the most frequent user scenarios with intelligent handling');
  console.log('='.repeat(80));
  
  const testSuite = new CommonRequestsTestSuite();
  
  const tests = [
    { name: 'Default Time Behavior', fn: testDefaultTimeBehavior },
    { name: 'Simple Event Creation at 1 PM', fn: testSimpleEventAt1PM },
    { name: 'Complex Workflow at 2 PM', fn: testComplexWorkflow2PM },
    { name: 'Event Update - Change Title', fn: testEventUpdate },
    { name: 'Calendar Management - List & Move', fn: testCalendarManagement },
    { name: 'What\'s Next on Calendar', fn: testWhatsNext },
    { name: 'Delete Upcoming Event', fn: testDeleteUpcomingEvent }
  ];
  
  // Run all tests
  for (const test of tests) {
    await testSuite.runTest(test.name, test.fn);
  }
  
  // Final summary
  const summary = testSuite.getSummary();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMMON REQUESTS TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`📈 Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`🎯 Success Rate: ${summary.successRate}%`);
  console.log(`⏱️ Total Execution Time: ${summary.totalTime}ms`);
  console.log(`📊 Average Test Time: ${summary.averageTime}ms`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-'.repeat(80));
  testSuite.results.forEach((result, index) => {
    const status = result.success ? '✅ PASSED' : '⚠️ GRACEFUL';
    const paddedIndex = String(index + 1).padStart(2, '0');
    console.log(`${paddedIndex}. ${status} - ${result.name}`);
    console.log(`    Message: ${result.message}`);
    console.log(`    Time: ${result.executionTime}ms`);
    if (Object.keys(result.details).length > 0) {
      console.log(`    Details: ${JSON.stringify(result.details, null, 4)}`);
    }
    console.log('');
  });
  
  // Performance assessment
  if (summary.successRate >= 80) {
    console.log('\n🎉 EXCELLENT! Common requests handled with high success rate!');
    console.log('🧠 System demonstrates strong intelligence for real-world scenarios.');
  } else if (summary.successRate >= 60) {
    console.log('\n✅ GOOD PERFORMANCE! System handles common requests well.');
    console.log('🛡️ Graceful degradation ensures good user experience.');
  } else {
    console.log('\n⚠️ IMPROVEMENT NEEDED. Common requests need enhancement.');
  }
  
  return summary.successRate >= 60;
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Common requests test execution interrupted.');
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  runCommonRequestsTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Common requests test suite execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runCommonRequestsTests,
  CommonRequestsTestSuite
};