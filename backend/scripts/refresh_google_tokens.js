#!/usr/bin/env node

// refresh_google_tokens.js - Script to refresh Google Calendar tokens

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/v1/auth/google/callback'
);

async function refreshGoogleTokens() {
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  
  console.log('Fetching current Google Calendar integration...');
  
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_calendar')
    .single();

  if (error || !integration) {
    console.error('Error fetching integration:', error);
    return;
  }

  console.log('Current integration found:', integration.id);

  // Set the refresh token
  oauth2Client.setCredentials({
    refresh_token: integration.credentials.refresh_token
  });

  try {
    console.log('Refreshing Google tokens...');
    const { tokens } = await oauth2Client.refreshAccessToken();
    
    console.log('New tokens received:', {
      access_token: tokens.access_token ? 'Present' : 'Missing',
      expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Missing',
      refresh_token: tokens.refresh_token ? 'Present' : 'Missing'
    });

    // Update the database with new tokens
    const updatedCredentials = {
      ...integration.credentials,
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token })
    };

    const { error: updateError } = await supabase
      .from('integrations')
      .update({ credentials: updatedCredentials })
      .eq('id', integration.id);

    if (updateError) {
      console.error('Error updating tokens:', updateError);
      return;
    }

    console.log('✅ Successfully refreshed and updated Google Calendar tokens!');
    console.log('New expiry date:', new Date(tokens.expiry_date).toLocaleString());
    
  } catch (refreshError) {
    console.error('Error refreshing tokens:', refreshError);
    console.log('\n💡 This might be because:');
    console.log('1. The refresh token has expired or been revoked');
    console.log('2. You need to re-authenticate with Google');
    console.log('\nNext step: Re-run the Google OAuth flow');
  }
}

// Run if called directly
if (require.main === module) {
  refreshGoogleTokens().catch(console.error);
}

module.exports = { refreshGoogleTokens };
