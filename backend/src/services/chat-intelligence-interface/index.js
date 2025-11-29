// Chat-First Intelligence Interface
// Ultimate productivity assistant that orchestrates all 6 intelligence engines through natural conversation

const EventEmitter = require('events');
const CorrelationEngine = require('../agents/murphy-agent/intelligence/correlation-engine');
const ProjectLifecycleTracker = require('../agents/murphy-agent/intelligence/lifecycle-tracker');
const SmartTechniqueMatrix = require('../agents/murphy-agent/intelligence/technique-matrix');
const ProductivityOptimizer = require('../agents/murphy-agent/intelligence/productivity-optimizer');
const WorkflowAnalyzer = require('../agents/murphy-agent/intelligence/workflow-analyzer');
const TimeManagementEngine = require('../agents/murphy-agent/intelligence/time-management');
const agentKnowledgeCoordinator = require('../agents/agent-knowledge-coordinator');
const CrossAgentIntelligenceCoordinator = require('../agents/murphy-agent/intelligence');

class ChatFirstIntelligenceInterface extends EventEmitter {
  constructor() {
    super();
    
    // Initialize all 6 intelligence engines
    this.correlationEngine = new CorrelationEngine();
    this.lifecycleTracker = new ProjectLifecycleTracker();
    this.techniqueMatrix = new SmartTechniqueMatrix();
    this.productivityOptimizer = new ProductivityOptimizer();
    this.workflowAnalyzer = new WorkflowAnalyzer();
    this.timeManagementEngine = new TimeManagementEngine();
    this.intelligenceCoordinator = new CrossAgentIntelligenceCoordinator();
    
    // Chat interface state
    this.activeChats = new Map(); // userId -> chat session
    this.conversationHistories = new Map(); // userId -> conversation history
    this.contextManagers = new Map(); // userId -> context manager
    this.proactiveSuggestions = new Map(); // userId -> suggestions queue
    
    // Natural Language Processing for productivity
    this.intentParser = new ProductivityIntentParser();
    this.contextAnalyzer = new ConversationContextAnalyzer();
    this.suggestionEngine = new ProactiveSuggestionEngine();
    
    // Initialize chat sessions
    this.initializeChatSystem();
    
    console.log('🧠 Chat-First Intelligence Interface initialized with 6 intelligence engines');
  }

  /**
   * Initialize the chat system with all intelligence engines
   */
  initializeChatSystem() {
    // Set up event listeners for intelligence engine updates
    this.setupIntelligenceEventListeners();
    
    // Start proactive suggestion system
    this.startProactiveSuggestionSystem();
    
    // Initialize conversation learning system
    this.initializeConversationLearning();
  }

  /**
   * Set up event listeners for intelligence engine coordination
   */
  setupIntelligenceEventListeners() {
    // Listen to correlation engine updates
    this.correlationEngine.on('correlationsUpdated', (data) => {
      this.handleIntelligenceUpdate('correlation', data);
    });

    // Listen to lifecycle tracker updates
    this.lifecycleTracker.on('lifecycleUpdated', (data) => {
      this.handleIntelligenceUpdate('lifecycle', data);
    });

    // Listen to cross-agent intelligence updates
    this.intelligenceCoordinator.on('userInsightsUpdated', (data) => {
      this.handleIntelligenceUpdate('crossAgent', data);
    });

    // Listen to knowledge coordinator updates
    agentKnowledgeCoordinator.on('knowledgeUpdated', (data) => {
      this.handleKnowledgeUpdate(data);
    });
  }

