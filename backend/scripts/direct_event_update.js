// Direct event update script to fix the "Break Time" event title
require('dotenv').config({ path: __dirname + '/../.env' });
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

async function updateBreakTimeEvent() {
  console.log('Updating Break Time event title to Lunch Break...\n');
  
  // Initialize Supabase client
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  // User ID (from previous logs)
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  const eventId = 'jago05e60vs4689d4bdqehulm0'; // The "Break Time" event ID
  
  try {
    // Get Google Calendar credentials from Supabase
    const { data: integrationData, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();

    if (integrationError || !integrationData) {
      throw new Error('Google Calendar credentials not found for user.');
    }

    const { access_token, refresh_token, expiry_date } = integrationData.credentials;

    // Set up Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/v1/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Update the event title
    const eventResource = {
      summary: '🍽️ Lunch Break', // New title with emoji
    };

    console.log(`Updating event ${eventId} with new title: ${eventResource.summary}`);
    
    const result = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      resource: eventResource,
    });

    console.log('\n✅ Event updated successfully!');
    console.log('Event Details:');
    console.log('- ID:', result.data.id);
    console.log('- Title:', result.data.summary);
    console.log('- Start:', result.data.start.dateTime);
    console.log('- End:', result.data.end.dateTime);
    console.log('- Location:', result.data.location || 'None');
    
    return {
      success: true,
      event: result.data,
      message: `Successfully updated "Break Time" event to "${eventResource.summary}"`
    };

  } catch (error) {
    console.error('❌ Error updating event:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update the event. Please check the console for details.'
    };
  }
}

// Run the update
updateBreakTimeEvent().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('FINAL RESULT:');
  console.log('='.repeat(50));
  console.log(result.message);
  console.log('='.repeat(50));
  
  if (result.success) {
    console.log('\n🎉 SUCCESS: Your "Break Time" event has been updated to "🍽️ Lunch Break"!');
    console.log('The event will now appear with the new title in your Google Calendar.');
  } else {
    console.log('\n❌ FAILED: The event could not be updated.');
    console.log('Error:', result.error);
  }
}).catch(console.error);
