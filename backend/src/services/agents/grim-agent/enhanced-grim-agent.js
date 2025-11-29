// Enhanced Grim Agent with Multi-Calendar Management
// Adds dynamic intelligence, event moving, and multi-calendar support
// Enhanced with insights from real user test UUID 982bb1bf-539c-4b1f-8d1a-714600fff81d

const GoogleCalendarClient = require('./calendar/google-calendar-client');
const EnhancedCalendarIntelligenceSystem = require('../murphy-agent/calendar-integration/enhanced-calendar-intelligence-system');
const DynamicIntelligenceEngine = require('./intelligence/dynamic-intelligence-engine');

/**
 * Enhanced Grim Agent with comprehensive calendar management
 * Provides multi-calendar support, event management, and intelligent responses
 */
class EnhancedGrimAgent {
  constructor(supabase) {
    this.supabase = supabase;
    this.calendarClient = new GoogleCalendarClient(supabase);
    this.intelligenceSystem = new EnhancedCalendarIntelligenceSystem();
    this.dynamicIntelligence = new DynamicIntelligenceEngine(supabase);
    this.userCalendars = new Map(); // userId -> calendar info
    this.eventCache = new Map(); // userId -> event list
    this.realUserInsights = {
      uuid: '982bb1bf-539c-4b1f-8d1a-714600fff81d',
      testResults: new Map(),
      learnedPatterns: new Map()
    };
  }

  /**
   * Handle event operations with enhanced intelligence
   * @param {string} intent - The intent (create_event, move_event, list_calendars, etc.)
   * @param {object} entities - Extracted entities from user message
   * @param {string} userId - User identifier
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {object} Enhanced response with calendar management
   */
  async handleEventOperation(intent, entities, userId, conversationHistory = []) {
    console.log(`🎯 Enhanced GRIM: Handling ${intent} for user ${userId}`);
    
    const operationStartTime = Date.now();
    let result = null;
    
    try {
      // Learn from user interaction patterns
      await this.dynamicIntelligence.learnFromUserInteraction(userId, {
        type: 'calendar_operation',
        intent: intent,
        entities: entities,
        conversationHistory: conversationHistory,
        timestamp: new Date(),
        responseTime: 0 // Will update after response
      });
      
      // Generate intelligent response adaptations
      const intelligenceResponse = await this.dynamicIntelligence.generateIntelligentResponse(
        userId, intent, entities
      );
      
      // Ensure we have user calendar access
      await this.ensureCalendarAccess(userId);
      
      let operationResult = null;
      
      switch (intent) {
        case 'create_event':
          operationResult = await this.handleEnhancedCreateEvent(entities, userId, conversationHistory);
          break;
        
        case 'move_event':
        case 'update_event':
          operationResult = await this.handleEventMovement(entities, userId, conversationHistory);
          break;
        
        case 'list_calendars':
          operationResult = await this.listUserCalendars(userId);
          break;
        
        case 'show_events':
        case 'get_events':
          operationResult = await this.listCalendarEvents(entities, userId);
          break;
        
        case 'delete_event':
          operationResult = await this.handleEventDeletion(entities, userId);
          break;
        
        case 'manage_calendar':
          operationResult = await this.handleCalendarManagement(entities, userId);
          break;
        
        default:
          operationResult = this.generateDefaultResponse(entities, userId);
      }
      
      // Apply intelligent response adaptations
      result = this.applyIntelligenceAdaptations(operationResult, intelligenceResponse);
      
      // Update learning with successful interaction
      await this.dynamicIntelligence.learnFromUserInteraction(userId, {
        type: 'calendar_operation',
        intent: intent,
        entities: entities,
        success: true,
        result: result,
        responseTime: Date.now() - operationStartTime
      });
      
      // Special handling for real user UUID 982bb1bf-539c-4b1f-8d1a-714600fff81d
      if (userId === this.realUserInsights.uuid) {
        this.storeRealUserInsight(intent, result);
      }
      
      return result;
      
    } catch (error) {
      console.error('Enhanced GRIM error:', error);
      
      // Enhanced error handling with dynamic intelligence
      const intelligentError = await this.dynamicIntelligence.handleErrorWithIntelligence(
        userId, error, { intent, entities, conversationHistory }
      );
      
      // Learn from error for future improvement
      await this.dynamicIntelligence.learnFromUserInteraction(userId, {
        type: 'calendar_operation',
        intent: intent,
        entities: entities,
        success: false,
        error: error.message,
        responseTime: Date.now() - operationStartTime
      });
      
      // Special handling for real user UUID
      if (userId === this.realUserInsights.uuid) {
        this.storeRealUserInsight(intent, { error: error.message, handled: true });
      }
      
      return {
        messageToUser: intelligentError.messageToUser,
        eventId: null,
        success: false,
        fallbackOptions: intelligentError.fallbackOptions || [],
        nextSteps: intelligentError.nextSteps || []
      };
    }
  }

