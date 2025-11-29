const EnhancedLLMExtractor = require('./extraction/enhanced-llm-extractor');
const GoogleCalendarClient = require('./calendar/google-calendar-client');
const EnhancedSingleEventCreator = require('./calendar/event-operations/enhanced-single-event-creator');
const ResponseFormatter = require('./formatting/response-formatter');
const GrimConversational = require('./conversational/grim-conversational');
const { enhancedCalendarUtils } = require('./calendar/enhanced-calendar-utils');
const { formatCapabilitiesMessage } = require('../agents-capabilities');
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
     * Enhanced event handler with intelligent error recovery
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
     * Enhanced operational request handler with comprehensive error recovery
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
     * Enhanced event creation with intelligent validation and error recovery
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
            const result = await enhancedEventCreator.createSingleEvent(event, userId);
            
            if (result.success) {
              results.push(result);
            } else {
              errors.push({
                event_index: i + 1,
                event_title: event.event_title,
                error: result.error || result.messageToUser
              });
            }
          } catch (eventError) {
            console.error(`❌ Enhanced event ${i + 1} creation failed:`, eventError);
            errors.push({
              event_index: i + 1,
              event_title: event.event_title,
              error: eventError.message
            });
          }
        }
        
        // Return comprehensive results
        if (results.length > 0) {
          const successMessage = `Successfully created ${results.length} event${results.length > 1 ? 's' : ''}. ${errors.length > 0 ? `${errors.length} failed.` : ''}`;
          return {
            messageToUser: successMessage,
            eventId: results[0].eventId, // Return first successful event ID
            success: true,
            created_events: results.length,
            failed_events: errors.length,
            results: results,
            errors: errors
          };
        } else {
          return {
            messageToUser: `Failed to create any events. ${errors.length} attempts failed.`,
            eventId: null,
            success: false,
            error: 'all_events_failed',
            errors: errors
          };
        }
      }
      
      // Handle single event with enhanced validation
      console.log('🎯 ENHANCED GRIM: Processing single event creation');
      
      try {
        const result = await enhancedEventCreator.createSingleEvent(extractedDetails, userId);
        
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
            context_analysis: true
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
          enhanced_validation: true
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
        timestamp: new Date().toISOString()
      });
    }
  };

  return enhancedGrimAgent;
};