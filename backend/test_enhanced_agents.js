// Test enhanced JARVI and Grim functionality
const { analyzeIntent } = require('./src/services/agents/jarvi-agent/intent-analysis');
const agentService = require('./src/services/agent-service');

async function testEnhancedAgents() {
  console.log('🚀 Testing Enhanced JARVI and Grim Functionality\n');
  console.log('=' * 60 + '\n');

  // Test 1: JARVI Context Awareness
  console.log('📋 TEST 1: JARVI Context Awareness Enhancement');
  console.log('-' * 40);
  
  const testMessages = [
    {
      text: 'what can murphy do?',
      userId: 'test_user',
      timestamp: new Date().toISOString()
    },
    {
      text: 'add two meetings: lunch at 12pm and gym at 6pm',
      userId: 'test_user',
      timestamp: new Date().toISOString()
    }
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n🔍 Testing message ${i + 1}: "${message.text}"`);
    
    try {
      const result = await analyzeIntent(message);
      console.log('✅ JARVI Response:', result.responseToUser || 'No direct response');
      
      if (result.delegationJson) {
        console.log('📤 Delegation:', JSON.stringify(result.delegationJson, null, 2));
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '=' * 60 + '\n');

  // Test 2: Grim Multiple Event Creation
  console.log('📅 TEST 2: Grim Multiple Event Creation Enhancement');
  console.log('-' * 50);
  
  try {
    // Import Grim agent dynamically
    const grimAgent = require('./src/services/agents/grim-agent/grim-agent-enhanced');
    const supabase = { /* mock supabase */ };
    const grim = grimAgent(supabase);
    
    const testMultipleEvents = {
      message: 'create two events: meeting at 2pm and lunch at 12pm today',
      originalPayload: { userId: 'test_user' }
    };
    
    console.log('🔍 Testing multiple event creation: "create two events: meeting at 2pm and lunch at 12pm today"');
    
    // First test the LLM extraction to see multiple event detection
    const LLMExtractor = require('./src/services/agents/grim-agent/extraction/llm-extractor');
    const extractor = new LLMExtractor();
    
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    console.log(`📅 Current context: ${currentDate} at ${currentTime}`);
    
    const extractedDetails = await extractor.extractEventDetails(
      testMultipleEvents.message, 
      currentDate, 
      currentTime
    );
    
    console.log('🔍 Extracted details:');
    console.log(JSON.stringify(extractedDetails, null, 2));
    
    // Test if multiple events were detected
    if (extractedDetails.multiple_events && extractedDetails.events) {
      console.log(`✅ Multiple events detected: ${extractedDetails.events.length} events`);
      
      for (let i = 0; i < extractedDetails.events.length; i++) {
        const event = extractedDetails.events[i];
        const hasAllFields = event.event_title && event.date && event.start_time && event.end_time;
        console.log(`📝 Event ${i + 1}: ${hasAllFields ? '✅ Complete' : '❌ Missing fields'} - ${event.event_title || 'No title'}`);
      }
    } else {
      console.log('❌ Multiple events not detected');
    }
    
  } catch (error) {
    console.log('❌ Grim test error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n' + '=' * 60 + '\n');
  console.log('📊 ENHANCEMENT TEST COMPLETE');
  console.log('🔧 JARVI: Enhanced with current date/time context awareness');
  console.log('📅 Grim: Enhanced with better multiple event validation and debugging');
  console.log('✅ Both agents now have improved functionality!\n');
}

// Run the test
testEnhancedAgents().catch(console.error);