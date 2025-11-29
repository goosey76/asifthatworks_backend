#!/usr/bin/env node

/**
 * 🔧 OAUTH USER ID SYNCHRONIZATION TEST
 * Tests if the OAuth completion user matches the API test user
 */

const axios = require('axios');

async function testOAuthUserConsistency() {
    console.log('🔧 OAUTH USER ID SYNCHRONIZATION TEST');
    console.log('======================================');
    console.log('🕐 Testing if OAuth user matches API test user...');
    
    // Test 1: Try with a more generic user ID that might match OAuth completion
    console.log('\n📋 TEST 1: Generic User ID');
    try {
        const response1 = await axios.post('http://localhost:3000/api/v1/test-chat', {
            text: 'What Google services am I connected to?',
            userId: 'user'
        }, { timeout: 10000 });
        
        console.log('Response:', response1.data.agentResponse || response1.data.response);
    } catch (error) {
        console.log('Failed:', error.message);
    }
    
    // Test 2: Try with OAuth completion user ID
    console.log('\n📋 TEST 2: OAuth User ID');
    try {
        const response2 = await axios.post('http://localhost:3000/api/v1/test-chat', {
            text: 'Create a test task to verify my Google connection',
            userId: 'oauth-user'
        }, { timeout: 10000 });
        
        console.log('Response:', response2.data.agentResponse || response2.data.response);
    } catch (error) {
        console.log('Failed:', error.message);
    }
    
    // Test 3: Try direct OAuth connection test
    console.log('\n📋 TEST 3: Direct OAuth Connection Test');
    try {
        const response3 = await axios.post('http://localhost:3000/api/v1/test-chat', {
            text: 'Show me my current Google Calendar events',
            userId: 'test_user'
        }, { timeout: 10000 });
        
        console.log('Response:', response3.data.agentResponse || response3.data.response);
    } catch (error) {
        console.log('Failed:', error.message);
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('If any response shows successful API access, that user ID matches the OAuth completion');
    console.log('This identifies which user ID should be used for API tests');
    console.log('\n💡 RECOMMENDATION: Use the successful user ID for Google API tests');
}

// Run the test
testOAuthUserConsistency()
    .then(() => {
        console.log('\n🏁 OAuth user consistency test completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });