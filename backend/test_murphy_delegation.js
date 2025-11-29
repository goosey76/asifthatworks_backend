// Test the full delegation flow for murphy capabilities
const jarviService = require('./src/services/jarvi-service');
const agentService = require('./src/services/agents/jarvi-agent');

async function testMurphyDelegationFlow() {
  console.log('=== Testing Full Delegation Flow for Murphy ===\n');
  
  try {
    // Step 1: Test JARVI intent analysis
    console.log('Step 1: JARVI analyzes "what can murphy do?"');
    const jarviResponse = await jarviService.analyzeIntent({
      text: 'what can murphy do?',
      userId: 'test_user'
    });
    
    console.log('JARVI Response:');
    console.log('- Delegation JSON:', jarviResponse.delegationJson ? 'YES' : 'NO');
    
    if (jarviResponse.delegationJson) {
      const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
      console.log('- Delegation Details:', { Recipient, RequestType, Message });
      
      // Step 2: Test delegation routing
      console.log('\nStep 2: JARVI routes delegation to the agent');
      const delegationResult = await agentService.routeDelegation(
        jarviResponse.delegationJson,
        { userId: 'test_user' }
      );
      
      console.log('Delegation Result:');
      console.log('- Response received:', delegationResult.response ? 'YES' : 'NO');
      console.log('- Response length:', delegationResult.response ? delegationResult.response.length : 0);
      console.log('- Agent:', delegationResult.agent);
      
      if (delegationResult.response) {
        console.log('\n--- ACTUAL MURPHY RESPONSE ---');
        console.log(delegationResult.response);
        console.log('--- END RESPONSE ---\n');
        
        // Check if response is from Murphy (contains Murphy-specific content)
        if (delegationResult.response.includes('Murphy here:') || 
            delegationResult.response.includes('Executor') ||
            delegationResult.response.includes('task') ||
            delegationResult.response.includes('Task')) {
          console.log('✅ SUCCESS: Murphy responded with her own capabilities!');
        } else {
          console.log('❌ ISSUE: Response does not appear to be from Murphy');
        }
      }
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Run the test
testMurphyDelegationFlow().catch(console.error);