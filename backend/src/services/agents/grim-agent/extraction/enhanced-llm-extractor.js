// Enhanced LLM-based event extraction with intelligent error handling and fallbacks

const llmService = require('../../../llm-service');

/**
 * Enhanced LLM-based event extraction module with robust error handling
 */
class EnhancedLLMExtractor {
  constructor() {
    this.llmService = llmService;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.fallbackModels = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'];
    this.currentModelIndex = 0;
  }

  /**
   * Enhanced event extraction with intelligent retry and fallback mechanisms
   * @param {string} originalMessage - The original user message
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {string} currentTime - Current time in HH:MM format
   * @returns {Promise<object>} Enhanced extracted event details
   */
  async extractEventDetails(originalMessage, currentDate, currentTime) {
    console.log(`🔍 Enhanced LLM Extraction starting for: "${originalMessage}"`);
    
    // Try multiple strategies for extraction
    const strategies = [
      () => this.extractWithPrimaryModel(originalMessage, currentDate, currentTime),
      () => this.extractWithFallbackPrompt(originalMessage, currentDate, currentTime),
      () => this.extractWithStructuredPrompt(originalMessage, currentDate, currentTime),
      () => this.createIntelligentFallback(originalMessage, currentDate, currentTime)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 Trying extraction strategy ${i + 1}/${strategies.length}`);
        const result = await strategies[i]();
        
        if (result && this.isValidExtraction(result)) {
          console.log(`✅ Extraction successful with strategy ${i + 1}`);
          return result;
        } else {
          console.log(`⚠️ Strategy ${i + 1} produced invalid result, trying next...`);
        }
      } catch (error) {
        console.log(`❌ Strategy ${i + 1} failed: ${error.message}`);
        if (i === strategies.length - 1) {
          console.log('🛡️ All strategies failed, using intelligent fallback');
          return await this.createIntelligentFallback(originalMessage, currentDate, currentTime);
        }
      }
    }

    // Final fallback
    return await this.createIntelligentFallback(originalMessage, currentDate, currentTime);
  }

  /**
   * Primary extraction with main model and retry logic
   */
  async extractWithPrimaryModel(originalMessage, currentDate, currentTime) {
    const extractionPrompt = this.buildExtractionPrompt(originalMessage, currentDate, currentTime);
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const model = this.fallbackModels[this.currentModelIndex % this.fallbackModels.length];
        console.log(`🤖 Attempting extraction with ${model} (attempt ${attempt + 1})`);
        
        const extractedDetailsText = await this.llmService.generateContent(model, extractionPrompt);
        
        if (!extractedDetailsText || extractedDetailsText.trim().length === 0) {
          throw new Error('Empty response from LLM service');
        }

        // Enhanced JSON parsing with multiple strategies
        const parsed = await this.parseLLMResponse(extractedDetailsText);
        if (parsed) {
          return parsed;
        }
        
      } catch (error) {
        console.log(`❌ Attempt ${attempt + 1} failed: ${error.message}`);
        
        if (attempt === this.maxRetries - 1) {
          this.currentModelIndex++; // Try next model
        } else {
          await this.delay(this.retryDelay * (attempt + 1)); // Exponential backoff
        }
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  /**
   * Fallback extraction with simplified prompt
   */
  async extractWithFallbackPrompt(originalMessage, currentDate, currentTime) {
    const simplePrompt = `Extract calendar event details from this message: "${originalMessage}"
    
Return ONLY valid JSON with this exact structure:
{
  "multiple_events": false,
  "event_title": "Clear event title",
  "date": "${currentDate}",
  "start_time": "HH:MM format",
  "end_time": "HH:MM format", 
  "description": "",
  "location": ""
}

Current date: ${currentDate}, Current time: ${currentTime}`;

    const result = await this.llmService.generateContent('gpt-3.5-turbo', simplePrompt);
    return await this.parseLLMResponse(result);
  }

  /**
   * Structured extraction with explicit JSON format
   */
  async extractWithStructuredPrompt(originalMessage, currentDate, currentTime) {
    const structuredPrompt = `You are a calendar event parser. Extract event details from: "${originalMessage}"

RULES:
1. Return ONLY valid JSON, no other text
2. Use current date: ${currentDate} if no date mentioned
3. Use current time: ${currentTime} as default start if no time mentioned
4. Add 1 hour duration if only start time given

FORMAT:
{
  "multiple_events": false,
  "event_title": "Event title",
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "description": "",
  "location": "",
  "time_range": ""
}`;

    const result = await this.llmService.generateContent('claude-3-sonnet', structuredPrompt);
    return await this.parseLLMResponse(result);
  }

  /**
   * Intelligent fallback when all LLM methods fail
   */
  async createIntelligentFallback(originalMessage, currentDate, currentTime) {
    console.log('🛠️ Creating intelligent fallback for:', originalMessage);
    
    // Extract time patterns with enhanced regex
    const timePatterns = this.extractTimePatterns(originalMessage);
    
    // Extract title with better parsing
    const title = this.extractIntelligentTitle(originalMessage);
    
    // Calculate times intelligently
    const { start_time, end_time } = this.calculateIntelligentTimes(timePatterns, currentTime);
    
    // Determine if this is a get/request vs create
    const isGetRequest = this.isCalendarQuery(originalMessage);
    
    const fallback = {
      multiple_events: false,
      event_title: title,
      date: currentDate,
      start_time: start_time,
      end_time: end_time,
      description: originalMessage,
      location: '',
      event_id: '',
      location_search_query: '',
      recurrence: '',
      time_range: isGetRequest ? this.extractTimeRange(originalMessage) : '',
      fallback_used: true,
      extraction_method: 'intelligent_fallback',
      original_message: originalMessage
    };

    console.log('🛠️ Intelligent fallback created:', fallback);
    return fallback;
  }

  /**
   * Enhanced JSON parsing with multiple strategies
   */
  async parseLLMResponse(responseText) {
    if (!responseText || typeof responseText !== 'string') {
      throw new Error('Invalid response type');
    }

    const cleanText = responseText.trim();
    
    // Strategy 1: Direct JSON parse
    try {
      const parsed = JSON.parse(cleanText);
      console.log('✅ Direct JSON parse successful');
      return parsed;
    } catch (directError) {
      console.log('⚠️ Direct JSON parse failed:', directError.message);
    }

    // Strategy 2: Extract JSON from markdown code blocks
    const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        console.log('✅ Code block JSON parse successful');
        return parsed;
      } catch (codeError) {
        console.log('⚠️ Code block JSON parse failed:', codeError.message);
      }
    }

    // Strategy 3: Extract JSON from text using regex
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Regex JSON extract successful');
        return parsed;
      } catch (regexError) {
        console.log('⚠️ Regex JSON extract failed:', regexError.message);
      }
    }

    // Strategy 4: Try to fix common JSON issues
    try {
      const fixed = this.fixCommonJSONIssues(cleanText);
      const parsed = JSON.parse(fixed);
      console.log('✅ Fixed JSON parse successful');
      return parsed;
    } catch (fixError) {
      console.log('⚠️ JSON fix attempt failed:', fixError.message);
    }

    throw new Error('All JSON parsing strategies failed');
  }

  /**
   * Fix common JSON formatting issues
   */
  fixCommonJSONIssues(text) {
    return text
      .replace(/,\s*\}/g, '}') // Remove trailing commas
      .replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
      .trim();
  }

  /**
   * Extract time patterns using enhanced regex
   */
  extractTimePatterns(message) {
    const patterns = [];
    
    // Pattern 1: "X-Y" time ranges
    const rangeRegex = /(\d{1,2}(:\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(:\d{2})?\s*(?:am|pm)?)/gi;
    let match;
    while ((match = rangeRegex.exec(message)) !== null) {
      patterns.push({
        type: 'range',
        start: match[1],
        end: match[3],
        fullMatch: match[0]
      });
    }
    
    // Pattern 2: Single time mentions
    const singleTimeRegex = /(\d{1,2}(:\d{2})?\s*(?:am|pm)?)/gi;
    let singleMatch;
    while ((singleMatch = singleTimeRegex.exec(message)) !== null) {
      if (!patterns.some(p => p.fullMatch === singleMatch[0])) {
        patterns.push({
          type: 'single',
          time: singleMatch[1],
          fullMatch: singleMatch[0]
        });
      }
    }
    
    return patterns;
  }

  /**
   * Extract intelligent title from message
   */
  extractIntelligentTitle(message) {
    // Remove common action words
    const cleaned = message
      .replace(/^(create|add|schedule|plan|set up|make|book)\s+(an?\s+)?(event|meeting|appointment)?\s*/i, '')
      .replace(/\d{1,2}(:\d{2})?\s*(am|pm)?\s*-\s*\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
      .trim();
    
    // If cleaned message is too short, use original
    if (cleaned.length < 3) {
      return this.capitalizeWords(message.substring(0, 30));
    }
    
    return this.capitalizeWords(cleaned);
  }

  /**
   * Calculate intelligent start and end times
   */
  calculateIntelligentTimes(timePatterns, currentTime) {
    if (timePatterns.length === 0) {
      // No time mentioned - use current time + 1 hour default
      const start = currentTime;
      const end = this.addMinutesToTime(currentTime, 60);
      return { start_time: start, end_time: end };
    }
    
    const pattern = timePatterns[0];
    
    if (pattern.type === 'range') {
      const start = this.parseTimeString(pattern.start, currentTime);
      const end = this.parseTimeString(pattern.end, currentTime);
      return { start_time: start, end_time: end };
    } else {
      // Single time mentioned - assume 1 hour duration
      const start = this.parseTimeString(pattern.time, currentTime);
      const end = this.addMinutesToTime(start, 60);
      return { start_time: start, end_time: end };
    }
  }

  /**
   * Parse time string to HH:MM format
   */
  parseTimeString(timeStr, defaultTime) {
    const clean = timeStr.trim().toLowerCase();
    
    // Handle 12-hour format
    const ampmMatch = clean.match(/(\d{1,2}(:\d{2})?)\s*(am|pm)/);
    if (ampmMatch) {
      let [_, time, period] = ampmMatch;
      let [hours, mins] = time.split(':').map(Number);
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${(mins || 0).toString().padStart(2, '0')}`;
    }
    
    // Handle 24-hour format
    if (clean.match(/^\d{1,2}(:\d{2})?$/)) {
      const [hours, mins] = clean.split(':');
      return `${hours.padStart(2, '0')}:${(mins || '0').padStart(2, '0')}`;
    }
    
    // Fallback to default time + 1 hour
    return this.addMinutesToTime(defaultTime, 60);
  }

