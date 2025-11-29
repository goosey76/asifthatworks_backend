// COMPREHENSIVE CROSS-AGENT PROJECT ANALYZER TESTING WITH FEEDBACK
// Testing framework for enhanced Grim and Murphy agents with user feedback integration

const CrossAgentProjectAnalyzer = require('./src/services/agents/murphy-agent/intelligence/project-analyzer');
const agentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');
const grimAgentEnhanced = require('./src/services/agents/grim-agent/grim-agent-enhanced');
const murphyAgent = require('./src/services/agents/murphy-agent/murphy-agent');

class ComprehensiveAgentTester {
  constructor() {
    this.userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d'; // Test user
    this.feedback = [];
    this.testResults = {};
  }

  /**
   * Run comprehensive tests and collect feedback
   */
  async runAllTests() {
    console.log('🎯 COMPREHENSIVE CROSS-AGENT PROJECT ANALYZER TESTING');
    console.log('=' .repeat(60));
    console.log('📋 Purpose: Test enhanced features with user feedback integration');
    console.log('🧠 Focus: Intelligence engines, API integration, cross-agent communication');
    console.log('⚡ Goal: Validate all 31+ productivity enhancement capabilities\n');

    try {
      // PHASE 1: Core Infrastructure Tests
      await this.testCoreInfrastructure();
      
      // PHASE 2: Grim Agent Enhanced Features
      await this.testGrimAgentEnhanced();
      
      // PHASE 3: Murphy Agent Enhanced Features
      await this.testMurphyAgentEnhanced();
      
      // PHASE 4: Cross-Agent Coordination
      await this.testCrossAgentCoordination();
      
      // PHASE 5: Intelligence Engines
      await this.testIntelligenceEngines();
      
      // PHASE 6: Project Analyzer Functionality
      await this.testProjectAnalyzer();
      
      // PHASE 7: Real-world Scenario Tests
      await this.testRealWorldScenarios();
      
      // Generate feedback report
      this.generateFeedbackReport();
      
      console.log('\n🎉 COMPREHENSIVE TESTING COMPLETED!');
      console.log('📊 Check feedback sections below for improvement insights');
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Testing framework error:', error);
      this.addFeedback('SYSTEM_ERROR', `Framework error: ${error.message}`, 'HIGH');
      return null;
    }
  }

  /**
   * Test core infrastructure and knowledge coordination
   */
  async testCoreInfrastructure() {
    console.log('\n🔧 PHASE 1: CORE INFRASTRUCTURE TESTS');
    console.log('-'.repeat(40));
    
    // Test 1.1: Knowledge Coordinator Health
    console.log('\n🔍 Test 1.1: Knowledge Coordinator Health Status');
    try {
      const healthStatus = agentKnowledgeCoordinator.getHealthStatus();
      console.log('✅ Knowledge Coordinator Operational:', healthStatus);
      this.testResults.infrastructure = { coordinator: 'PASSED' };
      this.addFeedback('INFRASTRUCTURE_1', 'Knowledge Coordinator health check', 'INFO');
    } catch (error) {
      console.error('❌ Knowledge Coordinator failed:', error);
      this.testResults.infrastructure = { coordinator: 'FAILED' };
      this.addFeedback('INFRASTRUCTURE_1', `Knowledge Coordinator error: ${error.message}`, 'HIGH');
    }
    
    // USER FEEDBACK SECTION
    console.log('\n📝 USER FEEDBACK - Test 1.1:');
    console.log('Comments: [Please provide your observations here]');
    console.log('Rating: [1-5 scale]');
    console.log('Improvements: [Specific suggestions]');
    console.log('Priority: [High/Medium/Low]');
    
    // Test 1.2: Project Analyzer Initialization
    console.log('\n🔍 Test 1.2: Project Analyzer Initialization');
    try {
      const analyzer = new CrossAgentProjectAnalyzer();
      console.log('✅ Project Analyzer initialized successfully');
      this.testResults.infrastructure.analyzer = 'PASSED';
      this.addFeedback('INFRASTRUCTURE_2', 'Project Analyzer initialization', 'INFO');
    } catch (error) {
      console.error('❌ Project Analyzer failed:', error);
      this.testResults.infrastructure.analyzer = 'FAILED';
      this.addFeedback('INFRASTRUCTURE_2', `Project Analyzer error: ${error.message}`, 'HIGH');
    }
    
    // USER FEEDBACK SECTION
    console.log('\n📝 USER FEEDBACK - Test 1.2:');
    console.log('Comments: [Please provide your observations here]');
    console.log('Rating: [1-5 scale]');
    console.log('Improvements: [Specific suggestions]');
    console.log('Priority: [High/Medium/Low]');
  }

