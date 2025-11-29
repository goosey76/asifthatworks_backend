// Enhanced Single event creation module with intelligent error handling
const ResponseRandomizer = require("../../../../response-randomizer");
const ResponseFormatter = require('../../formatting/response-formatter');
const { enhancedCalendarUtils } = require('../enhanced-calendar-utils');

/**
 * Enhanced single calendar event creation with robust error handling
 */
class EnhancedSingleEventCreator {
  constructor(googleCalendarClient) {
    this.responseRandomizer = new ResponseRandomizer();
    this.responseFormatter = new ResponseFormatter();
    this.calendarClient = googleCalendarClient;
    this.calendarUtils = enhancedCalendarUtils;
  }

  /**
   * Creates a single calendar event with enhanced error handling
   * @param {object} eventDetails - Event details including title, date, time, etc.
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with message and event ID
   */
  async createSingleEvent(eventDetails, userId) {
    console.log('🆕 Enhanced Single Event Creator starting...');
    console.log('📋 Event details:', JSON.stringify(eventDetails, null, 2));
    
    try {
      // Step 1: Clean and validate event details
      const cleanedDetails = this.calendarUtils.cleanEventDetails(eventDetails);
      console.log('🧹 Cleaned event details:', JSON.stringify(cleanedDetails, null, 2));
      
      // Step 2: Final validation
      if (!this.isValidEventForCreation(cleanedDetails)) {
        return {
          messageToUser: "I need valid details to schedule this. Time zones don't lie, and neither should you.",
          eventId: null,
          error: 'invalid_event_details'
        };
      }
      
      // Step 3: Get calendar client
      console.log('📅 Getting calendar client for user:', userId);
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      // Step 4: Parse date and time with enhanced validation
      const { start, end } = this.calendarUtils.parseStartEndDateTime(
        cleanedDetails.date,
        cleanedDetails.start_time,
        cleanedDetails.end_time,
        "60 minutes" // Default 1 hour duration
      );

      if (!start || !end) {
        console.log('❌ Failed to parse date/time');
        return {
          messageToUser: "I need valid date and time to schedule this. Time zones don't lie, and neither should you.",
          eventId: null,
          error: 'invalid_date_time'
        };
      }

      console.log('✅ Parsed date/time successfully:', { start, end });

      // Step 5: Check for duplicates with enhanced detection
      const duplicateCheck = await this.checkForDuplicates(calendar, cleanedDetails, start, end);
      if (duplicateCheck.isDuplicate) {
        console.log('🔄 Duplicate event detected:', duplicateCheck.existingEvent.id);
        return {
          messageToUser: "That event already exists. Time moves forward, but your calendar refuses to duplicate.",
          eventId: duplicateCheck.existingEvent.id,
          warning: 'duplicate_event'
        };
      }

      // Step 6: Create event resource
      const eventResource = this.buildEventResource(cleanedDetails, start, end);
      console.log('🏗️ Event resource built:', JSON.stringify(eventResource, null, 2));

      // Step 7: Insert event with error handling
      const event = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventResource,
      });

      console.log('🎉 Event created successfully:', event.data.id);
      
