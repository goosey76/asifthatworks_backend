const LLMExtractor = require('./extraction/llm-extractor');
const GoogleCalendarClient = require('./calendar/google-calendar-client');
const EventOperations = require('./calendar/event-manager');
const ResponseFormatter = require('./formatting/response-formatter');
const GrimConversational = require('./conversational/grim-conversational');
const { formatCapabilitiesMessage } = require('../agents-capabilities');
require('dotenv').config({ path: '../../.env' }); // Load environment variables

// Export a function that takes supabase and an optional fetch as arguments
module.exports = (supabase, fetchFunction) => {
  if (!supabase) {
    console.error('Supabase client is not provided to grimAgent.');
    process.exit(1);
  }

  const fetch = fetchFunction || global.fetch; // Use the injected fetch, or fall back to the global fetch

  // Initialize modular components
  const llmExtractor = new LLMExtractor();
  const googleCalendarClient = new GoogleCalendarClient(supabase);
  const eventOperations = new EventOperations(googleCalendarClient);
  const responseFormatter = new ResponseFormatter();
  const grimConversational = new GrimConversational();

  const grimAgent = {
    /**
     * Handles conversational requests (greetings, casual chat, etc.)
     * @param {string} originalMessage - The original user message
     * @param {string} userId - User identifier
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {object} Response object with messageToUser and eventId
     */
    async handleConversational(originalMessage, userId, conversationHistory = []) {
      return await grimConversational.handleConversational(originalMessage, userId, conversationHistory);
    },

    /**
     * Handles various calendar-related intents (create, get, update, delete events).
     * Uses LLM to extract event details from the original message.
     * @param {string} intent - The intent of the user's request (e.g., 'create_event').
     * @param {object} entities - Extracted entities from the user's message.
     * @param {string} userId - The ID of the user.
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {object} An object containing a message to the user and an event ID (if applicable).
     */
    async handleEvent(intent, entities, userId, conversationHistory = []) {
      console.log(`GRIM Agent FIXED: Handling intent '${intent}' for user ${userId} with entities:`, entities);
      
      // Robust message extraction - handle both direct delegation and conversational scenarios
      const originalMessage = entities.message || this.reconstructMessageFromEntities(entities);

      // DEBUG: Log the intent and check for operational processing
      console.log(`GRIM DEBUG: Intent is '${intent}', checking operational conditions...`);
      
      // Priority 1: Handle operational calendar intents directly (ALWAYS operational)
      if (intent === 'create_event' || intent === 'get_event' ||
          intent === 'update_event' || intent === 'delete_event') {
        console.log(`GRIM DEBUG: Intent '${intent}' matched operational condition - calling handleOperationalRequest`);
        return await this.handleOperationalRequest(intent, entities, userId, conversationHistory, originalMessage);
      }
      console.log(`GRIM DEBUG: Intent '${intent}' did NOT match operational condition - checking other paths`);
      
      // Priority 2: Handle get_goals (capabilities/introduction)
      if (intent === 'get_goals') {
        const capabilitiesMessage = formatCapabilitiesMessage('grim');
        return {
          messageToUser: capabilitiesMessage,
          eventId: null
        };
      }

      // Priority 3: Handle true conversational requests (greetings, casual chat)
      if (this.isConversationalRequest(originalMessage) && !this.isOperationalCalendarRequest(originalMessage)) {
        return await this.handleConversational(originalMessage, userId, conversationHistory);
      }

      // Priority 4: Fallback for unclear cases - default to operational handling
      return await this.handleOperationalRequest(intent, entities, userId, conversationHistory, originalMessage);
    },

    /**
     * Handle operational calendar requests (create, get, update, delete events)
     * @param {string} intent - The intent (create_event, get_event, etc.)
     * @param {object} entities - Extracted entities
     * @param {string} userId - User ID
     * @param {Array} conversationHistory - Conversation history
     * @param {string} originalMessage - Original user message
     * @returns {Promise<object>} Operational response
     */
    async handleOperationalRequest(intent, entities, userId, conversationHistory, originalMessage) {
      console.log(`GRIM Agent: Processing OPERATIONAL request - intent: ${intent}`);

      try {
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        // Extract event details using LLM
        let extractedDetails;
        try {
          extractedDetails = await llmExtractor.extractEventDetails(originalMessage, currentDate, currentTime);
          extractedDetails = llmExtractor.mergeEventId(extractedDetails, entities);
        } catch (llmError) {
          console.error('LLM extraction error:', llmError);
          return {
            messageToUser: responseFormatter.formatErrorMessage('llm_parse'),
            eventId: null
          };
        }

        // Handle location search if needed
        if (extractedDetails.location_search_query) {
          try {
            const serpedLocation = await eventOperations.searchLocation(extractedDetails.location_search_query, fetch);
            if (serpedLocation) {
              extractedDetails.location = serpedLocation;
              console.log(responseFormatter.formatLocationSearchResult(extractedDetails.location_search_query, serpedLocation));
            }
          } catch (locationError) {
            console.error('Location search error:', locationError);
          }
        }

        console.log('Final Extracted event details:', extractedDetails);

        // Route to appropriate operation based on intent
        switch (intent) {
          case 'create_event':
          case 'Create Event':
            return await this.handleCreateEvent(extractedDetails, userId, originalMessage);

          case 'get_event':
          case 'Get Event':
            return await eventOperations.getEvents(extractedDetails, currentDate, userId);

          case 'update_event':
          case 'Update Event':
            return await eventOperations.updateEvent(extractedDetails, userId);

          case 'delete_event':
          case 'Delete Event':
            return await eventOperations.deleteEvent(extractedDetails, userId);

          default:
            return {
              messageToUser: responseFormatter.formatErrorMessage('unrecognized_request'),
              eventId: null
            };
        }

      } catch (error) {
        console.error('GRIM Agent operational error:', error);
        return {
          messageToUser: responseFormatter.formatErrorMessage('technical_hiccup'),
          eventId: null
        };
      }
    },

    /**
     * Handles event creation (single or multiple events)
     * @param {object} extractedDetails - Extracted event details
     * @param {string} userId - User ID for calendar access
     * @param {string} originalMessage - Original user message for diagnosis
     * @returns {Promise<object>} Result with creation status
     */
    async handleCreateEvent(extractedDetails, userId, originalMessage) {
      // Handle multiple events
      if (extractedDetails.multiple_events && extractedDetails.events && extractedDetails.events.length > 0) {
        console.log(`GRIM FIXED: Creating ${extractedDetails.events.length} Google Calendar events.`);
        return await eventOperations.createMultipleEvents(extractedDetails.events, userId);
      }
      
      // Handle single event
      if (extractedDetails.event_title && extractedDetails.date && extractedDetails.start_time && extractedDetails.end_time) {
        return await eventOperations.createSingleEvent(extractedDetails, userId);
      }

      // Missing required details - provide diagnostic feedback
      console.log('Event creation failed - missing details:', extractedDetails);
      
      try {
        const diagnosis = await llmExtractor.diagnoseExtractionFailure(
          originalMessage,
          extractedDetails,
          'Missing required event details'
        );
        
        const diagnosticMessage = responseFormatter.formatDiagnosticError(diagnosis);
        return {
          messageToUser: diagnosticMessage,
          eventId: null,
          diagnosis: diagnosis
        };
      } catch (diagnosticError) {
        console.error('Failed to generate diagnosis:', diagnosticError);
        return {
          messageToUser: responseFormatter.formatErrorMessage('invalid_details'),
          eventId: null
        };
      }
    },
    /**
     * Reconstruct message from entities when original message is not available
     * This handles delegation scenarios where only extracted entities are passed
     * @param {object} entities - The entities object containing event details
     * @returns {string} Reconstructed message for LLM processing
     */
    reconstructMessageFromEntities(entities) {
      console.log('GRIM: Reconstructing message from entities:', entities);
      
      // Handle different delegation formats
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
        console.log('GRIM: Reconstructed message from extractedEntities:', message);
        return message;
      }
      
      // Handle direct entity format
      if (entities.event_title || entities.date || entities.start_time || entities.end_time) {
        const parts = [];
        if (entities.event_title) parts.push(`event: ${entities.event_title}`);
        if (entities.date) parts.push(`date: ${entities.date}`);
        if (entities.start_time) parts.push(`start: ${entities.start_time}`);
        if (entities.end_time) parts.push(`end: ${entities.end_time}`);
        if (entities.description) parts.push(`description: ${entities.description}`);
        if (entities.location) parts.push(`location: ${entities.location}`);
        
        const message = parts.length > 0 ? parts.join(', ') : 'create calendar event';
        console.log('GRIM: Reconstructed message from direct entities:', message);
        return message;
      }
      
      // Fallback for minimal delegation
      const fallback = 'create calendar event';
      console.log('GRIM: Using fallback message:', fallback);
      return fallback;
    },

    /**
     * Check if a message is a conversational request that should be handled by the conversational layer
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
     * Check if a message is an operational calendar request that should NOT be handled by conversational layer
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
     * Get calendar knowledge for agent coordination system
     * @param {string} userId - User identifier
     * @returns {object} Calendar knowledge summary for coordination
     */
    getCalendarKnowledgeForAgents(userId) {
      return grimConversational.getCalendarKnowledgeForAgents(userId);
    },

    /**
     * Update event activity in conversational layer
     * @param {string} userId - User identifier
     * @param {object} eventData - Event activity data
     */
    updateEventActivity(userId, eventData) {
      grimConversational.updateEventActivity(userId, eventData);
    },

    /**
     * Record interaction for learning
     * @param {string} userId - User identifier
     * @param {string} interactionType - Type of interaction
     * @param {object} details - Interaction details
     */
    recordInteraction(userId, interactionType, details) {
      grimConversational.recordInteraction(userId, interactionType, details);
    }
  };

  return grimAgent;
};