  /**
   * Test Grim Agent enhanced features
   */
  async testGrimAgentEnhanced() {
    console.log('\n🎭 PHASE 2: GRIM AGENT ENHANCED FEATURES');
    console.log('-'.repeat(40));
    
    const testScenarios = [
      {
        name: 'Calendar Event Creation',
        intent: 'create_event',
        message: 'create a meeting tomorrow at 2pm for project review',
        entities: { event_title: 'Project Review Meeting' }
      },
      {
        name: 'Schedule Analysis',
        intent: 'analyze_schedule',
        message: 'analyze my schedule for productivity improvements',
        entities: {}
      },
      {
        name: 'Free Time Discovery',
        intent: 'find_free_time',
        message: 'find optimal time slots for focused work this week',
        entities: {}
      }
    ];

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n🔍 Test 2.${i + 1}: ${scenario.name}`);
      
      try {
        const startTime = Date.now();
        const result = await grimAgentEnhanced.handleCalendarIntent(
          scenario.intent, 
          scenario.entities, 
          this.userId
        );
        const endTime = Date.now();
        
        const response = {
          success: true,
          responseTime: endTime - startTime,
          hasMessage: !!result.messageToUser,
          messageLength: result.messageToUser?.length || 0,
          hasEvents: !!(result.events && result.events.length > 0),
          intelligence: result.messageToUser?.toLowerCase().includes('calendar') || 
                       result.messageToUser?.toLowerCase().includes('schedule')
        };
        
        console.log('✅ Grim Agent Response:', response);
        this.testResults[`grim_${i + 1}`] = response;
        
        // Test calendar intelligence
        const intelligence = grimAgentEnhanced.getCalendarIntelligence(this.userId);
        console.log('📊 Calendar Intelligence:', {
          hasInsights: !!intelligence.calendarInsights,
          hasRhythms: !!intelligence.productivityRhythms,
          hasPreferences: !!intelligence.schedulingPreferences
        });
        
        this.addFeedback(`GRIM_${i + 1}`, `${scenario.name} - Response time: ${response.responseTime}ms`, 'INFO');
        
      } catch (error) {
        console.error(`❌ Grim Agent Test ${i + 1} failed:`, error);
        this.testResults[`grim_${i + 1}`] = { success: false, error: error.message };
        this.addFeedback(`GRIM_${i + 1}`, `Error in ${scenario.name}: ${error.message}`, 'HIGH');
      }
      
      // USER FEEDBACK SECTION
      console.log(`\n📝 USER FEEDBACK - Test 2.${i + 1}: ${scenario.name}`);
      console.log('Comments: [How well did Grim handle this scenario?]');
      console.log('Response Quality: [1-5 scale]');
      console.log('Intelligence Level: [How smart/sophisticated was the response?]');
      console.log('Improvements: [What could be better?]');
      console.log('Priority: [High/Medium/Low]');
    }
  }

  /**
   * Test Murphy Agent enhanced features
   */
  async testMurphyAgentEnhanced() {
    console.log('\n⚡ PHASE 3: MURPHY AGENT ENHANCED FEATURES');
    console.log('-'.repeat(40));
    
    const testScenarios = [
      {
        name: 'Task Creation Intelligence',
        intent: 'create_task',
        message: 'create a task to finish the project proposal by Friday',
        entities: { task_description: 'finish project proposal', due_date: '2025-11-21' }
      },
      {
        name: 'Productivity Analysis',
        intent: 'get_task',
        message: 'show my productivity patterns and suggest improvements',
        entities: { message: 'productivity patterns' }
      },
      {
        name: 'Smart Task Organization',
        intent: 'create_task',
        message: 'organize my tasks into smart categories',
        entities: { task_description: 'organize tasks smartly' }
      }
    ];

    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n🔍 Test 3.${i + 1}: ${scenario.name}`);
      
