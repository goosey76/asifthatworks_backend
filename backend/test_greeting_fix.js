// Test script to verify greeting fix
const jarviService = require('./src/services/jarvi-service');

async function testGreetingFix() {
  console.log('=== Testing JARVI Greeting Fix ===\n');
  
  const testCases = [
    { text: "hey jarvi", expected: "direct_response" },
    { text: "hello jarvi", expected: "direct_response" },
    { text: "what can you do?", expected: "capability_delegation" },
    { text: "what can jarvi do?", expected: "capability_delegation" },
    { text: "hi there jarvi", expected: "direct_response" },
    { text: "how's it going jarvi?", expected: "direct_response" }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing: "${testCase.text}" ---`);
    console.log(`Expected: ${testCase.expected}`);
    
    try {
      const jarviResponse = await jarviService.analyzeIntent({
        text: testCase.text,
        userId: 'test_user'
      });
      
      console.log('Result:');
      console.log('- Response to User:', jarviResponse.responseToUser ? 'YES' : 'NO');
      console.log('- Delegation JSON:', jarviResponse.delegationJson ? 'YES' : 'NO');
      
      if (testCase.expected === 'direct_response' && jarviResponse.responseToUser) {
        console.log('✅ CORRECT: Direct response sent');
        console.log('Response:', jarviResponse.responseToUser);
      } else if (testCase.expected === 'capability_delegation' && jarviResponse.delegationJson) {
        console.log('✅ CORRECT: Capability delegation created');
        const { Recipient, RequestType } = jarviResponse.delegationJson;
        console.log('Delegation:', { Recipient, RequestType });
      } else {
        console.log('❌ INCORRECT: Expected', testCase.expected, 'but got opposite');
      }
      
    } catch (error) {
      console.log('Error:', error.message);
    }
    
    console.log('='.repeat(60));
  }
}

// Run the test
testGreetingFix().catch(console.error);