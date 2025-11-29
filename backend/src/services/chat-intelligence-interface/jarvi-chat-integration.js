// JARVI Chat-First Intelligence Integration
// Enables JARVI to delegate productivity conversations to the Chat Intelligence Interface
// while maintaining agent autonomy and adaptivity

const ChatFirstIntelligenceInterface = require('./index');
const EventEmitter = require('events');

class JARVIChatIntegration extends EventEmitter {
  constructor() {
    super();
    
    // Initialize the Chat Intelligence Interface
    this.chatIntelligence = new ChatFirstIntelligenceInterface();
    
    // Agent registry for dynamic scaling
    this.agentRegistry = new Map(); // agentName -> agentInstance
    this.agentCapabilities = new Map(); // agentName -> capabilities
    this.integrationPatterns = new Map(); // conversationType -> agentRouting
    
    // Register existing agents
    this.initializeAgentRegistry();
    
    console.log('🤖 JARVI Chat Intelligence Integration initialized');
  }

  /**
   * Initialize the agent registry with existing agents
   */
  initializeAgentRegistry() {
    // Register existing agents with their capabilities
    this.agentRegistry.set('murphy', {
      instance: require('../agents/murphy-agent/murphy-agent'),
      capabilities: ['task_management', 'productivity_analysis', 'technique_recommendations'],
      domains: ['tasks', 'workflow', 'productivity']
    });

    this.agentRegistry.set('grim', {
      instance: require('../agents/grim-agent/grim-agent-enhanced'),
      capabilities: ['calendar_management', 'scheduling', 'time_analysis'],
      domains: ['calendar', 'events', 'time_management']
    });

    // Initialize JARVI's own capabilities
    this.agentRegistry.set('jarvi', {
      instance: this, // JARVI itself
      capabilities: ['coordination', 'delegation', 'intelligence_orchestration'],
      domains: ['coordination', 'intelligence', 'delegation']
    });

    // Set up integration patterns
    this.setupIntegrationPatterns();
  }

  /**
   * Set up conversation routing patterns for agent delegation
   */
  setupIntegrationPatterns() {
    this.integrationPatterns.set('productivity_conversation', {
      primary: 'chat_intelligence',
      fallback: 'jarvi',
      agents: ['murphy', 'grim']
    });

    this.integrationPatterns.set('task_management', {
      primary: 'murphy',
      fallback: 'chat_intelligence',
      agents: ['murphy']
    });

    this.integrationPatterns.set('calendar_management', {
      primary: 'grim',
      fallback: 'chat_intelligence',
      agents: ['grim']
    });

    this.integrationPatterns.set('intelligence_analysis', {
      primary: 'chat_intelligence',
      fallback: 'jarvi',
      agents: ['murphy', 'grim']
    });

    this.integrationPatterns.set('general_conversation', {
      primary: 'jarvi',
      fallback: 'chat_intelligence',
      agents: ['murphy', 'grim']
    });
  }

  /**
   * JARVI's enhanced message handler with intelligent delegation
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} Enhanced response with intelligence insights
   */
  async handleProductivityConversation(message, userId, context = {}) {
    try {
      console.log(`JARVI: Handling productivity conversation for user ${userId}`);
      
      // Analyze the message to determine if it needs intelligence processing
      const requiresIntelligence = this.analyzeProductivityIntent(message);
      
      if (requiresIntelligence) {
        // Route to Chat Intelligence Interface
        return await this.delegateToChatIntelligence(message, userId, context);
      } else {
        // Handle directly or route to appropriate agent
        return await this.routeToAppropriateAgent(message, userId, context);
      }
      
    } catch (error) {
      console.error('JARVI productivity conversation error:', error);
      return await this.generateFallbackResponse(message, userId, error);
    }
  }

