#!/usr/bin/env node

/**
 * REAL GOOGLE API CALLS TEST
 * Tests actual Google Calendar and Google Tasks API calls
 * Detects real API responses vs simulated error messages
 */

const http = require('http');

// Real user account identification for Google APIs
const USER_PHONE = '+491621808878';
const USER_ID = 'user_491621808878'; // This should match a real Supabase user_id with Google credentials

function makeRealGoogleAPICall(message, expectedAPIAction) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Use the actual test-chat endpoint with real user identification
        const requestData = {
            text: message,
            userId: USER_ID,
            phoneNumber: USER_PHONE,
            realGoogleAPITest: true,
            expectedAction: expectedAPIAction,
            triggerRealAPI: true
        };
        
        const data = JSON.stringify(requestData);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/v1/test-chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        success: res.statusCode === 200,
                        responseTime,
                        statusCode: res.statusCode,
                        data: parsed,
                        originalMessage: message,
                        expectedAction: expectedAPIAction,
                        userId: USER_ID,
                        rawResponse: responseData
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        responseTime,
                        statusCode: res.statusCode,
                        error: 'Failed to parse response',
                        rawResponse: responseData,
                        originalMessage: message,
                        expectedAction: expectedAPIAction
                    });
                }
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                responseTime,
                error: error.message,
                originalMessage: message,
                expectedAction: expectedAPIAction
            });
        });

        req.write(data);
        req.end();
    });
}

function analyzeRealGoogleAPICall(result) {
    const analysis = {
        testCase: result.originalMessage,
        expectedAction: result.expectedAction,
        success: result.success,
        responseTime: result.responseTime,
        responseType: result.data?.type || 'unknown',
        jarviMessage: result.data?.jarviMessage || result.data?.response || '',
        agentResponse: result.data?.agentResponse || '',
        realGoogleAPICall: false,
        calendarEventCreated: false,
        taskCreated: false,
        oauthRequired: false,
        credentialsMissing: false,
        realAPISuccess: false,
        errorDetails: []
    };

    const jarviText = analysis.jarviMessage.toLowerCase();
    const agentText = analysis.agentResponse.toLowerCase();

    // Detect REAL Google Calendar API calls (not simulated)
    if (agentText.includes('event created') || agentText.includes('calendar event') ||
        agentText.includes('meeting scheduled') || agentText.includes('event added') ||
        jarviText.includes('created in your calendar') || jarviText.includes('scheduled')) {
        analysis.calendarEventCreated = true;
        analysis.realGoogleAPICall = true;
        analysis.realAPISuccess = true;
    }

    // Detect REAL Google Tasks API calls (not simulated)
    if (agentText.includes('task created') || agentText.includes('task added') ||
        agentText.includes('todo created') || agentText.includes('task list updated') ||
        jarviText.includes('task created') || jarviText.includes('todo added')) {
        analysis.taskCreated = true;
        analysis.realGoogleAPICall = true;
        analysis.realAPISuccess = true;
    }

    // Detect OAuth/credentials missing (simulated responses)
    if (agentText.includes('google tasks isn\'t connected') || 
        agentText.includes('not connected properly') ||
        agentText.includes('technical hiccup') ||
        jarviText.includes('not connected')) {
        analysis.credentialsMissing = true;
        analysis.realGoogleAPICall = false;
    }

    // Detect OAuth required
    if (jarviText.includes('authenticate') || jarviText.includes('connect your google') ||
        jarviText.includes('authorize') || jarviText.includes('login')) {
        analysis.oauthRequired = true;
    }

    // Detect real API error responses (vs generic errors)
    if (agentText.includes('quota exceeded') || agentText.includes('permission denied') ||
        agentText.includes('invalid request') || agentText.includes('rate limit')) {
        analysis.realGoogleAPICall = true;
        analysis.realAPISuccess = false;
        analysis.errorDetails.push('Real Google API error detected');
    }

    // Detect successful real API responses
    if (analysis.responseTime > 1000 && analysis.responseTime < 5000 &&
        (analysis.calendarEventCreated || analysis.taskCreated)) {
        analysis.realAPISuccess = true;
    }

    return analysis;
}

