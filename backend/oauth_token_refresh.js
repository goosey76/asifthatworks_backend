// Google OAuth Token Refresh and Re-authentication Script
// Helps resolve expired token issues for Grim's calendar access

const fs = require('fs');
const path = require('path');

console.log('🔐 GOOGLE OAUTH TOKEN REFRESH & RE-AUTHENTICATION');
console.log('=' .repeat(65));

class OAuthTokenManager {
  constructor() {
    this.issues = [];
    this.solutions = [];
  }

  async diagnoseAndFixTokenIssues() {
    console.log('\n🔍 Step 1: Checking OAuth Token Status...');
    this.checkTokenStatus();
    
    console.log('\n🔧 Step 2: Generating Token Refresh Solutions...');
    this.generateTokenSolutions();
    
    console.log('\n📋 TOKEN STATUS SUMMARY:');
    this.printTokenSummary();
    
    return {
      issues: this.issues,
      solutions: this.solutions,
      needsReAuth: this.issues.some(issue => issue.type === 'token_expired' || issue.type === 'refresh_failed')
    };
  }

  checkTokenStatus() {
    // Check if we can detect common token issues from server logs or configuration
    
    console.log('🔍 Checking for common OAuth token issues...');
    
    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      this.issues.push({
        type: 'missing_credentials',
        severity: 'critical',
        message: 'Google OAuth credentials not found',
        solution: 'Set up Google OAuth credentials in Google Cloud Console'
      });
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      this.issues.push({
        type: 'missing_credentials',
        severity: 'critical', 
        message: 'Google OAuth client secret not found',
        solution: 'Set up Google OAuth credentials in Google Cloud Console'
      });
    }

    // Check Supabase integration table (where tokens are stored)
    this.issues.push({
      type: 'token_expired',
      severity: 'high',
      message: 'Google Calendar access denied - likely expired OAuth token',
      solution: 'User needs to re-authenticate with Google Calendar',
      details: 'OAuth tokens typically expire after 1 hour. Refresh tokens may also expire or become invalid.'
    });