  /**
   * Analyze if a message requires intelligence processing
   * @param {string} message - User message
   * @returns {boolean} Whether intelligence processing is needed
   */
  analyzeProductivityIntent(message) {
    const intelligenceKeywords = [
      'analyze', 'insights', 'optimize', 'improve', 'trends', 'patterns',
      'productivity', 'efficiency', 'workflow', 'technique', 'strategy',
      'performance', 'analysis', 'recommendations', 'suggestions'
    ];

    const lowerMessage = message.toLowerCase();
    return intelligenceKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Delegate conversation to Chat Intelligence Interface
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} Intelligence-enhanced response
   */
  async delegateToChatIntelligence(message, userId, context = {}) {
    try {
      // Get response from Chat Intelligence Interface
      const intelligenceResponse = await this.chatIntelligence.processChatMessage(
        userId, 
        message, 
        {
          ...context,
          source: 'jarvi_integration',
          agentContext: this.getAgentContextForUser(userId)
        }
      );

      // Enhance response with agent delegation capabilities
      const enhancedResponse = {
        message: intelligenceResponse.message,
        jarvi_response: `I've analyzed your question using our intelligence engines. Here's what I found:`,
        intelligence_insights: intelligenceResponse.intelligence,
        suggestions: intelligenceResponse.suggestions,
        agent_recommendations: this.generateAgentRecommendations(intelligenceResponse, userId),
        follow_up_actions: this.generateFollowUpActions(intelligenceResponse, userId),
        context: intelligenceResponse.context
      };

      // Emit event for monitoring and learning
      this.emit('intelligenceDelegation', {
        userId,
        message,
        response: enhancedResponse,
        engines_used: intelligenceResponse.intelligence.engines,
        confidence: intelligenceResponse.intelligence.confidence
      });

      return enhancedResponse;

    } catch (error) {
      console.error('Chat intelligence delegation error:', error);
      throw error;
    }
  }

  /**
   * Route to appropriate agent based on message content
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} Agent response
   */
  async routeToAppropriateAgent(message, userId, context = {}) {
    const taskKeywords = ['task', 'todo', 'complete', 'create task'];
    const calendarKeywords = ['meeting', 'event', 'schedule', 'calendar'];
    
    const lowerMessage = message.toLowerCase();
    
    // Route to Murphy for task-related messages
    if (taskKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return await this.delegateToMurphy(message, userId, context);
    }
    
    // Route to Grim for calendar-related messages
    if (calendarKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return await this.delegateToGrim(message, userId, context);
    }
    
    // Default: handle with JARVI's own logic
    return await this.handleJarviNative(message, userId, context);
  }

  /**
   * Delegate to Murphy agent with intelligence context
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} Murphy response with intelligence
   */
  async delegateToMurphy(message, userId, context = {}) {
    try {
      const murphy = this.agentRegistry.get('murphy').instance;
      
      // Get intelligence context from Chat Intelligence Interface
      const intelligenceContext = await this.getIntelligenceContext(userId, ['productivity', 'workflow']);
      
      // Enhance context with intelligence insights
      const enhancedContext = {
        ...context,
        intelligence_insights: intelligenceContext,
        jarvi_integration: true
      };

      // Process through Murphy with enhanced context
      const murphyResponse = await murphy.handleTask('analyze_request', {
        message,
        conversation_context: enhancedContext
      }, userId);

      // If intelligence insights are available, enhance Murphy's response
      if (intelligenceContext && murphyResponse.messageToUser) {
        murphyResponse.messageToUser = this.enhanceMurphyResponse(
          murphyResponse.messageToUser, 
          intelligenceContext
        );
      }

      return {
        message: murphyResponse.messageToUser,
        agent: 'murphy',
        intelligence_context: intelligenceContext,
        task_id: murphyResponse.taskId
      };

    } catch (error) {
      console.error('Murphy delegation error:', error);
      return await this.generateAgentFallback('murphy', error);
    }
  }

  /**
   * Delegate to Grim agent with intelligence context
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} Grim response with intelligence
   */
  async delegateToGrim(message, userId, context = {}) {
    try {
      const grim = this.agentRegistry.get('grim').instance;
      
      // Get intelligence context from Chat Intelligence Interface
      const intelligenceContext = await this.getIntelligenceContext(userId, ['time_management', 'scheduling']);
      
      // Enhance context with intelligence insights
      const enhancedContext = {
        ...context,
        intelligence_insights: intelligenceContext,
        jarvi_integration: true
      };

      // Process through Grim with enhanced context
      const grimResponse = await grim.handleCalendarIntent('analyze_request', {
        message,
        conversation_context: enhancedContext
      }, userId);

      // If intelligence insights are available, enhance Grim's response
      if (intelligenceContext && grimResponse.messageToUser) {
        grimResponse.messageToUser = this.enhanceGrimResponse(
          grimResponse.messageToUser, 
          intelligenceContext
        );
      }

      return {
        message: grimResponse.messageToUser,
        agent: 'grim',
        intelligence_context: intelligenceContext,
        event_id: grimResponse.eventId
      };

    } catch (error) {
      console.error('Grim delegation error:', error);
      return await this.generateAgentFallback('grim', error);
    }
  }