  /**
   * Process a chat message and provide intelligent response
   * @param {string} userId - User identifier
   * @param {string} message - User's message
   * @param {object} context - Additional context
   * @returns {object} Intelligent chat response
   */
  async processChatMessage(userId, message, context = {}) {
    try {
      console.log(`🗣️ Processing chat message from ${userId}: "${message}"`);
      
      // Initialize chat session if needed
      this.initializeChatSession(userId);
      
      // Parse productivity intent from natural language
      const intentAnalysis = await this.intentParser.parseIntent(message, context);
      
      // Get conversation context
      const conversationContext = this.getConversationContext(userId);
      
      // Update context with new message
      this.updateConversationContext(userId, message, intentAnalysis);
      
      // Generate response based on intent and intelligence analysis
      const intelligenceData = await this.gatherIntelligenceData(userId, intentAnalysis, conversationContext);
      
      const response = await this.generateIntelligentResponse(
        userId, 
        message, 
        intentAnalysis, 
        intelligenceData, 
        conversationContext
      );
      
      // Learn from this interaction
      await this.learnFromInteraction(userId, message, intentAnalysis, response);
      
      // Queue proactive suggestions if relevant
      this.queueProactiveSuggestions(userId, intentAnalysis, intelligenceData);
      
      return {
        message: response.message,
        suggestions: response.suggestions,
        intelligence: {
          insights: response.insights,
          confidence: response.confidence,
          engines: response.engines
        },
        context: {
          conversationId: conversationContext.conversationId,
          turnNumber: conversationContext.turnNumber,
          topics: conversationContext.activeTopics
        }
      };
      
    } catch (error) {
      console.error(`Chat processing error for user ${userId}:`, error);
      return {
        message: "I'm having trouble processing that right now. Let me try a different approach.",
        suggestions: ["Try rephrasing your question", "Ask about your productivity insights"],
        intelligence: { insights: [], confidence: 0.5, engines: [] },
        error: error.message
      };
    }
  }

  /**
   * Gather intelligence data from all 6 engines based on user intent
   * @param {string} userId - User identifier
   * @param {object} intentAnalysis - Parsed intent
   * @param {object} context - Conversation context
   * @returns {object} Combined intelligence data
   */
  async gatherIntelligenceData(userId, intentAnalysis, context) {
    const intelligenceData = {
      correlation: null,
      lifecycle: null,
      technique: null,
      productivity: null,
      workflow: null,
      timeManagement: null,
      unified: null
    };

    try {
      // Get user knowledge from existing agents
      const userKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
      const agentData = userKnowledge.raw?.agents || {};
      
      const tasks = agentData.murphy?.knowledge?.tasks || [];
      const events = agentData.grim?.knowledge?.events || [];

      // Gather data based on intent analysis
      const tasksToProcess = this.getTasksToProcess(intentAnalysis, tasks);
      const eventsToProcess = this.getEventsToProcess(intentAnalysis, events);

      // Get correlation engine data
      if (this.shouldProcessCorrelation(intentAnalysis)) {
        intelligenceData.correlation = this.correlationEngine.getRealTimeCorrelations(userId);
      }

      // Get lifecycle tracker data
      if (this.shouldProcessLifecycle(intentAnalysis)) {
        intelligenceData.lifecycle = this.lifecycleTracker.getAllProjectLifecycles();
      }

      // Get technique matrix recommendations
      if (this.shouldProcessTechnique(intentAnalysis)) {
        intelligenceData.technique = await this.techniqueMatrix.generateTechniqueRecommendations(userId, {
          tasks: tasksToProcess,
          events: eventsToProcess,
          context: context
        });
      }

      // Get productivity optimization
      if (this.shouldProcessProductivity(intentAnalysis)) {
        intelligenceData.productivity = await this.productivityOptimizer.generateProductivityOptimization(userId, {
          tasks: tasksToProcess,
          events: eventsToProcess
        });
      }

      // Get workflow analysis
      if (this.shouldProcessWorkflow(intentAnalysis)) {
        intelligenceData.workflow = await this.workflowAnalyzer.generateWorkflowAnalysis(userId, {
          tasks: tasksToProcess,
          events: eventsToProcess
        });
      }

      // Get time management insights
      if (this.shouldProcessTimeManagement(intentAnalysis)) {
        intelligenceData.timeManagement = await this.timeManagementEngine.generateTimeManagementOptimization(userId, {
          tasks: tasksToProcess,
          events: eventsToProcess
        });
      }

      // Get unified intelligence from coordinator
      if (this.shouldProcessUnified(intentAnalysis)) {
        intelligenceData.unified = await this.intelligenceCoordinator.getUserIntelligence(userId);
      }

      return intelligenceData;

    } catch (error) {
      console.error('Intelligence data gathering error:', error);
      return intelligenceData;
    }
  }

