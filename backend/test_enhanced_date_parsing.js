/**
 * Test Enhanced Date Range Parsing for Real-World Calendar Entries
 * Tests patterns like "17-20" as "November 17-20" with intelligent fallback
 */

const DateRangeParser = require('./src/services/agents/grim-agent/calendar/date-range-parser.js');

async function testEnhancedDateParsing() {
  console.log("🧪 Testing Enhanced Date Range Parsing System\n");
  
  const parser = new DateRangeParser();
  
  // Test cases for enhanced date parsing
  const testCases = [
    {
      input: "17-20",
      description: "Date range pattern - should handle as November 17-20",
      context: { eventTitle: "University Workshop" }
    },
    {
      input: "20-17", 
      description: "Malformed date - should fix to current month/day",
      context: { eventTitle: "Meeting" }
    },
    {
      input: "25-17",
      description: "Another malformed date - should fix to current month/day", 
      context: { eventTitle: "Conference" }
    },
    {
      input: "today",
      description: "Relative date - should work correctly",
      context: { eventTitle: "Daily Standup" }
    },
    {
      input: "tomorrow", 
      description: "Relative date - should work correctly",
      context: { eventTitle: "Project Review" }
    },
    {
      input: "2025-11-20",
      description: "Standard format - should validate correctly",
      context: { eventTitle: "Deadline" }
    },
    {
      input: "november 15",
      description: "Natural language - should extract correctly",
      context: { eventTitle: "Workshop" }
    },
    {
      input: "invalid-date-xyz",
      description: "Invalid date - should request clarification",
      context: { eventTitle: "Test Event" }
    }
  ];
  
  let successCount = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    
    try {
      const result = parser.parseDateString(testCase.input, testCase.context);
      
      console.log(`   ✅ Parsed: ${result.date}`);
      console.log(`   Method: ${result.method}`);
      console.log(`   Description: ${result.description}`);
      
      if (result.isRange) {
        console.log(`   Range End: ${result.endDate}`);
      }
      
      if (result.needsClarification) {
        console.log(`   ⚠️ Needs Clarification: ${result.clarificationMessage}`);
      }
      
      if (result.parsed && !result.needsClarification) {
        successCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`   Successful Parses: ${successCount}/${totalTests}`);
  console.log(`   Success Rate: ${((successCount/totalTests) * 100).toFixed(1)}%`);
  
  if (successCount/totalTests >= 0.9) {
    console.log(`   🎯 TARGET ACHIEVED: 90%+ success rate for enhanced date parsing!`);
  } else {
    console.log(`   📈 Needs improvement to reach 90%+ success rate`);
  }
  
  // Test specific date range functionality
  console.log(`\n🔍 Testing Date Range Detection:`);
  const rangeTest = parser.parseDateString("17-20", { eventTitle: "Conference" });
  console.log(`   Input: "17-20"`);
  console.log(`   Detected as range: ${rangeTest.isRange ? 'YES' : 'NO'}`);
  if (rangeTest.isRange) {
    console.log(`   Start: ${rangeTest.date}`);
    console.log(`   End: ${rangeTest.endDate}`);
  }
  
  return successCount / totalTests;
}

// Run the test
testEnhancedDateParsing()
  .then(successRate => {
    console.log(`\n🏆 Enhanced Date Parsing Test Complete`);
    console.log(`   Final Success Rate: ${(successRate * 100).toFixed(1)}%`);
  })
  .catch(error => {
    console.error(`❌ Test failed:`, error);
  });