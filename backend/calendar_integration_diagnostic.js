// Google Calendar Integration Diagnostic and Fix Script
// Diagnoses and fixes Grim's calendar access issues

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSING GOOGLE CALENDAR INTEGRATION ISSUES');
console.log('=' .repeat(60));

class CalendarIntegrationDiagnostic {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  async runFullDiagnostic() {
    console.log('\n🔍 Step 1: Checking Environment Variables...');
    this.checkEnvironmentVariables();
    
    console.log('\n📁 Step 2: Checking Configuration Files...');
    this.checkConfigurationFiles();
    
    console.log('\n🗄️ Step 3: Checking Database Schema...');
    this.checkDatabaseSchema();
    
    console.log('\n🔐 Step 4: Checking Google OAuth Configuration...');
    this.checkGoogleOAuthConfig();
    
    console.log('\n🔧 Step 5: Generating Fixes...');
    this.generateFixes();
    
    console.log('\n📋 DIAGNOSTIC SUMMARY:');
    this.printSummary();
    
    return {
      issues: this.issues,
      fixes: this.fixes,
      isHealthy: this.issues.length === 0
    };
  }

  checkEnvironmentVariables() {
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET', 
      'GOOGLE_REDIRECT_URI',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missing = [];
    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
        this.issues.push({
          type: 'environment_variable',
          severity: 'high',
          message: `Missing environment variable: ${varName}`,
          solution: `Add ${varName} to your .env file`
        });
      }
    });

    if (missing.length === 0) {
      console.log('✅ All required environment variables are present');
    } else {
      console.log(`❌ Missing ${missing.length} environment variables`);
    }
  }

  checkConfigurationFiles() {
    const configFiles = [
      { path: '.env', description: 'Environment variables' },
      { path: 'backend/.env', description: 'Backend environment variables' }
    ];

    configFiles.forEach(config => {
      if (fs.existsSync(config.path)) {
        console.log(`✅ Found ${config.description}: ${config.path}`);
      } else {
        this.issues.push({
          type: 'config_file',
          severity: 'high',
          message: `Missing configuration file: ${config.path}`,
          solution: `Create ${config.path} with required environment variables`
        });
        console.log(`❌ Missing ${config.description}: ${config.path}`);
      }
    });
  }

  checkDatabaseSchema() {
    // Check if integrations table exists (required for Google Calendar credentials)
    const schemaIssues = [];
    
    // This would typically check the actual database, but for now we'll check the code
    const googleCalendarClientPath = 'src/services/agents/grim-agent/calendar/google-calendar-client.js';
    
    if (fs.existsSync(googleCalendarClientPath)) {
      const clientCode = fs.readFileSync(googleCalendarClientPath, 'utf8');
      
      if (clientCode.includes('.from(\'integrations\')')) {
        console.log('✅ Database integration code found');
      } else {
        this.issues.push({
          type: 'database_schema',
          severity: 'high',
          message: 'Google Calendar client code not found',
          solution: 'Ensure google-calendar-client.js exists and is properly configured'
        });
      }
    }
  }

  checkGoogleOAuthConfig() {
    // Check Google OAuth redirect URI
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/v1/auth/google/callback';
    
    console.log(`🔐 Google OAuth Redirect URI: ${redirectUri}`);
    
    // Common issues with OAuth configuration
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      this.issues.push({
        type: 'oauth_config',
        severity: 'critical',
        message: 'Google OAuth credentials not configured',
        solution: 'Set up Google Cloud Console project and obtain OAuth 2.0 credentials'
      });
    } else {
      console.log('✅ Google OAuth credentials found');
    }
  }

  generateFixes() {
    // Generate specific fixes based on identified issues
    
    if (this.issues.some(issue => issue.type === 'environment_variable')) {
      this.fixes.push({
        title: 'Environment Variables Setup',
        description: 'Create/update .env file with required variables',
        implementation: this.createEnvTemplate()
      });
    }

    if (this.issues.some(issue => issue.type === 'oauth_config')) {
      this.fixes.push({
        title: 'Google OAuth Setup',
        description: 'Configure Google Cloud Console for OAuth 2.0',
        implementation: this.createGoogleOAuthGuide()
      });
    }

    if (this.issues.some(issue => issue.type === 'database_schema')) {
      this.fixes.push({
        title: 'Database Schema Check',
        description: 'Verify integrations table exists',
        implementation: this.createDatabaseCheckScript()
      });
    }
  }

  createEnvTemplate() {
    return `# Environment Variables Template
# Copy this to your .env file and fill in the values

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server Configuration
PORT=3000
NODE_ENV=development`;
  }

  createGoogleOAuthGuide() {
    return `# Google OAuth 2.0 Setup Guide

1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application Type to "Web Application"
6. Add Authorized Redirect URI: http://localhost:3000/api/v1/auth/google/callback
7. Copy Client ID and Client Secret to your .env file

Required Scopes:
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/calendar.events`;
  }

  createDatabaseCheckScript() {
    return `-- Check if integrations table exists and has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'integrations' 
AND column_name IN ('user_id', 'provider', 'credentials');

-- If table doesn't exist, create it:
CREATE TABLE integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS (Row Level Security)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own integrations
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);`;
  }

  printSummary() {
    console.log(`\n📊 DIAGNOSTIC RESULTS:`);
    console.log(`├─ Issues Found: ${this.issues.length}`);
    console.log(`├─ Fixes Generated: ${this.fixes.length}`);
    console.log(`└─ System Health: ${this.issues.length === 0 ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}`);
    
    if (this.issues.length > 0) {
      console.log(`\n🚨 ISSUES DETECTED:`);
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        console.log(`   Solution: ${issue.solution}`);
      });
    }
    
    if (this.fixes.length > 0) {
      console.log(`\n🔧 AVAILABLE FIXES:`);
      this.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.title}`);
        console.log(`   ${fix.description}`);
      });
    }
  }
}

// Main execution
async function runCalendarDiagnostic() {
  const diagnostic = new CalendarIntegrationDiagnostic();
  const results = await diagnostic.runFullDiagnostic();
  
  console.log(`\n🎯 IMMEDIATE ACTIONS NEEDED:`);
  
  if (results.issues.length > 0) {
    const criticalIssues = results.issues.filter(issue => issue.severity === 'critical');
    const highIssues = results.issues.filter(issue => issue.severity === 'high');
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL - Fix immediately:');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.message}`);
      });
    }
    
    if (highIssues.length > 0) {
      console.log('⚠️ HIGH PRIORITY - Fix soon:');
      highIssues.forEach(issue => {
        console.log(`   • ${issue.message}`);
      });
    }
  } else {
    console.log('✅ No critical issues found. Calendar integration should work.');
    console.log('\n🔍 If Grim still can\'t access calendar events, check:');
    console.log('   • User has connected Google Calendar via OAuth');
    console.log('• Calendar permissions are granted');
    console.log('• Access tokens are valid and not expired');
  }
  
  return results;
}

// Export for use
module.exports = { CalendarIntegrationDiagnostic, runCalendarDiagnostic };

// Run if called directly
if (require.main === module) {
  runCalendarDiagnostic()
    .then(results => {
      console.log(`\n💡 NEXT STEPS:`);
      if (results.isHealthy) {
        console.log('• Test calendar access with a real user account');
        console.log('• Verify Google Calendar OAuth flow works');
        console.log('• Test event creation and retrieval');
      } else {
        console.log('• Apply the generated fixes');
        console.log('• Re-run diagnostic to verify fixes');
        console.log('• Test with a real user account');
      }
    })
    .catch(error => {
      console.error('❌ Diagnostic failed:', error);
    });
}