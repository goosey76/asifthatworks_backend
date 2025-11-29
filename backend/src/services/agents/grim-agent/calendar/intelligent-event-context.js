// Intelligent Event Context Management System with Dynamic Memory Integration
// Handles event tracking, smart matching, and contextual references using conversation history and long-term memory

const memoryService = require('../../../memory-service');
const agentService = require('../../../agent-service');

class IntelligentEventContextManager {
  constructor() {
    this.activeEventContext = new Map(); // Track current active events per user
    this.conversationPatternCache = new Map(); // Cache conversation patterns
    this.eventMemoryTTL = 3600000; // 1 hour TTL for event context
    this.maxHistoryAnalysis = 15; // Analyze last 15 messages
    this.patternAnalysisCache = new Map(); // Cache user behavior patterns
  }

  /**
   * Updates the active event context with enhanced memory integration
   * @param {string} userId - User identifier
   * @param {object} eventDetails - Event details to store
   * @param {string} originalMessage - Original user message for context
   */
  async updateEventContext(userId, eventDetails, originalMessage) {
    try {
      // Get agent configurations
      const grimAgentConfig = await agentService.getAgentConfig('Grim');
      const jarviAgentConfig = await agentService.getAgentConfig('JARVI');
      
      if (!grimAgentConfig || !jarviAgentConfig) {
        console.log('Agent configurations not found for context update');
        return;
      }

      // Get conversation history for pattern analysis
      const conversationHistory = await memoryService.getConversationHistory(userId, jarviAgentConfig.id, this.maxHistoryAnalysis);
      const foreverBrainMemories = await memoryService.getForeverBrain(userId);
      
      // Analyze conversation patterns for context enhancement
      const conversationPatterns = this.analyzeConversationPatterns(conversationHistory, foreverBrainMemories, originalMessage);
      
      const eventContext = {
        eventId: eventDetails.event_id || eventDetails.google_event_id,
        eventTitle: this.cleanEventTitle(eventDetails.event_title || eventDetails.title),
        originalTitle: eventDetails.event_title || eventDetails.title,
        eventDate: eventDetails.date,
        startTime: eventDetails.start_time,
        endTime: eventDetails.end_time,
        eventType: eventDetails.event_type || 'general',
        location: eventDetails.location,
        message: originalMessage,
        timestamp: Date.now(),
        context: this.extractEventContext(originalMessage),
        conversationPatterns: conversationPatterns,
        agentsInvolved: ['Grim'],
        interactionFrequency: this.calculateInteractionFrequency(userId, conversationHistory),
        userBehaviorType: this.determineUserBehaviorType(conversationHistory, foreverBrainMemories)
      };

      // Store in memory service for persistence with enhanced metadata
      await memoryService.storeMemory(userId, {
        type: 'event_context',
        summary: `Event: ${eventContext.eventTitle} on ${eventContext.eventDate}`,
        content: eventContext,
        tags: ['event', 'context', eventContext.eventType, conversationPatterns.patternType, eventContext.userBehaviorType],
        metadata: {
          agentsInvolved: eventContext.agentsInvolved,
          interactionFrequency: eventContext.interactionFrequency,
          conversationPattern: conversationPatterns.patternType,
          createdAt: new Date().toISOString()
        }
      });

      // Update active memory and pattern cache
      this.activeEventContext.set(userId, eventContext);
      this.patternAnalysisCache.set(userId, conversationPatterns);
      
      console.log(`Enhanced event context updated for user ${userId}:`, {
        eventTitle: eventContext.eventTitle,
        patternType: conversationPatterns.patternType,
        behaviorType: eventContext.userBehaviorType,
        interactionFrequency: eventContext.interactionFrequency
      });

    } catch (error) {
      console.error('Failed to update enhanced event context:', error);
    }
  }

