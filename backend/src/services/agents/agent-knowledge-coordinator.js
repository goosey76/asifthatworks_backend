// Agent Coordination System - Rotating User Knowledge
// Allows agents to share and rotate user insights for better coordination

const EventEmitter = require('events');

class AgentKnowledgeCoordinator extends EventEmitter {
  constructor() {
    super();
    this.userKnowledgeStore = new Map(); // userId -> comprehensive knowledge
    this.agentKnowledgeAccess = new Map(); // agent -> Set of userIds they have access to
    this.knowledgeRotationSchedule = new Map(); // userId -> lastRotation timestamp
    this.maxRotationInterval = 5 * 60 * 1000; // 5 minutes
    this.knowledgeTTL = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Register an agent's access to user knowledge
   * @param {string} agentName - Name of the agent (murphy, grim, jarvi)
   * @param {string} userId - User identifier
   * @param {object} initialKnowledge - Initial knowledge from the agent
   */
  registerAgentKnowledge(agentName, userId, initialKnowledge = {}) {
    if (!this.agentKnowledgeAccess.has(agentName)) {
      this.agentKnowledgeAccess.set(agentName, new Set());
    }
    
    this.agentKnowledgeAccess.get(agentName).add(userId);
    
    // Initialize or update user knowledge
    const existingKnowledge = this.userKnowledgeStore.get(userId) || {};
    const updatedKnowledge = {
      userId: userId,
      lastUpdated: new Date().toISOString(),
      agents: {
        ...existingKnowledge.agents,
        [agentName]: {
          knowledge: initialKnowledge,
          lastUpdated: new Date().toISOString(),
          accessLevel: this.getAgentAccessLevel(agentName)
        }
      },
      rotatedKnowledge: existingKnowledge.rotatedKnowledge || null
    };
    
    this.userKnowledgeStore.set(userId, updatedKnowledge);
    
    console.log(`KNOWLEDGE COORDINATOR: Registered ${agentName} knowledge for user ${userId}`);
  }

  /**
   * Update agent's knowledge for a specific user
   * @param {string} agentName - Name of the agent
   * @param {string} userId - User identifier
   * @param {object} knowledgeUpdate - Updated knowledge from agent
   */
  updateAgentKnowledge(agentName, userId, knowledgeUpdate) {
    const userKnowledge = this.userKnowledgeStore.get(userId);
    
    if (!userKnowledge) {
      console.warn(`KNOWLEDGE COORDINATOR: No knowledge store for user ${userId}`);
      return;
    }
    
    userKnowledge.agents[agentName] = {
      knowledge: knowledgeUpdate,
      lastUpdated: new Date().toISOString(),
      accessLevel: this.getAgentAccessLevel(agentName)
    };
    
    userKnowledge.lastUpdated = new Date().toISOString();
    
    // Trigger rotation if needed
    this.checkAndRotateKnowledge(userId);
    
    console.log(`KNOWLEDGE COORDINATOR: Updated ${agentName} knowledge for user ${userId}`);
  }

  /**
   * Get rotated user knowledge for an agent
   * @param {string} requestingAgent - Agent requesting knowledge
   * @param {string} userId - User identifier
   * @returns {object} Rotated knowledge summary
   */
  getRotatedUserKnowledge(requestingAgent, userId) {
    const userKnowledge = this.userKnowledgeStore.get(userId);
    
    if (!userKnowledge) {
      console.warn(`KNOWLEDGE COORDINATOR: No knowledge found for user ${userId}`);
      return this.getEmptyKnowledgeSummary(userId);
    }
    
    // Check if rotation is needed
    this.checkAndRotateKnowledge(userId);
    
    // Get knowledge from all other agents (excluding requesting agent)
    const otherAgentKnowledge = {};
    const knowledgeContributors = Object.keys(userKnowledge.agents).filter(agent => agent !== requestingAgent);
    
    knowledgeContributors.forEach(agentName => {
      const agentData = userKnowledge.agents[agentName];
      if (this.canAgentAccessKnowledge(requestingAgent, agentName)) {
        otherAgentKnowledge[agentName] = this.sanitizeKnowledgeForAgent(agentData.knowledge, requestingAgent);
      }
    });
    
    // Create rotated summary
    const rotatedKnowledge = {
      userId: userId,
      timestamp: new Date().toISOString(),
      contributors: knowledgeContributors,
      knowledge: this.createRotatedSummary(otherAgentKnowledge, userId),
      coordinationHints: this.generateCoordinationHints(otherAgentKnowledge)
    };
    
    console.log(`KNOWLEDGE COORDINATOR: Provided rotated knowledge to ${requestingAgent} for user ${userId}`);
    
    return rotatedKnowledge;
  }

  /**
   * Check if knowledge rotation is needed and perform it
   * @param {string} userId - User identifier
   */
  checkAndRotateKnowledge(userId) {
    const now = Date.now();
    const lastRotation = this.knowledgeRotationSchedule.get(userId) || 0;
    
    if (now - lastRotation > this.maxRotationInterval) {
      this.performKnowledgeRotation(userId);
      this.knowledgeRotationSchedule.set(userId, now);
    }
  }

  /**
   * Perform knowledge rotation for a user
   * @param {string} userId - User identifier
   */
  performKnowledgeRotation(userId) {
    const userKnowledge = this.userKnowledgeStore.get(userId);
    
    if (!userKnowledge || Object.keys(userKnowledge.agents).length < 2) {
      return; // Need at least 2 agents for meaningful rotation
    }
    
    // Create rotated summary focusing on coordination
    const rotatedSummary = this.createCoordinationSummary(userKnowledge);
    userKnowledge.rotatedKnowledge = rotatedSummary;
    
    console.log(`KNOWLEDGE COORDINATOR: Performed knowledge rotation for user ${userId}`);
  }

  /**
   * Create coordination summary from multiple agent knowledge sources
   * @param {object} userKnowledge - User knowledge from all agents
   * @returns {object} Coordination summary
   */
  createCoordinationSummary(userKnowledge) {
    const agentNames = Object.keys(userKnowledge.agents);
    const summary = {
      userId: userKnowledge.userId,
      rotationTimestamp: new Date().toISOString(),
      participatingAgents: agentNames,
      unifiedProfile: {},
      coordinationInsights: []
    };
    
    // Extract productivity patterns
    const productivityPatterns = this.extractProductivityPatterns(userKnowledge);
    summary.unifiedProfile.productivity = productivityPatterns;
    
    // Extract scheduling patterns
    const schedulingPatterns = this.extractSchedulingPatterns(userKnowledge);
    summary.unifiedProfile.scheduling = schedulingPatterns;
    
    // Generate coordination insights
    summary.coordinationInsights = this.generateCoordinationInsights(productivityPatterns, schedulingPatterns);
    
    return summary;
  }

  /**
   * Extract productivity patterns from agent knowledge
   * @param {object} userKnowledge - User knowledge from all agents
   * @returns {object} Productivity patterns
   */
  extractProductivityPatterns(userKnowledge) {
    const patterns = {
      overallCompletionRate: 0,
      taskPreferences: [],
      productivityLevel: 'unknown',
      optimalInteractionTimes: [],
      motivationalTriggers: []
    };
    
    // Get Murphy's productivity insights
    const murphyKnowledge = userKnowledge.agents.murphy?.knowledge;
    if (murphyKnowledge) {
      patterns.overallCompletionRate = murphyKnowledge.productivitySnapshot?.completionRate || 0;
      patterns.taskPreferences = murphyKnowledge.productivitySnapshot?.favoriteCategory || 'general';
      patterns.motivationalTriggers = murphyKnowledge.personalizedInsights?.motivationalTriggers || [];
    }
    
    // Get JARVI's interaction patterns
    const jarviKnowledge = userKnowledge.agents.jarvi?.knowledge;
    if (jarviKnowledge) {
      patterns.optimalInteractionTimes = jarviKnowledge.interactionPatterns || [];
    }
    
    return patterns;
  }

  /**
   * Extract scheduling patterns from agent knowledge
   * @param {object} userKnowledge - User knowledge from all agents
   * @returns {object} Scheduling patterns
   */
  extractSchedulingPatterns(userKnowledge) {
    const patterns = {
      totalEvents: 0,
      favoriteEventTypes: [],
      preferredMeetingLengths: [],
      bufferTimePreference: 15,
      schedulingExperience: 'beginner'
    };
    
    // Get Grim's scheduling insights
    const grimKnowledge = userKnowledge.agents.grim?.knowledge;
    if (grimKnowledge) {
      patterns.totalEvents = grimKnowledge.calendarSnapshot?.totalEvents || 0;
      patterns.favoriteEventTypes = grimKnowledge.calendarSnapshot?.favoriteEventTypes || [];
      patterns.bufferTimePreference = grimKnowledge.coordinationHints?.bufferTimeNeeded || 15;
      
      if (patterns.totalEvents > 20) {
        patterns.schedulingExperience = 'experienced';
      } else if (patterns.totalEvents > 5) {
        patterns.schedulingExperience = 'intermediate';
      }
    }
    
    return patterns;
  }

  /**
   * Generate coordination insights from patterns
   * @param {object} productivityPatterns - Productivity patterns
   * @param {object} schedulingPatterns - Scheduling patterns
   * @returns {Array} Coordination insights
   */
  generateCoordinationInsights(productivityPatterns, schedulingPatterns) {
    const insights = [];
    
    // High productivity + experienced scheduling
    if (productivityPatterns.overallCompletionRate > 80 && schedulingPatterns.schedulingExperience === 'experienced') {
      insights.push({
        type: 'power-user',
        description: 'User is highly productive and experienced with scheduling',
        recommendations: ['minimal-guidance', 'advanced-features', 'efficiency-focused']
      });
    }
    
    // Low productivity + beginner scheduling
    if (productivityPatterns.overallCompletionRate < 50 && schedulingPatterns.schedulingExperience === 'beginner') {
      insights.push({
        type: 'needs-support',
        description: 'User needs extra support and guidance',
        recommendations: ['step-by-step', 'frequent-reminders', 'encouragement-focused']
      });
    }
    
    // Time management optimization
    if (schedulingPatterns.bufferTimePreference > 15) {
      insights.push({
        type: 'needs-buffer-time',
        description: 'User benefits from extra time between commitments',
        recommendations: ['auto-buffer-time', 'realistic-scheduling', 'stress-reduction']
      });
    }
    
    return insights;
  }

  /**
   * Create rotated summary for agent access
   * @param {object} otherAgentKnowledge - Knowledge from other agents
   * @param {string} userId - User identifier
   * @returns {object} Rotated summary
   */
  createRotatedSummary(otherAgentKnowledge, userId) {
    const summary = {
      userId: userId,
      timestamp: new Date().toISOString(),
      insights: {},
      patterns: {}
    };
    
    // Combine insights from all contributing agents
    Object.entries(otherAgentKnowledge).forEach(([agentName, knowledge]) => {
      if (agentName === 'murphy') {
        summary.patterns.taskManagement = {
          completionRate: knowledge.productivitySnapshot?.completionRate || 0,
          favoriteCategories: knowledge.productivitySnapshot?.favoriteCategory || 'general',
          taskTypes: knowledge.recentPatterns?.recentTaskTypes || []
        };
      } else if (agentName === 'grim') {
        summary.patterns.scheduling = {
          totalEvents: knowledge.calendarSnapshot?.totalEvents || 0,
          eventTypes: knowledge.calendarSnapshot?.favoriteEventTypes || [],
          bufferPreference: knowledge.coordinationHints?.bufferTimeNeeded || 15
        };
      }
    });
    
    return summary;
  }

  /**
   * Generate coordination hints for agents
   * @param {object} otherAgentKnowledge - Knowledge from other agents
   * @returns {object} Coordination hints
   */
  generateCoordinationHints(otherAgentKnowledge) {
    const hints = {
      communicationStyle: 'friendly',
      interactionFrequency: 'normal',
      preferredAgentForType: {},
      coordinationRecommendations: []
    };
    
    // Determine best agent for different task types
    const murphyData = otherAgentKnowledge.murphy;
    const grimData = otherAgentKnowledge.grim;
    
    if (murphyData?.productivitySnapshot?.completionRate > 70) {
      hints.preferredAgentForType.tasks = 'murphy'; // Murphy is preferred for task management
      hints.interactionFrequency = 'minimal'; // High-performing users need less intervention
    }
    
    if (grimData?.calendarSnapshot?.totalEvents > 10) {
      hints.preferredAgentForType.scheduling = 'grim'; // Grim is preferred for calendar management
    }
    
    return hints;
  }

  /**
   * Get agent access level for knowledge sharing
   * @param {string} agentName - Name of the agent
   * @returns {string} Access level
   */
  getAgentAccessLevel(agentName) {
    const accessLevels = {
      'jarvi': 'full', // JARVI has full access to coordinate
      'murphy': 'task-focused', // Murphy shares task-related knowledge
      'grim': 'schedule-focused' // Grim shares calendar-related knowledge
    };
    
    return accessLevels[agentName] || 'limited';
  }

  /**
   * Check if requesting agent can access knowledge from source agent
   * @param {string} requestingAgent - Agent requesting access
   * @param {string} sourceAgent - Agent providing knowledge
   * @returns {boolean} Whether access is allowed
   */
  canAgentAccessKnowledge(requestingAgent, sourceAgent) {
    // All agents can access general patterns for coordination
    // JARVI has full access to everything
    if (requestingAgent === 'jarvi') return true;
    
    // Agents can access each other's patterns for coordination
    // but not sensitive implementation details
    return true;
  }

  /**
   * Sanitize knowledge for specific agent consumption
   * @param {object} knowledge - Source knowledge
   * @param {string} requestingAgent - Agent requesting the knowledge
   * @returns {object} Sanitized knowledge
   */
  sanitizeKnowledgeForAgent(knowledge, requestingAgent) {
    // Remove sensitive implementation details
    // Keep only coordination-relevant insights
    const sanitized = {
      userId: knowledge.userId,
      timestamp: knowledge.timestamp,
      insights: {},
      patterns: {}
    };
    
    // Only share relevant patterns
    if (requestingAgent === 'murphy' && knowledge.calendarSnapshot) {
      sanitized.patterns.scheduling = {
        totalEvents: knowledge.calendarSnapshot.totalEvents,
        bufferPreference: knowledge.coordinationHints?.bufferTimeNeeded || 15
      };
    }
    
    if (requestingAgent === 'grim' && knowledge.productivitySnapshot) {
      sanitized.patterns.productivity = {
        completionRate: knowledge.productivitySnapshot.completionRate,
        taskTypes: knowledge.recentPatterns?.recentTaskTypes || []
      };
    }
    
    return sanitized;
  }

  /**
   * Get empty knowledge summary for new users
   * @param {string} userId - User identifier
   * @returns {object} Empty knowledge summary
   */
  getEmptyKnowledgeSummary(userId) {
    return {
      userId: userId,
      timestamp: new Date().toISOString(),
      contributors: [],
      knowledge: {
        patterns: {},
        insights: {}
      },
      coordinationHints: {
        communicationStyle: 'friendly',
        interactionFrequency: 'normal',
        preferredAgentForType: {},
        coordinationRecommendations: ['start-building-profile']
      }
    };
  }

  /**
   * Clean up expired knowledge
   * @param {number} maxAge - Maximum age in milliseconds (default: 30 minutes)
   */
  cleanupExpiredKnowledge(maxAge = null) {
    const ageLimit = maxAge || this.knowledgeTTL;
    const now = Date.now();
    
    for (const [userId, knowledge] of this.userKnowledgeStore.entries()) {
      const lastUpdated = new Date(knowledge.lastUpdated).getTime();
      if (now - lastUpdated > ageLimit) {
        this.userKnowledgeStore.delete(userId);
        this.knowledgeRotationSchedule.delete(userId);
        console.log(`KNOWLEDGE COORDINATOR: Cleaned up expired knowledge for user ${userId}`);
      }
    }
  }

  /**
   * Integration helper for agents to easily register knowledge
   * @param {string} agentName - Name of the agent
   * @param {string} userId - User identifier
   * @param {object} agent - Agent instance with getRotatingUserKnowledge method
   */
  registerAgentWithKnowledge(agentName, userId, agent) {
    try {
      // Get knowledge from agent
      const agentKnowledge = agent.getRotatingUserKnowledge ?
        agent.getRotatingUserKnowledge(userId) :
        agent.getCalendarKnowledgeForAgents ?
          agent.getCalendarKnowledgeForAgents(userId) :
          {};
      
      // Register with coordinator
      this.registerAgentKnowledge(agentName, userId, agentKnowledge);
      
      console.log(`KNOWLEDGE COORDINATOR: Registered ${agentName} with rotating knowledge for user ${userId}`);
    } catch (error) {
      console.error(`KNOWLEDGE COORDINATOR: Failed to register ${agentName}:`, error);
    }
  }

  /**
   * Integration helper to get all agent knowledge for coordination
   * @param {string} userId - User identifier
   * @returns {object} Comprehensive knowledge summary from all agents
   */
  getComprehensiveUserKnowledge(userId) {
    // Trigger rotation to get latest insights
    this.checkAndRotateKnowledge(userId);
    
    // Get rotated knowledge from coordinator
    const rotatedKnowledge = this.getRotatedUserKnowledge('jarvi', userId);
    
    return {
      userId: userId,
      rotated: rotatedKnowledge,
      raw: this.userKnowledgeStore.get(userId) || {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check agent health and knowledge distribution
   * @returns {object} Health status of knowledge coordination
   */
  getHealthStatus() {
    const health = {
      totalUsers: this.userKnowledgeStore.size,
      activeAgents: this.agentKnowledgeAccess.size,
      rotationSchedule: this.knowledgeRotationSchedule.size,
      lastCleanup: new Date().toISOString()
    };
    
    // Check for stuck rotations
    const now = Date.now();
    const staleRotations = [];
    
    for (const [userId, lastRotation] of this.knowledgeRotationSchedule.entries()) {
      if (now - lastRotation > this.maxRotationInterval * 2) {
        staleRotations.push(userId);
      }
    }
    
    health.staleRotations = staleRotations;
    health.needsCleanup = staleRotations.length > 0;
    
    return health;
  }
}

// Export singleton instance
module.exports = new AgentKnowledgeCoordinator();

// Export singleton instance
module.exports = new AgentKnowledgeCoordinator();