// agent-service/llm-extractor.js

const llmService = require('../../../llm-service');

/**
 * LLM-based event extraction and parsing module
 */
class LLMExtractor {
  constructor() {
    this.llmService = llmService;
  }

  /**
   * Extracts event details from user message using LLM
   * @param {string} originalMessage - The original user message
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {string} currentTime - Current time in HH:MM format
   * @returns {Promise<object>} Extracted event details
   */
  async extractEventDetails(originalMessage, currentDate, currentTime) {
    const extractionPrompt = `Current Date: ${currentDate}. Current Time: ${currentTime}.
    
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
    
    **ENHANCED SEQUENTIAL EVENT DETECTION**:
    Look for these specific patterns that indicate multiple events:
    - TIME-RANGE - activity - "and" - break/next TIME-RANGE - more activity
    - TIME-RANGE - activity - "then" - break/next TIME-RANGE - more activity
    - TIME-RANGE - activity - "afterwards" - break/next TIME-RANGE - more activity
    - TIME-RANGE - activity - "puff[er]" - break/next TIME-RANGE - more activity
    - TIME-RANGE - activity - "continued" - break/next TIME-RANGE - more activity
    
    **SPECIFIC PATTERN EXAMPLES TO DETECT**:
    - "3:30-6:00 - grinding programming for uni - and break of 5 minutes afterwards - 6:05-6:50 - let's grind even more" → DETECT AS 3 EVENTS
    - "9-12 - work session - then break - 12:30-1 - lunch - and resume - 1:30-4:30 - continued work"
    - "8-10 - morning workout - afterwards - 10:30-12 - coding - and later - 2-5 - project work"
    - "7-9 - study session - break 30 min - 9:30-11:30 - more studying - then lunch - 12-1"
    - "10-12 - client meeting - break 15 min - 12:15-1:15 - follow up - and wrap up - 1:30-3"
    
    **CRITICAL 3-EVENT UNIV STUDY PATTERN**:
    When you see "3:30-6:00 - grinding programming for uni - and break of 5 minutes afterwards - 6:05-6:50 - let's grind even more for uni":
    → DETECT AS 3 SEPARATE EVENTS:
    1. Event 1: 3:30-6:00 (grinding programming for uni)
    2. Event 2: 6:00-6:05 (break of 5 minutes - 5-minute break)  
    3. Event 3: 6:05-6:50 (let's grind even more for uni - continued programming study)
    
    
    **DETAILED BREAK TIME EXAMPLES**:
    - "break of 5 minutes afterwards" → Create event from first event end time to (end time + 5 minutes)
    - "break 30 min" → Calculate exact time range for 30-minute break  
    - "break 15 min" → Calculate exact time range for 15-minute break
    - When "break of X minutes" is mentioned, create a separate event for the break time
    
    **YOUR EXACT UNIV STUDY MESSAGE**: "create an event -3:30 - 6:00 - grinding programming for uni - and break of 5 minutes afterwards, as a puffer - 6:05-6:50 - let's grind even more for uni"
    MUST CREATE 3 EVENTS:
    1. Study Session: 15:30-18:00 "grinding programming for uni"
    2. Break Time: 18:00-18:05 "break of 5 minutes afterwards, as a puffer" 
    3. Study Session 2: 18:05-18:50 "let's grind even more for uni"
    
    **MANDATORY 3-EVENT PARSING RULE**:
    ANY message containing "break of X minutes" MUST create 3 separate events:
    1. First activity event (before the break)
    2. Break event (calculated from "break of X minutes")  
    3. Second activity event (after the break)
    
    **NON-NEGOTIABLE**: The phrase "break of 5 minutes afterwards" ALWAYS means:
    - Event 1: [first time range] - [first activity]  
    - Event 2: [end of first event] to [end + 5 minutes] - "break of 5 minutes"
    - Event 3: [second time range] - [second activity]
    
    **THIS IS NOT A SUGGESTION - IT IS A REQUIREMENT**
    **CRITICAL**: If message contains words like "and break", "then", "afterwards", "continued", "puff[er]" between time ranges, it indicates MULTIPLE events!
    
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
    Message: "${originalMessage}"`;

    const extractedDetailsText = await this.llmService.generateContent("gpt-3.5-turbo", extractionPrompt);
    
    try {
      const extractedDetails = JSON.parse(extractedDetailsText);
      console.log('LLM Raw Extracted Details:', extractedDetailsText);
      console.log('LLM Parsed Extracted Details:', extractedDetails);
      
      // Handle time range for calendar queries (like "tomorrow", "today")
      if (extractedDetails.time_range) {
        if (extractedDetails.time_range.toLowerCase() === 'tomorrow') {
          const tomorrow = new Date(currentDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          extractedDetails.date = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
          console.log('Calculated tomorrow date:', extractedDetails.date);
        }
        // For "today", "this week", "next 3 days" - the calendar utils will handle the calculation
      } else {
        // Check if this looks like a GET request (asking to view/check events)
        const isGetRequest = originalMessage.toLowerCase().includes('what') ||
                            originalMessage.toLowerCase().includes('show') ||
                            originalMessage.toLowerCase().includes('check') ||
                            originalMessage.toLowerCase().includes('list') ||
                            originalMessage.toLowerCase().includes('get') ||
                            originalMessage.toLowerCase().includes('view');
        
        if (!isGetRequest) {
          // Handle single event date override
          if (!extractedDetails.multiple_events && extractedDetails.date) {
            const extractedDateObj = new Date(extractedDetails.date);
            const currentDateObj = new Date(currentDate);

            if (extractedDateObj < currentDateObj) {
              console.log(`Condition met for overriding date. Extracted date: ${extractedDetails.date}, Current date: ${currentDate}`);
              extractedDetails.date = currentDate;
              console.log('Extracted date after override:', extractedDetails.date);
            } else {
              console.log('Condition not met for overriding date. Extracted date is valid or in the future.');
            }
          }
          
          // Handle multiple events date override
          if (extractedDetails.multiple_events && extractedDetails.events) {
            console.log(`Processing ${extractedDetails.events.length} events for date validation`);
            for (let i = 0; i < extractedDetails.events.length; i++) {
              const event = extractedDetails.events[i];
              console.log(`Event ${i + 1} date: ${event.date}, title: ${event.event_title}`);
              
              if (event.date && event.date !== 'undefined' && event.date.trim() !== '') {
                try {
                  const extractedDateObj = new Date(event.date);
                  const currentDateObj = new Date(currentDate);
                  
                  // Validate date objects
                  if (isNaN(extractedDateObj.getTime()) || isNaN(currentDateObj.getTime())) {
                    console.log(`Event ${i + 1}: Invalid date format, using current date`);
                    event.date = currentDate;
                  } else if (extractedDateObj < currentDateObj) {
                    console.log(`Event ${i + 1}: Overriding date from ${event.date} to ${currentDate}`);
                    event.date = currentDate;
                  } else {
                    console.log(`Event ${i + 1}: Date ${event.date} is valid`);
                  }
                } catch (dateError) {
                  console.log(`Event ${i + 1}: Date parsing error, using current date:`, dateError.message);
                  event.date = currentDate;
                }
              } else {
                console.log(`Event ${i + 1}: No date provided, using current date ${currentDate}`);
                event.date = currentDate;
              }
            }
          }
        } else {
          console.log('GET request detected - preserving original dates for calendar query');
        }
      }
      
      return extractedDetails;
    } catch (jsonError) {
      console.error('Failed to parse LLM extracted details as JSON:', jsonError);
      console.log('Raw LLM response that failed to parse:', extractedDetailsText);
      
      // Fallback: try to extract basic information from raw response
      const fallbackDetails = this.createFallbackDetails(originalMessage, currentDate, currentTime);
      return fallbackDetails;
    }
  }

  /**
   * Create fallback details when LLM parsing fails
   * @param {string} originalMessage - Original user message
   * @param {string} currentDate - Current date
   * @param {string} currentTime - Current time
   * @returns {object} Fallback event details
   */
  createFallbackDetails(originalMessage, currentDate, currentTime) {
    console.log('Creating fallback details for message:', originalMessage);
    
    // Extract basic time information using regex as fallback
    const timeRegex = /(\d{1,2}(:\d{2})?\s*(am|pm)?)\s*-\s*(\d{1,2}(:\d{2})?\s*(am|pm)?)/gi;
    const timeMatch = originalMessage.match(timeRegex);
    
    if (timeMatch && timeMatch[0]) {
      const times = timeMatch[0].split('-').map(t => t.trim());
      const startTime = this.parseTime(times[0], currentTime);
      const endTime = this.parseTime(times[1], currentTime);
      
      return {
        multiple_events: false,
        event_title: this.extractTitleFromMessage(originalMessage),
        date: currentDate,
        start_time: startTime,
        end_time: endTime,
        description: '',
        location: '',
        event_id: '',
        location_search_query: '',
        recurrence: '',
        time_range: '',
        fallback_used: true
      };
    }
    
    // If no time found, create a simple event
    return {
      multiple_events: false,
      event_title: this.extractTitleFromMessage(originalMessage),
      date: currentDate,
      start_time: currentTime,
      end_time: this.addMinutesToTime(currentTime, 60),
      description: originalMessage,
      location: '',
      event_id: '',
      location_search_query: '',
      recurrence: '',
      time_range: '',
      fallback_used: true
    };
  }

  /**
   * Parse time string to HH:MM format
   * @param {string} timeStr - Time string to parse
   * @param {string} currentTime - Current time for reference
   * @returns {string} Parsed time in HH:MM format
   */
  parseTime(timeStr, currentTime) {
    const cleanTime = timeStr.trim().toLowerCase();
    
    // Handle common time formats
    if (cleanTime.match(/^\d{1,2}(:\d{2})?$/)) {
      return cleanTime.padStart(5, '0').replace(/:/, ':');
    }
    
    // If parsing fails, use current time + 1 hour
    return this.addMinutesToTime(currentTime, 60);
  }

  /**
   * Extract title from message
   * @param {string} message - Original message
   * @returns {string} Extracted title
   */
  extractTitleFromMessage(message) {
    // Remove common prefixes and extract meaningful title
    const cleanMessage = message
      .replace(/^(create|add|schedule|plan|set up)\s+(an?\s+)?(event|meeting|appointment)?\s*/i, '')
      .replace(/\d{1,2}(:\d{2})?\s*(am|pm)?\s*-\s*\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
      .trim();
    
    return cleanMessage || 'Untitled Event';
  }

  /**
   * Add minutes to time string
   * @param {string} timeStr - Time in HH:MM format
   * @param {number} minutes - Minutes to add
   * @returns {string} New time in HH:MM format
   */
  addMinutesToTime(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * Diagnose why event extraction failed
   * @param {string} originalMessage - The original user message
   * @param {object} extractedDetails - The extracted details (may be incomplete)
   * @param {string} error - The specific error that occurred
   * @returns {object} Diagnostic information
   */
  async diagnoseExtractionFailure(originalMessage, extractedDetails, error) {
    const diagnosisPrompt = `Analyze this failed calendar event extraction and provide specific diagnostic feedback:

Original Message: "${originalMessage}"
Extracted Details: ${JSON.stringify(extractedDetails, null, 2)}
Error: ${error}

Provide specific diagnosis in JSON format:
{
  "missing_fields": ["list of missing required fields"],
  "issue_description": "detailed explanation of what's wrong",
  "specific_missing_details": ["what specific information is missing"],
  "how_to_fix": ["specific instructions to fix the issue"]
}

Required fields for event creation:
- event_title (what the event is about)
- start_time (when it starts, format: HH:MM)
- end_time (when it ends, format: HH:MM)
- date (when it happens, format: YYYY-MM-DD or use 'today'/'tomorrow')`;

    try {
      const diagnosisText = await this.llmService.generateContent("gpt-3.5-turbo", diagnosisPrompt);
      return JSON.parse(diagnosisText);
    } catch (diagnosticError) {
      console.error('Failed to generate diagnosis:', diagnosticError);
      return {
        missing_fields: [],
        issue_description: "Unable to analyze the specific issue.",
        specific_missing_details: [],
        how_to_fix: ["Try providing all required details: title, time, and date"]
      };
    }
  }

  /**
   * Merge event_id from entities if present, overriding LLM extraction if conflicting
   * @param {object} extractedDetails - The extracted details from LLM
   * @param {object} entities - The entities object containing event_id
   * @returns {object} Merged extracted details
   */
  mergeEventId(extractedDetails, entities) {
    if (entities.event_id) {
      extractedDetails.event_id = entities.event_id;
    }
    return extractedDetails;
  }
}

module.exports = LLMExtractor;