  /**
   * Generate intelligent response based on intent and intelligence data
   * @param {string} userId - User identifier
   * @param {string} message - Original message
   * @param {object} intentAnalysis - Parsed intent
   * @param {object} intelligenceData - Intelligence from all engines
   * @param {object} context - Conversation context
   * @returns {object} Intelligent response
   */
  async generateIntelligentResponse(userId, message, intentAnalysis, intelligenceData, context) {
    const response = {
      message: '',
      suggestions: [],
      insights: [],
      confidence: 0.7,
      engines: []
    };

    try {
      // Handle different intent types
      switch (intentAnalysis.type) {
        case 'productivity_question':
          response.message = await this.handleProductivityQuestion(intentAnalysis, intelligenceData);
          response.engines = ['productivity', 'workflow', 'technique'];
          break;
          
        case 'task_analysis':
          response.message = await this.handleTaskAnalysis(intentAnalysis, intelligenceData);
          response.engines = ['correlation', 'lifecycle', 'productivity'];
          break;
          
        case 'time_question':
          response.message = await this.handleTimeQuestion(intentAnalysis, intelligenceData);
          response.engines = ['timeManagement', 'workflow'];
          break;
          
        case 'technique_question':
          response.message = await this.handleTechniqueQuestion(intentAnalysis, intelligenceData);
          response.engines = ['technique', 'productivity'];
          break;
          
        case 'project_question':
          response.message = await this.handleProjectQuestion(intentAnalysis, intelligenceData);
          response.engines = ['lifecycle', 'correlation'];
          break;
          
        case 'workflow_question':
          response.message = await this.handleWorkflowQuestion(intentAnalysis, intelligenceData);
          response.engines = ['workflow', 'timeManagement'];
          break;
          
        case 'general_insight':
          response.message = await this.handleGeneralInsight(intentAnalysis, intelligenceData);
          response.engines = this.getActiveEngines(intelligenceData);
          break;
          
        default:
          response.message = await this.handleGeneralConversation(intentAnalysis, intelligenceData, context);
          response.engines = ['productivity']; // Default fallback
      }

      // Generate contextual suggestions
      response.suggestions = await this.generateContextualSuggestions(
        userId, 
        intentAnalysis, 
        intelligenceData, 
        context
      );

      // Extract key insights
      response.insights = this.extractKeyInsights(intelligenceData, intentAnalysis);

      // Calculate confidence based on available intelligence
      response.confidence = this.calculateResponseConfidence(intelligenceData, response.engines);

      return response;

    } catch (error) {
      console.error('Response generation error:', error);
      return {
        message: "I'm here to help with your productivity! What specific area would you like to focus on?",
        suggestions: ["Analyze my tasks", "Optimize my workflow", "Get time management tips"],
        insights: [],
        confidence: 0.3,
        engines: []
      };
    }
  }

  /**
   * Initialize chat session for a user
   * @param {string} userId - User identifier
   */
  initializeChatSession(userId) {
    if (!this.activeChats.has(userId)) {
      this.activeChats.set(userId, {
        sessionId: `chat_${Date.now()}_${userId}`,
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0
      });
    }

    if (!this.conversationHistories.has(userId)) {
      this.conversationHistories.set(userId, []);
    }

    if (!this.contextManagers.has(userId)) {
      this.contextManagers.set(userId, new ConversationContextManager(userId));
    }

    if (!this.proactiveSuggestions.has(userId)) {
      this.proactiveSuggestions.set(userId, []);
    }
  }

  /**
   * Get conversation context for a user
   * @param {string} userId - User identifier
   * @returns {object} Conversation context
   */
  getConversationContext(userId) {
    const chatSession = this.activeChats.get(userId);
    const history = this.conversationHistories.get(userId) || [];
    const contextManager = this.contextManagers.get(userId);

    return {
      conversationId: chatSession?.sessionId,
      turnNumber: chatSession?.messageCount || 0,
      history: history.slice(-10), // Last 10 messages
      activeTopics: contextManager?.getActiveTopics() || [],
      userProfile: contextManager?.getUserProfile() || {},
      session: chatSession
    };
  }

