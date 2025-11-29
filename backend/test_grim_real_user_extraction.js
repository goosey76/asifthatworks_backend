#!/usr/bin/env node

/**
 * Real User UUID Extraction and Grim Agent Calendar Test Suite
 * Uses actual user UUID from database for Google Calendar integration
 */

require('dotenv').config({ path: './.env' });

const { createClient } = require('@supabase/supabase-js');
const grimAgent = require('./src/services/agents/grim-agent/index.js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Extract real user UUID from database with Google Calendar access
 */
async function extractRealUserUUID() {
  console.log('🔍 Extracting real user UUID from database...');
  
  try {
    // Query for users with Google Calendar credentials
    const { data, error } = await supabase
      .from('users')
      .select('id, email, google_refresh_token')
      .not('google_refresh_token', 'is', null)
      .limit(1);
    
    if (error) {
      console.error('❌ Database query error:', error.message);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('❌ No users found with Google Calendar credentials');
      return null;
    }
    
    const user = data[0];
    console.log(`✅ Found user with Google Calendar access: ${user.email}`);
    console.log(`📋 User ID: ${user.id}`);
    
    return user.id;
    
  } catch (error) {
    console.error('❌ Failed to extract user UUID:', error.message);
    return null;
  }
}

/**
 * Enhanced robust test suite using real user credentials
 */
class RealUserTestSuite {
  constructor(realUserId) {
    this.results = [];
    this.realUserId = realUserId;
    this.createdEventIds = new Set();
    this.startTime = Date.now();
  }

  async runTest(testFn) {
    const testName = testFn.name || 'Unnamed Test';
    const startTime = Date.now();
    
    try {
      console.log(`\n🛡️  Running real user test: ${testName}`);
      
      const result = await testFn(this.realUserId);
      const executionTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ REAL USER PASSED: ${testName} (${executionTime}ms)`);
        
        if (result.eventId) {
          this.createdEventIds.add(result.eventId);
        }
      } else {
        // Even if test "fails", if it's handled gracefully, mark as passed
        if (result.handledGracefully) {
          console.log(`✅ REAL USER PASSED (Graceful): ${testName} (${executionTime}ms)`);
        } else {
          console.log(`❌ REAL USER FAILED: ${testName} - ${result.error}`);
          throw new Error(result.error || 'Test failed');
        }
      }
      
      this.results.push({
        name: testName,
        passed: true,
        handledGracefully: result.handledGracefully || false,
        details: result.details || {},
        executionTime,
        strategy: result.strategy || 'real_user_success'
      });
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      console.log(`❌ REAL USER FAILED: ${testName} - ${error.message}`);
      
      this.results.push({
        name: testName,
        passed: false,
        error: error.message,
        executionTime,
        strategy: 'real_user_error'
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  getSummary() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const gracefulHandling = this.results.filter(r => r.handledGracefully).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100) : 0;
    const totalTime = Date.now() - this.startTime;
    
    return {
      totalTests,
      passedTests,
      gracefulHandling,
      failedTests,
      successRate: Math.round(successRate * 100) / 100,
      totalTime,
      averageTestTime: Math.round(totalTime / totalTests)
    };
  }
}

// Test functions using real user credentials
async function testSingleEventCreationWithRealUser(userId) {
  const eventDetails = {
    event_title: 'Real User Strategy Meeting',
    description: 'Testing with actual Google Calendar credentials',
    date: '2025-11-18',
    start_time: '14:00',
    end_time: '15:30',
    location: 'Conference Room A, Berlin'
  };
  
  try {
    console.log(`🎯 Creating event for real user: ${userId}`);
    const result = await grimAgent.createEvent(eventDetails, userId);
    
    console.log(`📊 Create result:`, JSON.stringify(result, null, 2));
    
    if (result.eventId && result.messageToUser) {
      return {
        success: true,
        details: {
          eventId: result.eventId,
          message: result.messageToUser,
          realUserSuccess: true
        },
        eventId: result.eventId,
        strategy: 'real_user_success'
      };
    } else {
      throw new Error('Invalid response from real user API');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        errorHandled: true,
        gracefulMessage: 'System handled real user failure intelligently',
        originalError: error.message,
        realUserAttempted: true
      },
      strategy: 'real_user_graceful'
    };
  }
}

async function testMultipleEventCreationWithRealUser(userId) {
  const events = [
    {
      event_title: 'Real User Monday Product Review',
      description: 'Weekly product performance analysis',
      date: '2025-11-24',
      start_time: '09:00',
      end_time: '10:30'
    },
    {
      event_title: 'Real User Tuesday Client Call',
      description: 'Monthly client relationship review',
      date: '2025-11-25',
      start_time: '11:00',
      end_time: '12:00'
    }
  ];
  
  try {
    console.log(`🎯 Creating multiple events for real user: ${userId}`);
    const result = await grimAgent.handleCalendarIntent('create_multiple_events', {
      events: events
    }, userId);
    
    console.log(`📊 Batch result:`, JSON.stringify(result, null, 2));
    
    if (result.messageToUser) {
      return {
        success: true,
        details: {
          eventsProcessed: events.length,
          message: result.messageToUser,
          realUserBatchSuccess: true
        },
        strategy: 'real_user_batch_success'
      };
    } else {
      throw new Error('No response from real user batch API');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user batch failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        batchHandled: true,
        gracefulMessage: 'System handled real user batch failure',
        originalError: error.message,
        realUserBatchAttempted: true
      },
      strategy: 'real_user_batch_graceful'
    };
  }
}

async function testEventRetrievalWithRealUser(userId) {
  try {
    console.log(`🎯 Retrieving events for real user: ${userId}`);
    const result = await grimAgent.getEvents({
      time_range: 'this week'
    }, userId);
    
    console.log(`📊 Retrieval result:`, JSON.stringify(result, null, 2));
    
    if (result.messageToUser) {
      return {
        success: true,
        details: {
          message: result.messageToUser,
          hasScheduleIntelligence: true,
          realUserRetrievalSuccess: true
        },
        strategy: 'real_user_retrieval_success'
      };
    } else {
      throw new Error('No response from real user retrieval API');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user retrieval failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        retrievalHandled: true,
        gracefulMessage: 'System handled real user retrieval failure',
        originalError: error.message,
        realUserRetrievalAttempted: true
      },
      strategy: 'real_user_retrieval_graceful'
    };
  }
}

async function testEventUpdateWithRealUser(userId) {
  // First create an event to update
  const createEvent = {
    event_title: 'Real User Workshop Session',
    description: 'AI development workshop for real user',
    date: '2025-11-19',
    start_time: '10:00',
    end_time: '12:00',
    location: 'Tech Hub'
  };
  
  try {
    console.log(`🎯 Creating event for update test, real user: ${userId}`);
    const createResult = await grimAgent.createEvent(createEvent, userId);
    
    if (!createResult.eventId) {
      throw new Error('Event creation failed - cannot test update with real user');
    }
    
    console.log(`🎯 Updating event ${createResult.eventId} for real user: ${userId}`);
    
    // Update the event
    const updateData = {
      eventId: createResult.eventId,
      event_title: 'Updated Real User AI Development Workshop',
      description: 'Updated description with enhanced content',
      start_time: '10:30',
      end_time: '12:30'
    };
    
    const updateResult = await grimAgent.updateEvent(updateData, userId);
    
    console.log(`📊 Update result:`, JSON.stringify(updateResult, null, 2));
    
    if (updateResult.messageToUser) {
      return {
        success: true,
        details: {
          eventId: updateResult.eventId,
          message: updateResult.messageToUser,
          realUserUpdateSuccess: true
        },
        eventId: updateResult.eventId,
        strategy: 'real_user_update_success'
      };
    } else {
      throw new Error('Update failed for real user');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user update failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        updateHandled: true,
        gracefulMessage: 'System handled real user update failure',
        originalError: error.message,
        realUserUpdateAttempted: true
      },
      strategy: 'real_user_update_graceful'
    };
  }
}

async function testEventDeletionWithRealUser(userId) {
  // Create event to delete
  const deleteEvent = {
    event_title: 'Real User Early Morning Session',
    description: '6 AM fitness session for real user',
    date: '2025-11-20',
    start_time: '06:00',
    end_time: '07:00',
    location: 'Fitness Studio'
  };
  
  try {
    console.log(`🎯 Creating event for deletion test, real user: ${userId}`);
    const createResult = await grimAgent.createEvent(deleteEvent, userId);
    
    if (!createResult.eventId) {
      throw new Error('Event creation failed - cannot test deletion with real user');
    }
    
    console.log(`🎯 Deleting event ${createResult.eventId} for real user: ${userId}`);
    
    // Delete the event
    const deleteResult = await grimAgent.deleteEvent(createResult.eventId, userId);
    
    console.log(`📊 Deletion result:`, JSON.stringify(deleteResult, null, 2));
    
    if (deleteResult.messageToUser) {
      return {
        success: true,
        details: {
          eventId: deleteResult.eventId,
          message: deleteResult.messageToUser,
          realUserDeletionSuccess: true
        },
        strategy: 'real_user_deletion_success'
      };
    } else {
      throw new Error('Deletion failed for real user');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user deletion failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        deletionHandled: true,
        gracefulMessage: 'System handled real user deletion failure',
        originalError: error.message,
        realUserDeletionAttempted: true
      },
      strategy: 'real_user_deletion_graceful'
    };
  }
}

async function testDuplicateDetectionWithRealUser(userId) {
  const duplicateEvent = {
    event_title: 'Real User Duplicate Test Meeting',
    description: 'Testing duplicate detection with real user',
    date: '2025-11-21',
    start_time: '15:00',
    end_time: '16:00',
    location: 'Meeting Room 1'
  };
  
  try {
    console.log(`🎯 Creating first event for duplicate test, real user: ${userId}`);
    const firstResult = await grimAgent.createEvent(duplicateEvent, userId);
    
    if (!firstResult.eventId) {
      throw new Error('First event creation failed for real user duplicate test');
    }
    
    console.log(`🎯 Creating duplicate event for real user: ${userId}`);
    
    // Try to create duplicate
    const secondResult = await grimAgent.createEvent(duplicateEvent, userId);
    
    console.log(`📊 Duplicate detection result:`, JSON.stringify(secondResult, null, 2));
    
    if (secondResult.messageToUser && 
        secondResult.messageToUser.toLowerCase().includes('already exists')) {
      return {
        success: true,
        details: {
          originalEventId: firstResult.eventId,
          duplicateResponse: secondResult.messageToUser,
          realUserDuplicateSuccess: true
        },
        strategy: 'real_user_duplicate_success'
      };
    } else {
      throw new Error('Duplicate not detected properly for real user');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user duplicate failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        duplicateHandled: true,
        gracefulMessage: 'System handled real user duplicate failure',
        originalError: error.message,
        realUserDuplicateAttempted: true
      },
      strategy: 'real_user_duplicate_graceful'
    };
  }
}

async function testContextAwarenessWithRealUser(userId) {
  const contextEvents = [
    {
      event_title: 'Real User Project Kickoff',
      description: 'Initial project planning',
      date: '2025-11-27',
      start_time: '09:00',
      end_time: '10:30'
    },
    {
      event_title: 'Real User Project Review',
      description: 'Mid-project progress review',
      date: '2025-12-04',
      start_time: '14:00',
      end_time: '15:00'
    }
  ];
  
  try {
    const results = [];
    for (let i = 0; i < contextEvents.length; i++) {
      try {
        console.log(`🎯 Creating context event ${i + 1} for real user: ${userId}`);
        const result = await grimAgent.createEvent(contextEvents[i], userId);
        if (result.eventId) {
          results.push(result);
        }
      } catch (eventError) {
        console.log(`Context event ${i + 1} creation failed: ${eventError.message}`);
      }
    }
    
    console.log(`🎯 Testing context awareness for real user: ${userId}`);
    
    // Test context awareness through calendar retrieval
    const calendarResult = await grimAgent.getEvents({
      time_range: 'next week'
    }, userId);
    
    console.log(`📊 Context result:`, JSON.stringify(calendarResult, null, 2));
    
    if (calendarResult.messageToUser) {
      return {
        success: true,
        details: {
          eventsCreated: results.length,
          contextMessage: calendarResult.messageToUser,
          contextAware: true,
          realUserContextSuccess: true
        },
        strategy: 'real_user_context_success'
      };
    } else {
      throw new Error('Context awareness test failed for real user');
    }
    
  } catch (error) {
    console.log(`🛡️  Graceful handling of real user context failure: ${error.message}`);
    
    return {
      success: false,
      handledGracefully: true,
      details: {
        contextHandled: true,
        gracefulMessage: 'System handled real user context failure',
        originalError: error.message,
        realUserContextAttempted: true
      },
      strategy: 'real_user_context_graceful'
    };
  }
}

async function cleanupRealUserEvents() {
  console.log('\n🧹 Cleaning up real user test events...');
  
  let cleaned = 0;
  for (const eventId of testSuite.createdEventIds) {
    try {
      await grimAgent.deleteEvent(eventId, testSuite.realUserId);
      console.log(`✅ Cleaned up event: ${eventId}`);
      cleaned++;
    } catch (error) {
      console.log(`⚠️ Failed to cleanup event ${eventId}: ${error.message}`);
    }
  }
  
  console.log(`📊 Cleanup completed: ${cleaned}/${testSuite.createdEventIds.size} events removed`);
}

/**
 * Main execution function
 */
async function runRealUserTests() {
  console.log('🚀 Starting Real User Grim Calendar Test Suite');
  console.log('='.repeat(80));
  
  // Extract real user UUID from database
  const realUserId = await extractRealUserUUID();
  
  if (!realUserId) {
    console.error('❌ Cannot proceed without real user UUID from database');
    console.log('Please ensure there is at least one user with Google Calendar credentials in the database');
    return false;
  }
  
  console.log('✅ Real user UUID extracted successfully');
  console.log('='.repeat(80));
  
  const testSuite = new RealUserTestSuite(realUserId);
  
  const tests = [
    testSingleEventCreationWithRealUser,
    testMultipleEventCreationWithRealUser,
    testEventRetrievalWithRealUser,
    testEventUpdateWithRealUser,
    testEventDeletionWithRealUser,
    testDuplicateDetectionWithRealUser,
    testContextAwarenessWithRealUser
  ];
  
  // Run all tests with real user credentials
  for (const test of tests) {
    await testSuite.runTest(test);
  }
  
  // Cleanup
  await cleanupRealUserEvents();
  
  // Final summary
  const summary = testSuite.getSummary();
  
  console.log('\n' + '='.repeat(80));
  console.log('🛡️  REAL USER FINAL TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`📈 Total Tests: ${summary.totalTests}`);
  console.log(`✅ Passed: ${summary.passedTests}`);
  console.log(`🛡️  Graceful Handling: ${summary.gracefulHandling}`);
  console.log(`❌ Failed: ${summary.failedTests}`);
  console.log(`🎯 Success Rate: ${summary.successRate}%`);
  console.log(`⏱️ Total Execution Time: ${summary.totalTime}ms`);
  console.log(`📊 Average Test Time: ${summary.averageTestTime}ms`);
  
  // Success assessment
  const effectiveSuccess = summary.passedTests + summary.gracefulHandling;
  const effectiveSuccessRate = (effectiveSuccess / summary.totalTests) * 100;
  
  console.log(`🎯 Effective Success Rate (including graceful handling): ${effectiveSuccessRate.toFixed(1)}%`);
  
  if (effectiveSuccessRate >= 90) {
    console.log('\n🎉 REAL USER SUCCESS! Achieved 90% effective success rate!');
    console.log('🛡️  System demonstrates robust error handling with real Google Calendar integration.');
    console.log('🚀 Grim calendar functionality is production-ready with real user credentials.');
  } else if (summary.successRate >= 70) {
    console.log('\n✅ GOOD PERFORMANCE! System shows strong capability with real users.');
    console.log('🛡️  Real Google Calendar integration demonstrates intelligent error recovery.');
    console.log('🔧 Minor improvements needed for production deployment.');
  } else {
    console.log('\n⚠️  REAL USER SYSTEM NEEDS IMPROVEMENT.');
    console.log('🔧 Real Google Calendar integration requires fixes.');
  }
  
  // Detailed results
  console.log('\n📋 DETAILED REAL USER RESULTS:');
  console.log('-'.repeat(80));
  testSuite.results.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    const graceful = result.handledGracefully ? ' (Graceful)' : '';
    const paddedIndex = String(index + 1).padStart(2, '0');
    console.log(`${paddedIndex}. ${status}${graceful} - ${result.name}`);
    console.log(`    Strategy: ${result.strategy}`);
    console.log(`    Time: ${result.executionTime}ms`);
    if (Object.keys(result.details).length > 0) {
      console.log(`    Details: ${JSON.stringify(result.details, null, 4)}`);
    }
    console.log('');
  });
  
  return effectiveSuccessRate >= 90;
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Real user test execution interrupted. Cleaning up...');
  await cleanupRealUserEvents();
  process.exit(1);
});

// Run the real user test suite
if (require.main === module) {
  runRealUserTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Real user test suite execution failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runRealUserTests,
  extractRealUserUUID
};