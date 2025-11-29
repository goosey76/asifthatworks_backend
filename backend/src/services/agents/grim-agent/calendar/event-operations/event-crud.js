// Event CRUD operations module
const ResponseRandomizer = require("../../../../response-randomizer");
const ResponseFormatter = require('../../formatting/response-formatter');
const calendarUtils = require('../calendar-utils');

/**
 * Handles calendar event CRUD operations (Create, Read, Update, Delete)
 */
class EventCrud {
  constructor(googleCalendarClient) {
    this.responseRandomizer = new ResponseRandomizer();
    this.responseFormatter = new ResponseFormatter();
    this.calendarClient = googleCalendarClient;
    this.calendarUtils = calendarUtils;
  }

  /**
   * Gets calendar events for a specified time range from ALL calendars
   * @param {object} extractedDetails - Extracted details including time_range
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with formatted schedule message
   */
  async getEvents(extractedDetails, currentDate, userId) {
    const calendarClients = await this.calendarClient.getAllCalendarClients(userId);
    
    const { timeMin, timeMax, timeRangeDescription } = this.calendarUtils.calculateTimeRange(
      extractedDetails.time_range, 
      currentDate
    );

    const timeMinUTC = new Date(timeMin).toISOString();
    const timeMaxUTC = new Date(timeMax).toISOString();

    let allEvents = [];
    
    // Get events from all calendars
    for (const [calendarId, calendarInfo] of Object.entries(calendarClients)) {
      try {
        const res = await calendarInfo.client.events.list({
          calendarId: calendarId,
          timeMin: timeMinUTC,
          timeMax: timeMaxUTC,
          singleEvents: true,
          orderBy: 'startTime',
        });
        
        if (res.data.items && res.data.items.length > 0) {
          // Add calendar info to each event
          const eventsWithCalendarInfo = res.data.items.map(event => ({
            ...event,
            calendarName: calendarInfo.name,
            calendarColor: calendarInfo.color,
            isPrimary: calendarInfo.isPrimary
          }));
          
          allEvents = allEvents.concat(eventsWithCalendarInfo);
        }
      } catch (error) {
        console.error(`Error fetching events from calendar ${calendarInfo.name}:`, error);
        // Continue with other calendars even if one fails
      }
    }

    // Sort all events by start time
    allEvents.sort((a, b) => {
      const aStart = a.start.dateTime || a.start.date;
      const bStart = b.start.dateTime || b.start.date;
      return new Date(aStart) - new Date(bStart);
    });

    // Format events into a clean schedule format grouped by calendar
    let scheduleMessage = `Grim here:\n\n📅 Your Complete Schedule - ${timeRangeDescription}\n\n`;
    
    if (allEvents.length) {
      // Group events by calendar
      const eventsByCalendar = {};
      allEvents.forEach(event => {
        const calendarName = event.calendarName || 'Unknown Calendar';
        if (!eventsByCalendar[calendarName]) {
          eventsByCalendar[calendarName] = [];
        }
        eventsByCalendar[calendarName].push(event);
      });

      // Display events organized by calendar (without asterisks)
      let eventNumber = 1;
      for (const [calendarName, events] of Object.entries(eventsByCalendar)) {
        scheduleMessage += `📅 ${calendarName}\n`;
        
        events.forEach((event) => {
          const formattedEvent = this.calendarUtils.formatEventForDisplay(
            event, 
            eventNumber, 
            timeRangeDescription
          );
          scheduleMessage += `${formattedEvent}\n`;
          eventNumber++;
        });
        
        scheduleMessage += '\n';
      }
    } else {
      scheduleMessage += `No events scheduled for ${timeRangeDescription}, Sir.\n`;
    }
    
    // Add characteristic Grim comment based on schedule
    let grimComment = '';
    if (allEvents.length > 0) {
      const now = new Date();
      const upcomingEvents = allEvents.filter(event => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        return eventStart > now;
      });
      
      if (upcomingEvents.length === 0) {
        grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);
      } else if (upcomingEvents.length <= 2) {
        grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);
      } else if (upcomingEvents.length <= 4) {
        grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);
      } else {
        grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);
      }
    } else {
      grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);
    }
    
    scheduleMessage += grimComment;
    
    return { messageToUser: scheduleMessage, eventId: null };
  }

  /**
   * Updates an existing calendar event
   * @param {object} extractedDetails - Extracted details including event_id and fields to update
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with update status message
   */
  async updateEvent(extractedDetails, userId) {
    if (!extractedDetails.event_id) {
      return { 
        messageToUser: "I need the event ID to update anything. Specificity is crucial.", 
        eventId: null 
      };
    }

    const calendar = await this.calendarClient.getCalendarClient(userId);
    
    const eventResource = {};
    if (extractedDetails.event_title) eventResource.summary = extractedDetails.event_title;
    if (extractedDetails.description) eventResource.description = extractedDetails.description;
    if (extractedDetails.location) eventResource.location = extractedDetails.location;
    
    if (extractedDetails.date && extractedDetails.start_time && extractedDetails.end_time) {
      const { start, end } = this.calendarUtils.parseStartEndDateTime(
        extractedDetails.date,
        extractedDetails.start_time,
        extractedDetails.end_time
      );
      if (start) eventResource.start = start;
      if (end) eventResource.end = end;
    }

    if (Object.keys(eventResource).length === 0) {
      return { 
        messageToUser: "I need something specific to update. Vague suggestions don't work in my world.", 
        eventId: null 
      };
    }

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: extractedDetails.event_id,
      resource: eventResource,
    });

    return { 
      messageToUser: "Event updated successfully. Time bends to your will, apparently.", 
      eventId: extractedDetails.event_id 
    };
  }

  /**
   * Deletes a calendar event
   * @param {object} extractedDetails - Extracted details including event_id
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with deletion status message
   */
  async deleteEvent(extractedDetails, userId) {
    if (!extractedDetails.event_id) {
      return { 
        messageToUser: "I need the event ID to delete anything. Help me help you.", 
        eventId: null 
      };
    }

    const calendar = await this.calendarClient.getCalendarClient(userId);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: extractedDetails.event_id,
    });

    return { 
      messageToUser: "Event deleted successfully. Time moves forward, and so do we.", 
      eventId: extractedDetails.event_id 
    };
  }
}

module.exports = EventCrud;