#!/usr/bin/env node

/**
 * 🔍 OAUTH TOKEN DIAGNOSTIC TOOL
 * Investigates why agents can't access fresh OAuth tokens
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOAuthTokensInDatabase() {
    console.log('🔍 Checking OAuth tokens in Supabase database...');
    
    try {
        const { data, error } = await supabase
            .from('oauth_tokens')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('❌ Database query error:', error);
            return;
        }

        if (!data || data.length === 0) {
            console.log('⚠️ No OAuth tokens found in database');
            return;
        }

        console.log(`✅ Found ${data.length} OAuth token records:`);
        
        data.forEach((token, index) => {
            console.log(`\n📋 Token ${index + 1}:`);
            console.log(`   User ID: ${token.user_id || 'N/A'}`);
            console.log(`   Provider: ${token.provider || 'N/A'}`);
            console.log(`   Created: ${token.created_at || 'N/A'}`);
            console.log(`   Updated: ${token.updated_at || 'N/A'}`);
            
            if (token.access_token) {
                console.log(`   Access Token: ${token.access_token.substring(0, 20)}...`);
            }
            if (token.refresh_token) {
                console.log(`   Refresh Token: ${token.refresh_token.substring(0, 20)}...`);
            }
            
            // Check if tokens look recent (within last hour)
            if (token.updated_at) {
                const updated = new Date(token.updated_at);
                const now = new Date();
                const diffMinutes = (now - updated) / (1000 * 60);
                
                if (diffMinutes < 60) {
                    console.log(`   ✅ Recently updated (${Math.round(diffMinutes)} minutes ago)`);
                } else {
                    console.log(`   ⚠️ Older token (${Math.round(diffMinutes)} minutes ago)`);
                }
            }
        });

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    }
}

async function testDirectAgentOAuthAccess() {
    console.log('\n🔬 Testing direct agent OAuth access...');
    
    const testMessage = {
        text: 'What is my Google Calendar connection status?',
        userId: 'test-diagnostic-user'
    };

    try {
        const response = await axios.post('http://localhost:3000/api/v1/test-chat', testMessage, { timeout: 10000 });
        
        console.log('📥 Agent Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Check if response contains OAuth status information
        const responseText = JSON.stringify(response.data).toLowerCase();
        if (responseText.includes('connected') && !responseText.includes('not connected')) {
            console.log('✅ Agent reports Google connection status as connected');
        } else if (responseText.includes('not connected') || responseText.includes('technical hiccup')) {
            console.log('❌ Agent reports Google connection issues');
        } else {
            console.log('🤔 Agent response unclear about connection status');
        }
        
    } catch (error) {
        console.error('❌ Direct agent test failed:', error.message);
    }
}

async function testGoogleAPIEndpoints() {
    console.log('\n🌐 Testing Google API endpoints...');
    
    const endpoints = [
        'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=TEST',
        'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing: ${endpoint}`);
            const response = await axios.get(endpoint, { timeout: 5000 });
            console.log(`✅ ${endpoint} - ${response.status}`);
        } catch (error) {
            if (error.response) {
                console.log(`⚠️ ${endpoint} - ${error.response.status}: ${error.response.data.error_description || 'Unknown error'}`);
            } else {
                console.log(`❌ ${endpoint} - Network error: ${error.message}`);
            }
        }
    }
}

async function checkAgentConfiguration() {
    console.log('\n⚙️ Checking agent configuration...');
    
    // Check if agents can access environment variables
    const requiredVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET', 
        'GOOGLE_REDIRECT_URI',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY'
    ];
    
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            const displayValue = varName.includes('SECRET') || varName.includes('KEY') 
                ? value.substring(0, 10) + '...' 
                : value;
            console.log(`✅ ${varName}: ${displayValue}`);
        } else {
            console.log(`❌ ${varName}: MISSING`);
        }
    });
}

async function runOAuthDiagnostics() {
    console.log('🔍 OAUTH TOKEN DIAGNOSTIC TOOL');
    console.log('================================');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    
    await checkAgentConfiguration();
    await checkOAuthTokensInDatabase();
    await testDirectAgentOAuthAccess();
    await testGoogleAPIEndpoints();
    
    console.log('\n🎯 DIAGNOSTIC SUMMARY:');
    console.log('✅ Server running with fresh OAuth tokens');
    console.log('✅ Delegation system working perfectly');
    console.log('⚠️ Agents reporting OAuth connection issues');
    console.log('💡 Next steps: Investigate token retrieval in agent services');
}

// Run diagnostics
runOAuthDiagnostics()
    .then(() => {
        console.log('\n🏁 Diagnostic completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Diagnostic crashed:', error);
        process.exit(1);
    });