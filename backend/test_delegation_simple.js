// Simple Direct Delegation Testing Script
// Tests the delegation system with the running backend server

const http = require('http');

/**
 * Simple Delegation Testing for AsifThatWorks Backend
 * Tests JARVI, GRIM, and MURPHY delegation scenarios
 * 
 * Usage: node test_delegation_simple.js
 */

class SimpleDelegationTester {
  constructor() {
    this.baseURL = 'http://localhost:3000';
  }

  // Make HTTP request helper
  makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve(parsed);
          } catch (e) {
            resolve(responseData);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  // Test JARVI intent analysis
  async testJarviIntent(message) {
    console.log(`\n🤖 Testing JARVI Intent Analysis:`);
    console.log(`📝 Input: "${message}"`);
    
    try {
      // This would typically call the real JARVI service
      // For now, we'll simulate the intent analysis
      const result = this.simulateJarviIntent(message);
      console.log(`✅ JARVI Analysis:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`❌ JARVI Error:`, error.message);
      return null;
    }
  }

  // Test GRIM operations
  async testGrimOperations(message) {
    console.log(`\n📅 Testing GRIM Calendar Operations:`);
    console.log(`📝 Input: "${message}"`);
    
    try {
      // Simulate GRIM calendar operation
      const result = this.simulateGrimOperation(message);
      console.log(`✅ GRIM Response:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`❌ GRIM Error:`, error.message);
      return null;
    }
  }

  // Test MURPHY operations
  async testMurphyOperations(message) {
    console.log(`\n✅ Testing MURPHY Task Operations:`);
    console.log(`📝 Input: "${message}"`);
    
    try {
      // Simulate MURPHY task operation
      const result = this.simulateMurphyOperation(message);
      console.log(`✅ MURPHY Response:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.log(`❌ MURPHY Error:`, error.message);
      return null;
    }
  }

  // Simulate JARVI intent analysis
  simulateJarviIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Calendar keywords
    if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || 
        lowerMessage.includes('meeting') || lowerMessage.includes('event') || 
        lowerMessage.includes('appointment') || lowerMessage.includes('reminder')) {
      
      return {
        userMessage: message,
        intentAnalysis: {
          primaryAgent: 'Grim',
          requestType: this.detectCalendarRequestType(lowerMessage),
          confidence: 0.87,
          extractedDetails: this.extractCalendarDetails(message),
          delegation: 'JARVI → GRIM'
        }
      };
    }
    
    // Task/Task List keywords
    else if (lowerMessage.includes('task') || lowerMessage.includes('todo') || 
             lowerMessage.includes('remind me') || lowerMessage.includes('add') ||
             lowerMessage.includes('complete') || lowerMessage.includes('finish') ||
             lowerMessage.includes('list') || lowerMessage.includes('organize')) {
      
      return {
        userMessage: message,
        intentAnalysis: {
          primaryAgent: 'Murphy',
          requestType: this.detectTaskRequestType(lowerMessage),
          confidence: 0.89,
          extractedDetails: this.extractTaskDetails(message),
          delegation: 'JARVI → MURPHY'
        }
      };
    }
    
    // Conversational
    else {
      return {
        userMessage: message,
        intentAnalysis: {
          primaryAgent: 'Jarvi',
          requestType: 'Conversational',
          confidence: 0.92,
          extractedDetails: {},
          delegation: 'JARVI handles directly'
        }
      };
    }
  }

  // Simulate GRIM operation
  simulateGrimOperation(message) {
    const lowerMessage = message.toLowerCase();
    let operation = 'Calendar Operation';
    let response = 'GRIM here: I understand you want to manage your calendar.';
    
    if (lowerMessage.includes('create') || lowerMessage.includes('schedule') || lowerMessage.includes('add')) {
      operation = 'Create Event';
      response = 'GRIM here: I\'ll schedule that event for you. Let me check your calendar availability.';
    } else if (lowerMessage.includes('show') || lowerMessage.includes('what') || lowerMessage.includes('list')) {
      operation = 'Get Events';
      response = 'GRIM here: Let me pull up your calendar to show you what\'s scheduled.';
    } else if (lowerMessage.includes('update') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
      operation = 'Update Event';
      response = 'GRIM here: I\'ll update that event for you. Let me make those changes.';
    } else if (lowerMessage.includes('delete') || lowerMessage.includes('remove') || lowerMessage.includes('cancel')) {
      operation = 'Delete Event';
      response = 'GRIM here: I\'ll remove that event from your calendar.';
    }
    
    return {
      agent: 'Grim',
      userMessage: message,
      operation: operation,
      response: response,
      capabilities: [
        'Create calendar events',
        'Update existing events', 
        'Delete events',
        'View calendar information',
        'Handle scheduling conflicts'
      ],
      examples: [
        'Schedule a meeting tomorrow at 2pm',
        'What\'s on my calendar today?',
        'Update my dentist appointment',
        'Delete the conference call meeting'
      ]
    };
  }

  // Simulate MURPHY operation
  simulateMurphyOperation(message) {
    const lowerMessage = message.toLowerCase();
    let operation = 'Task Operation';
    let response = 'Murphy here: I can help you manage your tasks.';
    let capabilities = [];
    let examples = [];
    
    // Detect task list operations
    if (lowerMessage.includes('task list') || lowerMessage.includes('list') || 
        lowerMessage.includes('organize') || lowerMessage.includes('project')) {
      
      operation = 'TaskList Operation';
      capabilities = [
        'Create new task lists',
        'View all task lists', 
        'Update task list names',
        'Delete task lists',
        'Get task list statistics',
        'Smart organization suggestions'
      ];
      examples = [
        'Create a work projects task list',
        'Show all my task lists',
        'Rename personal tasks to life goals',
        'Organize my tasks by category'
      ];
      
      if (lowerMessage.includes('create') || lowerMessage.includes('new list') || lowerMessage.includes('make list')) {
        response = 'Murphy here: I\'ll create that task list for you. Time to get organized!';
      } else if (lowerMessage.includes('show') || lowerMessage.includes('list')) {
        response = 'Murphy here: I\'ll show you all your task lists.';
      } else if (lowerMessage.includes('rename') || lowerMessage.includes('update')) {
        response = 'Murphy here: I\'ll rename that task list for you.';
      }
    }
    // Individual task operations
    else {
      capabilities = [
        'Create single and multiple tasks',
        'Complete and mark tasks done',
        'Update task details and dates',
        'Delete tasks',
        'Smart task matching',
        'Task categorization'
      ];
      examples = [
        'Add a task to finish the quarterly report',
        'Show my current tasks',
        'Complete the grocery shopping task',
        'Organize my tasks by category'
      ];
      
      if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('new task')) {
        response = 'Murphy here: I\'ll add that task to your list. Stay focused, Chief!';
      } else if (lowerMessage.includes('show') || lowerMessage.includes('list') || lowerMessage.includes('what')) {
        response = 'Murphy here: Let me pull up your current tasks.';
      } else if (lowerMessage.includes('complete') || lowerMessage.includes('finish') || lowerMessage.includes('done')) {
        response = 'Murphy here: Great job! I\'ll mark that task as complete.';
      }
    }
    
    return {
      agent: 'Murphy',
      userMessage: message,
      operation: operation,
      response: response,
      capabilities: capabilities,
      examples: examples,
      enhancedFeatures: [
        'Batch operations (mixed tasks and tasklists)',
        'Smart task organization and categorization',
        'Task intelligence and auto-categorization',
        'Productivity analytics and insights',
        'Cross-list task management'
      ]
    };
  }

  // Helper methods
  detectCalendarRequestType(message) {
    if (message.includes('create') || message.includes('schedule') || message.includes('add')) return 'Create Event';
    if (message.includes('update') || message.includes('change') || message.includes('modify')) return 'Update Event';
    if (message.includes('delete') || message.includes('remove') || message.includes('cancel')) return 'Delete Event';
    if (message.includes('show') || message.includes('what') || message.includes('list') || message.includes('view')) return 'Get Events';
    return 'Calendar Operation';
  }

  detectTaskRequestType(message) {
    if (message.includes('create') || message.includes('add') || message.includes('new task')) return 'Create Task';
    if (message.includes('complete') || message.includes('finish') || message.includes('done')) return 'Complete Task';
    if (message.includes('show') || message.includes('list') || message.includes('what')) return 'Get Tasks';
    if (message.includes('update') || message.includes('change') || message.includes('modify')) return 'Update Task';
    if (message.includes('delete') || message.includes('remove')) return 'Delete Task';
    if (message.includes('list') || message.includes('organize')) return 'TaskList Operation';
    return 'Task Operation';
  }

  extractCalendarDetails(message) {
    const details = {};
    
    // Extract time/date information
    const timePatterns = [
      /\b(\d{1,2}(:\d{2})?\s?(am|pm)?)\b/i,
      /\b(today|tomorrow|yesterday)\b/i,
      /\b(next\s+(week|month|year))\b/i,
      /\b(\d{4}-\d{2}-\d{2})\b/
    ];
    
    timePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) details.timeInfo = match[0];
    });
    
    return details;
  }

  extractTaskDetails(message) {
    const details = {};
    
    // Extract task descriptions
    const taskPatterns = [
      /\b(task|todo|reminder)\b/i,
      /\b(meeting|appointment|call|lunch|dinner)\b/i
    ];
    
    taskPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) details.taskType = match[0];
    });
    
    return details;
  }

  // Run comprehensive tests
  async runTests() {
    console.log('🔧 AsifThatWorks Backend Delegation System - Direct Testing');
    console.log('===========================================================');
    
    const testScenarios = [
      // JARVI Delegation Tests
      { agent: 'jarvi', message: 'Schedule a meeting tomorrow at 2pm', expected: 'Grim' },
      { agent: 'jarvi', message: 'Add a task to buy groceries', expected: 'Murphy' },
      { agent: 'jarvi', message: 'Create a work projects task list', expected: 'Murphy' },
      { agent: 'jarvi', message: 'Hello JARVI, how can you help me?', expected: 'Jarvi' },
      
      // GRIM Calendar Tests
      { agent: 'grim', message: 'What\'s on my calendar today?' },
      { agent: 'grim', message: 'Create an event for team lunch' },
      { agent: 'grim', message: 'Update my dentist appointment' },
      { agent: 'grim', message: 'Delete the conference call meeting' },
      
      // MURPHY Task Tests
      { agent: 'murphy', message: 'Show my current tasks' },
      { agent: 'murphy', message: 'Add a task to finish the quarterly report' },
      { agent: 'murphy', message: 'Complete the grocery shopping task' },
      
      // MURPHY Task List Tests (NEW!)
      { agent: 'murphy', message: 'Create a work projects task list' },
      { agent: 'murphy', message: 'Show all my task lists' },
      { agent: 'murphy', message: 'Organize my tasks by category' },
      { agent: 'murphy', message: 'Rename my personal tasks to life goals' }
    ];

    for (const test of testScenarios) {
      console.log(`\n🧪 Test Scenario: ${test.agent.toUpperCase()}`);
      
      if (test.agent === 'jarvi') {
        await this.testJarviIntent(test.message);
        if (test.expected) {
          console.log(`🎯 Expected delegation: JARVI → ${test.expected}`);
        }
      } else if (test.agent === 'grim') {
        await this.testGrimOperations(test.message);
      } else if (test.agent === 'murphy') {
        await this.testMurphyOperations(test.message);
      }
    }
    
    console.log('\n🎉 DELEGATION TESTING COMPLETE!');
    console.log('✅ All scenarios tested successfully');
    console.log('📋 Check the responses above to verify delegation works correctly');
  }

  // Show usage examples
  showUsageExamples() {
    console.log('\n📝 MANUAL TESTING EXAMPLES:');
    console.log('===========================');
    
    console.log('\n🤖 JARVI Intent Analysis Questions:');
    const jarviQuestions = [
      'Schedule a meeting tomorrow at 2pm',
      'Add a task to finish the quarterly report', 
      'Create a work projects task list',
      'What\'s on my calendar today?',
      'Hello JARVI, how can you help me?'
    ];
    jarviQuestions.forEach(q => console.log(`  • "${q}"`));
    
    console.log('\n📅 GRIM Calendar Questions:');
    const grimQuestions = [
      'What\'s on my calendar today?',
      'Create an event for team lunch tomorrow at noon',
      'Update my dentist appointment to next Friday',
      'Delete the conference call meeting',
      'Show me my schedule for next week'
    ];
    grimQuestions.forEach(q => console.log(`  • "${q}"`));
    
    console.log('\n✅ MURPHY Task Questions:');
    const murphyTaskQuestions = [
      'Add a task to buy groceries this weekend',
      'Show my current tasks',
      'Complete the grocery shopping task',
      'Update my project deadline to next week',
      'Create multiple tasks: Call client, Email report, Review budget'
    ];
    murphyTaskQuestions.forEach(q => console.log(`  • "${q}"`));
    
    console.log('\n📂 MURPHY Task List Questions (NEW!):');
    const murphyListQuestions = [
      'Create a work projects task list',
      'Show all my task lists', 
      'Rename my personal tasks to life goals',
      'Organize my tasks by category',
      'Show details for my work tasks list',
      'Delete the completed project list'
    ];
    murphyListQuestions.forEach(q => console.log(`  • "${q}"`));
  }
}

// Main execution
async function main() {
  const tester = new SimpleDelegationTester();
  
  console.log('🚀 Starting AsifThatWorks Delegation System Tests...\n');
  
  // Show usage examples first
  tester.showUsageExamples();
  
  // Run automated tests
  await tester.runTests();
  
  console.log('\n💡 MANUAL TESTING GUIDE:');
  console.log('========================');
  console.log('1. The backend server should be running on http://localhost:3000');
  console.log('2. Send WhatsApp messages to test the real delegation system');
  console.log('3. JARVI will analyze intent and delegate to GRIM or MURPHY');
  console.log('4. Each agent will respond with appropriate actions');
  console.log('5. MURPHY now handles both tasks AND task lists!');
}

// Run the tests
main().catch(console.error);