// Multiple events creation module
const ResponseRandomizer = require("../../../../response-randomizer");
const ResponseFormatter = require('../../formatting/response-formatter');
const calendarUtils = require('../calendar-utils');

/**
 * Handles multiple calendar events creation
 */
class MultipleEventCreator {
  constructor(googleCalendarClient) {
    this.responseRandomizer = new ResponseRandomizer();
    this.responseFormatter = new ResponseFormatter();
    this.calendarClient = googleCalendarClient;
    this.calendarUtils = calendarUtils;
  }

  /**
   * Creates multiple calendar events
   * @param {Array} events - Array of event details
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with message about created and failed events
   */
  async createMultipleEvents(events, userId) {
    console.log(`🔍 GRIM: Starting multiple event creation for ${events.length} events`);
    console.log('📋 Events to create:', JSON.stringify(events, null, 2));
    
    const calendar = await this.calendarClient.getCalendarClient(userId);
    const createdEvents = [];
    const failedEvents = [];
    
    // Enhanced validation for all events before processing
    for (let i = 0; i < events.length; i++) {
      const eventDetails = events[i];
      console.log(`🔍 Validating event ${i + 1}:`, eventDetails);
      
      // Check required fields for each event
      if (!eventDetails.event_title) {
        console.log(`❌ Event ${i + 1} failed: missing event_title`);
        failedEvents.push(`"Event ${i + 1}" (missing title)`);
        continue;
      }
      if (!eventDetails.date) {
        console.log(`❌ Event ${i + 1} failed: missing date`);
        failedEvents.push(`"${eventDetails.event_title}" (missing date)`);
        continue;
      }
      if (!eventDetails.start_time) {
        console.log(`❌ Event ${i + 1} failed: missing start_time`);
        failedEvents.push(`"${eventDetails.event_title}" (missing start time)`);
        continue;
      }
      if (!eventDetails.end_time) {
        console.log(`❌ Event ${i + 1} failed: missing end_time`);
        failedEvents.push(`"${eventDetails.event_title}" (missing end time)`);
        continue;
      }
      
      console.log(`✅ Event ${i + 1} validation passed`);
    }
    
    // If all events failed validation, return early
    if (createdEvents.length === 0 && failedEvents.length === events.length) {
      return {
        messageToUser: `None of the ${events.length} events could be created due to missing information. Please provide complete details for each event (title, date, start time, end time).`,
        eventId: null
      };
    }
    
    console.log(`🔄 Processing ${events.length} events...`);
    
    for (let i = 0; i < events.length; i++) {
      const eventDetails = events[i];
      
      try {
        if (eventDetails.event_title && eventDetails.date && eventDetails.start_time && eventDetails.end_time) {
          const { start, end } = this.calendarUtils.parseStartEndDateTime(
            eventDetails.date,
            eventDetails.start_time,
            eventDetails.end_time
          );
          
          if (!start || !end) {
            failedEvents.push(`"${eventDetails.event_title}" (invalid time)`);
            continue;
          }
          
          // Check for duplicates
          const timeMinUTC = new Date(start.dateTime).toISOString();
          const timeMaxUTC = new Date(end.dateTime).toISOString();
          
          const existingEventsRes = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMinUTC,
            timeMax: timeMaxUTC,
            singleEvents: true,
            orderBy: 'startTime',
          });
          const existingEvents = existingEventsRes.data.items;
          
          const duplicateEvent = existingEvents.find(event =>
            event.summary === eventDetails.event_title &&
            event.start.dateTime === start.dateTime &&
            event.end.dateTime === end.dateTime &&
            (eventDetails.location ? event.location === eventDetails.location : !event.location)
          );
          
          if (duplicateEvent) {
            failedEvents.push(`"${eventDetails.event_title}" (already exists)`);
            continue;
          }
          
          // Create the event
          const eventResource = {
            summary: eventDetails.event_title,
            description: eventDetails.description || '',
            location: eventDetails.location || '',
            start: start,
            end: end,
          };
          
          const event = await calendar.events.insert({
            calendarId: 'primary',
            resource: eventResource,
          });
          
          createdEvents.push({
            title: eventDetails.event_title,
            time: `${eventDetails.start_time}-${eventDetails.end_time}`,
            id: event.data.id
          });
          
        } else {
          failedEvents.push(`"${eventDetails.event_title || 'Unknown Event'}" (missing details)`);
        }
      } catch (eventError) {
        console.error(`Error creating event ${i + 1}:`, eventError);
        failedEvents.push(`"${eventDetails.event_title || 'Unknown Event'}" (system error)`);
      }
    }
    
    // Format enhanced response message with better formatting
    let responseMessage;
    if (createdEvents.length === 1) {
      responseMessage = `✅ Successfully created 1 event:\n${createdEvents[0].title} at ${createdEvents[0].time}`;
    } else if (createdEvents.length > 1) {
      responseMessage = `✅ Successfully created ${createdEvents.length} events:\n`;
      createdEvents.forEach((event, index) => {
        responseMessage += `${index + 1}. ${event.title} at ${event.time}\n`;
      });
    } else {
      responseMessage = `❌ No events were created successfully`;
    }
    
    if (failedEvents.length > 0) {
      responseMessage += `\n\n❌ ${failedEvents.length} event(s) failed:\n• ${failedEvents.join('\n• ')}`;
    }
    
    console.log(`📊 Final results: ${createdEvents.length} created, ${failedEvents.length} failed`);
    responseMessage += '.';
    
    return { messageToUser: responseMessage, eventId: null };
  }
}

module.exports = MultipleEventCreator;