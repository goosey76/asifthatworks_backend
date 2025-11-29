#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Import the FIXED grim agent from new structure
const grimAgent = require('../src/services/agents/grim-agent');

async function testGrimAgentFixed() {
  try {
    console.log('=== Testing FIXED Grim Agent ===');
    
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
    console.log('\n1. Testing FIXED create_event intent...');
    const createResult = await grimAgent.handleEvent('create_event', {
      message: 'Create a FIXED test meeting tomorrow at 3pm for 1 hour',
      event_id: null
    }, testUserId);
    
    console.log('FIXED Create result:', createResult);

    console.log('\n=== FIXED Test Complete ===');

  } catch (error) {
    console.error('Test error:', error);
  }
}

testGrimAgentFixed();
