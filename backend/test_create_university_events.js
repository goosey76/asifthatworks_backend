// Test to create the university study events directly through Grim agent

const GrimAgent = require('./src/services/agents/grim-agent');
const EventOperations = require('./src/services/agents/grim-agent/calendar/event-operations');

async function createUniversityEvents() {
  console.log('=== CREATING UNIVERSITY STUDY EVENTS ===');
  
  try {
    // The parsed events from our successful test
    const events = [
      {
        "event_title": "🎓 Programming Study Session 1",
        "date": "2025-11-16",
        "start_time": "15:30",
        "end_time": "18:00",
        "description": "Initial programming session for university",
        "location": "",
        "location_search_query": "",
        "recurrence": ""
      },
      {
        "event_title": "☕ Break Time",
        "date": "2025-11-16",
        "start_time": "18:00",
        "end_time": "18:05",
        "description": "5-minute break after first study session",
        "location": "",
        "location_search_query": "",
        "recurrence": ""
      },
      {
        "event_title": "🎓 Programming Study Session 2",
        "date": "2025-11-16",
        "start_time": "18:05",
        "end_time": "18:50",
        "description": "Continued programming study for university",
        "location": "",
        "location_search_query": "",
        "recurrence": ""
      }
    ];
    
    console.log('Attempting to create events:', events.length);
    
    // Initialize Grim agent
    const grim = new GrimAgent();
    
    // Test if we can initialize the event operations
    console.log('Initializing Grim agent...');
    const calendarManager = grim.calendarManager;
    
    if (!calendarManager) {
      console.error('❌ Calendar manager not initialized');
      return;
    }
    
    console.log('✅ Calendar manager initialized');
    
    // Try to create events using the multiple event creator
    console.log('Testing event creation...');
    
    // Simulate the message that would come from the user
    const originalMessage = 'create an event -3:30 - 6:00 - grinding programming for uni - and break of 5 minutes afterwards, as a puffer - 6:05-6:50 - let\'s grind even more for uni';
    const extractedDetails = {
      multiple_events: true,
      events: events
    };
    
    // Use the multiple event creator if available
    const multipleEventCreator = calendarManager.multipleEventCreator;
    
    if (multipleEventCreator && multipleEventCreator.createMultipleEvents) {
      console.log('Using multiple event creator...');
      const result = await multipleEventCreator.createMultipleEvents(events, extractedDetails, originalMessage);
      console.log('✅ Events created successfully!');
      console.log('Result:', result);
    } else {
      console.log('❌ Multiple event creator not available');
      console.log('Available methods:', Object.getOwnPropertyNames(calendarManager));
    }
    
  } catch (error) {
    console.error('❌ Error creating events:', error);
    console.error('Stack:', error.stack);
  }
}

// Test direct calendar operations
async function testDirectCalendarCreation() {
  console.log('\n=== TESTING DIRECT CALENDAR CREATION ===');
  
  try {
    const EventCRUD = require('./src/services/agents/grim-agent/calendar/event-operations/event-crud');
    const eventCRUD = new EventCRUD();
    
    const eventData = {
      event_title: "🎓 Programming Study Session 1",
      date: "2025-11-16",
      start_time: "15:30",
      end_time: "18:00",
      description: "Initial programming session for university"
    };
    
    console.log('Testing direct event creation...');
    console.log('Event data:', eventData);
    
    if (eventCRUD.createEvent) {
      const result = await eventCRUD.createEvent(eventData);
      console.log('✅ Direct event creation result:', result);
    } else {
      console.log('❌ createEvent method not available');
      console.log('Available methods:', Object.getOwnPropertyNames(eventCRUD));
    }
    
  } catch (error) {
    console.error('❌ Error in direct calendar test:', error);
  }
}

createUniversityEvents()
  .then(() => testDirectCalendarCreation())
  .catch(console.error);