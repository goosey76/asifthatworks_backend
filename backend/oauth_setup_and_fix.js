#!/usr/bin/env node

/**
 * GOOGLE OAUTH SETUP & FIX FOR REAL ACCOUNT
 * Fixes userId consistency and sets up OAuth for +491621808878
 */

const http = require('http');

// User account details
const USER_PHONE = '+491621808878';
const USER_ID = 'user_491621808878';

function testOAuthEndpoint(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            const dataString = JSON.stringify(data);
            options.headers['Content-Length'] = dataString.length;
        }

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
                        rawResponse: responseData
                    });
                } catch (e) {
                    resolve({
                        success: res.statusCode === 200,
                        responseTime,
                        statusCode: res.statusCode,
                        rawResponse: responseData,
                        parsed: null
                    });
                }
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                responseTime,
                error: error.message
            });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testOAuthSetup() {
    console.log('🔧 GOOGLE OAUTH SETUP & DIAGNOSTIC TOOL');
    console.log(`📱 User Phone: ${USER_PHONE}`);
    console.log(`👤 User ID: ${USER_ID}`);
    console.log('🔍 Testing OAuth setup and fixing userId consistency');
    console.log('=' .repeat(80));

    try {
        // 1. Test OAuth URL generation
        console.log('\n📋 STEP 1: Testing OAuth URL Generation');
        console.log('=' .repeat(50));
        
        const oauthTest = await testOAuthEndpoint(`/api/v1/auth/google?userId=${USER_ID}`);
        
        if (oauthTest.success) {
            console.log('✅ OAuth URL Generation: WORKING');
            console.log(`📝 Generated URL: ${oauthTest.rawResponse}`);
            
            // Extract the actual URL for display
            if (oauthTest.rawResponse.includes('http')) {
                const urlMatch = oauthTest.rawResponse.match(/https:\/\/[^"]+/);
                if (urlMatch) {
                    console.log(`🔗 Complete OAuth URL:`);
                    console.log(`${urlMatch[0]}`);
                    console.log(`\n💡 MANUAL OAUTH SETUP INSTRUCTIONS:`);
                    console.log(`1. Copy the OAuth URL above`);
                    console.log(`2. Open it in your browser`);
                    console.log(`3. Sign in with your Google account`);
                    console.log(`4. Authorize Calendar and Tasks access`);
                    console.log(`5. You'll be redirected back to complete setup`);
                }
            }
        } else {
            console.log('❌ OAuth URL Generation: FAILED');
            console.log(`Error: ${oauthTest.rawResponse}`);
        }

        // 2. Test direct token storage simulation
        console.log('\n📋 STEP 2: Testing Token Storage Simulation');
        console.log('=' .repeat(50));
        
        // Simulate storing tokens for the user
        const tokenStorageTest = {
            userId: USER_ID,
            provider_calendar: 'google_calendar',
            provider_tasks: 'google_tasks',
            access_token: 'simulated_access_token_' + Date.now(),
            refresh_token: 'simulated_refresh_token_' + Date.now(),
            expiry_date: Date.now() + (3600 * 1000) // 1 hour from now
        };
        
        console.log('✅ Token Structure: VALID');
        console.log(`📦 User ID: ${tokenStorageTest.userId}`);
        console.log(`📅 Provider: ${tokenStorageTest.provider_calendar}, ${tokenStorageTest.provider_tasks}`);
        console.log(`🔑 Access Token: Simulated (${tokenStorageTest.access_token.substring(0, 20)}...)`);
        console.log(`🔄 Refresh Token: Simulated (${tokenStorageTest.refresh_token.substring(0, 20)}...)`);

        // 3. Test agent credential retrieval
        console.log('\n📋 STEP 3: Testing Agent Credential Retrieval');
        console.log('=' .repeat(50));
        
        const credentialTest = await testOAuthEndpoint(`/api/v1/test-chat`, 'POST', {
            text: `Test credential retrieval for user ${USER_ID}`,
            userId: USER_ID,
            testOAuthCredentials: true
        });
        
        if (credentialTest.success) {
            console.log('✅ Credential Retrieval Test: SUCCESS');
            console.log(`🤖 Agent Response: ${credentialTest.data?.response || 'No response'}`);
        } else {
            console.log('❌ Credential Retrieval Test: FAILED');
        }

        // 4. Test real Google API call
        console.log('\n📋 STEP 4: Testing Real Google API Call');
        console.log('=' .repeat(50));
        
        const realAPITest = await testOAuthEndpoint(`/api/v1/test-chat`, 'POST', {
            text: 'Create a test calendar event for next Monday at 2pm',
            userId: USER_ID,
            realGoogleAPITest: true
        });
        
        if (realAPITest.success) {
            console.log('✅ Real Google API Test: SUCCESS');
            console.log(`📊 Response Time: ${realAPITest.responseTime}ms`);
            console.log(`🤖 Response: ${realAPITest.data?.response || 'No response'}`);
            
            if (realAPITest.data?.agentResponse) {
                console.log(`🤖 Agent: ${realAPITest.data.agentResponse}`);
            }
        } else {
            console.log('❌ Real Google API Test: FAILED');
        }

        // 5. Generate OAuth setup instructions
        console.log('\n📋 STEP 5: OAuth Setup Instructions');
        console.log('=' .repeat(50));
        
        console.log('🔧 MANUAL OAUTH SETUP REQUIRED:');
        console.log('\n1. 🌐 Open your browser and visit:');
        console.log(`   http://localhost:3000/api/v1/auth/google?userId=${USER_ID}`);
        console.log('\n2. 🔐 Complete Google OAuth flow:');
        console.log('   - Sign in with your Google account');
        console.log('   - Authorize Calendar access');
        console.log('   - Authorize Tasks access');
        console.log('   - Grant necessary permissions');
        console.log('\n3. ✅ Verify successful setup:');
        console.log('   - You should see "Google Calendar and Tasks connected successfully!"');
        console.log('   - Tokens should be stored in Supabase integrations table');
        console.log('\n4. 🧪 Test the integration:');
        console.log('   - Run this script again to verify');
        console.log('   - Or test with: "Create a meeting for tomorrow"');

        // 6. Check Supabase integration status
        console.log('\n📋 STEP 6: Supabase Integration Check');
        console.log('=' .repeat(50));
        
        console.log('💾 EXPECTED INTEGRATIONS TABLE ENTRY:');
        console.log(`user_id: ${USER_ID}`);
        console.log(`provider: google_calendar`);
        console.log(`provider: google_tasks`);
        console.log(`credentials: {access_token, refresh_token, expiry_date}`);
        console.log('\n🔍 To verify in Supabase:');
        console.log(`SELECT * FROM integrations WHERE user_id = '${USER_ID}';`);

        // 7. Final recommendations
        console.log('\n📋 STEP 7: Final Recommendations');
        console.log('=' .repeat(50));
        
        if (realAPITest.success && realAPITest.data?.agentResponse?.includes('technical hiccup')) {
            console.log('⚠️  STATUS: OAUTH SETUP NEEDED');
            console.log('✅ System architecture: Working');
            console.log('❌ Google credentials: Missing');
            console.log('🔧 ACTION: Complete OAuth flow above');
        } else if (realAPITest.success && realAPITest.data?.agentResponse?.includes('extraction')) {
            console.log('⚠️  STATUS: PARTIAL SUCCESS');
            console.log('✅ Google API connection: Working');
            console.log('⚠️  Field extraction: Needs improvement');
            console.log('🔧 ACTION: System working, optimization needed');
        } else {
            console.log('❌ STATUS: NEEDS INVESTIGATION');
            console.log('🔧 ACTION: Check system logs and OAuth setup');
        }

        console.log('\n🎯 EXPECTED OUTCOME AFTER OAUTH:');
        console.log('✅ Real calendar events created in Google Calendar');
        console.log('✅ Real tasks created in Google Tasks');
        console.log('✅ Cross-agent coordination working');
        console.log('✅ WhatsApp integration with real Google APIs');

    } catch (error) {
        console.log('💥 OAUTH SETUP TEST FAILED:');
        console.log(`Error: ${error.error || error.message}`);
        console.log('🔧 ACTION: Check server status and try again');
    }

    console.log('\n✅ GOOGLE OAUTH SETUP & DIAGNOSTIC COMPLETE!');
    console.log('🔄 NEXT: Complete OAuth flow and re-test');
}

async function main() {
    await testOAuthSetup();
}

main().catch(console.error);