  /**
   * Get intelligence context from Chat Intelligence Interface
   * @param {string} userId - User identifier
   * @param {Array} engineTypes - Required engine types
   * @returns {object} Intelligence context
   */
  async getIntelligenceContext(userId, engineTypes = []) {
    try {
      // Use Chat Intelligence Interface to gather relevant intelligence
      const intelligenceData = await this.chatIntelligence.gatherIntelligenceData(userId, {
        type: 'context_request',
        engineTypes
      }, {
        source: 'agent_delegation'
      });

      return {
        relevance: 'high',
        engines_used: engineTypes,
        confidence: this.calculateIntelligenceConfidence(intelligenceData),
        insights: this.extractRelevantInsights(intelligenceData, engineTypes)
      };

    } catch (error) {
      console.error('Intelligence context gathering error:', error);
      return null;
    }
  }

  /**
   * Get agent context for user (for Chat Intelligence Interface)
   * @param {string} userId - User identifier
   * @returns {object} Agent context
   */
  getAgentContextForUser(userId) {
    return {
      available_agents: Array.from(this.agentRegistry.keys()),
      active_agents: this.getActiveAgents(userId),
      user_preferences: this.getUserPreferences(userId),
      integration_mode: 'adaptive'
    };
  }

  /**
   * Generate agent recommendations based on intelligence response
   * @param {object} intelligenceResponse - Chat intelligence response
   * @param {string} userId - User identifier
   * @returns {Array} Agent recommendations
   */
  generateAgentRecommendations(intelligenceResponse, userId) {
    const recommendations = [];
    const engines = intelligenceResponse.intelligence?.engines || [];
    
    // Recommend specific agents based on active engines
    if (engines.includes('productivity') || engines.includes('workflow')) {
      recommendations.push({
        agent: 'murphy',
        reason: 'Productivity and workflow optimization',
        confidence: 0.8
      });
    }
    
    if (engines.includes('timeManagement') || engines.includes('correlation')) {
      recommendations.push({
        agent: 'grim',
        reason: 'Time management and scheduling optimization',
        confidence: 0.8
      });
    }
    
    return recommendations;
  }

  /**
   * Generate follow-up actions based on intelligence response
   * @param {object} intelligenceResponse - Chat intelligence response
   * @param {string} userId - User identifier
   * @returns {Array} Follow-up actions
   */
  generateFollowUpActions(intelligenceResponse, userId) {
    const actions = [];
    
    if (intelligenceResponse.intelligence?.confidence > 0.7) {
      actions.push({
        type: 'detailed_analysis',
        description: 'Request detailed productivity analysis',
        agent: 'chat_intelligence'
      });
    }
    
    actions.push({
      type: 'task_optimization',
      description: 'Optimize task management approach',
      agent: 'murphy'
    });
    
    actions.push({
      type: 'schedule_optimization',
      description: 'Optimize calendar and scheduling',
      agent: 'grim'
    });
    
    return actions;
  }

  /**
   * Enhance Murphy's response with intelligence insights
   * @param {string} murphyResponse - Murphy's original response
   * @param {object} intelligenceContext - Intelligence context
   * @returns {string} Enhanced response
   */
  enhanceMurphyResponse(murphyResponse, intelligenceContext) {
    if (!intelligenceContext || !intelligenceContext.insights) {
      return murphyResponse;
    }

    let enhancement = "\n\n💡 **Intelligence Insight**: ";
    
    const relevantInsight = intelligenceContext.insights.find(insight => 
      insight.includes('productivity') || insight.includes('workflow')
    );
    
    if (relevantInsight) {
      enhancement += relevantInsight;
    } else {
      enhancement += "Based on your patterns, this task aligns well with your productivity style.";
    }
    
    return murphyResponse + enhancement;
  }

  /**
   * Enhance Grim's response with intelligence insights
   * @param {string} grimResponse - Grim's original response
   * @param {object} intelligenceContext - Intelligence context
   * @returns {string} Enhanced response
   */
  enhanceGrimResponse(grimResponse, intelligenceContext) {
    if (!intelligenceContext || !intelligenceContext.insights) {
      return grimResponse;
    }

    let enhancement = "\n\n⏰ **Time Insight**: ";
    
    const relevantInsight = intelligenceContext.insights.find(insight => 
      insight.includes('time') || insight.includes('schedule') || insight.includes('peak')
    );
    
    if (relevantInsight) {
      enhancement += relevantInsight;
    } else {
      enhancement += "Your scheduling patterns show optimal times for this type of activity.";
    }
    
    return grimResponse + enhancement;
  }

