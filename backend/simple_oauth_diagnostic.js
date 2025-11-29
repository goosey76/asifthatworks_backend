#!/usr/bin/env node

/**
 * 🔍 SIMPLE OAUTH TOKEN DIAGNOSTIC
 * Quick diagnostic for OAuth token access
 */

require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

async function quickOAuthTest() {
    console.log('🔍 QUICK OAUTH TOKEN DIAGNOSTIC');
    console.log('==================================');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);

    // Check environment variables
    console.log('\n🔧 Environment Variables:');
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

    // Test if agents can access OAuth status
    console.log('\n🔬 Testing Agent OAuth Status Access:');
    
    try {
        const testMessage = {
            text: 'Check my Google connection status - are my OAuth tokens working?',
            userId: 'test-oauth-diagnostic'
        };

        const startTime = Date.now();
        const response = await axios.post('http://localhost:3000/api/v1/test-chat', testMessage, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        console.log(`⏱️ Response Time: ${responseTime}ms`);
        console.log(`📥 Response Type: ${response.data.type}`);
        console.log(`🎯 Agent Response: ${response.data.agentResponse || response.data.response || 'No response text'}`);
        
        const responseText = JSON.stringify(response.data).toLowerCase();
        
        // Analyze the response
        console.log('\n🔍 Response Analysis:');
        if (responseText.includes('connected') && !responseText.includes('not connected')) {
            console.log('✅ Agent reports Google connection as CONNECTED');
        } else if (responseText.includes('not connected') || responseText.includes('technical hiccup')) {
            console.log('❌ Agent reports Google connection ISSUES');
        } else {
            console.log('🤔 Agent response unclear about connection status');
        }
        
        if (responseText.includes('token') || responseText.includes('oauth')) {
            console.log('✅ Agent is aware of OAuth/token context');
        } else {
            console.log('⚠️ Agent may not be handling OAuth context properly');
        }

    } catch (error) {
        console.error('❌ Agent test failed:', error.message);
    }

    console.log('\n🎯 DIAGNOSTIC SUMMARY:');
    console.log('This diagnostic shows whether agents can access OAuth tokens after restart');
    console.log('If agents report connection issues, the OAuth tokens may need:');
    console.log('1. Proper userId mapping in the database');
    console.log('2. Agent-specific token retrieval logic');
    console.log('3. Token refresh mechanism activation');
}

// Run the diagnostic
quickOAuthTest()
    .then(() => {
        console.log('\n🏁 Diagnostic completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Diagnostic crashed:', error);
        process.exit(1);
    });