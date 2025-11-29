// Event Operations Module - Main orchestrator class
// Refactored to use modular components
const { SingleEventCreator, MultipleEventCreator, EventCrud, LocationUtils } = require('./event-operations');

/**
 * Calendar event CRUD operations module - Main orchestrator
 * Delegates operations to specialized modular classes
 */
class EventOperations {
  constructor(googleCalendarClient) {
    this.calendarClient = googleCalendarClient;
    
    // Initialize modular components
    this.singleEventCreator = new SingleEventCreator(googleCalendarClient);
    this.multipleEventCreator = new MultipleEventCreator(googleCalendarClient);
    this.eventCrud = new EventCrud(googleCalendarClient);
    this.locationUtils = new LocationUtils();
  }

  /**
   * Creates a single calendar event
   * @param {object} eventDetails - Event details including title, date, time, etc.
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with message and event ID
   */
  async createSingleEvent(eventDetails, userId) {
    return await this.singleEventCreator.createSingleEvent(eventDetails, userId);
  }

  /**
   * Creates multiple calendar events
   * @param {Array} events - Array of event details
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with message about created and failed events
   */
  async createMultipleEvents(events, userId) {
    return await this.multipleEventCreator.createMultipleEvents(events, userId);
  }

  /**
   * Gets calendar events for a specified time range from ALL calendars
   * @param {object} extractedDetails - Extracted details including time_range
   * @param {string} currentDate - Current date in YYYY-MM-DD format
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with formatted schedule message
   */
  async getEvents(extractedDetails, currentDate, userId) {
    return await this.eventCrud.getEvents(extractedDetails, currentDate, userId);
  }

  /**
   * Updates an existing calendar event
   * @param {object} extractedDetails - Extracted details including event_id and fields to update
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with update status message
   */
  async updateEvent(extractedDetails, userId) {
    return await this.eventCrud.updateEvent(extractedDetails, userId);
  }

  /**
   * Deletes a calendar event
   * @param {object} extractedDetails - Extracted details including event_id
   * @param {string} userId - User ID for calendar access
   * @returns {Promise<object>} Result with deletion status message
   */
  async deleteEvent(extractedDetails, userId) {
    return await this.eventCrud.deleteEvent(extractedDetails, userId);
  }

  /**
   * Handles location search using SerpAPI
   * @param {string} locationSearchQuery - The location search query
   * @param {Function} fetch - Fetch function for HTTP requests
   * @returns {Promise<string|null>} The found location or null
   */
  async searchLocation(locationSearchQuery, fetch) {
    return await this.locationUtils.searchLocation(locationSearchQuery, fetch);
  }
}

module.exports = EventOperations;