  /**
   * Analyzes conversation patterns using history and long-term memory
   * @param {Array} conversationHistory - Recent conversation messages
   * @param {Array} foreverBrainMemories - Long-term user memories
   * @param {string} currentMessage - Current message for context
   * @returns {object} Conversation pattern analysis
   */
  analyzeConversationPatterns(conversationHistory, foreverBrainMemories, currentMessage) {
    const patterns = {
      patternType: 'balanced',
      calendarFrequency: 0,
      taskFrequency: 0,
      agentPreference: {},
      timePreferences: {},
      contextDepth: 0
    };

    // Analyze conversation history for patterns
    conversationHistory.forEach(msg => {
      const lowerMsg = msg.toLowerCase();
      
      // Count calendar vs task mentions
      if (lowerMsg.includes('calendar') || lowerMsg.includes('meeting') || lowerMsg.includes('event') || lowerMsg.includes('appointment')) {
        patterns.calendarFrequency++;
      }
      if (lowerMsg.includes('task') || lowerMsg.includes('todo') || lowerMsg.includes('reminder')) {
        patterns.taskFrequency++;
      }
      
      // Analyze agent preferences
      if (lowerMsg.includes('grim')) patterns.agentPreference.grim = (patterns.agentPreference.grim || 0) + 1;
      if (lowerMsg.includes('murphy')) patterns.agentPreference.murphy = (patterns.agentPreference.murphy || 0) + 1;
      if (lowerMsg.includes('jarvi')) patterns.agentPreference.jarvi = (patterns.agentPreference.jarvi || 0) + 1;
      
      // Extract time preferences
      const timeMatches = lowerMsg.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/g);
      if (timeMatches) {
        timeMatches.forEach(time => {
          patterns.timePreferences[time] = (patterns.timePreferences[time] || 0) + 1;
        });
      }
    });

    // Analyze long-term memories for deeper patterns
    foreverBrainMemories.forEach(memory => {
      const summary = memory.summary.toLowerCase();
      
      if (summary.includes('calendar') || summary.includes('meeting')) {
        patterns.calendarFrequency += 2; // Long-term memories have more weight
      }
      if (summary.includes('task') || summary.includes('reminder')) {
        patterns.taskFrequency += 2;
      }
    });

    // Determine primary pattern type
    if (patterns.calendarFrequency > patterns.taskFrequency * 1.5) {
      patterns.patternType = 'calendar_focused';
    } else if (patterns.taskFrequency > patterns.calendarFrequency * 1.5) {
      patterns.patternType = 'task_focused';
    } else {
      patterns.patternType = 'balanced';
    }

    // Calculate context depth based on conversation length and memory richness
    patterns.contextDepth = Math.min((conversationHistory.length * 0.3) + (foreverBrainMemories.length * 0.7), 10);