      return {
        messageToUser: this.generateSuccessMessage(cleanedDetails),
        eventId: event.data.id,
        success: true,
        event: event.data
      };

    } catch (error) {
      console.error('💥 Enhanced single event creation failed:', error);
      return this.handleCreationError(error, eventDetails);
    }
  }

  /**
   * Validate event details for creation
   * @param {object} eventDetails - Event details to validate
   * @returns {boolean} True if valid for creation
   */
  isValidEventForCreation(eventDetails) {
    // Check required fields
    if (!eventDetails.event_title || eventDetails.event_title.trim().length === 0) {
      console.log('❌ Missing event title');
      return false;
    }
    
    // Validate date and time formats
    if (!this.calendarUtils.isValidDate(eventDetails.date)) {
      console.log('❌ Invalid date format:', eventDetails.date);
      return false;
    }
    
    if (!this.calendarUtils.isValidTime(eventDetails.start_time)) {
      console.log('❌ Invalid start time format:', eventDetails.start_time);
      return false;
    }
    
    if (!this.calendarUtils.isValidTime(eventDetails.end_time)) {
      console.log('❌ Invalid end time format:', eventDetails.end_time);
      return false;
    }
    
    // Ensure end time is after start time
    if (!this.calendarUtils.isEndTimeAfterStart(eventDetails.start_time, eventDetails.end_time)) {
      console.log('❌ End time is not after start time');
      return false;
    }
    
    return true;
  }

  /**
   * Check for duplicate events with enhanced detection
   * @param {object} calendar - Google Calendar client
   * @param {object} eventDetails - Event details
   * @param {object} start - Start date/time object
   * @param {object} end - End date/time object
   * @returns {object} Duplicate check result
   */
  async checkForDuplicates(calendar, eventDetails, start, end) {
    try {
      // Expand the search window to catch potential overlaps
      const searchStart = new Date(start.dateTime);
      searchStart.setHours(searchStart.getHours() - 1); // 1 hour before
      
      const searchEnd = new Date(end.dateTime);
      searchEnd.setHours(searchEnd.getHours() + 1); // 1 hour after

      const existingEventsRes = await calendar.events.list({
        calendarId: 'primary',
        timeMin: searchStart.toISOString(),
        timeMax: searchEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const existingEvents = existingEventsRes.data.items || [];
      
      // Enhanced duplicate detection
      for (const existingEvent of existingEvents) {
        if (this.isDuplicateEvent(existingEvent, eventDetails, start, end)) {
          return {
            isDuplicate: true,
            existingEvent: existingEvent,
            matchType: this.getDuplicateMatchType(existingEvent, eventDetails)
          };
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.log('⚠️ Error checking for duplicates:', error.message);
      return { isDuplicate: false, error: error.message };
    }
  }

  /**
   * Check if an existing event is a duplicate
   * @param {object} existingEvent - Existing Google Calendar event
   * @param {object} newEventDetails - New event details
   * @param {object} newStart - New event start time
   * @param {object} newEnd - New event end time
   * @returns {boolean} True if duplicate
   */
  isDuplicateEvent(existingEvent, newEventDetails, newStart, newEnd) {
    // Check title similarity (case-insensitive, ignoring common words)
    const title1 = this.normalizeTitle(existingEvent.summary);
    const title2 = this.normalizeTitle(newEventDetails.event_title);
    
    if (title1 === title2) {
      // Check time overlap
      const existingStart = new Date(existingEvent.start.dateTime);
      const existingEnd = new Date(existingEvent.end.dateTime);
      const newStartTime = new Date(newStart.dateTime);
      const newEndTime = new Date(newEnd.dateTime);
      
      // Check for time overlap
      const hasTimeOverlap = (existingStart < newEndTime) && (newStartTime < existingEnd);
      if (hasTimeOverlap) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Normalize event title for comparison
   * @param {string} title - Event title to normalize
   * @returns {string} Normalized title
   */
  normalizeTitle(title) {
    return (title || '')
      .toLowerCase()
      .replace(/\b(the|a|an)\b/g, '') // Remove articles
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Get the type of duplicate match
   * @param {object} existingEvent - Existing event
   * @param {object} newEventDetails - New event details
   * @returns {string} Match type description
   */
  getDuplicateMatchType(existingEvent, newEventDetails) {
    if (existingEvent.summary === newEventDetails.event_title) {
      return 'exact_title_match';
    }
    return 'similar_title_match';
  }

  /**
   * Build event resource for Google Calendar API
   * @param {object} eventDetails - Cleaned event details
   * @param {object} start - Start date/time object
   * @param {object} end - End date/time object
   * @returns {object} Event resource
   */
  buildEventResource(eventDetails, start, end) {
    const resource = {
      summary: eventDetails.event_title,
      description: eventDetails.description || '',
      start: start,
      end: end,
    };

    // Add location if provided
    if (eventDetails.location && eventDetails.location.trim().length > 0) {
      resource.location = eventDetails.location.trim();
    }

    // Add recurrence if provided
    if (eventDetails.recurrence && eventDetails.recurrence.trim().length > 0) {
      resource.recurrence = [eventDetails.recurrence.trim()];
    }

    // Add extended properties for tracking
    resource.extendedProperties = {
      private: {
        created_by: 'grim_enhanced',
        creation_method: 'enhanced_single_creator',
        fallback_used: eventDetails.fallback_used ? 'true' : 'false'
      }
    };

    return resource;
  }

  /**
   * Generate success message with context
   * @param {object} eventDetails - Event details
   * @returns {string} Success message
   */
  generateSuccessMessage(eventDetails) {
    const responses = [
      `Event created successfully. I assume you'll actually show up this time.`,
      `Scheduled! Your calendar just got a little more organized.`,
      `Event added. Time management: achieved.`,
      `Done! Your schedule is now one event richer.`,
      `Created! Because spontaneity is overrated.`
    ];

    // Add contextual information if available
    let message = this.responseRandomizer.getRandomResponse(responses);
    
    if (eventDetails.fallback_used) {
      message += " (Note: Used intelligent defaults for some details)";
    }

    return message;
  }

  /**
   * Handle creation errors with appropriate user messages
   * @param {Error} error - The error that occurred
   * @param {object} eventDetails - Original event details
   * @returns {object} Error response
   */
  handleCreationError(error, eventDetails) {
    console.error('Creation error details:', {
      message: error.message,
      code: error.code,
      eventDetails: eventDetails
    });

    // Handle specific error types
    if (error.code === 401) {
      return {
        messageToUser: "I need access to your Google Calendar to create events. Please check your permissions.",
        eventId: null,
        error: 'authorization_required'
      };
    }

    if (error.code === 403) {
      return {
        messageToUser: "I don't have permission to create events on your calendar.",
        eventId: null,
        error: 'permission_denied'
      };
    }

    if (error.code === 409) {
      return {
        messageToUser: "There's a scheduling conflict. Try a different time.",
        eventId: null,
        error: 'time_conflict'
      };
    }

    if (error.code >= 500) {
      return {
        messageToUser: "Google Calendar is having issues. Try again in a moment.",
        eventId: null,
        error: 'google_api_error'
      };
    }

    // Generic error handling
    return {
      messageToUser: "I encountered a technical hiccup while handling your calendar request. The universe seems to have conspired against us, but I'll pretend it didn't happen.",
      eventId: null,
      error: 'technical_error',
      technical_details: error.message
    };
  }

  /**
   * Update an existing event with enhanced error handling
   * @param {object} eventId - Event ID to update
   * @param {object} updateDetails - Updated event details
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Update result
   */
  async updateEvent(eventId, updateDetails, userId) {
    console.log('🔄 Enhanced event update starting for:', eventId);
    
    try {
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      // Get existing event
      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      // Merge updates with existing event
      const updatedEvent = { ...existingEvent.data };
      
      if (updateDetails.event_title) {
        updatedEvent.summary = updateDetails.event_title;
      }
      
      if (updateDetails.description !== undefined) {
        updatedEvent.description = updateDetails.description;
      }
      
      if (updateDetails.location !== undefined) {
        updatedEvent.location = updateDetails.location;
      }

      // Handle date/time updates
      if (updateDetails.date || updateDetails.start_time || updateDetails.end_time) {
        const currentDetails = {
          date: updateDetails.date || existingEvent.data.start.dateTime?.split('T')[0],
          start_time: updateDetails.start_time || existingEvent.data.start.dateTime?.split('T')[1]?.substring(0, 5),
          end_time: updateDetails.end_time || existingEvent.data.end.dateTime?.split('T')[1]?.substring(0, 5)
        };

        const { start, end } = this.calendarUtils.parseStartEndDateTime(
          currentDetails.date,
          currentDetails.start_time,
          currentDetails.end_time
        );

        if (start && end) {
          updatedEvent.start = start;
          updatedEvent.end = end;
        }
      }

      // Perform update
      const result = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent
      });

      console.log('✅ Event updated successfully:', result.data.id);

      return {
        messageToUser: "Event updated successfully. Time flies when you're having fun reorganizing.",
        eventId: result.data.id,
        success: true,
        event: result.data
      };

    } catch (error) {
      console.error('❌ Enhanced event update failed:', error);
      return this.handleUpdateError(error, eventId);
    }
  }

  /**
   * Handle update errors
   * @param {Error} error - Update error
   * @param {string} eventId - Event ID that failed to update
   * @returns {object} Error response
   */
  handleUpdateError(error, eventId) {
    if (error.code === 404) {
      return {
        messageToUser: "Event not found. It might have been deleted already.",
        eventId: null,
        error: 'event_not_found'
      };
    }

    return {
      messageToUser: "I couldn't update that event. Time is relative, but calendar errors are not.",
      eventId: null,
      error: 'update_failed'
    };
  }

  /**
   * Delete an event with enhanced error handling
   * @param {string} eventId - Event ID to delete
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Delete result
   */
  async deleteEvent(eventId, userId) {
    console.log('🗑️ Enhanced event deletion starting for:', eventId);
    
    try {
      const calendar = await this.calendarClient.getCalendarClient(userId);
      
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      console.log('✅ Event deleted successfully:', eventId);

      return {
        messageToUser: "Event deleted. Out of sight, out of mind.",
        eventId: eventId,
        success: true
      };

    } catch (error) {
      console.error('❌ Enhanced event deletion failed:', error);
      return this.handleDeleteError(error, eventId);
    }
  }

  /**
   * Handle delete errors
   * @param {Error} error - Delete error
   * @param {string} eventId - Event ID that failed to delete
   * @returns {object} Error response
   */
  handleDeleteError(error, eventId) {
    if (error.code === 404) {
      return {
        messageToUser: "Event not found. It might have been deleted already.",
        eventId: null,
        error: 'event_not_found'
      };
    }

    return {
      messageToUser: "I couldn't delete that event. Some things are meant to be permanent, apparently.",
      eventId: null,
      error: 'delete_failed'
    };
  }
}

module.exports = EnhancedSingleEventCreator;