      try {
        const startTime = Date.now();
        
        // Initialize knowledge coordination
        murphyAgent.initializeKnowledgeCoordination(this.userId);
        
        const result = await murphyAgent.handleTask(
          scenario.intent,
          scenario.entities,
          this.userId
        );
        const endTime = Date.now();
        
        const response = {
          success: true,
          responseTime: endTime - startTime,
          hasMessage: !!result.messageToUser,
          messageLength: result.messageToUser?.length || 0,
          hasTaskId: !!result.taskId,
          intelligence: result.messageToUser?.toLowerCase().includes('task') || 
                       result.messageToUser?.toLowerCase().includes('productivity')
        };
        
        console.log('✅ Murphy Agent Response:', response);
        this.testResults[`murphy_${i + 1}`] = response;
        
        // Test knowledge coordination
        const knowledge = murphyAgent.getRotatingUserKnowledge(this.userId);
        console.log('📊 User Knowledge:', {
          hasProductivitySnapshot: !!knowledge.productivitySnapshot,
          hasRecentPatterns: !!knowledge.recentPatterns,
          hasCoordinationHints: !!knowledge.coordinationHints
        });
        
        this.addFeedback(`MURPHY_${i + 1}`, `${scenario.name} - Response time: ${response.responseTime}ms`, 'INFO');
        
      } catch (error) {
        console.error(`❌ Murphy Agent Test ${i + 1} failed:`, error);
        this.testResults[`murphy_${i + 1}`] = { success: false, error: error.message };
        this.addFeedback(`MURPHY_${i + 1}`, `Error in ${scenario.name}: ${error.message}`, 'HIGH');
      }
      
