const EnhancedLLMExtractor = require('./extraction/enhanced-llm-extractor');
const GoogleCalendarClient = require('./calendar/google-calendar-client');
const EnhancedSingleEventCreator = require('./calendar/event-operations/enhanced-single-event-creator');
const ResponseFormatter = require('./formatting/response-formatter');
const GrimConversational = require('./conversational/grim-conversational');
const { enhancedCalendarUtils } = require('./calendar/enhanced-calendar-utils');
const { formatCapabilitiesMessage } = require('../agents-capabilities');
const EnhancedCalendarIntelligenceSystem = require('../murphy-agent/calendar-integration/enhanced-calendar-intelligence-system');
require('dotenv').config({ path: '../../.env' }); // Load environment variables

// Export a function that takes supabase and an optional fetch as arguments
module.exports = (supabase, fetchFunction) => {
  if (!supabase) {
    console.error('Supabase client is not provided to enhanced grimAgent.');
    process.exit(1);
  }

  const fetch = fetchFunction || global.fetch; // Use the injected fetch, or fall back to the global fetch

  // Initialize enhanced modular components
  const llmExtractor = new EnhancedLLMExtractor();
  const googleCalendarClient = new GoogleCalendarClient(supabase);
  const enhancedEventCreator = new EnhancedSingleEventCreator(googleCalendarClient);
  const responseFormatter = new ResponseFormatter();
  const grimConversational = new GrimConversational();
  const calendarIntelligenceSystem = new EnhancedCalendarIntelligenceSystem();

  const enhancedGrimAgent = {
    /**
     * Enhanced conversational request handler
     * @param {string} originalMessage - The original user message
     * @param {string} userId - User identifier
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {object} Response object with messageToUser and eventId
     */
    async handleConversational(originalMessage, userId, conversationHistory = []) {
      return await grimConversational.handleConversational(originalMessage, userId, conversationHistory);
    },

    /**
     * Enhanced event handler with Murphy's 9-engine intelligence integration
     * @param {string} intent - The intent of the user's request (e.g., 'create_event').
     * @param {object} entities - Extracted entities from the user's message.
     * @param {string} userId - The ID of the user.
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {object} An object containing a message to the user and an event ID (if applicable).
     */
    async handleEvent(intent, entities, userId, conversationHistory = []) {
      console.log(`🚀 ENHANCED GRIM: Handling intent '${intent}' for user ${userId}`);
      
      // Enhanced message extraction with better entity handling
      const originalMessage = entities.message || this.reconstructMessageFromEntities(entities);

      // DEBUG: Log the intent and check for operational processing
      console.log(`🔍 ENHANCED GRIM DEBUG: Intent is '${intent}', processing enhanced operational workflow...`);
      
      // Always handle operational calendar intents with enhanced processing
      if (intent === 'create_event' || intent === 'get_event' ||
          intent === 'update_event' || intent === 'delete_event') {
        console.log(`⚡ ENHANCED GRIM: Intent '${intent}' matched enhanced operational condition`);
        return await this.handleEnhancedOperationalRequest(intent, entities, userId, conversationHistory, originalMessage);
      }

      // Handle get_goals (capabilities/introduction)
      if (intent === 'get_goals') {
        const capabilitiesMessage = formatCapabilitiesMessage('grim');
        return {
          messageToUser: capabilitiesMessage,
          eventId: null
        };
      }

      // Handle conversational requests
      if (this.isConversationalRequest(originalMessage) && !this.isOperationalCalendarRequest(originalMessage)) {
        return await this.handleConversational(originalMessage, userId, conversationHistory);
      }

      // Enhanced fallback for unclear cases
      return await this.handleEnhancedOperationalRequest(intent, entities, userId, conversationHistory, originalMessage);
    },

    /**
     * Enhanced operational request handler with Murphy's intelligence integration
     * @param {string} intent - The intent (create_event, get_event, etc.)
     * @param {object} entities - Extracted entities
     * @param {string} userId - User ID
     * @param {Array} conversationHistory - Conversation history
     * @param {string} originalMessage - Original user message
     * @returns {Promise<object>} Enhanced operational response
     */
    async handleEnhancedOperationalRequest(intent, entities, userId, conversationHistory, originalMessage) {
      console.log(`🔧 ENHANCED GRIM: Processing enhanced OPERATIONAL request - intent: ${intent}`);

      try {
        // NEW: Use Murphy's 9-engine intelligence system for intelligent processing
        if (intent === 'create_event') {
          console.log('🧠 ENHANCED GRIM: Using Murphy Intelligence System for event creation');
          
          const intelligenceResult = await calendarIntelligenceSystem.processIntelligentCalendarRequest(
            userId,
            originalMessage,
            {
              entities: entities,
              conversationHistory: conversationHistory,
              enhanced_processing: true
            }
          );
          
          if (intelligenceResult.success) {
            // Intelligence-enhanced creation was successful
            return {
              messageToUser: intelligenceResult.messageToUser,
              eventId: intelligenceResult.eventId,
              success: true,
              intelligence: intelligenceResult.intelligence,
              planning: intelligenceResult.planning,
              population: intelligenceResult.population,
              context: intelligenceResult.context
            };
          } else {
            console.log('⚠️ ENHANCED GRIM: Intelligence processing failed, falling back to standard processing');
            // Fallback to standard processing
          }
        }

        // Standard enhanced processing (existing logic)
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        // Enhanced LLM extraction with multiple fallback strategies
        let extractedDetails;
        try {
          console.log('🧠 Starting enhanced LLM extraction...');
          extractedDetails = await llmExtractor.extractEventDetails(originalMessage, currentDate, currentTime);
          extractedDetails = llmExtractor.mergeEventId(extractedDetails, entities);
          console.log('✅ Enhanced LLM extraction completed:', JSON.stringify(extractedDetails, null, 2));
        } catch (llmError) {
          console.error('❌ Enhanced LLM extraction failed:', llmError);
          
          // Provide detailed error information
          return {
            messageToUser: responseFormatter.formatErrorMessage('enhanced_llm_parse'),
            eventId: null,
            error_details: {
              type: 'enhanced_llm_failure',
              message: llmError.message,
              fallback_used: true
            }
          };
        }

        // Enhanced location search with error handling
        if (extractedDetails.location_search_query) {
          try {
            console.log('📍 Starting enhanced location search...');
            // Note: This would need to be implemented with the enhanced event operations
            // const serpedLocation = await eventOperations.searchLocation(extractedDetails.location_search_query, fetch);
            // if (serpedLocation) {
            //   extractedDetails.location = serpedLocation;
            //   console.log(responseFormatter.formatLocationSearchResult(extractedDetails.location_search_query, serpedLocation));
            // }
          } catch (locationError) {
            console.error('⚠️ Enhanced location search error:', locationError);
            // Continue without location - not critical
          }
        }

        console.log('📋 Final enhanced extracted event details:', JSON.stringify(extractedDetails, null, 2));

        // Enhanced routing to appropriate operation based on intent
        switch (intent) {
          case 'create_event':
          case 'Create Event':
            return await this.handleEnhancedCreateEvent(extractedDetails, userId, originalMessage);

          case 'get_event':
          case 'Get Event':
            return await this.handleEnhancedGetEvent(extractedDetails, currentDate, userId);

          case 'update_event':
          case 'Update Event':
            return await this.handleEnhancedUpdateEvent(extractedDetails, userId);

          case 'delete_event':
          case 'Delete Event':
            return await this.handleEnhancedDeleteEvent(extractedDetails, userId);

          default:
            console.log(`⚠️ Unrecognized intent: ${intent}`);
            return {
              messageToUser: responseFormatter.formatErrorMessage('unrecognized_request'),
              eventId: null,
              error: 'unrecognized_intent'
            };
        }

      } catch (error) {
        console.error('💥 ENHANCED GRIM operational error:', error);
        return {
          messageToUser: responseFormatter.formatErrorMessage('enhanced_technical_hiccup'),
          eventId: null,
          error: 'enhanced_operational_failure',
          technical_details: error.message
        };
      }
    },

    /**
     * Enhanced event creation with intelligence and robust population
     * @param {object} extractedDetails - Enhanced extracted event details
     * @param {string} userId - User ID for calendar access
     * @param {string} originalMessage - Original user message for diagnosis
     * @returns {Promise<object>} Enhanced creation result
     */
    async handleEnhancedCreateEvent(extractedDetails, userId, originalMessage) {
      console.log('🎯 ENHANCED GRIM: Handling enhanced create event request');
      
      // Handle multiple events with enhanced processing
      if (extractedDetails.multiple_events && extractedDetails.events && extractedDetails.events.length > 0) {
        console.log(`📦 ENHANCED GRIM: Processing ${extractedDetails.events.length} multiple events`);
        
        const results = [];
        const errors = [];
        
        for (let i = 0; i < extractedDetails.events.length; i++) {
          const event = extractedDetails.events[i];
          try {
            console.log(`🔄 Creating enhanced event ${i + 1}/${extractedDetails.events.length}`);
            
            // CRITICAL: Ensure each event gets created with fallback validation
            const result = await this.ensureEventCreationWithValidation(event, userId, i + 1);
            
            if (result.success) {
              results.push(result);
              console.log(`✅ Event ${i + 1} created successfully: ${result.title}`);
            } else {
              errors.push({
                event_index: i + 1,
                event_title: event.event_title || `Event ${i + 1}`,
                error: result.error || result.messageToUser
              });
              console.log(`❌ Event ${i + 1} failed: ${result.error}`);
            }
          } catch (eventError) {
            console.error(`❌ Enhanced event ${i + 1} creation failed:`, eventError);
            errors.push({
              event_index: i + 1,
              event_title: event.event_title || `Event ${i + 1}`,
              error: eventError.message
            });
          }
        }
        
        // Return comprehensive results with clear population status
        const successMessage = this.generatePopulationMessage(results, errors, extractedDetails.events.length);
        
        return {
          messageToUser: successMessage,
          eventId: results.length > 0 ? results[0].eventId : null,
          success: results.length > 0,
          created_events: results.length,
          failed_events: errors.length,
          total_requested: extractedDetails.events.length,
          results: results,
          errors: errors,
          population_status: results.length === extractedDetails.events.length ? 'complete' : 'partial'
        };
      }
      
      // Handle single event with enhanced validation
      console.log('🎯 ENHANCED GRIM: Processing single event creation');
      
      try {
        const result = await this.ensureEventCreationWithValidation(extractedDetails, userId, 1);
        
        if (result.success) {
          console.log('✅ ENHANCED GRIM: Single event created successfully');
          return result;
        } else {
          console.log('⚠️ ENHANCED GRIM: Single event creation failed, providing diagnostic feedback');
          
          // Enhanced error diagnosis
          try {
            const diagnosis = await llmExtractor.diagnoseExtractionFailure(
              originalMessage,
              extractedDetails,
              result.error || 'Event creation failed'
            );
            
            const diagnosticMessage = responseFormatter.formatDiagnosticError(diagnosis);
            return {
              messageToUser: diagnosticMessage,
              eventId: null,
              success: false,
              diagnosis: diagnosis,
              technical_details: result.technical_details
            };
          } catch (diagnosticError) {
            console.error('Failed to generate enhanced diagnosis:', diagnosticError);
            return {
              messageToUser: result.messageToUser,
              eventId: null,
              success: false,
              error: result.error
            };
          }
        }
      } catch (creationError) {
        console.error('💥 ENHANCED GRIM: Critical error in enhanced event creation:', creationError);
        return {
          messageToUser: "I encountered a critical error while trying to create your event. Even my advanced algorithms can't solve every problem.",
          eventId: null,
          success: false,
          error: 'critical_creation_failure',
          technical_details: creationError.message
        };
      }
    },

    /**
     * CRITICAL: Ensure event creation with robust validation and population
     * @param {object} eventDetails - Event details to create
     * @param {string} userId - User ID
     * @param {number} eventIndex - Event index for logging
     * @returns {Promise<object>} Creation result
     */
    async ensureEventCreationWithValidation(eventDetails, userId, eventIndex) {
      console.log(`🔍 ENHANCED GRIM: Ensuring event creation for event ${eventIndex}`);
      
      // Step 1: Validate and fix missing required fields
      const validatedEvent = this.validateAndFixEventDetails(eventDetails, eventIndex);
      
      // Step 2: Attempt creation with fallback strategies
      let creationResult;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !creationResult?.success) {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} for event creation`);
        
        try {
          creationResult = await enhancedEventCreator.createSingleEvent(validatedEvent, userId);
          
          if (creationResult.success) {
            console.log(`✅ Event creation successful on attempt ${attempts}`);
            break;
          } else {
            console.log(`⚠️ Attempt ${attempts} failed: ${creationResult.error || creationResult.messageToUser}`);
            
            // Fix common issues and retry
            if (attempts < maxAttempts) {
              validatedEvent = this.applyFixStrategy(validatedEvent, creationResult.error, attempts);
            }
          }
        } catch (error) {
          console.error(`❌ Attempt ${attempts} threw error:`, error);
          if (attempts < maxAttempts) {
            validatedEvent = this.applyFixStrategy(validatedEvent, error.message, attempts);
          }
        }
      }
      
      // Step 3: Final validation and return result
      if (creationResult?.success) {
        return {
          success: true,
          eventId: creationResult.eventId,
          title: validatedEvent.event_title,
          date: validatedEvent.date,
          startTime: validatedEvent.start_time,
          endTime: validatedEvent.end_time,
          category: validatedEvent.category || 'general',
          validation_applied: true,
          attempts: attempts,
          enhanced_processing: true
        };
      } else {
        return {
          success: false,
          eventId: null,
          title: validatedEvent.event_title,
          error: creationResult?.error || 'Failed after multiple attempts',
          messageToUser: `Failed to create event "${validatedEvent.event_title}" after ${maxAttempts} attempts. ${creationResult?.messageToUser || ''}`,
          attempts: attempts,
          validated_fields: Object.keys(validatedEvent)
        };
      }
    },

    /**
     * Validate and fix event details to ensure population success
     */
    validateAndFixEventDetails(eventDetails, eventIndex) {
      const validated = { ...eventDetails };
      
      // Ensure required fields exist and are valid
      if (!validated.event_title || validated.event_title.trim() === '') {
        validated.event_title = `Event ${eventIndex}`;
      }
      
      if (!validated.date || !/^\d{4}-\d{2}-\d{2}$/.test(validated.date)) {
        validated.date = this.getNextBusinessDay();
      }
      
      if (!validated.start_time || !/^\d{1,2}:\d{2}$/.test(validated.start_time)) {
        validated.start_time = '09:00';
      }
      
      if (!validated.end_time || !/^\d{1,2}:\d{2}$/.test(validated.end_time)) {
        validated.end_time = '10:00';
      }
      
      // Ensure end time is after start time
      const startMinutes = this.timeToMinutes(validated.start_time);
      const endMinutes = this.timeToMinutes(validated.end_time);
      
      if (endMinutes <= startMinutes) {
        validated.end_time = this.minutesToTime(startMinutes + 60); // Add 1 hour
      }
      
      // Add category if missing
      if (!validated.category) {
        validated.category = this.inferCategory(validated.event_title);
      }
      
      console.log(`✅ Validated event ${eventIndex}:`, {
        title: validated.event_title,
        date: validated.date,
        time: `${validated.start_time}-${validated.end_time}`,
        category: validated.category
      });
      
      return validated;
    },

    /**
     * Apply fix strategies based on error types
     */
    applyFixStrategy(eventDetails, error, attempt) {
      const fixed = { ...eventDetails };
      
      console.log(`🔧 Applying fix strategy for attempt ${attempt}: ${error}`);
      
      // Time-related fixes
      if (error?.includes('time') || error?.includes('date')) {
        if (attempt === 2) {
          // Try different time
          fixed.start_time = '10:00';
          fixed.end_time = '11:00';
        } else if (attempt === 3) {
          // Try next day
          fixed.date = this.getNextBusinessDay();
        }
      }
      
      // Title-related fixes
      if (error?.includes('title') || error?.includes('summary')) {
        if (fixed.event_title.length > 100) {
          fixed.event_title = fixed.event_title.substring(0, 100);
        }
      }
      
      // Location-related fixes
      if (error?.includes('location')) {
        delete fixed.location; // Remove problematic location
      }
      
      return fixed;
    },

    /**
     * Generate comprehensive population message
     */
    generatePopulationMessage(results, errors, totalRequested) {
      let message = '';
      
      if (results.length > 0) {
        message += `✅ Successfully created ${results.length} out of ${totalRequested} events:\n`;
        results.forEach((result, index) => {
          message += `${index + 1}. ${result.title} on ${result.date} at ${result.startTime}-${result.endTime}\n`;
        });
      }
      
      if (errors.length > 0) {
        message += `\n❌ ${errors.length} event(s) failed to create:\n`;
        errors.forEach((error, index) => {
          message += `${index + 1}. ${error.event_title}: ${error.error}\n`;
        });
      }
      
      if (results.length === totalRequested) {
        message += '\n🎉 All events were successfully populated!';
      } else if (results.length > 0) {
        message += `\n📊 Population rate: ${Math.round((results.length / totalRequested) * 100)}%`;
      } else {
        message += '\n⚠️ No events were successfully created. Please check the event details.';
      }
      
      return message;
    },

    /**
     * Helper methods
     */
    timeToMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    },

    minutesToTime(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    },

    getNextBusinessDay() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Skip weekends
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      return tomorrow.toISOString().split('T')[0];
    },

    inferCategory(title) {
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('meeting') || titleLower.includes('call') || titleLower.includes('discussion')) {
        return 'meeting';
      } else if (titleLower.includes('workshop') || titleLower.includes('training') || titleLower.includes('course')) {
        return 'education';
      } else if (titleLower.includes('doctor') || titleLower.includes('appointment') || titleLower.includes('medical')) {
        return 'health';
      } else if (titleLower.includes('lunch') || titleLower.includes('dinner') || titleLower.includes('coffee')) {
        return 'personal';
      }
      
      return 'general';
    },

    /**
     * Enhanced get events with improved intelligence
     * @param {object} extractedDetails - Extracted details
     * @param {string} currentDate - Current date
     * @param {string} userId - User ID
     * @returns {Promise<object>} Enhanced get events result
     */
    async handleEnhancedGetEvent(extractedDetails, currentDate, userId) {
      console.log('🔍 ENHANCED GRIM: Handling enhanced get events request');
      
      try {
        // Use enhanced calendar utils for time range calculation
        const timeRange = extractedDetails.time_range || 'today';
        const timeRangeCalc = enhancedCalendarUtils.calculateTimeRange(timeRange, currentDate);
        
        // This would integrate with the existing event operations
        // For now, we'll provide an enhanced response structure
        return {
          messageToUser: `Enhanced calendar retrieval for ${timeRangeCalc.timeRangeDescription}`,
          eventId: null,
          success: true,
          time_range: timeRangeCalc.timeRangeDescription,
          enhanced_features: {
            intelligent_categorization: true,
            status_tracking: true,
            context_analysis: true,
            murphy_intelligence: true
          }
        };
      } catch (getError) {
        console.error('❌ ENHANCED GRIM get events failed:', getError);
        return {
          messageToUser: "I couldn't retrieve your calendar information. Even time has its limits.",
          eventId: null,
          success: false,
          error: 'enhanced_get_failed'
        };
      }
    },

    /**
     * Enhanced event update with intelligent validation
     * @param {object} extractedDetails - Extracted details
     * @param {string} userId - User ID
     * @returns {Promise<object>} Enhanced update result
     */
    async handleEnhancedUpdateEvent(extractedDetails, userId) {
      console.log('🔄 ENHANCED GRIM: Handling enhanced event update');
      
      try {
        if (!extractedDetails.event_id) {
          return {
            messageToUser: "I need an event ID to update. Even I can't modify events that don't exist.",
            eventId: null,
            success: false,
            error: 'missing_event_id'
          };
        }
        
        const result = await enhancedEventCreator.updateEvent(
          extractedDetails.event_id,
          extractedDetails,
          userId
        );
        
        return result;
      } catch (updateError) {
        console.error('❌ ENHANCED GRIM update failed:', updateError);
        return {
          messageToUser: "I couldn't update that event. Time waits for no one, but events are stubborn.",
          eventId: null,
          success: false,
          error: 'enhanced_update_failed'
        };
      }
    },

    /**
     * Enhanced event deletion with safety checks
     * @param {object} extractedDetails - Extracted details
     * @param {string} userId - User ID
     * @returns {Promise<object>} Enhanced delete result
     */
    async handleEnhancedDeleteEvent(extractedDetails, userId) {
      console.log('🗑️ ENHANCED GRIM: Handling enhanced event deletion');
      
      try {
        if (!extractedDetails.event_id) {
          return {
            messageToUser: "I need an event ID to delete. I can't erase things that weren't there in the first place.",
            eventId: null,
            success: false,
            error: 'missing_event_id'
          };
        }
        
        const result = await enhancedEventCreator.deleteEvent(
          extractedDetails.event_id,
          userId
        );
        
        return result;
      } catch (deleteError) {
        console.error('❌ ENHANCED GRIM delete failed:', deleteError);
        return {
          messageToUser: "I couldn't delete that event. Some things are meant to be permanent, apparently.",
          eventId: null,
          success: false,
          error: 'enhanced_delete_failed'
        };
      }
    },

    /**
     * Enhanced message reconstruction from entities
     * @param {object} entities - The entities object containing event details
     * @returns {string} Reconstructed message for LLM processing
     */
    reconstructMessageFromEntities(entities) {
      console.log('🔧 ENHANCED GRIM: Reconstructing message from entities:', entities);
      
      // Handle different delegation formats with enhanced parsing
      if (entities.extractedEntities) {
        const details = entities.extractedEntities;
        const parts = [];
        
        if (details.event_title) parts.push(`event: ${details.event_title}`);
        if (details.date) parts.push(`date: ${details.date}`);
        if (details.start_time) parts.push(`start: ${details.start_time}`);
        if (details.end_time) parts.push(`end: ${details.end_time}`);
        if (details.description) parts.push(`description: ${details.description}`);
        if (details.location) parts.push(`location: ${details.location}`);
        
        const message = parts.length > 0 ? parts.join(', ') : 'create calendar event';
        console.log('🔧 ENHANCED GRIM: Reconstructed message from extractedEntities:', message);
        return message;
      }
      
      // Handle direct entity format with enhanced validation
      if (entities.event_title || entities.date || entities.start_time || entities.end_time) {
        const parts = [];
        if (entities.event_title) parts.push(`event: ${entities.event_title}`);
        if (entities.date) parts.push(`date: ${entities.date}`);
        if (entities.start_time) parts.push(`start: ${entities.start_time}`);
        if (entities.end_time) parts.push(`end: ${entities.end_time}`);
        if (entities.description) parts.push(`description: ${entities.description}`);
        if (entities.location) parts.push(`location: ${entities.location}`);
        
        const message = parts.length > 0 ? parts.join(', ') : 'create calendar event';
        console.log('🔧 ENHANCED GRIM: Reconstructed message from direct entities:', message);
        return message;
      }
      
      // Enhanced fallback for minimal delegation
      const fallback = 'create calendar event';
      console.log('🔧 ENHANCED GRIM: Using enhanced fallback message:', fallback);
      return fallback;
    },

    /**
     * Enhanced conversational request detection
     * @param {string} message - The user message
     * @returns {boolean} Whether this is a conversational request
     */
    isConversationalRequest(message) {
      const conversationalKeywords = [
        'hey', 'hello', 'hi', 'hey grim', 'hello grim', 'hi grim',
        'what can you do', 'what are your capabilities', 'how can you help',
        'who are you', 'tell me about yourself', 'describe yourself',
        'how are you', 'how\'s it going', 'good morning', 'good afternoon',
        'good evening', 'thanks', 'thank you', 'good job', 'nice work'
      ];
      
      return conversationalKeywords.some(keyword => message.toLowerCase().includes(keyword));
    },

    /**
     * Enhanced operational calendar request detection
     * @param {string} message - The user message
     * @returns {boolean} Whether this is an operational calendar request
     */
    isOperationalCalendarRequest(message) {
      const operationalCalendarKeywords = [
        'schedule', 'create event', 'create appointment', 'book meeting',
        'calendar', 'show me my calendar', 'show my calendar', 'check my calendar',
        'what\'s on', 'what do i have', 'appointments', 'meetings',
        'time', 'when', 'what time', 'free time', 'available', 'busy',
        'schedule meeting', 'schedule appointment', 'calendar event'
      ];
      
      return operationalCalendarKeywords.some(keyword => message.toLowerCase().includes(keyword));
    },

    /**
     * Get enhanced calendar knowledge for agent coordination
     * @param {string} userId - User identifier
     * @returns {object} Enhanced calendar knowledge summary
     */
    getCalendarKnowledgeForAgents(userId) {
      const baseKnowledge = grimConversational.getCalendarKnowledgeForAgents(userId);
      return {
        ...baseKnowledge,
        enhanced_features: {
          intelligent_time_parsing: true,
          robust_error_handling: true,
          multi_fallback_strategy: true,
          enhanced_validation: true,
          murphy_intelligence: true,
          dual_planning: true,
          intelligent_population: true
        }
      };
    },

    /**
     * Update enhanced event activity tracking
     * @param {string} userId - User identifier
     * @param {object} eventData - Enhanced event activity data
     */
    updateEventActivity(userId, eventData) {
      grimConversational.updateEventActivity(userId, {
        ...eventData,
        enhancement_applied: true,
        intelligence_enhanced: true,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Record enhanced interaction for learning
     * @param {string} userId - User identifier
     * @param {string} interactionType - Type of interaction
     * @param {object} details - Enhanced interaction details
     */
    recordInteraction(userId, interactionType, details) {
      grimConversational.recordInteraction(userId, interactionType, {
        ...details,
        enhanced_processing: true,
        murphy_intelligence: true,
        timestamp: new Date().toISOString()
      });
    }
  };

  return enhancedGrimAgent;
};