    return patterns;
  }

  /**
   * Calculates interaction frequency patterns for a user
   * @param {string} userId - User identifier
   * @param {Array} conversationHistory - Recent conversation history
   * @returns {object} Interaction frequency analysis
   */
  calculateInteractionFrequency(userId, conversationHistory) {
    const now = Date.now();
    const frequency = {
      dailyInteractions: 0,
      weeklyInteractions: 0,
      lastInteraction: null,
      peakHours: {},
      agentUsage: {}
    };

    // Analyze recent interactions
    conversationHistory.forEach(msg => {
      // This would need timestamp data from actual messages
      frequency.dailyInteractions++;
      frequency.weeklyInteractions++;
    });

    return frequency;
  }

  /**
   * Determines user behavior type based on conversation patterns
   * @param {Array} conversationHistory - Recent conversation history
   * @param {Array} foreverBrainMemories - Long-term memories
   * @returns {string} User behavior classification
   */
  determineUserBehaviorType(conversationHistory, foreverBrainMemories) {
    const messageCount = conversationHistory.length;
    const memoryCount = foreverBrainMemories.length;
    
    if (messageCount < 5 && memoryCount < 3) {
      return 'new_user';
    } else if (messageCount > 20 || memoryCount > 10) {
      return 'power_user';
    } else if (conversationHistory.some(msg => msg.includes('?')) && 
               conversationHistory.some(msg => msg.includes('help'))) {
      return 'help_seeker';
    } else {
      return 'regular_user';
    }
  }

  /**
   * Gets enhanced event context with conversation history integration
   * @param {string} userId - User identifier
   * @returns {object|null} Enhanced event context
   */
  async getEventContext(userId) {
    try {
      // Try active memory first
      let context = this.activeEventContext.get(userId);
      
      if (!context) {
        // Fallback to memory service with enhanced query
        const memories = await memoryService.getMemoriesByType(userId, 'event_context');
        if (memories && memories.length > 0) {
          const sortedMemories = memories.sort((a, b) => 
            new Date(b.content.timestamp) - new Date(a.content.timestamp)
          );
          
          const recentContext = sortedMemories[0].content;
          
          if (Date.now() - recentContext.timestamp < this.eventMemoryTTL) {
            context = recentContext;
            this.activeEventContext.set(userId, context);
          }
        }
      }

      // Enhance context with current conversation patterns if available
      if (context) {
        const cachedPatterns = this.patternAnalysisCache.get(userId);
        if (cachedPatterns) {
          context.currentPatterns = cachedPatterns;
        }
      }

      return context;
    } catch (error) {
      console.error('Failed to retrieve enhanced event context:', error);
      return null;
    }
  }

  /**
   * Intelligently matches event reference with enhanced context awareness
   * @param {string} userId - User identifier  
   * @param {string} eventReference - Reference like "the event", "it", "that meeting"
   * @param {Array} availableEvents - Array of available events to match against
   * @returns {object|null} Best matching event with enhanced metadata
   */
  async smartEventMatch(userId, eventReference, availableEvents) {
    if (!availableEvents || availableEvents.length === 0) {
      return null;
    }

    console.log(`Enhanced smart matching event reference "${eventReference}" for user ${userId}`);
    
    // Get enhanced event context
    const context = await this.getEventContext(userId);
    if (!context) {
      console.log('No enhanced event context found for smart matching');
      return null;
    }

    // Get conversation patterns for enhanced matching
    const patterns = context.conversationPatterns || this.patternAnalysisCache.get(userId);
    
    // Score each available event with enhanced criteria
    const scoredEvents = availableEvents.map(event => {
      const score = this.calculateEnhancedEventMatchScore(context, event, patterns);
      return { event, score, confidence: this.calculateMatchConfidence(context, event, patterns) };
    });

    // Sort by score (highest first)
    scoredEvents.sort((a, b) => b.score - a.score);
    
    const bestMatch = scoredEvents[0];
    
    console.log(`Enhanced best match - Score: ${bestMatch.score}, Confidence: ${bestMatch.confidence} for event:`, bestMatch.event.summary);
    
    // Only return if score is above threshold AND confidence is sufficient
    if (bestMatch.score >= 0.3 && bestMatch.confidence >= 0.4) {
      return {
        ...bestMatch.event,
        matchScore: bestMatch.score,
        matchConfidence: bestMatch.confidence,
        contextualReasoning: this.generateContextualReasoning(context, bestMatch.event, patterns)
      };
    }

    return null;
  }

  /**
   * Calculates enhanced match score with conversation pattern integration
   * @param {object} context - Event context
   * @param {object} event - Google Calendar event
   * @param {object} patterns - Conversation patterns
   * @returns {number} Enhanced match score (0-1)
   */
  calculateEnhancedEventMatchScore(context, event, patterns) {
    let score = 0;
    
    // Base matching (title, date, time, location)
    score += this.calculateEventMatchScore(context, event) * 0.6;
    
    // Pattern-based scoring
    if (patterns) {
      // Calendar-focused users get higher scores for calendar events
      if (patterns.patternType === 'calendar_focused') {
        score += 0.1;
      }
      
      // Agent preference scoring
      if (patterns.agentPreference.grim > patterns.agentPreference.murphy) {
        score += 0.1; // User prefers Grim, so calendar events are more likely
      }
      
      // Time preference matching
      if (patterns.timePreferences && event.start && event.start.dateTime) {
        const eventTime = new Date(event.start.dateTime).toTimeString().substring(0, 5);
        if (patterns.timePreferences[eventTime]) {
          score += 0.1;
        }
      }
    }
    
    // Context depth bonus - users with richer context are more likely to reference specific events
    if (context.contextDepth > 5) {
      score += 0.05;
    }
    
    // User behavior type scoring
    switch (context.userBehaviorType) {
      case 'power_user':
        score += 0.1; // Power users are more precise
        break;
      case 'help_seeker':
        score -= 0.05; // Help seekers might be less specific
        break;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculates confidence in event matching
   * @param {object} context - Event context
   * @param {object} event - Google Calendar event
   * @param {object} patterns - Conversation patterns
   * @returns {number} Confidence score (0-1)
   */
  calculateMatchConfidence(context, event, patterns) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on context richness
    confidence += (context.contextDepth / 10) * 0.3;
    
    // Increase confidence for power users
    if (context.userBehaviorType === 'power_user') {
      confidence += 0.2;
    }
    
    // Decrease confidence for new users
    if (context.userBehaviorType === 'new_user') {
      confidence -= 0.2;
    }
    
    // Increase confidence if patterns strongly indicate calendar focus
    if (patterns && patterns.patternType === 'calendar_focused' && patterns.calendarFrequency > 5) {
      confidence += 0.15;
    }
    
    return Math.max(0, Math.min(confidence, 1.0));
  }

  /**
   * Generates contextual reasoning for the match
   * @param {object} context - Event context
   * @param {object} event - Matched event
   * @param {object} patterns - Conversation patterns
   * @returns {string} Human-readable reasoning
   */
  generateContextualReasoning(context, event, patterns) {
    const reasons = [];
    
    if (context.eventTitle && event.summary && 
        this.cleanEventTitle(context.eventTitle) === this.cleanEventTitle(event.summary)) {
      reasons.push('exact title match');
    }
    
    if (patterns && patterns.patternType === 'calendar_focused') {
      reasons.push('user has calendar-focused interaction pattern');
    }
    
    if (context.userBehaviorType === 'power_user') {
      reasons.push('user shows precision in event references');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'contextual pattern matching';
  }

  /**
   * Processes contextual event update with enhanced intelligence
   * @param {string} userId - User identifier
   * @param {string} updateMessage - Update message like "change the time for the event"
   * @param {Array} availableEvents - Available events to match against
   * @returns {object} Enhanced processing result
   */
  async processContextualUpdate(userId, updateMessage, availableEvents) {
    const context = await this.getEventContext(userId);
    if (!context) {
      return {
        success: false,
        message: "I don't have sufficient context about your recent events. Please be more specific about which event you'd like to update.",
        matchedEvent: null,
        confidence: 0
      };
    }

    // Enhanced smart match with confidence scoring
    const matchedEvent = await this.smartEventMatch(userId, updateMessage, availableEvents);
    if (!matchedEvent) {
      return {
        success: false,
        message: `I found your recent ${context.eventType} "${context.eventTitle}" but couldn't confidently match it to current events. User pattern: ${context.userBehaviorType}, Context depth: ${context.contextDepth}. Could you be more specific?`,
        matchedEvent: context,
        confidence: 0.2
      };
    }

    // Extract what needs to be updated with enhanced analysis
    const updateDetails = this.extractUpdateDetails(updateMessage, context);

    // Validate update based on user behavior patterns
    const validationResult = this.validateUpdateAgainstPatterns(updateDetails, context.conversationPatterns);

    return {
      success: true,
      message: `Found your event "${matchedEvent.summary}" with ${Math.round(matchedEvent.matchConfidence * 100)}% confidence. Reasoning: ${matchedEvent.contextualReasoning}. Applying ${updateDetails.action} to ${updateDetails.target}`,
      matchedEvent: matchedEvent,
      updateDetails: updateDetails,
      context: context,
      confidence: matchedEvent.matchConfidence,
      validationResult: validationResult
    };
  }

  /**
   * Validates update request against user patterns
   * @param {object} updateDetails - Update details
   * @param {object} patterns - User conversation patterns
   * @returns {object} Validation result
   */
  validateUpdateAgainstPatterns(updateDetails, patterns) {
    const validation = {
      isValid: true,
      warnings: [],
      suggestions: []
    };

    // Check if update type matches user patterns
    if (patterns) {
      if (updateDetails.target === 'time' && patterns.patternType === 'task_focused') {
        validation.warnings.push('User typically focuses on tasks, not time management');
        validation.suggestions.push('Consider if this should be a task reminder instead');
      }
      
      if (updateDetails.action === 'change' && patterns.agentPreference.murphy > patterns.agentPreference.grim) {
        validation.suggestions.push('User often uses Murphy - consider task delegation');
      }
    }

    return validation;
  }

  /**
   * Gets user interaction analytics for all agents
   * @param {string} userId - User identifier
   * @returns {Promise<object} Comprehensive user analytics
   */
  async getUserInteractionAnalytics(userId) {
    try {
      const jarviAgentConfig = await agentService.getAgentConfig('JARVI');
      const conversationHistory = await memoryService.getConversationHistory(userId, jarviAgentConfig.id, 50);
      const foreverBrainMemories = await memoryService.getForeverBrain(userId);
      
      const analytics = {
        userId: userId,
        timestamp: new Date().toISOString(),
        conversationPatterns: this.analyzeConversationPatterns(conversationHistory, foreverBrainMemories, ''),
        behaviorType: this.determineUserBehaviorType(conversationHistory, foreverBrainMemories),
        eventContext: await this.getEventContext(userId),
        recommendations: this.generateRecommendations(conversationHistory, foreverBrainMemories)
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get user interaction analytics:', error);
      return null;
    }
  }

  /**
   * Generates recommendations based on user patterns
   * @param {Array} conversationHistory - Conversation history
   * @param {Array} foreverBrainMemories - Long-term memories
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(conversationHistory, foreverBrainMemories) {
    const recommendations = [];
    
    // Pattern-based recommendations
    const patterns = this.analyzeConversationPatterns(conversationHistory, foreverBrainMemories, '');
    
    if (patterns.patternType === 'calendar_focused' && patterns.calendarFrequency < 3) {
      recommendations.push('User shows calendar focus but low frequency - consider proactive calendar suggestions');
    }
    
    if (patterns.agentPreference.murphy > patterns.agentPreference.grim * 2) {
      recommendations.push('Strong task preference - consider task-based alternatives to calendar events');
    }
    
    if (patterns.contextDepth < 3) {
      recommendations.push('Low context depth - provide more explicit confirmation and context');
    }
    
    return recommendations;
  }

  // ... (keeping existing utility methods: cleanEventTitle, calculateEventMatchScore, etc.)
  
  /**
   * Cleans event title by removing emojis and normalizing
   * @param {string} title - Event title
   * @returns {string} Cleaned title
   */
  cleanEventTitle(title) {
    if (!title) return '';
    
    return title
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove symbols
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport symbols
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove miscellaneous symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
      .trim();
  }

  /**
   * Checks if a message references a previous event
   * @param {string} message - User message
   * @returns {boolean} True if references previous event
   */
  isEventReference(message) {
    const lowerMessage = message.toLowerCase();
    const referencePatterns = [
      /\b(the|that|it|this)\s+(event|meeting|appointment|call|lunch|break)\b/gi,
      /\bchange\b.*\b(event|meeting|appointment)\b/gi,
      /\bupdate\b.*\b(event|meeting|appointment)\b/gi,
      /\bmodify\b.*\b(event|meeting|appointment)\b/gi
    ];

    return referencePatterns.some(pattern => pattern.test(lowerMessage));
  }

  /**
   * Clears event context for a user
   * @param {string} userId - User identifier
   */
  clearEventContext(userId) {
    this.activeEventContext.delete(userId);
    this.patternAnalysisCache.delete(userId);
    console.log(`Cleared enhanced event context and patterns for user ${userId}`);
  }
}

module.exports = IntelligentEventContextManager;