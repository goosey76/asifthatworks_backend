// Test script to verify emoji-enhanced LLM title extraction
require('dotenv').config({ path: '../../.env' });
const llmService = require('../src/services/llm-service');

async function testEmojiExtraction() {
  console.log('Testing emoji-enhanced LLM title extraction...\n');
  
  const testMessages = [
    "going to coffee at Friedrichstraße",
    "lunch with John",
    "gym workout session",
    "doctor appointment",
    "shopping at mall",
    "study session for exam"
  ];
  
  for (const message of testMessages) {
    console.log(`\n--- Testing: "${message}" ---`);
    
    const extractionPrompt = `Current Date: 2025-11-10. Current Time: 12:50.
    Extract event details (event_title, date, start_time, end_time, description, location, event_id, location_search_query, recurrence) from the following message.
    
    CRITICAL: For event_title, create a MEANINGFUL and DESCRIPTIVE title that captures the purpose/activity of the event, with a suitable emoji at the beginning. Examples:
    - "going to coffee Place at Friedrichstraße" → "☕ Coffee at Friedrichstraße"
    - "lunch with John" → "🍽️ Lunch with John"
    - "gym workout" → "💪 Gym Workout"
    - "doctor appointment" → "🩺 Doctor Appointment"
    - "meeting with team" → "👥 Team Meeting"
    - "study session" → "📚 Study Session"
    - "shopping" → "🛍️ Shopping"
    - "call with client" → "📞 Client Call"
    - "birthday party" → "🎂 Birthday Party"
    - "work from home" → "🏠 Working from Home"
    - "walking in park" → "🌳 Walk in the Park"
    - "tennis practice" → "🎾 Tennis Practice"
    
    IMPORTANT: If no date is explicitly mentioned in the message, ALWAYS use the provided Current Date.
    If the message mentions "now", use the Current Time for start_time. Calculate end_time based on any specified duration (e.g., "45 min from now").
    Ensure 'location' is extracted as a separate field if present, and not included in 'event_title' or 'description'.
    If the message contains a generic location (e.g., "bib", "library", "gym"), you must also generate a 'location_search_query' to be used with a location search API.
    If the message is about getting or checking events, include a 'time_range' field (e.g., "today", "this week", "next 3 days").
    Respond in JSON format: {"event_title": "", "date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "description": "", "location": "", "event_id": "", "location_search_query": "", "recurrence": "", "time_range": ""}.
    Message: "${message}"`;
    
    try {
      const result = await llmService.generateContent("gpt-3.5-turbo", extractionPrompt);
      const extractedDetails = JSON.parse(result);
      console.log(`Extracted Title: "${extractedDetails.event_title}"`);
      
      // Check if title starts with an emoji
      const firstChar = extractedDetails.event_title.charAt(0);
      const isEmoji = /[\p{Emoji}]/u.test(firstChar);
      console.log(`Has Emoji: ${isEmoji ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testEmojiExtraction().catch(console.error);