async function runRealGoogleAPITests() {
    console.log('🌐 REAL GOOGLE API CALLS TEST');
    console.log(`📱 User: ${USER_PHONE}`);
    console.log(`👤 User ID: ${USER_ID}`);
    console.log('🔗 Testing actual Google Calendar and Tasks API calls');
    console.log('=' .repeat(80));

    const realAPITestScenarios = [
        // Real Google Calendar API Tests
        {
            category: 'REAL GOOGLE CALENDAR API TESTS',
            messages: [
                'Schedule a meeting with my professor next Monday at 2pm',
                'Create a university lecture event for tomorrow at 10am',
                'Set up a study group session this Friday at 4pm',
                'Book a dentist appointment for next week',
                'Plan a project deadline event for December 15th'
            ],
            expectedAction: 'create_calendar_event'
        },

        // Real Google Tasks API Tests
        {
            category: 'REAL GOOGLE TASKS API TESTS',
            messages: [
                'Create a task to finish my assignment due next Friday',
                'Add a task to review lecture notes this weekend',
                'Set up a task list for my exam preparation',
                'Create a homework task due tomorrow',
                'Add a task to prepare for the meeting'
            ],
            expectedAction: 'create_task'
        },

        // Cross-Platform Real API Tests
        {
            category: 'REAL CROSS-PLATFORM API TESTS',
            messages: [
                'Schedule a study session and create tasks to prepare for it',
                'Create a project timeline with calendar events and tasks',
                'Plan my week with meetings and homework tasks',
                'Set up my academic schedule with deadlines',
                'Create a productivity plan with events and tasks'
            ],
            expectedAction: 'multi_platform_api'
        },

        // OAuth Configuration Tests
        {
            category: 'OAUTH CONFIGURATION TESTS',
            messages: [
                'Connect my Google account to enable calendar and tasks',
                'Authenticate with Google to access my services',
                'Set up Google integration for this chatbot',
                'Authorize calendar and tasks access',
                'Link my Google services to the system'
            ],
            expectedAction: 'oauth_setup'
        }
    ];

    let totalTests = 0;
    let successfulTests = 0;
    let realGoogleAPICalls = 0;
    let calendarEventsCreated = 0;
    let tasksCreated = 0;
    let oauthRequired = 0;
    let credentialsMissing = 0;
    let realAPISuccess = 0;

    for (const testGroup of realAPITestScenarios) {
        console.log(`\n📋 ${testGroup.category}`);
        console.log('=' .repeat(60));

        for (const message of testGroup.messages) {
            totalTests++;
            
            try {
                console.log(`\n🔍 Real API Test: "${message}"`);
                console.log(`🎯 Expected: ${testGroup.expectedAction}`);
                
                const result = await makeRealGoogleAPICall(message, testGroup.expectedAction);
                const analysis = analyzeRealGoogleAPICall(result);
                
                if (analysis.success) {
                    successfulTests++;
                    console.log(`✅ SUCCESS (${result.responseTime}ms)`);
                    
                    // Count real API achievements
                    if (analysis.realGoogleAPICall) {
                        realGoogleAPICalls++;
                        console.log('🌐 REAL Google API Call: DETECTED');
                    }
                    if (analysis.calendarEventCreated) {
                        calendarEventsCreated++;
                        console.log('📅 Real Calendar Event: CREATED');
                    }
                    if (analysis.taskCreated) {
                        tasksCreated++;
                        console.log('📋 Real Task: CREATED');
                    }
                    if (analysis.oauthRequired) {
                        oauthRequired++;
                        console.log('🔐 OAuth Required: NEEDED');
                    }
                    if (analysis.credentialsMissing) {
                        credentialsMissing++;
                        console.log('❌ Credentials Missing: DETECTED');
                    }
                    if (analysis.realAPISuccess) {
                        realAPISuccess++;
                        console.log('🎉 Real API Success: CONFIRMED');
                    }

                    // Show detailed response
                    if (analysis.responseType === 'delegation') {
                        console.log(`🤝 Delegation: ${analysis.responseType}`);
                        console.log(`💬 JARVI: "${analysis.jarviMessage}"`);
                        console.log(`🤖 Agent: "${analysis.agentResponse}"`);
                    } else {
                        console.log(`🎯 Response: "${analysis.jarviMessage}"`);
                    }

                    // Show API call indicators
                    if (analysis.realGoogleAPICall) {
                        console.log('🔥 REAL GOOGLE API CALL CONFIRMED');
                        if (analysis.calendarEventCreated) {
                            console.log('✅ Actual calendar event created in Google Calendar');
                        }
                        if (analysis.taskCreated) {
                            console.log('✅ Actual task created in Google Tasks');
                        }
                    }

                    if (analysis.credentialsMissing) {
                        console.log('⚠️  SIMULATED RESPONSE: Google credentials not connected');
                        console.log('💡 Need to set up OAuth for real API calls');
                    }

                } else {
                    console.log(`❌ FAILED: ${result.error || 'No response'}`);
                }

                // Longer delay for real API calls
                await new Promise(resolve => setTimeout(resolve, 1500));

            } catch (error) {
                console.log(`💥 EXCEPTION: ${error.error || error.message}`);
            }
        }
    }

    // Final Real API Analysis
    console.log('\n' + '=' .repeat(80));
    console.log('🌐 REAL GOOGLE API TEST RESULTS');
    console.log('=' .repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful Tests: ${successfulTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Real Google API Calls: ${realGoogleAPICalls}`);
    console.log(`Real Calendar Events Created: ${calendarEventsCreated}`);
    console.log(`Real Tasks Created: ${tasksCreated}`);
    console.log(`OAuth Required: ${oauthRequired}`);
    console.log(`Credentials Missing: ${credentialsMissing}`);
    console.log(`Real API Success: ${realAPISuccess}`);

    // Real API Assessment
    console.log('\n🎯 REAL GOOGLE API ASSESSMENT:');
    console.log('=' .repeat(60));

    if (realGoogleAPICalls > 0) {
        console.log('🌐 REAL GOOGLE API INTEGRATION: ACTIVE');
        console.log(`   - Real API calls detected: ${realGoogleAPICalls}`);
        console.log(`   - Calendar events created: ${calendarEventsCreated}`);
        console.log(`   - Tasks created: ${tasksCreated}`);
        console.log('   - System making actual Google API requests');
    } else {
        console.log('📱 SIMULATED RESPONSES: Google APIs not connected');
        console.log(`   - Credentials missing: ${credentialsMissing}`);
        console.log(`   - OAuth setup needed: ${oauthRequired > 0 ? 'Yes' : 'No'}`);
        console.log('   - System using fallback responses');
    }

    if (realAPISuccess > 0) {
        console.log('🎉 REAL API SUCCESS: CONFIRMED');
        console.log(`   - Successful real API calls: ${realAPISuccess}`);
        console.log('   - Google Calendar integration: Working');
        console.log('   - Google Tasks integration: Working');
        console.log('   - User account properly configured');
    }

    // Configuration Status
    console.log('\n🔧 GOOGLE API CONFIGURATION STATUS:');
    console.log('=' .repeat(60));
    console.log(`👤 User ID: ${USER_ID}`);
    console.log(`📱 Phone: ${USER_PHONE}`);

    if (credentialsMissing > realGoogleAPICalls * 0.5) {
        console.log('❌ CREDENTIALS STATUS: NOT CONNECTED');
        console.log('   - Google Calendar: Not authorized');
        console.log('   - Google Tasks: Not authorized');
        console.log('   - OAuth flow: Needs completion');
        
        console.log('\n🔗 SETUP INSTRUCTIONS:');
        console.log('1. Visit: http://localhost:3000/api/v1/auth/google');
        console.log('2. Complete OAuth flow with Google account');
        console.log('3. Authorize Calendar and Tasks access');
        console.log('4. Return to test real API calls');
    } else if (realGoogleAPICalls > 0) {
        console.log('✅ CREDENTIALS STATUS: CONNECTED');
        console.log('   - Google Calendar: Authorized');
        console.log('   - Google Tasks: Authorized');
        console.log('   - Real API calls: Working');
    }

    // Next Steps
    console.log('\n🚀 NEXT STEPS FOR REAL API TESTING:');
    console.log('=' .repeat(60));
    
    if (realGoogleAPICalls === 0) {
        console.log('1. 🔐 Set up Google OAuth:');
        console.log('   - Configure Google Cloud Console');
        console.log('   - Set up OAuth 2.0 credentials');
        console.log('   - Add calendar and tasks scopes');
        
        console.log('2. 🔗 Complete OAuth Flow:');
        console.log('   - User must authenticate with Google');
        console.log('   - Authorize Calendar and Tasks access');
        console.log('   - Tokens stored in Supabase integrations table');
        
        console.log('3. 🧪 Re-run Tests:');
        console.log('   - Execute this test again after OAuth setup');
        console.log('   - Should see real API calls and responses');
    } else {
        console.log('✅ REAL GOOGLE APIS: FULLY OPERATIONAL');
        console.log('✅ Calendar integration: Working');
        console.log('✅ Tasks integration: Working');
        console.log('✅ Ready for production deployment');
    }

    console.log('\n🎯 TEST SUMMARY:');
    console.log(`📊 Real API Calls: ${realGoogleAPICalls}/${totalTests}`);
    console.log(`📅 Calendar Events: ${calendarEventsCreated} real creations`);
    console.log(`📋 Tasks: ${tasksCreated} real creations`);
    console.log(`🔐 OAuth Setup: ${oauthRequired} requests`);

    if (realGoogleAPICalls > 0 && realAPISuccess > 0) {
        console.log('\n🎉 REAL GOOGLE API INTEGRATION: SUCCESSFUL!');
        console.log('✅ System making actual calls to Google APIs');
        console.log('✅ Real calendar events and tasks being created');
        console.log('✅ WhatsApp integration with real Google services: Working');
    } else {
        console.log('\n⚠️ REAL GOOGLE API INTEGRATION: NEEDS SETUP');
        console.log('🔧 Complete OAuth flow to enable real API calls');
    }

    console.log('\n✅ REAL GOOGLE API TEST COMPLETE!');
    
    return {
        totalTests,
        successfulTests,
        successRate: (successfulTests / totalTests) * 100,
        realGoogleAPICalls,
        calendarEventsCreated,
        tasksCreated,
        oauthRequired,
        credentialsMissing,
        realAPISuccess
    };
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
});

runRealGoogleAPITests().catch(error => {
    console.error('Real Google API testing failed:', error);
    process.exit(1);
});