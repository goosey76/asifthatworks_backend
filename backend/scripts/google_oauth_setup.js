#!/usr/bin/env node

// google_oauth_setup.js - Set up Google Calendar OAuth for the user

const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Use the correct redirect URI that matches the server's callback route
const REDIRECT_URI = 'http://localhost:3000/api/v1/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI  // Use the correct redirect URI
);

// Scopes for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

async function generateOAuthURL() {
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  
  // Generate OAuth URL with the correct redirect URI
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId, // Pass user ID in state for callback
    prompt: 'consent' // Force consent to get refresh token
  });

  console.log('🔗 Google Calendar OAuth Setup - FIXED');
  console.log('===========================================\n');
  console.log('✅ Using correct redirect URI:', REDIRECT_URI);
  console.log('\nPlease follow these steps:\n');
  console.log('1. Open this URL in your browser:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Sign in to your Google account');
  console.log('3. Grant calendar permissions');
  console.log('4. You will be redirected to:', REDIRECT_URI);
  console.log('5. The server will automatically store your tokens');
  console.log('6. You can then test creating events via WhatsApp!\n');
  console.log('🎉 After this, your calendar will work perfectly!');
  console.log('===========================================\n');
  
  return authUrl;
}

async function exchangeAuthCode(authCode) {
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  
  try {
    console.log('Exchanging authorization code for tokens...');
    
    const { tokens } = await oauth2Client.getToken(authCode);
    
    console.log('Tokens received!', {
      access_token: tokens.access_token ? 'Present ✅' : 'Missing ❌',
      expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Missing ❌',
      refresh_token: tokens.refresh_token ? 'Present ✅' : 'Missing ❌'
    });

    // Store tokens in database
    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'google_calendar',
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
          expiry_date: tokens.expiry_date
        }
      }, {
        onConflict: 'user_id,provider'
      });

    if (error) {
      console.error('Error storing tokens:', error);
      return;
    }

    console.log('✅ Google Calendar tokens stored successfully!');
    console.log('Your calendar integration is now active!');
    console.log('You can now test creating events via WhatsApp.');
    
  } catch (error) {
    console.error('Error exchanging code:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Generate OAuth URL
    await generateOAuthURL();
  } else if (args.length === 1) {
    // Exchange authorization code
    const authCode = args[0];
    await exchangeAuthCode(authCode);
  } else {
    console.log('Usage:');
    console.log('1. node google_oauth_setup.js (to get OAuth URL)');
    console.log('2. node google_oauth_setup.js <auth_code> (to exchange code for tokens)');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateOAuthURL, exchangeAuthCode };