  /**
   * Check if message is a calendar query (get) vs create
   */
  isCalendarQuery(message) {
    const queryKeywords = [
      'what', 'show', 'check', 'list', 'get', 'view', 'when', 'time',
      'schedule', 'calendar', 'appointments', 'meetings', 'busy', 'free'
    ];
    
    return queryKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  /**
   * Extract time range from message
   */
  extractTimeRange(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('today')) return 'today';
    if (lower.includes('tomorrow')) return 'tomorrow';
    if (lower.includes('week')) return 'this week';
    if (lower.includes('next')) return 'next';
    
    return '';
  }

  /**
   * Validate extracted details
   */
  isValidExtraction(details) {
    if (!details || typeof details !== 'object') return false;
    
    // Check required fields for single event
    if (!details.multiple_events) {
      return details.event_title && 
             details.date && 
             details.start_time && 
             details.end_time;
    }
    
    // Check multiple events
    if (details.multiple_events && Array.isArray(details.events)) {
      return details.events.length > 0 && 
             details.events.every(event => 
               event.event_title && event.date && 
               event.start_time && event.end_time
             );
    }
    
    return false;
  }

  /**
   * Build enhanced extraction prompt
   */
  buildExtractionPrompt(originalMessage, currentDate, currentTime) {
    return `Current Date: ${currentDate}. Current Time: ${currentTime}.

ENHANCED EVENT EXTRACTION with intelligent defaults:

CRITICAL ENHANCEMENT RULES:
1. Always use current date (${currentDate}) if no date specified
2. Always use current time (${currentTime}) as default start if no time specified  
3. Add 1 hour duration when only start time is given
4. Enhance titles with relevant emojis for clarity

MULTIPLE EVENT DETECTION:
Look for patterns like:
- "meeting at 10am, lunch at 12pm, gym at 5pm" → Multiple events
- "9-12 work session, then break, 1-3 meeting" → Multiple events
- "schedule X events with comma separation" → Multiple events

DEFAULT BEHAVIOR:
- Single time mentioned → 1 hour duration from that time
- No time mentioned → Current time (${currentTime}) as start
- No date mentioned → Current date (${currentDate})

ENHANCED FORMATTING:
Always return valid JSON with these exact field names:
{
  "multiple_events": true/false,
  "event_title": "Enhanced title with emoji",
  "date": "YYYY-MM-DD format",
  "start_time": "HH:MM format", 
  "end_time": "HH:MM format",
  "description": "",
  "location": ""
}

For multiple events, use:
{
  "multiple_events": true,
  "events": [
    {
      "event_title": "Event 1 with emoji",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "description": "",
      "location": ""
    }
  ]
}

Message: "${originalMessage}"`;
  }

