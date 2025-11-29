#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Import the grim agent (refactored modular version)
const grimAgent = require('../src/services/agents/grim-agent');

async function testGrimAgentDirectly() {
  try {
    console.log('=== Testing Grim Agent Directly (Refactored Version) ===');
    
    // Get a test user ID from the integrations table
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('user_id')
      .eq('provider', 'google_calendar')
      .limit(1);

    if (integrationsError || !integrations || integrations.length === 0) {
      console.error('No Google Calendar integrations found:', integrationsError);
      return;
    }

    const testUserId = integrations[0].user_id;
    console.log('Using test user ID:', testUserId);

    // Test 1: Create event
    console.log('\n1. Testing create_event intent...');
    const createResult = await grimAgent.handleEvent('create_event', {
      message: 'Create a test meeting tomorrow at 2pm for 1 hour',
      event_id: null
    }, testUserId);
    
    console.log('Create result:', createResult);

    // Test 2: Get events
    console.log('\n2. Testing get_event intent...');
    const getResult = await grimAgent.handleEvent('get_event', {
      message: 'Show me today\'s events',
      event_id: null
    }, testUserId);
    
    console.log('Get result:', getResult);

    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testGrimAgentDirectly();