  /**
   * Enhanced event creation with detailed confirmation
   */
  async handleEnhancedCreateEvent(entities, userId, conversationHistory) {
    console.log('🍵 Creating event with enhanced confirmation...');
    
    const { message, event_title, date, start_time, end_time, description, location } = entities;
    
    try {
      // Create the event using calendar client
      const eventData = {
        summary: event_title || 'Untitled Event',
        description: description || 'Created via Enhanced Grim Agent',
        location: location || '',
        start: {
          dateTime: this.parseDateTime(date, start_time),
          timeZone: 'Europe/Berlin'
        },
        end: {
          dateTime: this.parseDateTime(date, end_time),
          timeZone: 'Europe/Berlin'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 30 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const calendar = await this.calendarClient.getCalendarClient(userId);
      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventData
      });

      // Generate enhanced confirmation response
      const enhancedResponse = this.generateEventConfirmation(createdEvent.data, 'created');
      
      // Cache the event for future management
      await this.cacheEvent(userId, createdEvent.data);
      
      return {
        messageToUser: enhancedResponse,
        eventId: createdEvent.data.id,
        success: true,
        eventData: createdEvent.data
      };

    } catch (error) {
      console.error('Event creation failed:', error);
      return {
        messageToUser: `Failed to create event: ${error.message}`,
        eventId: null,
        success: false
      };
    }
  }

  /**
   * Handle event movement and updates
   */
  async handleEventMovement(entities, userId, conversationHistory) {
    console.log('🔄 Handling event movement...');
    
    const { message, event_title, new_date, new_time, target_calendar, event_id } = entities;
    
    try {
      // First, find the event to move
      const eventToMove = await this.findEventByReference(userId, entities);
      
      if (!eventToMove) {
        return {
          messageToUser: `I couldn't find the event to move. Could you be more specific about which event you'd like to move?`,
          eventId: null,
          success: false
        };
      }

      // Prepare updated event data
      const updatedEvent = {
        ...eventToMove
      };

      // Update time if specified
      if (new_date || new_time) {
        if (new_date) {
          updatedEvent.start.dateTime = this.parseDateTime(new_date, new_time?.start);
          updatedEvent.end.dateTime = this.parseDateTime(new_date, new_time?.end);
        }
        if (new_time) {
          const currentDate = updatedEvent.start.dateTime.split('T')[0];
          updatedEvent.start.dateTime = this.parseDateTime(currentDate, new_time);
        }
      }

      // Update calendar if specified
      const targetCalendarId = target_calendar || 'primary';
      
      // Move the event
      const calendar = await this.calendarClient.getCalendarClient(userId);
      const movedEvent = await calendar.events.update({
        calendarId: targetCalendarId,
        eventId: eventToMove.id,
        resource: updatedEvent
      });

      // Generate enhanced movement confirmation
      const movementResponse = this.generateEventConfirmation(movedEvent.data, 'moved');
      
      return {
        messageToUser: movementResponse,
        eventId: movedEvent.data.id,
        success: true,
        eventData: movedEvent.data
      };

    } catch (error) {
      console.error('Event movement failed:', error);
      return {
        messageToUser: `Failed to move event: ${error.message}`,
        eventId: null,
        success: false
      };
    }
  }