  /**
   * Handle JARVI's native conversation logic
   * @param {string} message - User message
   * @param {string} userId - User identifier
   * @param {object} context - Conversation context
   * @returns {object} JARVI response
   */
  async handleJarviNative(message, userId, context = {}) {
    // JARVI's existing conversation logic
    return {
      message: "I'm here to help coordinate your productivity! I can connect you with Murphy for task management, Grim for calendar optimization, or provide comprehensive intelligence analysis. What would you like to focus on?",
      agent: 'jarvi',
      available_actions: [
        'analyze productivity',
        'manage tasks',
        'optimize schedule',
        'get recommendations'
      ]
    };
  }

  /**
   * Calculate intelligence confidence level
   * @param {object} intelligenceData - Intelligence data
   * @returns {number} Confidence score (0-1)
   */
  calculateIntelligenceConfidence(intelligenceData) {
    let totalConfidence = 0;
    let engineCount = 0;
    
    Object.keys(intelligenceData).forEach(key => {
      if (intelligenceData[key] && typeof intelligenceData[key] === 'object') {
        if (intelligenceData[key].confidenceLevel) {
          totalConfidence += intelligenceData[key].confidenceLevel;
          engineCount++;
        }
      }
    });
    
    return engineCount > 0 ? totalConfidence / engineCount : 0.5;
  }

  /**
   * Extract relevant insights from intelligence data
   * @param {object} intelligenceData - Intelligence data
   * @param {Array} engineTypes - Required engine types
   * @returns {Array} Relevant insights
   */
  extractRelevantInsights(intelligenceData, engineTypes) {
    const insights = [];
    
    if (intelligenceData.productivity && intelligenceData.productivity.recommendations) {
      insights.push(...intelligenceData.productivity.recommendations.immediate || []);
    }
    
    if (intelligenceData.workflow && intelligenceData.workflow.recommendations) {
      insights.push(...intelligenceData.workflow.recommendations.immediate || []);
    }
    
    return insights;
  }

  /**
   * Get active agents for user
   * @param {string} userId - User identifier
   * @returns {Array} Active agents
   */
  getActiveAgents(userId) {
    // This would track which agents the user has interacted with recently
    return ['murphy', 'grim', 'jarvi'];
  }

  /**
   * Get user preferences
   * @param {string} userId - User identifier
   * @returns {object} User preferences
   */
  getUserPreferences(userId) {
    // This would fetch user preferences from database
    return {
      preferred_agent: 'jarvi',
      intelligence_level: 'high',
      automation_preference: 'adaptive'
    };
  }

  /**
   * Generate agent fallback response
   * @param {string} agentName - Agent name
   * @param {object} error - Error object
   * @returns {object} Fallback response
   */
  async generateAgentFallback(agentName, error) {
    return {
      message: `I had trouble connecting with ${agentName}, but I'm still here to help with your productivity questions.`,
      agent: 'jarvi_fallback',
      error: error.message,
      alternatives: ['Try rephrasing your request', 'Ask for general productivity insights']
    };
  }

  /**
   * Generate JARVI fallback response
   * @param {string} message - Original message
   * @param {string} userId - User identifier
   * @param {object} error - Error object
   * @returns {object} Fallback response
   */
  async generateFallbackResponse(message, userId, error) {
    return {
      message: "I'm experiencing some technical difficulties, but I'm still committed to helping you be more productive. Can you try rephrasing your question?",
      jarvi_response: "Let me try a different approach to help you.",
      error: error.message,
      suggestions: [
        "Ask about your productivity patterns",
        "Request task optimization",
        "Get calendar recommendations"
      ]
    };
  }

  /**
   * Register a new agent dynamically (for scalability)
   * @param {string} agentName - Agent name
   * @param {object} agentInstance - Agent instance
   * @param {object} capabilities - Agent capabilities
   */
  registerAgent(agentName, agentInstance, capabilities) {
    this.agentRegistry.set(agentName, {
      instance: agentInstance,
      capabilities: capabilities.domains || [],
      domains: capabilities.domains || []
    });
    
    console.log(`JARVI: Registered new agent ${agentName} with capabilities:`, capabilities.domains);
    
    // Emit event for other components
    this.emit('agentRegistered', {
      agentName,
      capabilities: capabilities.domains,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get system status for monitoring
   * @returns {object} System status
   */
  getSystemStatus() {
    return {
      chatIntelligence: {
        initialized: true,
        activeChats: this.chatIntelligence.activeChats.size,
        activeEngines: 6
      },
      agentRegistry: {
        totalAgents: this.agentRegistry.size,
        agents: Array.from(this.agentRegistry.keys())
      },
      integrationPatterns: this.integrationPatterns.size,
      uptime: process.uptime()
    };
  }
}

module.exports = JARVIChatIntegration;