  /**
   * Update conversation context with new message
   * @param {string} userId - User identifier
   * @param {string} message - New message
   * @param {object} intentAnalysis - Intent analysis
   */
  updateConversationContext(userId, message, intentAnalysis) {
    const chatSession = this.activeChats.get(userId);
    const history = this.conversationHistories.get(userId);
    const contextManager = this.contextManagers.get(userId);

    if (chatSession) {
      chatSession.messageCount++;
      chatSession.lastActivity = new Date().toISOString();
    }

    if (history) {
      history.push({
        message,
        intent: intentAnalysis.type,
        timestamp: new Date().toISOString(),
        topics: intentAnalysis.topics
      });

      // Keep only last 50 messages
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
    }

    if (contextManager) {
      contextManager.updateTopics(intentAnalysis.topics);
      contextManager.updateUserProfileFromIntent(intentAnalysis);
    }
  }

  /**
   * Start proactive suggestion system
   */
  startProactiveSuggestionSystem() {
    setInterval(() => {
      this.generateProactiveSuggestions();
    }, 30000); // Every 30 seconds
  }

  /**
   * Initialize conversation learning system
   */
  initializeConversationLearning() {
    this.learningPatterns = new Map(); // userId -> learning data
  }

  /**
   * Learn from user interaction to improve future responses
   * @param {string} userId - User identifier
   * @param {string} message - User message
   * @param {object} intentAnalysis - Intent analysis
   * @param {object} response - Generated response
   */
  async learnFromInteraction(userId, message, intentAnalysis, response) {
    try {
      if (!this.learningPatterns.has(userId)) {
        this.learningPatterns.set(userId, {
          successfulIntents: new Map(),
          preferredResponseStyles: new Map(),
          engagementPatterns: new Map(),
          lastUpdated: new Date().toISOString()
        });
      }

      const learningData = this.learningPatterns.get(userId);
      
      // Track successful intent types
      const intentType = intentAnalysis.type;
      const success = this.assessInteractionSuccess(response);
      
      if (!learningData.successfulIntents.has(intentType)) {
        learningData.successfulIntents.set(intentType, { success: 0, total: 0 });
      }
      
      const intentStats = learningData.successfulIntents.get(intentType);
      intentStats.total++;
      if (success) intentStats.success++;

      // Track engagement patterns
      const engagement = this.assessEngagement(message, response);
      const hour = new Date().getHours();
      if (!learningData.engagementPatterns.has(hour)) {
        learningData.engagementPatterns.set(hour, []);
      }
      learningData.engagementPatterns.get(hour).push(engagement);

      learningData.lastUpdated = new Date().toISOString();

    } catch (error) {
      console.error('Learning from interaction error:', error);
    }
  }

  // Intent handlers for different types of questions
  
  async handleProductivityQuestion(intentAnalysis, intelligenceData) {
    const productivity = intelligenceData.productivity;
    const workflow = intelligenceData.workflow;
    
    let message = "Based on your productivity patterns, here's what I found:\n\n";
    
    if (productivity) {
      message += `🎯 **Productivity Profile**: ${productivity.profile.productivityStyle} style with ${productivity.profile.optimizationPotential} optimization potential\n`;
      message += `📊 **Current Efficiency**: ${Math.round(productivity.workloadAnalysis.completionRate * 100)}% task completion rate\n`;
    }
    
    if (workflow) {
      message += `⚡ **Workflow Type**: ${workflow.profile.workflowType} workflow\n`;
      message += `🔄 **Efficiency Score**: ${Math.round(workflow.profile.efficiency * 100)}%\n`;
    }
    
    return message;
  }

