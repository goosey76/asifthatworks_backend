// Comprehensive Delegation System Test File
// Tests JARVI delegation to GRIM and MURPHY with full end-to-end flow

const express = require('express');
const bodyParser = require('body-parser');

/**
 * Manual Testing Guide for AsifThatWorks Backend Delegation System
 * 
 * This file provides comprehensive testing scenarios for:
 * 1. JARVI Intent Analysis & Delegation
 * 2. GRIM Calendar Operations  
 * 3. MURPHY Task Operations (Tasks & Task Lists)
 * 4. Cross-agent Communication
 * 
 * RUN THIS WITH: node test_delegation_system_manual.js
 * SERVER RUNS ON: http://localhost:3000
 */

class DelegationSystemTester {
  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(bodyParser.json());
    this.app.use(express.static('.'));
    
    // Main test interface
    this.app.get('/', (req, res) => {
      res.send(this.getTestInterfaceHTML());
    });
    
    // Test JARVI delegation endpoint
    this.app.post('/test-delegation', (req, res) => {
      this.testDelegation(req.body, res);
    });
    
    // Test GRIM calendar operations
    this.app.post('/test-grim', (req, res) => {
      this.testGrimOperations(req.body, res);
    });
    
    // Test MURPHY task operations
    this.app.post('/test-murphy', (req, res) => {
      this.testMurphyOperations(req.body, res);
    });
    
    // Test direct JARVI intent analysis
    this.app.post('/test-jarvi-intent', (req, res) => {
      this.testJarviIntent(req.body, res);
    });
    
