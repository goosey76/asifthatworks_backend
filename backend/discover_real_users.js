#!/usr/bin/env node

/**
 * 🔍 DISCOVER REAL USER IDS IN SUPABASE DATABASE
 * Query the database to find actual user IDs and their Google integrations
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

class RealUserDiscovery {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
    }

    async discoverUsers() {
        console.log('🔍 DISCOVERING REAL USERS IN SUPABASE DATABASE');
        console.log('===============================================');
        console.log(`🕐 Started: ${new Date().toISOString()}`);
        console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL}`);
        
        try {
            // Get all users
            console.log('\n📋 Fetching all users from database...');
            const { data: users, error: usersError } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (usersError) {
                console.error('❌ Error fetching users:', usersError);
                return [];
            }
            
            console.log(`✅ Found ${users.length} users in database:`);
            
            const userDetails = [];
            
            for (const user of users) {
                console.log(`\n👤 User: ${user.email || 'No email'}`);
                console.log(`🆔 ID: ${user.id}`);
                console.log(`📱 Phone: ${user.phone_number || 'No phone'}`);
                console.log(`📊 Plan: ${user.subscription_plan}`);
                console.log(`🕐 Created: ${user.created_at}`);
                
                // Get integrations for this user
                const { data: integrations, error: integrationsError } = await this.supabase
                    .from('integrations')
                    .select('*')
                    .eq('user_id', user.id);
                    
                if (integrationsError) {
                    console.log(`⚠️ Error fetching integrations: ${integrationsError.message}`);
                } else {
                    console.log(`🔗 Integrations (${integrations.length}):`);
                    integrations.forEach(integration => {
                        console.log(`   - ${integration.provider}`);
                        console.log(`     Created: ${integration.created_at}`);
                        
                        // Check if credentials exist
                        const hasCredentials = integration.credentials && 
                                             Object.keys(integration.credentials).length > 0;
                        console.log(`     ✅ Has credentials: ${hasCredentials}`);
                    });
                }
                
                userDetails.push({
                    ...user,
                    integrations: integrations || []
                });
            }
            
            // Find users with Google integrations
            const googleUsers = userDetails.filter(user => 
                user.integrations.some(integration => 
                    integration.provider.includes('google')
                )
            );
            
            console.log('\n' + '='.repeat(70));
            console.log('🎯 GOOGLE INTEGRATION ANALYSIS');
            console.log('='.repeat(70));
            
            console.log(`📊 Total Users: ${userDetails.length}`);
            console.log(`🔗 Users with Google Integrations: ${googleUsers.length}`);
            
            if (googleUsers.length > 0) {
                console.log('\n🏆 RECOMMENDED USER IDs for Testing:');
                googleUsers.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.id} (${user.email || 'No email'})`);
                    console.log(`   📱 Phone: ${user.phone_number || 'No phone'}`);
                    
                    const googleCal = user.integrations.find(i => i.provider === 'google_calendar');
                    const googleTasks = user.integrations.find(i => i.provider === 'google_tasks');
                    
                    console.log(`   📅 Google Calendar: ${googleCal ? '✅ Connected' : '❌ Not connected'}`);
                    console.log(`   📝 Google Tasks: ${googleTasks ? '✅ Connected' : '❌ Not connected'}`);
                    console.log();
                });
                
                console.log('🎯 SUGGESTED TEST USER IDs:');
                googleUsers.forEach(user => {
                    console.log(`- "${user.id}" (Email: ${user.email || 'No email'})`);
                });
            } else {
                console.log('\n⚠️ NO GOOGLE INTEGRATIONS FOUND');
                console.log('💡 You may need to connect Google Calendar/Tasks in the app first');
            }
            
            return userDetails;
            
        } catch (error) {
            console.error('💥 Database discovery failed:', error);
            return [];
        }
    }

    async testDiscoveredUsers(users) {
        if (!users || users.length === 0) {
            console.log('❌ No users found to test');
            return;
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🧪 TESTING DISCOVERED USER IDs');
        console.log('='.repeat(70));
        
        const axios = require('axios');
        const API_BASE = 'http://localhost:3000/api/v1';
        
        const testResults = [];
        
        for (const user of users.slice(0, 3)) { // Test first 3 users
            console.log(`\n🧪 Testing User: ${user.id}`);
            console.log(`📧 Email: ${user.email || 'No email'}`);
            
            const testQuery = {
                text: "Show me my calendar events for today",
                userId: user.id
            };
            
            try {
                const startTime = Date.now();
                const response = await axios.post(`${API_BASE}/test-chat`, testQuery, { timeout: 15000 });
                const responseTime = Date.now() - startTime;
                
                const responseText = (response.data.response || response.data.agentResponse || '').toLowerCase();
                
                const hasSuccess = responseText.includes('created') || 
                                 responseText.includes('success') ||
                                 responseText.includes('your calendar') ||
                                 responseText.includes('events');
                                 
                const hasOAuth = responseText.includes('technical hiccup') ||
                               responseText.includes('google') ||
                               responseText.includes('not connected');
                
                console.log(`⏱️ Response Time: ${responseTime}ms`);
                console.log(`📊 Response: ${responseText.substring(0, 100)}...`);
                console.log(`✅ Success: ${hasSuccess}`);
                console.log(`🔗 OAuth: ${hasOAuth}`);
                
                testResults.push({
                    userId: user.id,
                    email: user.email,
                    responseTime,
                    hasSuccess,
                    hasOAuth,
                    status: hasSuccess ? 'SUCCESS' : hasOAuth ? 'OAUTH_ISSUE' : 'UNCLEAR'
                });
                
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
                testResults.push({
                    userId: user.id,
                    email: user.email,
                    error: error.message,
                    status: 'ERROR'
                });
            }
            
            // Wait between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🏆 FINAL USER ID TEST RESULTS');
        console.log('='.repeat(70));
        
        testResults.forEach((result, index) => {
            const icon = result.status === 'SUCCESS' ? '🏆' : 
                        result.status === 'OAUTH_ISSUE' ? '🔗' : '⚠️';
            console.log(`${icon} ${index + 1}. ${result.userId} - ${result.status}`);
            if (result.email) console.log(`   📧 ${result.email}`);
            if (result.responseTime) console.log(`   ⏱️ ${result.responseTime}ms`);
        });
        
        const bestUser = testResults.find(r => r.status === 'SUCCESS') || testResults.find(r => r.status === 'OAUTH_ISSUE');
        if (bestUser) {
            console.log(`\n🎯 RECOMMENDED USER ID: "${bestUser.userId}"`);
            console.log(`📧 Email: ${bestUser.email || 'No email'}`);
            console.log(`🏆 Status: ${bestUser.status}`);
        }
    }
}

// Run the discovery
const discovery = new RealUserDiscovery();

async function main() {
    try {
        const users = await discovery.discoverUsers();
        
        if (users && users.length > 0) {
            await discovery.testDiscoveredUsers(users);
        }
        
        console.log('\n✅ User discovery completed!');
    } catch (error) {
        console.error('💥 Discovery failed:', error);
    }
}

main();