  async handleTaskAnalysis(intentAnalysis, intelligenceData) {
    const correlation = intelligenceData.correlation;
    const lifecycle = intelligenceData.lifecycle;
    
    let message = "Here's your task analysis:\n\n";
    
    if (correlation && correlation.correlations.size > 0) {
      message += `🔗 **Event-Task Correlations**: Found ${correlation.correlations.size} correlations with ${correlation.confidenceLevel} confidence\n`;
    }
    
    if (lifecycle) {
      const projectCount = Object.keys(lifecycle).length;
      message += `📋 **Active Projects**: ${projectCount} projects tracked\n`;
    }
    
    return message;
  }

  async handleTimeQuestion(intentAnalysis, intelligenceData) {
    const timeManagement = intelligenceData.timeManagement;
    
    let message = "Time management insights:\n\n";
    
    if (timeManagement) {
      message += `⏰ **Peak Hours**: ${timeManagement.profile.timePatterns.peakHours.join(', ')}\n`;
      message += `🎯 **Focus Blocks**: ${timeManagement.profile.timePatterns.focusBlocks}\n`;
      message += `📅 **Meeting Density**: ${timeManagement.profile.timePatterns.meetingDensity}\n`;
    }
    
    return message;
  }

  async handleTechniqueQuestion(intentAnalysis, intelligenceData) {
    const technique = intelligenceData.technique;
    
    let message = "Recommended productivity techniques:\n\n";
    
    if (technique && technique.recommendations) {
      message += `🌟 **Primary Recommendations**:\n`;
      technique.recommendations.primary.forEach((rec, index) => {
        message += `${index + 1}. **${rec.name}** - ${rec.description}\n`;
      });
      
      if (technique.expectedImprovement) {
        message += `\n💡 **Expected Improvement**: ${technique.expectedImprovement.percentage}% in ${technique.expectedImprovement.timeframe}\n`;
      }
    }
    
    return message;
  }

  async handleProjectQuestion(intentAnalysis, intelligenceData) {
    const lifecycle = intelligenceData.lifecycle;
    
    let message = "Project lifecycle analysis:\n\n";
    
    if (lifecycle) {
      Object.entries(lifecycle).forEach(([projectId, data]) => {
        message += `📈 **${projectId}**: ${data.currentPhase} phase (${Math.round(data.phaseProgress)}% complete)\n`;
        message += `   Timeline Health: ${data.timelineAnalysis.timelineHealth}\n`;
        
        if (data.bottlenecks.length > 0) {
          message += `   ⚠️ Bottlenecks: ${data.bottlenecks.length}\n`;
        }
      });
    }
    
    return message;
  }

  async handleWorkflowQuestion(intentAnalysis, intelligenceData) {
    const workflow = intelligenceData.workflow;
    
    let message = "Workflow optimization opportunities:\n\n";
    
    if (workflow && workflow.patternAnalysis) {
      const opportunities = workflow.patternAnalysis.optimizationOpportunities || [];
      opportunities.forEach((opp, index) => {
        message += `${index + 1}. **${opp.area}**: ${opp.opportunity}\n`;
        message += `   💪 Impact: ${opp.potential_impact}\n\n`;
      });
    }
    
    return message;
  }

  async handleGeneralInsight(intentAnalysis, intelligenceData) {
    return "I'm analyzing your productivity patterns across all areas. What specific insight would you like to explore?";
  }