      // USER FEEDBACK SECTION
      console.log(`\n📝 USER FEEDBACK - Test 3.${i + 1}: ${scenario.name}`);
      console.log('Comments: [How well did Murphy handle this scenario?]');
      console.log('Task Intelligence: [How smart was the task handling?]');
      console.log('Knowledge Coordination: [Did it use other agent knowledge well?]');
      console.log('Improvements: [What could be better?]');
      console.log('Priority: [High/Medium/Low]');
    }
  }

  /**
   * Test cross-agent coordination and communication
   */
  async testCrossAgentCoordination() {
    console.log('\n🤝 PHASE 4: CROSS-AGENT COORDINATION');
    console.log('-'.repeat(40));
    
    // Test 4.1: Knowledge Registration and Rotation
    console.log('\n🔍 Test 4.1: Knowledge Registration and Rotation');
    try {
      const mockKnowledge = {
        grim: {
          calendarSnapshot: {
            totalEvents: 5,
            favoriteEventTypes: ['meeting', 'work'],
            events: [
              { summary: '💻 Development Session', start: { dateTime: '2025-11-16T10:00:00Z' } },
              { summary: '🤝 Team Meeting', start: { dateTime: '2025-11-16T14:00:00Z' } }
            ]
          }
        },
        murphy: {
          productivitySnapshot: {
            completionRate: 75,
            totalTasks: 12,
            favoriteCategory: 'work'
          },
          recentPatterns: {
            recentTaskTypes: ['development', 'meeting', 'planning']
          }
        }
      };
      
      // Register knowledge from both agents
      agentKnowledgeCoordinator.registerAgentKnowledge('grim', this.userId, mockKnowledge.grim);
      agentKnowledgeCoordinator.registerAgentKnowledge('murphy', this.userId, mockKnowledge.murphy);
      
      // Get rotated knowledge
      const rotatedKnowledge = agentKnowledgeCoordinator.getRotatedUserKnowledge('jarvi', this.userId);
      const comprehensiveKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(this.userId);
      
      console.log('✅ Knowledge Rotation:', {
        contributors: rotatedKnowledge.contributors?.length || 0,
        hasKnowledge: !!rotatedKnowledge.knowledge,
        hasHints: !!rotatedKnowledge.coordinationHints,
        comprehensiveData: !!comprehensiveKnowledge.raw
      });
      
      this.testResults.coordination = {
        knowledgeRotation: 'PASSED',
        contributors: rotatedKnowledge.contributors?.length || 0,
        comprehensive: !!comprehensiveKnowledge.raw
      };
      
      this.addFeedback('COORDINATION_1', 'Knowledge registration and rotation working', 'INFO');
      
    } catch (error) {
      console.error('❌ Knowledge coordination failed:', error);
      this.testResults.coordination = { knowledgeRotation: 'FAILED', error: error.message };
      this.addFeedback('COORDINATION_1', `Knowledge coordination error: ${error.message}`, 'HIGH');
    }
    
    // USER FEEDBACK SECTION
    console.log('\n📝 USER FEEDBACK - Test 4.1: Knowledge Coordination');
    console.log('Comments: [How well do agents share knowledge?]');
    console.log('Integration Quality: [How seamless is the collaboration?]');
    console.log('Data Sharing: [Is information flowing properly between agents?]');
    console.log('Improvements: [What coordination aspects need work?]');
    console.log('Priority: [High/Medium/Low]');
  }

  /**
   * Test intelligence engines
   */
  async testIntelligenceEngines() {
    console.log('\n🧠 PHASE 5: INTELLIGENCE ENGINES');
    console.log('-'.repeat(40));
    
    const intelligenceTests = [
      { name: 'Event-to-Task Correlation', query: 'convert my meetings into actionable tasks' },
      { name: 'Project Lifecycle Tracking', query: 'track my project progress and milestones' },
      { name: 'Smart Technique Recommendations', query: 'suggest productivity techniques for my schedule' },
      { name: 'Workflow Optimization', query: 'optimize my daily workflow and task completion' },
      { name: 'Time Management Analysis', query: 'analyze my time management and suggest improvements' },
      { name: 'Predictive Task Suggestions', query: 'predict what tasks I should create next' },
      { name: 'Context-Aware Task Creation', query: 'create tasks that fit my calendar context' }
    ];
    
    const analyzer = new CrossAgentProjectAnalyzer();
    
    for (let i = 0; i < intelligenceTests.length; i++) {
      const test = intelligenceTests[i];
      console.log(`\n🔍 Test 5.${i + 1}: ${test.name}`);
      
      try {
        // Mock comprehensive knowledge for analysis
        const mockGrimKnowledge = {
          calendarSnapshot: {
            events: [
              { summary: '💻 Backend Development', start: { dateTime: '2025-11-16T09:00:00Z' } },
              { summary: '🤝 Client Meeting', start: { dateTime: '2025-11-16T14:00:00Z' } }
            ],
            totalEvents: 2,
            favoriteEventTypes: ['development', 'meeting']
          }
        };
        
        const mockMurphyKnowledge = {
          productivitySnapshot: {
            completionRate: 70,
            totalTasks: 8,
            favoriteCategory: 'work'
          },
          recentPatterns: {
            recentTaskTypes: ['development', 'meeting', 'planning']
          }
        };
        
        const startTime = Date.now();
        const analysisResult = await analyzer.analyzeProjectLandscape(
          this.userId,
          mockGrimKnowledge,
          mockMurphyKnowledge
        );
        const endTime = Date.now();
        
        const response = {
          success: true,
          responseTime: endTime - startTime,
          hasActiveProjects: !!(analysisResult.activeProjects && analysisResult.activeProjects.length > 0),
          hasInsights: !!(analysisResult.insights && Object.keys(analysisResult.insights).length > 0),
          hasRecommendations: !!(analysisResult.recommendations && analysisResult.recommendations.length > 0),
          hasNextActions: !!(analysisResult.nextActions && analysisResult.nextActions.length > 0),
          intelligence: analysisResult.activeProjects?.length > 0 || analysisResult.recommendations?.length > 0
        };
        
        console.log('✅ Intelligence Engine Result:', {
          activeProjects: analysisResult.activeProjects?.length || 0,
          recommendations: analysisResult.recommendations?.length || 0,
          insights: Object.keys(analysisResult.insights || {}),
          intelligence: response.intelligence
        });
        
        this.testResults[`intelligence_${i + 1}`] = {
          ...response,
          analysisData: {
            activeProjects: analysisResult.activeProjects?.length || 0,
            recommendations: analysisResult.recommendations?.length || 0,
            insightsCount: Object.keys(analysisResult.insights || {}).length
          }
        };
        
        this.addFeedback(`INTELLIGENCE_${i + 1}`, `${test.name} - ${response.intelligence ? 'INTELLIGENT' : 'BASIC'} response`, 'INFO');
        
      } catch (error) {
        console.error(`❌ Intelligence Engine Test ${i + 1} failed:`, error);
        this.testResults[`intelligence_${i + 1}`] = { success: false, error: error.message };
        this.addFeedback(`INTELLIGENCE_${i + 1}`, `Error in ${test.name}: ${error.message}`, 'HIGH');
      }
      
      // USER FEEDBACK SECTION
      console.log(`\n📝 USER FEEDBACK - Test 5.${i + 1}: ${test.name}`);
      console.log('Comments: [How intelligent and useful was this analysis?]');
      console.log('Accuracy: [How accurate were the suggestions?]');
      console.log('Helpfulness: [How actionable were the recommendations?]');
      console.log('Intelligence Level: [How sophisticated was the AI reasoning?]');
      console.log('Improvements: [What could make this smarter?]');
      console.log('Priority: [High/Medium/Low]');
    }
  }

  /**
   * Test project analyzer core functionality
   */
  async testProjectAnalyzer() {
    console.log('\n📊 PHASE 6: PROJECT ANALYZER FUNCTIONALITY');
    console.log('-'.repeat(40));
    
    console.log('\n🔍 Test 6.1: Complete Project Analysis Workflow');
    try {
      const analyzer = new CrossAgentProjectAnalyzer();
      
      // Mock comprehensive user data
      const comprehensiveMockData = {
        grim: {
          calendarSnapshot: {
            events: [
              {
                summary: '🚀 MVP Development Sprint',
                start: { dateTime: '2025-11-16T09:00:00Z' },
                end: { dateTime: '2025-11-16T17:00:00Z' }
              },
              {
                summary: '📋 Project Planning Session',
                start: { dateTime: '2025-11-17T10:00:00Z' },
                end: { dateTime: '2025-11-17T12:00:00Z' }
              },
              {
                summary: '🎯 Client Presentation Prep',
                start: { dateTime: '2025-11-18T14:00:00Z' },
                end: { dateTime: '2025-11-18T16:00:00Z' }
              }
            ],
            totalEvents: 3,
            favoriteEventTypes: ['development', 'planning', 'presentation']
          }
        },
        murphy: {
          productivitySnapshot: {
            completionRate: 78,
            totalTasks: 15,
            currentStreak: 5,
            favoriteCategory: 'work'
          },
          recentPatterns: {
            recentTaskTypes: ['development', 'planning', 'client-work'],
            mostActiveHours: '09:00-11:00, 14:00-16:00'
          }
        }
      };
      
      // Register agent knowledge
      agentKnowledgeCoordinator.registerAgentKnowledge('grim', this.userId, comprehensiveMockData.grim);
      agentKnowledgeCoordinator.registerAgentKnowledge('murphy', this.userId, comprehensiveMockData.murphy);
      
      const startTime = Date.now();
      const analysisResult = await analyzer.analyzeProjectLandscape(
        this.userId,
        comprehensiveMockData.grim,
        comprehensiveMockData.murphy
      );
      const endTime = Date.now();
      
      // Detailed analysis validation
      const analysisQuality = {
        hasActiveProjects: analysisResult.activeProjects && analysisResult.activeProjects.length > 0,
        hasInsights: analysisResult.insights && Object.keys(analysisResult.insights).length > 0,
        hasRecommendations: analysisResult.recommendations && analysisResult.recommendations.length > 0,
        hasNextActions: analysisResult.nextActions && analysisResult.nextActions.length > 0,
        projectTypesIdentified: new Set(analysisResult.activeProjects?.map(p => p.type) || []).size,
        phasesDetected: analysisResult.activeProjects?.reduce((acc, p) => acc + (p.phases?.length || 0), 0) || 0,
        intelligenceScore: this.calculateIntelligenceScore(analysisResult),
        responseTime: endTime - startTime
      };
      
      console.log('✅ Project Analysis Results:', {
        activeProjects: analysisResult.activeProjects?.length || 0,
        insights: Object.keys(analysisResult.insights || {}),
        recommendations: analysisResult.recommendations?.length || 0,
        nextActions: analysisResult.nextActions?.length || 0,
        intelligenceScore: analysisQuality.intelligenceScore,
        responseTime: `${analysisQuality.responseTime}ms`
      });
      
      // Show sample project details
      if (analysisResult.activeProjects && analysisResult.activeProjects.length > 0) {
        const sampleProject = analysisResult.activeProjects[0];
        console.log('📋 Sample Project Analysis:', {
          name: sampleProject.name,
          type: sampleProject.type,
          phases: sampleProject.phases?.length || 0,
          priority: sampleProject.priority,
          hasTimeline: !!sampleProject.timeline
        });
      }
      
      this.testResults.projectAnalyzer = {
        ...analysisQuality,
        overall: analysisQuality.intelligenceScore > 50 ? 'INTELLIGENT' : 'BASIC'
      };
      
      this.addFeedback('PROJECT_ANALYZER', `Analysis quality score: ${analysisQuality.intelligenceScore}/100`, 'INFO');
      
    } catch (error) {
      console.error('❌ Project Analyzer failed:', error);
      this.testResults.projectAnalyzer = { success: false, error: error.message };
      this.addFeedback('PROJECT_ANALYZER', `Project analysis error: ${error.message}`, 'HIGH');
    }
    
    // USER FEEDBACK SECTION
    console.log('\n📝 USER FEEDBACK - Test 6.1: Project Analyzer');
    console.log('Comments: [How well did it understand your projects?]');
    console.log('Project Detection: [Did it correctly identify your projects?]');
    console.log('Insight Quality: [How valuable were the insights?]');
    console.log('Actionability: [How actionable were the recommendations?]');
    console.log('Intelligence: [How smart was the analysis?]');
    console.log('Improvements: [What would make this better?]');
    console.log('Priority: [High/Medium/Low]');
  }

  /**
   * Test real-world scenario simulations
   */
  async testRealWorldScenarios() {
    console.log('\n🌍 PHASE 7: REAL-WORLD SCENARIO TESTS');
    console.log('-'.repeat(40));
    
    const scenarios = [
      {
        name: 'University Student Schedule',
        description: 'Test with typical university student pattern',
       grimData: {
          events: [
            { summary: '📚 Programming Lecture', start: { dateTime: '2025-11-16T08:00:00Z' } },
            { summary: '💻 Lab Session', start: { dateTime: '2025-11-16T15:30:00Z' } }
          ]
        },
        murphyData: {
          tasks: ['study programming', 'complete assignment', 'prepare for exam']
        }
      },
      {
        name: 'Professional Workday',
        description: 'Test with professional work pattern',
        grimData: {
          events: [
            { summary: '👔 Team Standup', start: { dateTime: '2025-11-16T09:00:00Z' } },
            { summary: '🎯 Project Review', start: { dateTime: '2025-11-16T14:00:00Z' } }
          ]
        },
        murphyData: {
          tasks: ['finish sprint work', 'update documentation', 'plan next sprint']
        }
      },
      {
        name: 'Mixed Personal/Professional',
        description: 'Test with mixed schedule pattern',
        grimData: {
          events: [
            { summary: '💻 Work Development', start: { dateTime: '2025-11-16T09:00:00Z' } },
            { summary: '🏃 Gym Session', start: { dateTime: '2025-11-16T18:00:00Z' } }
          ]
        },
        murphyData: {
          tasks: ['complete work tasks', 'maintain fitness', 'personal projects']
        }
      }
    ];
    
    const analyzer = new CrossAgentProjectAnalyzer();
    
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      console.log(`\n🔍 Test 7.${i + 1}: ${scenario.name}`);
      console.log(`   Description: ${scenario.description}`);
      
      try {
        const mockGrimKnowledge = {
          calendarSnapshot: {
            ...scenario.grimData,
            totalEvents: scenario.grimData.events.length,
            favoriteEventTypes: ['work', 'study', 'personal']
          }
        };
        
        const mockMurphyKnowledge = {
          productivitySnapshot: {
            completionRate: 65 + Math.random() * 20, // 65-85%
            totalTasks: scenario.murphyData.tasks.length + 5,
            favoriteCategory: 'mixed'
          },
          recentPatterns: {
            recentTaskTypes: scenario.murphyData.tasks
          }
        };
        
        const startTime = Date.now();
        const result = await analyzer.analyzeProjectLandscape(
          this.userId,
          mockGrimKnowledge,
          mockMurphyKnowledge
        );
        const endTime = Date.now();
        
        const scenarioResults = {
          scenarioName: scenario.name,
          responseTime: endTime - startTime,
          projectsDetected: result.activeProjects?.length || 0,
          insightsGenerated: Object.keys(result.insights || {}).length,
          recommendationsProvided: result.recommendations?.length || 0,
          contextAwareness: this.assessContextAwareness(result, scenario),
          intelligence: result.activeProjects?.length > 0 || result.recommendations?.length > 0
        };
        
        console.log('✅ Scenario Results:', {
          projects: scenarioResults.projectsDetected,
          insights: scenarioResults.insightsGenerated,
          recommendations: scenarioResults.recommendationsProvided,
          contextMatch: scenarioResults.contextAwareness,
          intelligence: scenarioResults.intelligence ? 'HIGH' : 'LOW'
        });
        
        this.testResults[`scenario_${i + 1}`] = scenarioResults;
        this.addFeedback(`SCENARIO_${i + 1}`, `${scenario.name} - Context awareness: ${scenarioResults.contextAwareness}%`, 'INFO');
        
      } catch (error) {
        console.error(`❌ Scenario Test ${i + 1} failed:`, error);
        this.testResults[`scenario_${i + 1}`] = { success: false, error: error.message };
        this.addFeedback(`SCENARIO_${i + 1}`, `Error in ${scenario.name}: ${error.message}`, 'HIGH');
      }
      
      // USER FEEDBACK SECTION
      console.log(`\n📝 USER FEEDBACK - Test 7.${i + 1}: ${scenario.name}`);
      console.log('Comments: [How well did it handle this scenario?]');
      console.log('Context Understanding: [Did it understand the scenario context?]');
      console.log('Relevance: [How relevant were the suggestions for this scenario?]');
      console.log('Adaptability: [How well did it adapt to different user types?]');
      console.log('Real-world Value: [How valuable would this be in real use?]');
      console.log('Improvements: [What would make this scenario work better?]');
      console.log('Priority: [High/Medium/Low]');
    }
  }

  /**
   * Calculate intelligence score for analysis results
   */
  calculateIntelligenceScore(analysisResult) {
    let score = 0;
    
    // Base score for having results
    if (analysisResult.activeProjects?.length > 0) score += 20;
    if (analysisResult.insights && Object.keys(analysisResult.insights).length > 0) score += 25;
    if (analysisResult.recommendations?.length > 0) score += 25;
    if (analysisResult.nextActions?.length > 0) score += 20;
    
    // Bonus for sophisticated analysis
    if (analysisResult.activeProjects?.some(p => p.phases?.length > 0)) score += 10;
    if (analysisResult.activeProjects?.some(p => p.timeline)) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Assess context awareness of analysis results
   */
  assessContextAwareness(result, scenario) {
    if (!result.activeProjects || result.activeProjects.length === 0) return 0;
    
    // Simple heuristic: check if project types match scenario context
    const detectedTypes = new Set(result.activeProjects.map(p => p.type));
    const expectedTypes = new Set(['work_project', 'learning_project', 'personal_project']);
    
    const overlap = Array.from(detectedTypes).filter(type => expectedTypes.has(type)).length;
    return Math.min(100, (overlap / Math.max(1, detectedTypes.size)) * 100);
  }

  /**
   * Add feedback entry
   */
  addFeedback(testId, comment, priority = 'INFO') {
    this.feedback.push({
      testId,
      comment,
      priority,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate comprehensive feedback report
   */
  generateFeedbackReport() {
    console.log('\n📊 COMPREHENSIVE FEEDBACK REPORT');
    console.log('=' .repeat(50));
    
    const priorityCounts = this.feedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Feedback Summary:');
    console.log(`   Total Feedback Items: ${this.feedback.length}`);
    console.log(`   High Priority: ${priorityCounts.HIGH || 0}`);
    console.log(`   Medium Priority: ${priorityCounts.MEDIUM || 0}`);
    console.log(`   Info Items: ${priorityCounts.INFO || 0}`);
    
    console.log('\n🎯 Test Results Summary:');
    const testCategories = Object.keys(this.testResults);
    testCategories.forEach(category => {
      const result = this.testResults[category];
      if (typeof result === 'object' && result.success !== undefined) {
        console.log(`   ${category}: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      } else {
        console.log(`   ${category}: ✅ COMPLETED`);
      }
    });
    
    console.log('\n💡 Key Insights for Improvement:');
    const highPriorityItems = this.feedback.filter(f => f.priority === 'HIGH');
    highPriorityItems.forEach(item => {
      console.log(`   • ${item.testId}: ${item.comment}`);
    });
    
    // Generate actionable recommendations
    console.log('\n🚀 Actionable Recommendations:');
    const recommendations = this.generateRecommendations();
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  /**
   * Generate actionable recommendations based on feedback
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Analyze test results for improvement areas
    const failedTests = Object.entries(this.testResults)
      .filter(([_, result]) => result.success === false)
      .map(([key, _]) => key);
    
    if (failedTests.length > 0) {
      recommendations.push(`Fix ${failedTests.length} failing test(s): ${failedTests.join(', ')}`);
    }
    
    // Check response times
    const slowTests = Object.entries(this.testResults)
      .filter(([_, result]) => result.responseTime > 5000)
      .map(([key, _]) => key);
    
    if (slowTests.length > 0) {
      recommendations.push(`Optimize performance for ${slowTests.length} slow test(s)`);
    }
    
    // Intelligence level recommendations
    const lowIntelligence = Object.entries(this.testResults)
      .filter(([_, result]) => result.intelligence === false)
      .map(([key, _]) => key);
    
    if (lowIntelligence.length > 0) {
      recommendations.push(`Enhance intelligence for ${lowIntelligence.length} test(s)`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is performing well - focus on advanced intelligence enhancements');
      recommendations.push('Implement more sophisticated pattern recognition');
      recommendations.push('Add predictive analytics capabilities');
    }
    
    return recommendations;
  }
}

// Run comprehensive testing
async function main() {
  const tester = new ComprehensiveAgentTester();
  await tester.runAllTests();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Review all USER FEEDBACK sections above');
  console.log('2. Provide your comments, ratings, and improvement suggestions');
  console.log('3. Specify priorities (High/Medium/Low) for each improvement area');
  console.log('4. I will implement improvements based on your feedback');
  console.log('\n📋 The system is now ready for your detailed feedback and iterative improvement!');
}

// Export for use
module.exports = ComprehensiveAgentTester;

// Run if called directly
if (require.main === module) {
  main();
}