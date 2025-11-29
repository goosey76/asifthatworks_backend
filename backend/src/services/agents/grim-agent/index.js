// agents/grim-agent/index.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Enhanced GRIM agent with Dynamic Intelligence
const EnhancedGrimAgent = require('./enhanced-grim-agent');
const grimAgentInstance = new EnhancedGrimAgent(supabase);

const grimAgent = {
  /**
   * Main entry point for Enhanced Grim agent with Dynamic Intelligence
   * Handles calendar-related requests with real-time learning
   */
  async handleCalendarIntent(intent, entities, userId, conversationHistory = []) {
    console.log('Enhanced Grim Agent: Handling calendar intent with dynamic intelligence:', intent);
    return await grimAgentInstance.handleEventOperation(intent, entities, userId, conversationHistory);
  },

  /**
   * Create new calendar event with intelligent adaptation
   */
  async createEvent(eventDetails, userId) {
    console.log('Enhanced Grim Agent: Creating calendar event with intelligence');
    return await grimAgentInstance.handleEventOperation('create_event', eventDetails, userId, []);
  },

  /**
   * Get calendar events with intelligent context
   */
  async getEvents(dateRange, userId) {
    console.log('Enhanced Grim Agent: Getting calendar events with intelligence');
    return await grimAgentInstance.handleEventOperation('get_events', dateRange, userId, []);
  },

  /**
   * Update existing calendar event with intelligent suggestions
   */
  async updateEvent(eventId, updates, userId) {
    console.log('Enhanced Grim Agent: Updating calendar event with intelligence:', eventId);
    return await grimAgentInstance.handleEventOperation('update_event', { eventId, ...updates }, userId, []);
  },

  /**
   * Delete calendar event with intelligent confirmation
   */
  async deleteEvent(eventId, userId) {
    console.log('Enhanced Grim Agent: Deleting calendar event with intelligence:', eventId);
    return await grimAgentInstance.handleEventOperation('delete_event', { eventId }, userId, []);
  },

  /**
   * Get user's calendar list with intelligent enhancement
   */
  async listCalendars(userId) {
    console.log('Enhanced Grim Agent: Listing calendars with intelligence');
    return await grimAgentInstance.handleEventOperation('list_calendars', {}, userId, []);
  },

  /**
   * Analyze calendar behavior patterns
   */
  async analyzeUserBehavior(userId) {
    console.log('Enhanced Grim Agent: Analyzing user behavior patterns');
    return await grimAgentInstance.dynamicIntelligence.analyzeCalendarBehavior(userId);
  },

  /**
   * Get intelligent response suggestions
   */
  async getIntelligentSuggestions(userId, intent, entities) {
    console.log('Enhanced Grim Agent: Getting intelligent suggestions');
    return await grimAgentInstance.dynamicIntelligence.generateIntelligentResponse(userId, intent, entities);
  }
};

module.exports = grimAgent;
