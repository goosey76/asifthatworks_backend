// Single event creation module
const ResponseRandomizer = require("../../../../response-randomizer");
const ResponseFormatter = require('../../formatting/response-formatter');
const calendarUtils = require('../calendar-utils');

/**
 * Handles single calendar event creation
 */
class SingleEventCreator {
  constructor(googleCalendarClient) {
    this.responseRandomizer = new ResponseRandomizer();
    this.responseFormatter = new ResponseFormatter();
    this.calendarClient = googleCalendarClient;
    this.calendarUtils = calendarUtils;
  }

  /**
   * Creates a single calendar event
   * @param {object} eventDetails - Event details including title, date, time, etc.
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with message and event ID
   */
  async createSingleEvent(eventDetails, userId) {
    const calendar = await this.calendarClient.getCalendarClient(userId);
    
    const { start, end } = this.calendarUtils.parseStartEndDateTime(
      eventDetails.date,
      eventDetails.start_time,
      eventDetails.end_time,
      eventDetails.description
    );

    if (!start || !end) {
      return { 
        messageToUser: "I need valid date and time to schedule this. Time zones don't lie, and neither should you.", 
        eventId: null 
      };
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
      return { 
        messageToUser: "That event already exists. Time moves forward, but your calendar refuses to duplicate.", 
        eventId: duplicateEvent.id 
      };
    }

    const eventResource = {
      summary: eventDetails.event_title,
      description: eventDetails.description,
      start: start,
      end: end,
    };

    if (eventDetails.recurrence) {
      eventResource.recurrence = [eventDetails.recurrence];
    }

    const event = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventResource,
    });

    return { 
      messageToUser: "Event created successfully. I assume you'll actually show up this time.", 
      eventId: event.data.id 
    };
  }
}

module.exports = SingleEventCreator;