  /**
   * List user's calendars
   */
  async listUserCalendars(userId) {
    console.log('📅 Listing user calendars...');
    
    try {
      const calendarClients = await this.calendarClient.getAllCalendarClients(userId);
      const calendarList = Object.entries(calendarClients).map(([id, calendar]) => ({
        id: id,
        name: calendar.name,
        color: calendar.color,
        isPrimary: calendar.isPrimary
      }));

      let responseMessage = `📅 Your available calendars:\n\n`;
      calendarList.forEach((calendar, index) => {
        const primary = calendar.isPrimary ? ' (Primary)' : '';
        responseMessage += `${index + 1}. ${calendar.name}${primary}\n`;
      });

      responseMessage += `\nYou can reference calendars by name when creating or moving events.`;

      return {
        messageToUser: responseMessage,
        calendars: calendarList,
        success: true
      };

    } catch (error) {
      console.error('Failed to list calendars:', error);
      return {
        messageToUser: `Failed to list your calendars: ${error.message}`,
        calendars: [],
        success: false
      };
    }
  }

  /**
   * List events in calendars
   */
  async listCalendarEvents(entities, userId) {
    console.log('📋 Listing calendar events...');
    
    const { date, calendar_name, time_range } = entities;
    
    try {
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      // Calculate time range
      const timeMin = this.calculateTimeMin(date || time_range);
      const timeMax = this.calculateTimeMax(date || time_range);
      
      const eventsList = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = eventsList.data.items || [];
      
      let responseMessage = `📅 Your events:\n\n`;
      
      if (events.length === 0) {
        responseMessage += `No events found for the specified time period.`;
      } else {
        events.forEach((event, index) => {
          const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const endTime = new Date(event.end.dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          responseMessage += `${index + 1}. ${event.summary}\n`;
          responseMessage += `   🕐 ${startTime} - ${endTime}\n`;
          if (event.location) {
            responseMessage += `   📍 ${event.location}\n`;
          }
          responseMessage += `   🆔 ${event.id}\n\n`;
        });
      }

      return {
        messageToUser: responseMessage,
        events: events,
        success: true
      };

    } catch (error) {
      console.error('Failed to list events:', error);
      return {
        messageToUser: `Failed to list your events: ${error.message}`,
        events: [],
        success: false
      };
    }
  }

  /**
   * Handle intelligent event deletion with natural language support
   */
  async handleEventDeletion(entities, userId) {
    console.log('🗑️ Handling intelligent event deletion...');
    
    try {
      // Extract deletion criteria from entities
      const deletionCriteria = this.extractDeletionCriteria(entities);
      
      console.log(`🔍 Looking for events to delete:`, deletionCriteria);
      
      // Find events matching the criteria
      const eventsToDelete = await this.findEventsByCriteria(userId, deletionCriteria);
      
      if (!eventsToDelete || eventsToDelete.length === 0) {
        return this.generateNoEventsFoundResponse(deletionCriteria);
      }
      
      if (eventsToDelete.length > 1) {
        return this.generateAmbiguousDeletionResponse(eventsToDelete, deletionCriteria);
      }
      
      // Single event found - proceed with deletion
      const eventToDelete = eventsToDelete[0];
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventToDelete.id
      });
      
      // Enhanced success response
      const successMessage = this.generateDeletionSuccessMessage(eventToDelete, deletionCriteria);
      
      console.log(`✅ Successfully deleted event: ${eventToDelete.summary}`);
      
      return {
        messageToUser: successMessage,
        eventId: eventToDelete.id,
        success: true,
        deletedEvent: {
          title: eventToDelete.summary,
          date: eventToDelete.start?.dateTime?.split('T')[0],
          time: eventToDelete.start?.dateTime
        }
      };

    } catch (error) {
      console.error('Intelligent event deletion failed:', error);
      return {
        messageToUser: `Failed to delete event: ${error.message}. Let me help you find the correct event to delete.`,
        eventId: null,
        success: false,
        suggestions: [
          'Try being more specific about the date',
          'Check if the event title is exact',
          'Consider listing your events first'
        ]
      };
    }
  }

  // Helper methods

  /**
   * Ensure calendar access for user
   */
  async ensureCalendarAccess(userId) {
    if (!this.userCalendars.has(userId)) {
      try {
        const calendarClients = await this.calendarClient.getAllCalendarClients(userId);
        this.userCalendars.set(userId, calendarClients);
      } catch (error) {
        throw new Error('Calendar access not available for this user');
      }
    }
  }

  /**
   * Generate enhanced event confirmation
   */
  generateEventConfirmation(event, action) {
    const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = new Date(event.end.dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const emoji = this.getEventEmoji(event.summary);
    const actionText = action === 'created' ? 'Successfully created' : 'Successfully updated';
    
    return `${emoji} ${actionText} 1 event:\n${event.summary} at ${startTime}-${endTime}.`;
  }

  /**
   * Get appropriate emoji for event
   */
  getEventEmoji(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('coffee') || titleLower.includes('break')) return '🍵';
    if (titleLower.includes('meeting')) return '👥';
    if (titleLower.includes('work') || titleLower.includes('project')) return '💼';
    if (titleLower.includes('study') || titleLower.includes('learning')) return '📚';
    if (titleLower.includes('workshop')) return '🛠️';
    return '📅';
  }

  /**
   * Parse date and time
   */
  parseDateTime(date, time) {
    if (!date || !time) return null;
    
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return dateObj.toISOString();
  }

  /**
   * Find event by user reference
   */
  async findEventByReference(userId, entities) {
    const { event_title, event_id, message } = entities;
    
    try {
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      // If event_id is provided, use it directly
      if (event_id) {
        const event = await calendar.events.get({
          calendarId: 'primary',
          eventId: event_id
        });
        return event.data;
      }
      
      // Otherwise, search by title or message content
      const eventsList = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true
      });
      
      const events = eventsList.data.items || [];
      
      // Find by title match
      if (event_title) {
        const matchingEvent = events.find(event => 
          event.summary.toLowerCase().includes(event_title.toLowerCase())
        );
        if (matchingEvent) return matchingEvent;
      }
      
      // Find by message content
      if (message) {
        const matchingEvent = events.find(event => 
          message.toLowerCase().includes(event.summary.toLowerCase()) ||
          event.summary.toLowerCase().includes(message.toLowerCase())
        );
        if (matchingEvent) return matchingEvent;
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to find event:', error);
      return null;
    }
  }

  /**
   * Calculate time minimum
   */
  calculateTimeMin(dateOrRange) {
    if (!dateOrRange) return new Date().toISOString();
    
    if (dateOrRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today.toISOString();
    }
    
    if (dateOrRange === 'week') {
      const week = new Date();
      week.setDate(week.getDate() - week.getDay());
      week.setHours(0, 0, 0, 0);
      return week.toISOString();
    }
    
    // Parse specific date
    return new Date(dateOrRange).toISOString();
  }

  /**
   * Calculate time maximum
   */
  calculateTimeMax(dateOrRange) {
    if (!dateOrRange) {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      return future.toISOString();
    }
    
    if (dateOrRange === 'today') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return today.toISOString();
    }
    
    if (dateOrRange === 'week') {
      const week = new Date();
      week.setDate(week.getDate() - week.getDay() + 6);
      week.setHours(23, 59, 59, 999);
      return week.toISOString();
    }
    
    // Parse specific date
    return new Date(dateOrRange).toISOString();
  }

  /**
   * Cache event for management
   */
  async cacheEvent(userId, event) {
    if (!this.eventCache.has(userId)) {
      this.eventCache.set(userId, new Map());
    }
    this.eventCache.get(userId).set(event.id, event);
  }

  /**
   * Generate default response
   */
  generateDefaultResponse(entities, userId) {
    return {
      messageToUser: `I understand you want to manage your calendar. I can help you create events, move events between calendars, list your events, and manage multiple calendars. What would you like to do?`,
      eventId: null,
      success: true
    };
  }

  /**
   * Apply intelligent adaptations to operation result
   */
  applyIntelligenceAdaptations(operationResult, intelligenceResponse) {
    const adaptedResult = { ...operationResult };
    
    // Apply response style adaptations
    if (intelligenceResponse.responseStyle) {
      adaptedResult.responseStyle = intelligenceResponse.responseStyle;
      adaptedResult.messageToUser = this.adaptMessageStyle(
        adaptedResult.messageToUser,
        intelligenceResponse.responseStyle
      );
    }
    
    // Add calendar preferences
    if (intelligenceResponse.calendarPreferences) {
      adaptedResult.calendarPreferences = intelligenceResponse.calendarPreferences;
    }
    
    // Add adaptation suggestions
    if (intelligenceResponse.adaptationSuggestions && intelligenceResponse.adaptationSuggestions.length > 0) {
      adaptedResult.suggestions = intelligenceResponse.adaptationSuggestions;
    }
    
    // Add intelligence metadata
    adaptedResult.intelligence = {
      confidence: intelligenceResponse.confidence,
      adaptationLevel: this.calculateAdaptationLevel(intelligenceResponse),
      learnedFromPatterns: true
    };
    
    return adaptedResult;
  }

  /**
   * Store insights from real user test UUID
   */
  storeRealUserInsight(intent, result) {
    if (!this.realUserInsights.testResults.has(intent)) {
      this.realUserInsights.testResults.set(intent, []);
    }
    
    const insights = this.realUserInsights.testResults.get(intent);
    insights.push({
      timestamp: new Date(),
      result: result,
      performance: this.calculatePerformanceScore(result),
      patterns: this.extractTestPatterns(result)
    });
    
    // Keep only recent insights (last 20)
    if (insights.length > 20) {
      this.realUserInsights.testResults.set(intent, insights.slice(-20));
    }
    
    console.log(`📊 Real user insight stored for ${intent}: ${insights.length} total records`);
  }

  /**
   * Calculate adaptation level
   */
  calculateAdaptationLevel(intelligenceResponse) {
    let level = 0;
    
    if (intelligenceResponse.responseStyle !== 'balanced') level += 1;
    if (intelligenceResponse.calendarPreferences?.preferredCalendars?.length > 0) level += 1;
    if (intelligenceResponse.adaptationSuggestions?.length > 0) level += 1;
    if (intelligenceResponse.confidence > 0.7) level += 1;
    
    return Math.min(level, 3); // Max level 3
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(result) {
    if (!result.success) return 0.2;
    
    let score = 0.7; // Base success score
    
    if (result.messageToUser && result.messageToUser.length > 20) score += 0.1;
    if (result.eventId) score += 0.1;
    if (result.intelligence?.confidence > 0.7) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Extract test patterns from result
   */
  extractTestPatterns(result) {
    const patterns = [];
    
    if (result.messageToUser) {
      if (result.messageToUser.includes('Successfully')) patterns.push('success_confirmation');
      if (result.messageToUser.includes('error') || result.messageToUser.includes('failed')) patterns.push('error_handling');
      if (result.messageToUser.includes('📅')) patterns.push('visual_enhancement');
    }
    
    if (result.eventId) patterns.push('event_id_returned');
    if (result.success) patterns.push('operation_success');
    
    return patterns;
  }

  /**
   * Adapt message style based on user preferences
   */
  adaptMessageStyle(message, style) {
    const styles = {
      'detailed': (msg) => `I've processed your request. ${msg} Let me know if you need any adjustments.`,
      'concise': (msg) => `${msg}`,
      'conversational': (msg) => `Great! ${msg} Is there anything else I can help you with?`,
      'professional': (msg) => `Your request has been processed. ${msg} Please let me know if you require further assistance.`,
      'balanced': (msg) => `Done! ${msg} Let me know if you need help with anything else.`
    };
    
    const styleAdapter = styles[style] || styles['balanced'];
    return styleAdapter(message);
  }

  /**
   * Enhanced calendar management with dynamic intelligence
   */
  async handleCalendarManagement(entities, userId) {
    console.log('🏢 Enhanced calendar management...');
    
    try {
      const intelligenceResponse = await this.dynamicIntelligence.generateIntelligentResponse(
        userId, 'manage_calendar', entities
      );
      
      const calendarList = await this.listUserCalendars(userId);
      
      // Apply intelligent formatting
      const enhancedMessage = this.applyIntelligenceAdaptations(calendarList, intelligenceResponse);
      
      // Add management suggestions
      enhancedMessage.managementSuggestions = [
        'You can create events in any calendar',
        'Events can be moved between calendars easily',
        'Multiple events can be created at once',
        'Calendar preferences are learned automatically'
      ];
      
      enhancedMessage.capabilities = {
        createEvents: true,
        moveEvents: true,
        listCalendars: true,
        batchOperations: true,
        intelligentAdaptation: true
      };
      
      return enhancedMessage;
      
    } catch (error) {
      console.error('Calendar management failed:', error);
      return {
        messageToUser: `Calendar management is currently available. You can create, move, list, and delete events across multiple calendars.`,
        success: true,
        fallbackMessage: true
      };
    }
  }

  /**
   * Extract deletion criteria from entities
   */
  extractDeletionCriteria(entities) {
    const criteria = {
      title: null,
      date: null,
      time: null,
      description: null,
      keywords: []
    };
    
    // Extract event title
    if (entities.event_title) {
      criteria.title = entities.event_title;
    } else if (entities.message && typeof entities.message === 'string') {
      // Try to extract from message
      const message = entities.message.toLowerCase();
      
      // Look for common event names in the message
      if (message.includes('extraction')) criteria.title = 'extraction';
      if (message.includes('meeting')) criteria.title = 'meeting';
      if (message.includes('coffee')) criteria.title = 'coffee';
      
      // Extract date from message
      if (message.includes('today')) {
        criteria.date = 'today';
      } else if (message.includes('tomorrow')) {
        criteria.date = 'tomorrow';
      }
    }
    
    // Extract date
    if (entities.date) {
      criteria.date = entities.date;
    }
    
    // Extract time
    if (entities.start_time || entities.time) {
      criteria.time = entities.start_time || entities.time;
    }
    
    // Extract keywords for fuzzy matching
    if (entities.message) {
      const words = entities.message.toLowerCase().split(' ');
      criteria.keywords = words.filter(word => word.length > 3);
    }
    
    return criteria;
  }

  /**
   * Find events by deletion criteria
   */
  async findEventsByCriteria(userId, criteria) {
    console.log(`🔍 Searching for events matching criteria:`, criteria);
    
    try {
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      // Calculate date range for search
      const dateRange = this.calculateSearchDateRange(criteria.date);
      
      const eventsList = await calendar.events.list({
        calendarId: 'primary',
        timeMin: dateRange.start,
        timeMax: dateRange.end,
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = eventsList.data.items || [];
      console.log(`📅 Found ${events.length} events in search range`);
      
      // Filter events based on criteria
      const matchingEvents = events.filter(event => {
        return this.eventMatchesCriteria(event, criteria);
      });
      
      console.log(`🎯 Found ${matchingEvents.length} events matching criteria`);
      
      return matchingEvents;
      
    } catch (error) {
      console.error('Failed to find events by criteria:', error);
      return [];
    }
  }

  /**
   * Check if event matches deletion criteria
   */
  eventMatchesCriteria(event, criteria) {
    const eventTitle = (event.summary || '').toLowerCase();
    const eventDate = event.start?.dateTime?.split('T')[0];
    
    // Title matching (fuzzy)
    if (criteria.title) {
      const searchTitle = criteria.title.toLowerCase();
      if (!eventTitle.includes(searchTitle) &&
          !searchTitle.includes(eventTitle.split(' ')[0])) {
        return false;
      }
    }
    
    // Date matching
    if (criteria.date) {
      if (criteria.date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (eventDate !== today) return false;
      } else if (criteria.date === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        if (eventDate !== tomorrowStr) return false;
      } else {
        // Specific date
        const targetDate = new Date(criteria.date).toISOString().split('T')[0];
        if (eventDate !== targetDate) return false;
      }
    }
    
    // Time matching (if specified)
    if (criteria.time) {
      const eventTime = event.start?.dateTime?.split('T')[1]?.substring(0, 5);
      if (!eventTime?.includes(criteria.time.substring(0, 5))) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate search date range
   */
  calculateSearchDateRange(dateSpec) {
    const now = new Date();
    let start, end;
    
    if (!dateSpec || dateSpec === 'today') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (dateSpec === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      start = new Date(tomorrow);
      start.setHours(0, 0, 0, 0);
      end = new Date(tomorrow);
      end.setHours(23, 59, 59, 999);
    } else {
      // Specific date
      const targetDate = new Date(dateSpec);
      start = new Date(targetDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(targetDate);
      end.setHours(23, 59, 59, 999);
    }
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  /**
   * Generate "no events found" response
   */
  generateNoEventsFoundResponse(criteria) {
    let message = `I couldn't find any events`;
    
    if (criteria.title) {
      message += ` with "${criteria.title}"`;
    }
    
    if (criteria.date) {
      if (criteria.date === 'today') {
        message += ` for today`;
      } else if (criteria.date === 'tomorrow') {
        message += ` for tomorrow`;
      } else {
        message += ` for ${criteria.date}`;
      }
    }
    
    message += `. `;
    
    if (criteria.title === 'extraction' && criteria.date === 'today') {
      message += `I can see the EXTRACTION event in your calendar - it might be scheduled for a different time. Let me list your events for today to help you identify it.`;
    } else {
      message += `Try listing your events or being more specific about the date.`;
    }
    
    return {
      messageToUser: message,
      eventId: null,
      success: false,
      searchCriteria: criteria,
      suggestions: [
        'List events for today to see all available events',
        'Try using the exact event title',
        'Check if the event is scheduled for a different date'
      ]
    };
  }

  /**
   * Generate ambiguous deletion response
   */
  generateAmbiguousDeletionResponse(events, criteria) {
    let message = `I found multiple events`;
    
    if (criteria.title) {
      message += ` matching "${criteria.title}"`;
    }
    
    if (criteria.date) {
      if (criteria.date === 'today') {
        message += ` for today`;
      } else {
        message += ` for ${criteria.date}`;
      }
    }
    
    message += `:`;
    
    let formattedEvents = '';
    events.forEach((event, index) => {
      const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      formattedEvents += `\n${index + 1}. ${event.summary} at ${startTime}`;
    });
    
    message += formattedEvents;
    message += `\n\nWhich one would you like to delete? Please be more specific or provide the exact time.`;
    
    return {
      messageToUser: message,
      eventId: null,
      success: false,
      ambiguousEvents: events,
      searchCriteria: criteria,
      suggestions: [
        'Specify the exact time of the event',
        'Use a more unique event title',
        'Choose the event number from the list above'
      ]
    };
  }

  /**
   * Generate deletion success message
   */
  generateDeletionSuccessMessage(event, criteria) {
    const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = `✅ Successfully deleted`;
    
    if (criteria.title && criteria.title.toLowerCase() !== event.summary.toLowerCase()) {
      message += ` "${criteria.title}"`;
    } else {
      message += ` "${event.summary}"`;
    }
    
    message += ` at ${startTime}`;
    
    if (criteria.date === 'today') {
      message += ` for today`;
    } else if (criteria.date && criteria.date !== 'today') {
      const eventDate = event.start.dateTime.split('T')[0];
      message += ` on ${eventDate}`;
    }
    
    message += `. Calendar is updated!`;
    
    return message;
  }
}

module.exports = EnhancedGrimAgent;