  async handleGeneralConversation(intentAnalysis, intelligenceData, context) {
    const greetings = [
      "Hello! I'm your productivity intelligence assistant. I can help you analyze your tasks, optimize your workflow, and improve your productivity. What would you like to focus on?",
      "Hi there! I'm here to help you become more productive. I have insights from your calendar, tasks, and work patterns. How can I assist you today?",
      "Hey! Ready to boost your productivity? I can provide insights on your tasks, time management, workflow optimization, and personalized technique recommendations."
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Helper methods for intent processing
  
  shouldProcessCorrelation(intentAnalysis) {
    return intentAnalysis.topics.includes('tasks') || intentAnalysis.topics.includes('calendar');
  }

  shouldProcessLifecycle(intentAnalysis) {
    return intentAnalysis.topics.includes('projects') || intentAnalysis.topics.includes('timeline');
  }

  shouldProcessTechnique(intentAnalysis) {
    return intentAnalysis.topics.includes('techniques') || intentAnalysis.topics.includes('methods');
  }

  shouldProcessProductivity(intentAnalysis) {
    return intentAnalysis.topics.includes('productivity') || intentAnalysis.topics.includes('efficiency');
  }

  shouldProcessWorkflow(intentAnalysis) {
    return intentAnalysis.topics.includes('workflow') || intentAnalysis.topics.includes('process');
  }

  shouldProcessTimeManagement(intentAnalysis) {
    return intentAnalysis.topics.includes('time') || intentAnalysis.topics.includes('scheduling');
  }

  shouldProcessUnified(intentAnalysis) {
    return intentAnalysis.topics.includes('insights') || intentAnalysis.topics.includes('overview');
  }

  getTasksToProcess(intentAnalysis, tasks) {
    // Filter tasks based on intent analysis
    return tasks; // For now, return all tasks
  }

  getEventsToProcess(intentAnalysis, events) {
    // Filter events based on intent analysis
    return events; // For now, return all events
  }

  getActiveEngines(intelligenceData) {
    const active = [];
    if (intelligenceData.correlation) active.push('correlation');
    if (intelligenceData.lifecycle) active.push('lifecycle');
    if (intelligenceData.technique) active.push('technique');
    if (intelligenceData.productivity) active.push('productivity');
    if (intelligenceData.workflow) active.push('workflow');
    if (intelligenceData.timeManagement) active.push('timeManagement');
    return active;
  }

  async generateContextualSuggestions(userId, intentAnalysis, intelligenceData, context) {
    // Generate proactive suggestions based on current context
    return [
      "Analyze my productivity trends",
      "Get time management recommendations",
      "Show my current project status"
    ];
  }

  extractKeyInsights(intelligenceData, intentAnalysis) {
    const insights = [];
    
    if (intelligenceData.correlation?.overallConfidence > 0.7) {
      insights.push("Strong event-task correlation patterns detected");
    }
    
    if (intelligenceData.productivity?.workloadAnalysis.workloadLevel === 'high') {
      insights.push("Consider workload optimization strategies");
    }
    
    return insights;
  }

  calculateResponseConfidence(intelligenceData, engines) {
    if (engines.length === 0) return 0.3;
    
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on available data
    engines.forEach(engine => {
      if (intelligenceData[engine]) {
        confidence += 0.1;
      }
    });
    
    return Math.min(confidence, 1.0);
  }

  assessInteractionSuccess(response) {
    // Simple heuristic for success assessment
    return response.confidence > 0.6 && response.message.length > 50;
  }

  assessEngagement(message, response) {
    // Assess user engagement level
    return message.length > 20 ? 'high' : 'medium';
  }

  handleIntelligenceUpdate(type, data) {
    console.log(`Intelligence update: ${type}`, data);
    // Handle real-time intelligence updates
  }

  handleKnowledgeUpdate(data) {
    console.log('Knowledge update:', data);
    // Handle knowledge coordinator updates
  }

  generateProactiveSuggestions() {
    // Generate proactive suggestions for active users
    for (const [userId, suggestions] of this.proactiveSuggestions.entries()) {
      if (suggestions.length > 0) {
        this.emit('proactiveSuggestions', { userId, suggestions });
      }
    }
  }

  queueProactiveSuggestions(userId, intentAnalysis, intelligenceData) {
    const suggestions = this.proactiveSuggestions.get(userId) || [];
    
    // Add relevant suggestions based on current context
    if (intentAnalysis.topics.includes('productivity')) {
      suggestions.push({
        type: 'productivity',
        message: 'Would you like a detailed productivity analysis?',
        action: 'analyze_productivity'
      });
    }
    
    this.proactiveSuggestions.set(userId, suggestions);
  }

  /**
   * Get proactive suggestions for a user
   * @param {string} userId - User identifier
   * @returns {Array} Proactive suggestions
   */
  getProactiveSuggestions(userId) {
    return this.proactiveSuggestions.get(userId) || [];
  }

  /**
   * Clear proactive suggestions for a user
   * @param {string} userId - User identifier
   */
  clearProactiveSuggestions(userId) {
    this.proactiveSuggestions.set(userId, []);
  }

  /**
   * Get chat session status
   * @param {string} userId - User identifier
   * @returns {object} Session status
   */
  getChatSessionStatus(userId) {
    const session = this.activeChats.get(userId);
    const context = this.getConversationContext(userId);
    
    return {
      session,
      context,
      activeEngines: this.getActiveEnginesFromSession(userId),
      suggestionsCount: this.getProactiveSuggestions(userId).length
    };
  }

  getActiveEnginesFromSession(userId) {
    // Determine which engines are most active for this user
    return ['productivity', 'workflow', 'timeManagement']; // Simplified for now
  }
}

// Supporting classes

class ProductivityIntentParser {
  async parseIntent(message, context) {
    // Enhanced intent parsing for productivity queries
    const lowerMessage = message.toLowerCase();
    
    // Determine intent type
    let type = 'general_conversation';
    const topics = [];
    
    if (this.containsProductivityKeywords(lowerMessage)) {
      type = 'productivity_question';
      topics.push('productivity');
    }
    
    if (this.containsTaskKeywords(lowerMessage)) {
      type = 'task_analysis';
      topics.push('tasks');
    }
    
    if (this.containsTimeKeywords(lowerMessage)) {
      type = 'time_question';
      topics.push('time');
    }
    
    if (this.containsTechniqueKeywords(lowerMessage)) {
      type = 'technique_question';
      topics.push('techniques');
    }
    
    if (this.containsProjectKeywords(lowerMessage)) {
      type = 'project_question';
      topics.push('projects');
    }
    
    if (this.containsWorkflowKeywords(lowerMessage)) {
      type = 'workflow_question';
      topics.push('workflow');
    }
    
    if (topics.length === 0) {
      topics.push('general');
    }
    
    return {
      type,
      topics,
      confidence: 0.8,
      message: message
    };
  }

  containsProductivityKeywords(message) {
    const keywords = ['productive', 'productivity', 'efficient', 'efficiency', 'optimize', 'performance'];
    return keywords.some(keyword => message.includes(keyword));
  }

  containsTaskKeywords(message) {
    const keywords = ['task', 'tasks', 'todo', 'to-do', 'complete', 'finish', 'work'];
    return keywords.some(keyword => message.includes(keyword));
  }

  containsTimeKeywords(message) {
    const keywords = ['time', 'schedule', 'calendar', 'meeting', 'when', 'hours', 'day'];
    return keywords.some(keyword => message.includes(keyword));
  }

  containsTechniqueKeywords(message) {
    const keywords = ['technique', 'method', 'approach', 'strategy', 'system', 'process'];
    return keywords.some(keyword => message.includes(keyword));
  }

  containsProjectKeywords(message) {
    const keywords = ['project', 'timeline', 'deadline', 'milestone', 'phase', 'progress'];
    return keywords.some(keyword => message.includes(keyword));
  }

  containsWorkflowKeywords(message) {
    const keywords = ['workflow', 'process', 'steps', 'flow', 'routine', 'habit'];
    return keywords.some(keyword => message.includes(keyword));
  }
}

class ConversationContextAnalyzer {
  analyzeContext(history, currentIntent) {
    return {
      trends: [],
      patterns: [],
      recommendations: []
    };
  }
}

class ProactiveSuggestionEngine {
  generateSuggestions(userId, context) {
    return [];
  }
}

class ConversationContextManager {
  constructor(userId) {
    this.userId = userId;
    this.activeTopics = new Set();
    this.userProfile = {};
  }

  updateTopics(topics) {
    topics.forEach(topic => this.activeTopics.add(topic));
  }

  updateUserProfileFromIntent(intentAnalysis) {
    // Update user profile based on intent patterns
  }

  getActiveTopics() {
    return Array.from(this.activeTopics);
  }

  getUserProfile() {
    return this.userProfile;
  }
}

module.exports = ChatFirstIntelligenceInterface;