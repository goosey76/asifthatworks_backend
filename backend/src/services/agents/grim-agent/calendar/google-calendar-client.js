// agent-service/google-calendar-client.js

const { google } = require('googleapis');

/**
 * Google Calendar API integration module
 */
class GoogleCalendarClient {
  constructor(supabase) {
    this.supabase = supabase;
    this.google = google;
  }

  /**
   * Retrieves an authenticated Google Calendar client for a given user
   * Fetches credentials from Supabase and handles token refreshing
   * @param {string} userId - The ID of the user
   * @returns {object} An authenticated Google Calendar API client
   * @throws {Error} If Google Calendar credentials are not found for the user
   */
  async getCalendarClient(userId) {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();

    if (error || !data) {
      console.error('Error fetching Google Calendar credentials:', error);
      throw new Error('Google Calendar not connected for this user.');
    }

    const { access_token, refresh_token, expiry_date } = data.credentials;

    const oauth2Client = new this.google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/v1/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    });

    // Refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        console.log('Refresh token obtained, updating Supabase...');
        await this.supabase
          .from('integrations')
          .update({ credentials: { ...data.credentials, ...tokens } })
          .eq('user_id', userId)
          .eq('provider', 'google_calendar');
      }
    });

    return this.google.calendar({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Gets all calendar clients for a given user (primary + all other calendars)
   * @param {string} userId - The ID of the user
   * @returns {object} Object containing all calendar clients
   * @throws {Error} If Google Calendar credentials are not found for the user
   */
  async getAllCalendarClients(userId) {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();

    if (error || !data) {
      console.error('Error fetching Google Calendar credentials:', error);
      throw new Error('Google Calendar not connected for this user.');
    }

    const { access_token, refresh_token, expiry_date } = data.credentials;

    const oauth2Client = new this.google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/v1/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    });

    // Refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        console.log('Refresh token obtained, updating Supabase...');
        await this.supabase
          .from('integrations')
          .update({ credentials: { ...data.credentials, ...tokens } })
          .eq('user_id', userId)
          .eq('provider', 'google_calendar');
      }
    });

    // Get all calendars first
    const calendar = this.google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarsList = await calendar.calendarList.list();
    const allCalendars = calendarsList.data.items;

    // Create calendar clients for each calendar
    const calendarClients = {};
    for (const calendarInfo of allCalendars) {
      const calendarId = calendarInfo.id;
      const calendarName = calendarInfo.summary;
      const calendarColor = calendarInfo.colorId || 'primary';
      
      // Create individual calendar client
      const calendarClient = this.google.calendar({ 
        version: 'v3', 
        auth: oauth2Client 
      });
      
      calendarClients[calendarId] = {
        client: calendarClient,
        name: calendarName,
        color: calendarColor,
        isPrimary: calendarId === 'primary'
      };
    }

    return calendarClients;
  }
}

module.exports = GoogleCalendarClient;
