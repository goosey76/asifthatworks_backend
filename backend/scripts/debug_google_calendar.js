#!/usr/bin/env node

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'exists' : 'missing');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'exists' : 'missing');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function debugGoogleCalendarAPI() {
  try {
    console.log('=== Google Calendar API Debug Script ===');
    
    // Get the first user with Google Calendar integration
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*')
      .eq('provider', 'google_calendar')
      .limit(1);

    if (integrationsError || !integrations || integrations.length === 0) {
      console.error('No Google Calendar integrations found:', integrationsError);
      return;
    }

    const integration = integrations[0];
    const userId = integration.user_id;
    const credentials = integration.credentials;

    console.log('User ID:', userId);
    console.log('Credentials keys:', Object.keys(credentials));
    console.log('Access token exists:', !!credentials.access_token);
    console.log('Refresh token exists:', !!credentials.refresh_token);
    console.log('Expiry date:', credentials.expiry_date);

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/v1/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expiry_date: credentials.expiry_date,
    });

    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log('\n=== Testing Calendar API Calls ===');

    // Test 1: Simple list call with minimal parameters
    console.log('\n1. Testing basic events.list()...');
    try {
      const response1 = await calendar.events.list({
        calendarId: 'primary',
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log('✓ Basic list successful, events count:', response1.data.items?.length || 0);
    } catch (error) {
      console.error('✗ Basic list failed:', error.response?.data || error.message);
    }

    // Test 2: List with time range
    console.log('\n2. Testing events.list() with time range...');
    try {
      const now = new Date();
      const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week ahead
      
      console.log('timeMin:', timeMin.toISOString());
      console.log('timeMax:', timeMax.toISOString());

      const response2 = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log('✓ Time range list successful, events count:', response2.data.items?.length || 0);
    } catch (error) {
      console.error('✗ Time range list failed:', error.response?.data || error.message);
    }

    // Test 3: List with specific date (today)
    console.log('\n3. Testing events.list() for today...');
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Start of day:', startOfDay.toISOString());
      console.log('End of day:', endOfDay.toISOString());

      const response3 = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log('✓ Today list successful, events count:', response3.data.items?.length || 0);
    } catch (error) {
      console.error('✗ Today list failed:', error.response?.data || error.message);
    }

    // Test 4: Test event creation (simple)
    console.log('\n4. Testing simple event creation...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      const endTime = new Date(tomorrow);
      endTime.setHours(endTime.getHours() + 1);

      const eventResource = {
        summary: 'Debug Test Event',
        start: {
          dateTime: tomorrow.toISOString(),
          timeZone: 'Europe/Berlin',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Berlin',
        },
      };

      console.log('Event resource:', JSON.stringify(eventResource, null, 2));

      const createResponse = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventResource,
      });
      console.log('✓ Event creation successful, event ID:', createResponse.data.id);

      // Clean up - delete the test event
      if (createResponse.data.id) {
        console.log('Cleaning up test event...');
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: createResponse.data.id,
        });
        console.log('✓ Test event deleted');
      }
    } catch (error) {
      console.error('✗ Event creation failed:', error.response?.data || error.message);
    }

    console.log('\n=== Debug Complete ===');

  } catch (error) {
    console.error('Debug script error:', error);
  }
}

debugGoogleCalendarAPI();