  /**
   * Add minutes to time string
   */
  addMinutesToTime(timeStr, minutes) {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * Capitalize words in string
   */
  capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Add delay for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enhanced diagnosis for failed extractions
   */
  async diagnoseExtractionFailure(originalMessage, extractedDetails, error) {
    const issues = [];
    const fixes = [];

    // Check for missing required fields
    if (!extractedDetails.event_title) {
      issues.push('Missing event title');
      fixes.push('Provide a clear title for your event (e.g., "Meeting with John", "Doctor appointment")');
    }

    if (!extractedDetails.start_time) {
      issues.push('Missing start time');
      fixes.push('Specify when the event should start (e.g., "2pm", "14:00")');
    }

    if (!extractedDetails.end_time) {
      issues.push('Missing end time');
      fixes.push('Specify when the event should end (e.g., "3pm", "15:00")');
    }

    if (!extractedDetails.date) {
      issues.push('Missing date');
      fixes.push('Specify when the event should happen (e.g., "today", "tomorrow", "2025-11-20")');
    }

    // Check for invalid time formats
    if (extractedDetails.start_time && !this.isValidTimeFormat(extractedDetails.start_time)) {
      issues.push('Invalid start time format');
      fixes.push('Use proper time format like "2pm", "14:00", or "2:30pm"');
    }

    if (extractedDetails.end_time && !this.isValidTimeFormat(extractedDetails.end_time)) {
      issues.push('Invalid end time format');
      fixes.push('Use proper time format like "3pm", "15:00", or "3:30pm"');
    }

    return {
      missing_fields: issues,
      issue_description: `Extraction failed: ${error}`,
      specific_missing_details: fixes,
      how_to_fix: [
        'Be specific about what you want to schedule',
        'Include time information (start and end times)',
        'Specify the date or use relative terms like "today" or "tomorrow"',
        'Use clear, descriptive language'
      ]
    };
  }

  /**
   * Validate time format
   */
  isValidTimeFormat(timeStr) {
    const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
    return timeRegex.test(timeStr);
  }

  /**
   * Merge event_id from entities if present
   */
  mergeEventId(extractedDetails, entities) {
    if (entities.event_id) {
      extractedDetails.event_id = entities.event_id;
    }
    return extractedDetails;
  }
}

module.exports = EnhancedLLMExtractor;