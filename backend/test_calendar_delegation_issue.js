// Test to reproduce the specific calendar delegation issues
const jarviService = require('./src/services/jarvi-service');
const agentService = require('./src/services/agents/jarvi-agent');

async function testCalendarDelegationIssues() {
  console.log('=== Testing Calendar Delegation Issues ===\n');
  
  // Test cases that reproduce the exact problems described
  const testCases = [
    {
      text: "Schedule a meeting with John tomorrow at 2pm",
      expectedIntent: "create_event",
      expectedRecipient: "Grim",
      description: "Should create calendar event, not show introduction"
    },
    {
      text: "Show me my calendar",
      expectedIntent: "get_event",
      expectedRecipient: "Grim", 
      description: "Should show calendar overview, not delegate back to Grim"
    },
    {
      text: "What can Grim do?",
      expectedIntent: "get_goals",
      expectedRecipient: "Grim",
      description: "This should show capabilities (current working case)"
    },
    {
      text: "Schedule an appointment with Dr. Smith next Friday",
      expectedIntent: "create_event",
      expectedRecipient: "Grim",
      description: "Should create calendar event directly"
    },
    {
      text: "Check my calendar for tomorrow",
      expectedIntent: "get_event", 
      expectedRecipient: "Grim",
      description: "Should get calendar events, not show introduction"
    }
  ];
  
  console.log('🎯 CURRENT PROBLEMS TO FIX:');
  console.log('1. "Schedule a meeting..." → Currently shows Grim introduction');
  console.log('2. "Show me my calendar" → Currently JARVI responds instead of Grim');
  console.log('3. Need operational requests to be handled by Grim, not conversational');
  console.log('');
  
  for (const testCase of testCases) {
    console.log(`--- Testing: "${testCase.text}" ---`);
    console.log(`Expected: ${testCase.description}`);
    
    try {
      // Test JARVI intent analysis
      const jarviResponse = await jarviService.analyzeIntent({
        text: testCase.text,
        userId: 'test_user_123'
      });
      
      console.log('Step 1 - JARVI Intent Analysis:');
      
      if (jarviResponse.delegationJson) {
        const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
        console.log(`✅ Created delegation: { Recipient: "${Recipient}", RequestType: "${RequestType}" }`);
        
        // Check if delegation is correct
        if (Recipient === testCase.expectedRecipient && RequestType === testCase.expectedIntent) {
          console.log('✅ CORRECT: Delegation matches expected');
          
          // Now test what happens when the delegation reaches Grim
          console.log('Step 2 - Testing Delegation to Grim:');
          
          try {
            const delegationResult = await agentService.delegateTask(
              { Recipient, RequestType, Message },
              { message: Message },
              'test_user_123'
            );
            
            console.log('Delegation result:');
            console.log('- Has response:', delegationResult?.response ? 'YES' : 'NO');
            console.log('- Response preview:', delegationResult?.response?.substring(0, 100) + '...' || 'NO RESPONSE');
            console.log('- Event ID:', delegationResult?.eventId || 'NO EVENT ID');
            
            // Check if this is an introduction/capability message vs operational result
            if (delegationResult?.response) {
              const responseLower = delegationResult.response.toLowerCase();
              const isIntroduction = responseLower.includes('i\'m grim') || 
                                   responseLower.includes('i am grim') ||
                                   responseLower.includes('calendar guardian') ||
                                   responseLower.includes('time management partner') ||
                                   responseLower.includes('capabilities');
              
              const isOperational = responseLower.includes('created') ||
                                  responseLower.includes('scheduled') ||
                                  responseLower.includes('meeting') ||
                                  responseLower.includes('appointment') ||
                                  responseLower.includes('calendar') ||
                                  responseLower.includes('events');
              
              if (isIntroduction && testCase.expectedIntent !== 'get_goals') {
                console.log('❌ PROBLEM: Got introduction/capabilities instead of operational response');
              } else if (isOperational || testCase.expectedIntent === 'get_goals') {
                console.log('✅ GOOD: Got appropriate response type');
              } else {
                console.log('⚠️  UNCLEAR: Response type unclear');
              }
            }
            
          } catch (delegationError) {
            console.log('❌ Delegation error:', delegationError.message);
          }
          
        } else {
          console.log(`❌ WRONG: Expected { Recipient: "${testCase.expectedRecipient}", RequestType: "${testCase.expectedIntent}" }`);
        }
        
      } else {
        console.log('❌ NO DELEGATION: Got direct response instead');
        console.log(`Response: "${jarviResponse.responseToUser?.substring(0, 100)}..."`);
      }
      
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
    
    console.log('='.repeat(80));
    console.log('');
  }
  
  console.log('=== SUMMARY ===');
  console.log('Issues to fix:');
  console.log('1. Grim should handle operational requests (create_event, get_event) directly');
  console.log('2. Grim should only show capabilities for get_goals intent');
  console.log('3. JARVI should properly delegate calendar operations to Grim');
}

// Run the test
testCalendarDelegationIssues().catch(console.error);