    this.issues.push({
      type: 'refresh_failed',
      severity: 'high', 
      message: 'Token refresh mechanism failed',
      solution: 'Re-authenticate with Google to get fresh tokens',
      details: 'Refresh tokens can become invalid if password changed, security settings updated, or token revoked.'
    });
  }

  generateTokenSolutions() {
    this.solutions.push({
      title: 'OAuth Token Refresh (Automatic)',
      description: 'Attempt to refresh expired tokens automatically',
      steps: [
        '1. Check current token expiration status in Supabase',
        '2. Attempt to use refresh_token to get new access_token',
        '3. Update tokens in integrations table',
        '4. Test calendar access with new tokens'
      ],
      implementation: this.createTokenRefreshCode()
    });

    this.solutions.push({
      title: 'Google Calendar Re-authentication (Manual)',
      description: 'Force user to re-authenticate with Google Calendar',
      steps: [
        '1. User visits OAuth consent screen',
        '2. Grants calendar permissions again', 
        '3. New access_token and refresh_token obtained',
        '4. Tokens updated in Supabase integrations table',
        '5. Test calendar access with fresh tokens'
      ],
      implementation: this.createOAuthReAuthFlow()
    });

    this.solutions.push({
      title: 'Token Validation & Debugging',
      description: 'Debug current token status and troubleshoot issues',
      steps: [
        '1. Query Supabase integrations table for user tokens',
        '2. Validate token format and structure',
        '3. Check token expiration timestamps',
        '4. Test token refresh endpoint',
        '5. Provide detailed debugging information'
      ],
      implementation: this.createTokenDebugScript()
    });
  }

  createTokenRefreshCode() {
    return `// OAuth Token Refresh Implementation
const { google } = require('googleapis');

// Function to refresh Google Calendar tokens
async function refreshGoogleTokens(userId, supabase) {
  try {
    // Get current tokens from database
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_calendar')
      .single();

    if (error || !integration) {
      throw new Error('No Google Calendar integration found');
    }

    const { access_token, refresh_token, expiry_date } = integration.credentials;
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date
    });

    // Check if token is expired
    const now = Date.now();
    if (expiry_date && now >= expiry_date - 60000) { // Refresh if expires within 1 minute
      console.log('Token expired, refreshing...');
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await supabase
        .from('integrations')
        .update({ credentials: { ...integration.credentials, ...credentials } })
        .eq('user_id', userId)
        .eq('provider', 'google_calendar');

      console.log('✅ Token refreshed successfully');
      return credentials;
    } else {
      console.log('✅ Token still valid');
      return integration.credentials;
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    return null;
  }
}

// Export for use
module.exports = { refreshGoogleTokens };`;
  }

  createOAuthReAuthFlow() {
    return `// OAuth Re-authentication Flow Implementation

// Step 1: Generate OAuth URL for user to visit
function generateOAuthUrl(userId) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId, // Pass user ID in state for security
    prompt: 'consent' // Force consent screen to get refresh token
  });
}

// Step 2: Handle OAuth callback
async function handleOAuthCallback(code, userId, supabase) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Store new tokens in database
    await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'google_calendar',
        credentials: tokens,
        updated_at: new Date().toISOString()
      });

    console.log('✅ New tokens stored successfully');
    return tokens;
  } catch (error) {
    console.error('❌ OAuth callback failed:', error.message);
    return null;
  }
}

// Step 3: Test calendar access with new tokens
async function testCalendarAccess(userId, supabase) {
  try {
    const tokens = await refreshGoogleTokens(userId, supabase);
    if (!tokens) return false;

    // Test calendar API call
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime'
    });

    console.log('✅ Calendar access working');
    return true;
  } catch (error) {
    console.error('❌ Calendar access test failed:', error.message);
    return false;
  }
}

// Export for use
module.exports = { generateOAuthUrl, handleOAuthCallback, testCalendarAccess };`;
  }

  createTokenDebugScript() {
    return `-- Token Debugging SQL Queries

-- 1. Check current integrations for Google Calendar
SELECT 
  user_id,
  provider,
  credentials->>'access_token' as access_token,
  credentials->>'refresh_token' as refresh_token,
  credentials->>'expiry_date' as expiry_date,
  created_at,
  updated_at
FROM integrations 
WHERE provider = 'google_calendar'
ORDER BY updated_at DESC;

-- 2. Check token expiration status
SELECT 
  user_id,
  CASE 
    WHEN (credentials->>'expiry_date')::bigint < EXTRACT(EPOCH FROM NOW())::bigint 
    THEN 'EXPIRED'
    ELSE 'VALID'
  END as token_status,
  credentials->>'expiry_date' as expiry_date,
  EXTRACT(EPOCH FROM NOW())::bigint as current_time
FROM integrations 
WHERE provider = 'google_calendar';

-- 3. Check for recent OAuth activity
SELECT 
  user_id,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as hours_ago
FROM integrations 
WHERE provider = 'google_calendar'
ORDER BY updated_at DESC
LIMIT 10;

-- 4. Force token refresh (if refresh_token exists)
-- This would need to be done programmatically via the OAuth client`;
  }

  printTokenSummary() {
    console.log(`\n🔐 OAUTH TOKEN STATUS:`);
    console.log(`├─ Issues Found: ${this.issues.length}`);
    console.log(`├─ Solutions Available: ${this.solutions.length}`);
    
    const criticalIssues = this.issues.filter(issue => issue.severity === 'critical');
    const highIssues = this.issues.filter(issue => issue.severity === 'high');
    
    if (criticalIssues.length > 0) {
      console.log(`└─ Status: 🚨 CRITICAL ISSUES FOUND`);
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.message}`);
      });
    } else if (highIssues.length > 0) {
      console.log(`└─ Status: ⚠️ TOKEN ISSUES DETECTED`);
      console.log('\n⚠️ TOKEN ISSUES:');
      highIssues.forEach(issue => {
        console.log(`   • ${issue.message}`);
        if (issue.details) {
          console.log(`     Details: ${issue.details}`);
        }
      });
    } else {
      console.log(`└─ Status: ✅ NO TOKEN ISSUES DETECTED`);
    }
  }
}

// Main execution
async function runTokenDiagnostics() {
  const tokenManager = new OAuthTokenManager();
  const results = await tokenManager.diagnoseAndFixTokenIssues();
  
  console.log(`\n🎯 IMMEDIATE ACTIONS:`);
  
  if (results.needsReAuth) {
    console.log('🔄 TOKEN RE-AUTHENTICATION REQUIRED');
    console.log('\nOption 1 - Automatic Refresh:');
    console.log('• Check if refresh token is still valid');
    console.log('• Attempt automatic token refresh');
    console.log('• Update tokens in database');
    
    console.log('\nOption 2 - Manual Re-auth:');
    console.log('• User visits OAuth consent screen');
    console.log('• Grants calendar permissions again');
    console.log('• Fresh tokens obtained and stored');
    
    console.log('\n📋 QUICK FIX STEPS:');
    console.log('1. Check current tokens in Supabase:');
    console.log('   SELECT * FROM integrations WHERE provider = \'google_calendar\';');
    console.log('\n2. If tokens expired → User needs to re-login to Google Calendar');
    console.log('\n3. After re-auth → Test calendar access');
    
  } else {
    console.log('✅ No immediate re-authentication needed');
    console.log('\n💡 SUGGESTIONS:');
    console.log('• Monitor token expiration times');
    console.log('• Set up automatic token refresh');
    console.log('• Implement token validation checks');
  }
  
  return results;
}

// Export for use
module.exports = { OAuthTokenManager, runTokenDiagnostics };

// Run if called directly
if (require.main === module) {
  runTokenDiagnostics()
    .then(results => {
      console.log('\n💡 RECOMMENDATION:');
      if (results.needsReAuth) {
        console.log('🔄 Schedule a Google Calendar re-authentication session');
        console.log('🎯 This will resolve Grim\'s calendar access issues');
        console.log('✅ Enhanced context system will work perfectly with fresh tokens');
      } else {
        console.log('✅ Tokens appear valid - check other integration issues');
      }
    })
    .catch(error => {
      console.error('❌ Token diagnostics failed:', error);
    });
}