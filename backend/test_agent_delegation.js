// Test script to debug agent delegation issue
const jarviService = require('./src/services/jarvi-service');
const agentService = require('./src/services/agents/jarvi-agent');

async function testAgentCapabilities() {
  console.log('=== Testing Agent Capability Delegation ===\n');
  
  // Test cases for different agents
  const testCases = [
    { text: "Murphy, what can you do?", expectedAgent: "Murphy" },
    { text: "Grim, what are your capabilities?", expectedAgent: "Grim" },
    { text: "Jarvi, what can you do?", expectedAgent: "JARVI" },
    { text: "What can Murphy do?", expectedAgent: "Murphy" },
    { text: "What are Grim's capabilities?", expectedAgent: "Grim" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: "${testCase.text}" ---`);
    console.log(`Expected agent: ${testCase.expectedAgent}`);
    
    try {
      // Test JARVI intent analysis
      const jarviResponse = await jarviService.analyzeIntent({
        text: testCase.text,
        userId: 'test_user'
      });
      
      console.log('JARVI Response:');
      console.log('- responseToUser:', jarviResponse.responseToUser ? 'YES' : 'NO');
      console.log('- delegationJson:', jarviResponse.delegationJson ? 'YES' : 'NO');
      
      if (jarviResponse.delegationJson) {
        const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
        console.log('- Delegation:', { Recipient, RequestType, Message });
        
        // Test the delegation routing
        try {
          const delegationResult = await agentService.routeDelegation(
            jarviResponse.delegationJson,
            { userId: 'test_user' }
          );
          
          console.log('- Delegation Result:');
          console.log('  * Response:', delegationResult.response ? 'YES' : 'NO');
          console.log('  * Response length:', delegationResult.response ? delegationResult.response.length : 0);
          console.log('  * Agent:', delegationResult.agent);
          
          if (delegationResult.response) {
            console.log('\n--- AGENT RESPONSE ---');
            console.log(delegationResult.response);
            console.log('--- END RESPONSE ---\n');
          }
        } catch (delegationError) {
          console.log('- Delegation Error:', delegationError.message);
        }
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    console.log('='.repeat(60));
  }
}

// Run the test
testAgentCapabilities().catch(console.error);