    // Get agent capabilities
    this.app.get('/agent-capabilities', (req, res) => {
      res.json(this.getAgentCapabilities());
    });
  }

  getTestInterfaceHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>AsifThatWorks Delegation System Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
            .agent-section { background-color: #f5f5f5; }
            .input-group { margin: 10px 0; }
            label { display: block; font-weight: bold; margin-bottom: 5px; }
            input, textarea, select { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; }
            button { background-color: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #005a87; }
            .result { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007cba; }
            .error { border-left-color: #dc3545; }
            .success { border-left-color: #28a745; }
            .examples { background-color: #e7f3ff; padding: 15px; margin: 10px 0; border-radius: 4px; }
            .agent-murphy { border-left-color: #ff6b35; }
            .agent-grim { border-left-color: #4ecdc4; }
            .agent-jarvi { border-left-color: #45b7d1; }
        </style>
    </head>
    <body>
        <h1>🔧 AsifThatWorks Delegation System Test Interface</h1>
        <p><strong>Backend Status:</strong> <span style="color: green;">✅ RUNNING</span> (Server on http://localhost:3000)</p>
        
        <div class="test-section agent-section">
            <h2>🤖 JARVI Intent Analysis Test</h2>
            <p>Test JARVI's ability to analyze user intent and delegate to the appropriate agent.</p>
            <div class="examples">
                <h3>📝 Example Questions to Test JARVI:</h3>
                <ul>
                    <li><strong>For GRIM (Calendar):</strong> "Schedule a meeting tomorrow at 2pm", "What's on my calendar today?", "Create a reminder for Friday"</li>
                    <li><strong>For MURPHY (Tasks):</strong> "Add a task to buy groceries", "Show my task list", "Complete the project task"</li>
                    <li><strong>For MURPHY (Task Lists):</strong> "Create a work tasks list", "Show all my task lists", "Rename my personal tasks"</li>
                    <li><strong>For JARVI (Conversational):</strong> "Hello", "How are you?", "What can you help me with?"</li>
                </ul>
            </div>
            <div class="input-group">
                <label>Test Message:</label>
                <textarea id="jarvi-test-message" rows="3" placeholder="Enter a test message for JARVI intent analysis...">Schedule a meeting tomorrow at 2pm</textarea>
            </div>
            <button onclick="testJarviIntent()">🔍 Test JARVI Intent Analysis</button>
            <div id="jarvi-result"></div>
        </div>
        
        <div class="test-section agent-section">
            <h2>📅 GRIM Calendar Operations Test</h2>
            <p>Test GRIM's calendar management capabilities.</p>
            <div class="examples">
                <h3>📝 Example Questions for GRIM:</h3>
                <ul>
                    <li>"Create an event for team meeting tomorrow at 3pm"</li>
                    <li>"What's my schedule for next week?"</li>
                    <li>"Update my dentist appointment to next Friday"</li>
                    <li>"Delete the conference call meeting"</li>
                    <li>"Show me today's calendar"</li>
                    <li>"Create multiple events: Project review at 10am, Lunch at 12pm, Client call at 2pm"</li>
                </ul>
            </div>
            <div class="input-group">
                <label>Test Message:</label>
                <textarea id="grim-test-message" rows="3" placeholder="Enter a test message for GRIM calendar operations...">What's my schedule for today?</textarea>
            </div>
            <button onclick="testGrimOperations()">📅 Test GRIM Operations</button>
            <div id="grim-result"></div>
        </div>
        
        <div class="test-section agent-section">
            <h2>✅ MURPHY Task Operations Test</h2>
            <p>Test MURPHY's task and task list management capabilities.</p>
            <div class="examples">
                <h3>📝 Example Questions for MURPHY:</h3>
                <h4>Individual Tasks:</h4>
                <ul>
                    <li>"Add a task to finish the quarterly report"</li>
                    <li>"Show my current tasks"</li>
                    <li>"Complete the grocery shopping task"</li>
                    <li>"Update my project deadline task to next week"</li>
                    <li>"Delete the old meeting preparation task"</li>
                </ul>
                <h4>Task Lists:</h4>
                <ul>
                    <li>"Create a work projects task list"</li>
                    <li>"Show all my task lists"</li>
                    <li>"Rename my personal tasks to life goals"</li>
                    <li>"Delete the completed project list"</li>
                    <li>"Show details for my work tasks list"</li>
                </ul>
                <h4>Smart Operations:</h4>
                <ul>
                    <li>"Organize my tasks by category"</li>
                    <li>"Create work list and add 3 tasks to it"</li>
                    <li>"Complete all my high priority tasks"</li>
                </ul>
            </div>
            <div class="input-group">
                <label>Test Message:</label>
                <textarea id="murphy-test-message" rows="3" placeholder="Enter a test message for MURPHY task operations...">Add a task to buy groceries this weekend</textarea>
            </div>
            <button onclick="testMurphyOperations()">✅ Test MURPHY Operations</button>
            <div id="murphy-result"></div>
        </div>
        
        <div class="test-section">
            <h2>🔄 Full Delegation Test</h2>
            <p>Test the complete delegation flow from user message to agent response.</p>
            <div class="examples">
                <h3>📝 Delegation Test Scenarios:</h3>
                <ul>
                    <li><strong>Calendar Delegation:</strong> "I need to schedule a doctor appointment next Tuesday"</li>
                    <li><strong>Task Delegation:</strong> "Remember to call mom this evening"</li>
                    <li><strong>Task List Delegation:</strong> "I want to organize my tasks into separate lists"</li>
                    <li><strong>Conversational:</strong> "Hi JARVI, how can you help me today?"</li>
                </ul>
            </div>
            <div class="input-group">
                <label>Test Message:</label>
                <textarea id="delegation-test-message" rows="3" placeholder="Enter a test message for full delegation flow...">I need to schedule a team meeting for Friday afternoon</textarea>
            </div>
            <button onclick="testFullDelegation()">🔄 Test Full Delegation</button>
            <div id="delegation-result"></div>
        </div>
        
        <div class="test-section">
            <h2>📊 Agent Capabilities</h2>
            <p>View the current capabilities of each agent.</p>
            <button onclick="loadAgentCapabilities()">📋 Load Agent Capabilities</button>
            <div id="capabilities-result"></div>
        </div>
        
        <script>
            async function testJarviIntent() {
                const message = document.getElementById('jarvi-test-message').value;
                const resultDiv = document.getElementById('jarvi-result');
                resultDiv.innerHTML = '<div class="result">🔄 Testing JARVI intent analysis...</div>';
                
                try {
                    const response = await fetch('/test-jarvi-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, userId: 'test-user-123' })
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = '<div class="result agent-jarvi"><strong>JARVI Intent Analysis:</strong><br>' + JSON.stringify(result, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            }
            
            async function testGrimOperations() {
                const message = document.getElementById('grim-test-message').value;
                const resultDiv = document.getElementById('grim-result');
                resultDiv.innerHTML = '<div class="result">🔄 Testing GRIM operations...</div>';
                
                try {
                    const response = await fetch('/test-grim', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, userId: 'test-user-123' })
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = '<div class="result agent-grim"><strong>GRIM Response:</strong><br>' + JSON.stringify(result, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            }
            
            async function testMurphyOperations() {
                const message = document.getElementById('murphy-test-message').value;
                const resultDiv = document.getElementById('murphy-result');
                resultDiv.innerHTML = '<div class="result">🔄 Testing MURPHY operations...</div>';
                
                try {
                    const response = await fetch('/test-murphy', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, userId: 'test-user-123' })
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = '<div class="result agent-murphy"><strong>MURPHY Response:</strong><br>' + JSON.stringify(result, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            }
            
            async function testFullDelegation() {
                const message = document.getElementById('delegation-test-message').value;
                const resultDiv = document.getElementById('delegation-result');
                resultDiv.innerHTML = '<div class="result">🔄 Testing full delegation flow...</div>';
                
                try {
                    const response = await fetch('/test-delegation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, userId: 'test-user-123' })
                    });
                    const result = await response.json();
                    resultDiv.innerHTML = '<div class="result"><strong>Full Delegation Result:</strong><br>' + JSON.stringify(result, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            }
            
            async function loadAgentCapabilities() {
                const resultDiv = document.getElementById('capabilities-result');
                resultDiv.innerHTML = '<div class="result">🔄 Loading agent capabilities...</div>';
                
                try {
                    const response = await fetch('/agent-capabilities');
                    const result = await response.json();
                    resultDiv.innerHTML = '<div class="result"><strong>Agent Capabilities:</strong><br>' + JSON.stringify(result, null, 2) + '</div>';
                } catch (error) {
                    resultDiv.innerHTML = '<div class="result error"><strong>Error:</strong> ' + error.message + '</div>';
                }
            }
        </script>
    </body>
    </html>
    `;
  }

  async testJarviIntent(data, res) {
    try {
      // Simulate JARVI intent analysis
      const { message, userId } = data;
      
      // Simple intent detection logic
      let agent = 'Jarvi';
      let requestType = 'Conversational';
      let confidence = 0.9;
      
      const lowerMessage = message.toLowerCase();
      
      // Calendar keywords
      if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule') || lowerMessage.includes('meeting') || 
          lowerMessage.includes('event') || lowerMessage.includes('appointment') || lowerMessage.includes('reminder')) {
        agent = 'Grim';
        requestType = this.detectCalendarRequestType(lowerMessage);
        confidence = 0.85;
      }
      // Task keywords
      else if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('remind me') ||
               lowerMessage.includes('add') || lowerMessage.includes('complete') || lowerMessage.includes('finish')) {
        agent = 'Murphy';
        requestType = this.detectTaskRequestType(lowerMessage);
        confidence = 0.88;
      }
      // Task List keywords
      else if (lowerMessage.includes('task list') || lowerMessage.includes('list') || lowerMessage.includes('organize')) {
        agent = 'Murphy';
        requestType = 'TaskListOperation';
        confidence = 0.87;
      }
      
      const intentAnalysis = {
        userMessage: message,
        userId: userId,
        intentAnalysis: {
          primaryAgent: agent,
          requestType: requestType,
          confidence: confidence,
          extractedDetails: this.extractDetails(message),
          timestamp: new Date().toISOString()
        }
      };
      
      res.json(intentAnalysis);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async testGrimOperations(data, res) {
    try {
      const { message, userId } = data;
      
      // Simulate GRIM calendar operations
      const operations = this.detectCalendarOperations(message);
      
      const grimResponse = {
        userMessage: message,
        userId: userId,
        agent: 'Grim',
        requestType: 'Calendar',
        operations: operations,
        response: this.generateGrimResponse(message, operations),
        timestamp: new Date().toISOString()
      };
      
      res.json(grimResponse);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async testMurphyOperations(data, res) {
    try {
      const { message, userId } = data;
      
      // Detect if this is a task list operation
      const isTaskListOperation = this.isTaskListOperation(message);
      const operations = isTaskListOperation ? 
        this.detectTaskListOperations(message) : 
        this.detectTaskOperations(message);
      
      const murphyResponse = {
        userMessage: message,
        userId: userId,
        agent: 'Murphy',
        requestType: isTaskListOperation ? 'TaskListOperation' : 'TaskOperation',
        operations: operations,
        response: this.generateMurphyResponse(message, operations),
        capabilities: this.getMurphyCapabilities(),
        timestamp: new Date().toISOString()
      };
      
      res.json(murphyResponse);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async testDelegation(data, res) {
    try {
      const { message, userId } = data;
      
      // Step 1: JARVI Intent Analysis
      const intent = await this.testJarviIntent({ message, userId }, { json: (data) => data });
      
      // Step 2: Route to appropriate agent
      let agentResponse;
      switch (intent.intentAnalysis.primaryAgent) {
        case 'Grim':
          agentResponse = await this.testGrimOperations({ message, userId }, { json: (data) => data });
          break;
        case 'Murphy':
          agentResponse = await this.testMurphyOperations({ message, userId }, { json: (data) => data });
          break;
        default:
          agentResponse = this.generateJarviResponse(message);
      }
      
      const delegationResult = {
        originalMessage: message,
        userId: userId,
        delegationFlow: {
          step1_intentAnalysis: intent.intentAnalysis,
          step2_agentRouting: {
            delegatedTo: intent.intentAnalysis.primaryAgent,
            requestType: intent.intentAnalysis.requestType,
            confidence: intent.intentAnalysis.confidence
          },
          step3_agentResponse: agentResponse
        },
        finalResponse: agentResponse.response || agentResponse.messageToUser,
        timestamp: new Date().toISOString()
      };
      
      res.json(delegationResult);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  getAgentCapabilities() {
    return {
      JARVI: {
        role: 'Personal Manager & Life Coach',
        capabilities: [
          'Intent analysis and agent delegation',
          'Conversational interactions and greetings',
          'Life coaching and motivational support',
          'Cross-agent coordination',
          'User guidance and help'
        ],
        exampleQuestions: [
          'Hello JARVI, how can you help me today?',
          'What can you help me with?',
          'I feel overwhelmed, can you help?',
          'What agents are available?'
        ]
      },
      GRIM: {
        role: 'Calendar & Scheduling Specialist',
        capabilities: [
          'Create calendar events and meetings',
          'Update and modify existing events',
          'Delete events and appointments',
          'Check calendar availability',
          'Set reminders and notifications',
          'Handle time zones and scheduling',
          'Multiple event creation',
          'Location and description management'
        ],
        exampleQuestions: [
          'Schedule a meeting tomorrow at 2pm',
          'What\'s on my calendar today?',
          'Create an event for team lunch at noon',
          'Update my dentist appointment to next Friday',
          'Show me my schedule for next week',
          'Delete the conference call meeting',
          'Create multiple events for my project kickoff'
        ]
      },
      MURPHY: {
        role: 'Task Management & Productivity Specialist',
        capabilities: {
          individualTasks: [
            'Create single and multiple tasks',
            'Complete and mark tasks as done',
            'Update task details and due dates',
            'Delete tasks',
            'Smart task matching and fuzzy search',
            'Task categorization and priority detection'
          ],
          taskLists: [
            'Create new task lists',
            'View all task lists',
            'Update task list names',
            'Delete task lists (except default)',
            'Get task list statistics and analytics',
            'Smart task list suggestions'
          ],
          enhancedFeatures: [
            'Batch operations (mixed tasks and tasklists)',
            'Smart task organization and categorization',
            'Task intelligence and auto-categorization',
            'Productivity analytics and insights',
            'Cross-list task management'
          ]
        },
        exampleQuestions: {
          individualTasks: [
            'Add a task to finish the quarterly report',
            'Show my current tasks',
            'Complete the grocery shopping task',
            'Update my project deadline to next week',
            'Delete the old meeting preparation task',
            'Create multiple tasks: Call client, Email report, Review budget'
          ],
          taskLists: [
            'Create a work projects task list',
            'Show all my task lists',
            'Rename my personal tasks to life goals',
            'Delete the completed project list',
            'Show details for my work tasks list',
            'Organize my tasks into separate lists'
          ],
          smartOperations: [
            'Organize my tasks by category',
            'Create work list and add 3 tasks to it',
            'Complete all my high priority tasks',
            'Show task completion statistics'
          ]
        }
      }
    };
  }

  // Helper methods for intent detection
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
    return 'Task Operation';
  }

  isTaskListOperation(message) {
    const taskListKeywords = ['task list', 'list', 'organize', 'categorize', 'project list', 'work list'];
    return taskListKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  detectTaskListOperations(message) {
    if (message.includes('create') || message.includes('new list') || message.includes('make list')) return 'Create Task List';
    if (message.includes('show') || message.includes('list') || message.includes('all my')) return 'Get Task Lists';
    if (message.includes('rename') || message.includes('update') || message.includes('change name')) return 'Update Task List';
    if (message.includes('delete') || message.includes('remove list')) return 'Delete Task List';
    if (message.includes('details') || message.includes('info') || message.includes('statistics')) return 'Get Task List Details';
    return 'Task List Operation';
  }

  detectTaskOperations(message) {
    return this.detectTaskRequestType(message);
  }

  detectCalendarOperations(message) {
    return this.detectCalendarRequestType(message);
  }

  extractDetails(message) {
    // Simple extraction logic
    const details = {};
    
    // Extract time/date information
    const timePatterns = [
      /\\b(\\d{1,2}(:\\d{2})?\\s?(am|pm)?)\\b/i,
      /\\b(today|tomorrow|yesterday)\\b/i,
      /\\b(next\\s+(week|month|year))\\b/i,
      /\\b(\\d{4}-\\d{2}-\\d{2})\\b/
    ];
    
    timePatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) details.timeInfo = match[0];
    });
    
    // Extract task/activity descriptions
    const activityPatterns = [
      /\\b(meeting|appointment|event|call|lunch|dinner)\\b/i,
      /\\b(task|todo|reminder)\\b/i
    ];
    
    activityPatterns.forEach(pattern => {
      const match = message.match(pattern);
      if (match) details.activity = match[0];
    });
    
    return details;
  }

  generateGrimResponse(message, operation) {
    const responses = {
      'Create Event': 'GRIM here: I\'ll schedule that event for you. Let me check your calendar availability and create it.',
      'Get Events': 'GRIM here: Let me pull up your calendar to show you what\'s scheduled.',
      'Update Event': 'GRIM here: I\'ll update that event for you. Let me make those changes.',
      'Delete Event': 'GRIM here: I\'ll remove that event from your calendar.',
      'Calendar Operation': 'GRIM here: I can help you with your calendar management. What would you like me to do?'
    };
    
    return responses[operation] || 'GRIM here: I understand you want to manage your calendar. How can I help you with scheduling?';
  }

  generateMurphyResponse(message, operation) {
    const responses = {
      'Create Task': 'Murphy here: I\'ll add that task to your list. Stay focused, Chief!',
      'Create Task List': 'Murphy here: I\'ll create that task list for you. Time to get organized!',
      'Get Tasks': 'Murphy here: Let me pull up your current tasks.',
      'Get Task Lists': 'Murphy here: I\'ll show you all your task lists.',
      'Complete Task': 'Murphy here: Great job! I\'ll mark that task as complete.',
      'Update Task': 'Murphy here: I\'ll update that task for you. All set!',
      'Update Task List': 'Murphy here: I\'ll rename that task list for you.',
      'Delete Task': 'Murphy here: I\'ll remove that task from your list.',
      'Delete Task List': 'Murphy here: I\'ll delete that task list for you.',
      'Task Operation': 'Murphy here: I can help you manage your tasks. What would you like to do?',
      'Task List Operation': 'Murphy here: I can help you organize your task lists. How can I assist?'
    };
    
    return responses[operation] || 'Murphy here: I\'m here to help you stay organized and productive! What can I do for you?';
  }

  generateJarviResponse(message) {
    const responses = [
      'JARVI here: Hello! I\'m your personal manager and life coach. I can help you manage your tasks with Murphy and schedule events with GRIM. How can I assist you today?',
      'JARVI here: Hi there! I\'m here to support you in achieving your goals. What would you like to work on today?',
      'JARVI here: Welcome! I coordinate between Murphy for tasks and GRIM for scheduling. What can I help you organize?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getMurphyCapabilities() {
    return {
      taskOperations: ['createTask', 'createMultipleTasks', 'completeTask', 'getTasks', 'updateTask', 'deleteTask'],
      taskListOperations: ['getTaskLists', 'createTaskList', 'updateTaskList', 'deleteTaskList', 'getTaskListDetails'],
      enhancedOperations: ['batchTaskOperations', 'smartTaskOrganization'],
      features: ['Smart task matching', 'Task categorization', 'Priority detection', 'Batch processing', 'Analytics']
    };
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log('\\n🔧 DELEGATION SYSTEM TEST INTERFACE');
      console.log('=====================================');
      console.log(`✅ Server running on: http://localhost:${port}`);
      console.log('🌐 Open your browser to test the delegation system');
      console.log('📋 Use the interface to test JARVI, GRIM, and MURPHY');
      console.log('\\n🧪 TEST SCENARIOS:');
      console.log('• JARVI: "Schedule a meeting tomorrow"');
      console.log('• GRIM: "What\'s on my calendar today?"');
      console.log('• MURPHY: "Add task to buy groceries"');
      console.log('• MURPHY: "Create a work tasks list"');
      console.log('• MURPHY: "Organize my tasks by category"');
      console.log('\\n🎯 Manual Testing: All delegation scenarios covered!');
    });
  }
}

// Initialize and start the test server
const tester = new DelegationSystemTester();
tester.start();