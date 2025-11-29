// Test script to debug the parsing issue and create the university study event

const GrimAgent = require('./src/services/agents/grim-agent');
const AgentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');

async function testUniversityEvent() {
  console.log('=== TESTING UNIVERSITY STUDY EVENT PARSING ===');
  
  try {
    const grim = new GrimAgent();
    const knowledge = new AgentKnowledgeCoordinator();
    
    const userMessage = 'create an event -3:30 - 6:00 - grinding programming for uni - and break of 5 minutes afterwards, as a puffer - 6:05-6:50 - let\'s grind even more for uni';
    
    console.log('User Message:', userMessage);
    console.log('Current Date:', '2025-11-16');
    console.log('Current Time:', '15:28');
    
    // Test the LLM extraction directly
    const extractionPrompt = `Current Date: 2025-11-16. Current Time: 15:28.
    
    CRITICAL EVENT TITLE ENHANCEMENT (use emoji and clear description):
    - Add relevant emoji to make events identifiable and actionable
    - Make titles descriptive and professional
    - Examples:
      * "working on the backend" → "💻 Backend Development"
      * "meeting with John" → "🤝 Meeting with John"
      * "doctor appointment" → "🏥 Doctor Appointment"
      * "lunch break" → "🍽️ Lunch Break"
      * "gym session" → "🏃 Gym Session"
      * "presentation at work" → "📊 Work Presentation"
      * "backend development" → "💻 Backend Development"
      * "finalize MVP" → "🚀 Finalize MVP"
    
    CRITICAL: Detect if the user is requesting to create MULTIPLE calendar events in one message.
    
    **🚀 DYNAMIC MULTIPLE EVENT DETECTION - NO LIMITS! 🚀**
    You can handle ANY number of events: 1, 2, 3, 5, 10, 20, 50+ events! There is NO maximum limit.
    
    **COMPLEX MULTIPLE EVENT PATTERNS** - Look for these patterns:
    - "create X events: [list]" - Extract ALL X events
    - "create an event TIME-RANGE - activity description - and break - another time range - more activities"
    - "meeting 3:30-6:00 - grinding programming for uni - and break of 5 minutes afterwards - 6:05-6:50 - let's grind more"
    - "activity from TIME to TIME - description - then break TIME TIME - description - then more TIME TIME - more description"
    - "schedule: event1 TIME-TIME, event2 TIME-TIME, event3 TIME-TIME, event4 TIME-TIME..." (extract ALL events)
    
    **SUCCESS CRITERIA**:
    - If user says "create 5 events" → Extract 5 events
    - If user says "create 10 events" → Extract 10 events
    - If user says "create 20 events" → Extract 20 events
    - If user lists events with commas/separators → Extract ALL listed events
    - If user describes sequential events → Extract ALL sequential events
    
    Examples of MULTIPLE events (return an array with ALL events):
    - "create 3 events: meeting at 10am, lunch at 12pm, gym at 5pm"
    - "create 10 events: work 9-12, lunch 12-1, meeting 2-3, gym 5-6, dinner 7-8, study 9-11, call mom, shopping, etc."
    - "add doctor appointment 2pm, dentist 4pm, grocery shopping 6pm, call grandma 8pm, cooking 9pm"
    - "schedule: morning workout 7-8, work 9-12, lunch 12-1, meeting 2-3, gym 5-6, dinner 7-8, study 9-11"
    - "work session 3:30-6:00 - coding - break 5 minutes - 6:05-7:00 - more coding"
    - "grinding programming for uni - 3:30-6:00 - and break of 5 minutes afterwards - 6:05-6:50 - let's grind even more for uni"
    - "create 15 events: wake up 7am, coffee 7:30, work 8-12, lunch 12-1, meeting 2-3, gym 4-5, dinner 6-7, etc."
    
    If MULTIPLE events are detected, respond with JSON array:
    {
      "multiple_events": true,
      "events": [
        {
          "event_title": "💻 Meeting",
          "date": "2025-11-13",
          "start_time": "14:00",
          "end_time": "15:00",
          "description": "",
          "location": "",
          "location_search_query": "",
          "recurrence": ""
        },
        {
          "event_title": "🏃 Gym Session",
          "date": "2025-11-13",
          "start_time": "18:00",
          "end_time": "19:00",
          "description": "",
          "location": "",
          "location_search_query": "",
          "recurrence": ""
        }
      ]
    }
    
    If SINGLE event (current behavior):
    {
      "multiple_events": false,
      "event_title": "",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "description": "",
      "location": "",
      "event_id": "",
      "location_search_query": "",
      "recurrence": "",
      "time_range": ""
    }
    
    IMPORTANT TIME RANGE DETECTION:
    - If user asks for "today" → set "time_range": "today"
    - If user asks for "tomorrow" → set "time_range": "tomorrow" and calculate tomorrow's date
    - If user asks for "this week" → set "time_range": "this week"
    - If user asks for "next 3 days" → set "time_range": "next 3 days"
    
    **ENHANCED MULTIPLE EVENT VALIDATION:**
    For multiple events, each event in the "events" array MUST have ALL required fields:
    - "event_title": "Descriptive title with emoji"
    - "date": "YYYY-MM-DD format (use current date if not specified)"
    - "start_time": "HH:MM format"
    - "end_time": "HH:MM format"
    - "description": "" (can be empty)
    - "location": "" (can be empty)
    
    **CRITICAL**: If ANY event in the multiple events array is missing required fields (title, date, start_time, or end_time), the entire request should fail gracefully with a clear message about which event has incomplete data.
    
    IMPORTANT: If no date is explicitly mentioned in the message, use the provided Current Date.
    If the message mentions "now", use the Current Time for start_time.
    If user asks for "tomorrow", calculate tomorrow's date from current date.
    
    Remember: Always enhance event titles with relevant emojis and clear descriptions!
    Message: "${userMessage}"`;

    const llmService = require('./src/services/llm-service');
    const extractedDetailsText = await llmService.generateContent("gpt-3.5-turbo", extractionPrompt);
    
    console.log('\n=== RAW LLM RESPONSE ===');
    console.log(extractedDetailsText);
    
    try {
      const extractedDetails = JSON.parse(extractedDetailsText);
      console.log('\n=== PARSED DETAILS ===');
      console.log(JSON.stringify(extractedDetails, null, 2));
      
      // Now test if we can create events
      if (extractedDetails.multiple_events && extractedDetails.events) {
        console.log('\n=== TESTING MULTIPLE EVENT CREATION ===');
        for (let i = 0; i < extractedDetails.events.length; i++) {
          const event = extractedDetails.events[i];
          console.log(`\nEvent ${i + 1}: ${event.event_title}`);
          console.log(`Date: ${event.date}`);
          console.log(`Time: ${event.start_time} - ${event.end_time}`);
        }
      }
      
    } catch (parseError) {
      console.error('\n=== JSON PARSE ERROR ===');
      console.error(parseError.message);
    }
    
  } catch (error) {
    console.error('\n=== GENERAL ERROR ===');
    console.error(error);
  }
}

testUniversityEvent();