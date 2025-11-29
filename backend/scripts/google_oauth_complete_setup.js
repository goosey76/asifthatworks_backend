#!/usr/bin/env node

// google_oauth_complete_setup.js - Set up Google Calendar + Tasks OAuth for the user

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

// Complete scopes for both Calendar AND Tasks
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly'
];

async function generateOAuthURL() {
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  
  // Generate OAuth URL with the correct redirect URI and both scopes
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId, // Pass user ID in state for callback
    prompt: 'consent' // Force consent to get refresh token
  });

  console.log('🔗 Google OAuth Setup - Calendar + Tasks');
  console.log('===========================================\n');
  console.log('✅ This will grant permissions for:');
  console.log('   📅 Google Calendar (events, scheduling)');
  console.log('   📋 Google Tasks (to-do management)');
  console.log('\n🔗 Using redirect URI:', REDIRECT_URI);
  console.log('\n📋 Please follow these steps:\n');
  console.log('1. Open this URL in your browser:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Sign in to your Google account');
  console.log('3. Grant BOTH calendar AND task permissions');
  console.log('4. You will be redirected to:', REDIRECT_URI);
  console.log('5. The server will automatically store your tokens');
  console.log('6. You can then test both calendar AND tasks via WhatsApp!\n');
  console.log('🎉 After this, JARVI -> GRIM (calendar) AND JARVI -> MURPHY (tasks) will work!');
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
      refresh_token: tokens.refresh_token ? 'Present ✅' : 'Missing ❌',
      scope: tokens.scope
    });

    // Store tokens in database - store as 'google_calendar' for calendar operations
    const { error: calendarError } = await supabase
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

    if (calendarError) {
      console.error('Error storing calendar tokens:', calendarError);
    } else {
      console.log('✅ Google Calendar tokens stored successfully!');
    }

    // Also store as 'google_tasks' for task operations (same tokens, different provider)
    const { error: tasksError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'google_tasks',
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

    if (tasksError) {
      console.error('Error storing tasks tokens:', tasksError);
    } else {
      console.log('✅ Google Tasks tokens stored successfully!');
    }

    console.log('\n🎉 Both Calendar and Tasks integrations are now active!');
    console.log('📅 JARVI -> GRIM (Calendar) will work');
    console.log('📋 JARVI -> MURPHY (Tasks) will work');
    console.log('You can now test both via WhatsApp!\n');
    
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
    console.log('1. node google_oauth_complete_setup.js (to get OAuth URL)');
    console.log('2. node google_oauth_complete_setup.js <auth_code> (to exchange code for tokens)');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateOAuthURL, exchangeAuthCode };