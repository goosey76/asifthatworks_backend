// Test script to verify delegation fix for grim capabilities
const jarviService = require('./src/services/jarvi-service');

async function testDelegationFix() {
  console.log('=== Testing JARVI Delegation Fix ===\n');
  
  const testCases = [
    { text: "what can grim do?", expectedRecipient: "Grim" },
    { text: "what are grim's capabilities?", expectedRecipient: "Grim" },
    { text: "what can murphy do?", expectedRecipient: "Murphy" },
    { text: "what are murphy's capabilities?", expectedRecipient: "Murphy" },
    { text: "what can you do?", expectedRecipient: "JARVI" },
    { text: "what can jarvi do?", expectedRecipient: "JARVI" },
    { text: "hey jarvi", expectedRecipient: null } // Should be direct response
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: "${testCase.text}" ---`);
    console.log(`Expected recipient: ${testCase.expectedRecipient || 'DIRECT RESPONSE'}`);
    
    try {
      const jarviResponse = await jarviService.analyzeIntent({
        text: testCase.text,
        userId: 'test_user'
      });
      
      console.log('Result:');
      
      if (testCase.expectedRecipient) {
        if (jarviResponse.delegationJson) {
          const { Recipient, RequestType } = jarviResponse.delegationJson;
          console.log('Delegation:', { Recipient, RequestType });
          if (Recipient === testCase.expectedRecipient) {
            console.log('✅ CORRECT: Right agent delegation');
          } else {
            console.log('❌ INCORRECT: Wrong agent, got', Recipient, 'but expected', testCase.expectedRecipient);
          }
        } else {
          console.log('❌ INCORRECT: Expected delegation but got direct response');
        }
      } else {
        if (jarviResponse.responseToUser && !jarviResponse.delegationJson) {
          console.log('✅ CORRECT: Direct response sent');
          console.log('Response:', jarviResponse.responseToUser.substring(0, 100) + '...');
        } else {
          console.log('❌ INCORRECT: Expected direct response but got delegation');
        }
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    console.log('='.repeat(60));
  }
}

// Run the test
testDelegationFix().catch(console.error);