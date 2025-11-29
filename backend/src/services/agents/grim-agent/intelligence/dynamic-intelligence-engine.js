/**
 * Dynamic Intelligence Engine for Grim Agent
 * Implements real-time learning from user behavior and adaptive responses
 * Based on insights from real user test UUID 982bb1bf-539c-4b1f-8d1a-714600fff81d
 */

class DynamicIntelligenceEngine {
  constructor(supabase) {
    this.supabase = supabase;
    this.userBehaviorCache = new Map(); // userId -> behavior patterns
    this.responsePatterns = new Map(); // userId -> response preferences
    this.calendarPreferences = new Map(); // userId -> calendar usage patterns
    this.adaptationHistory = new Map(); // userId -> learning history
  }

  /**
   * Learn from user interaction patterns
   * @param {string} userId - User identifier
   * @param {object} interaction - User interaction data
   */
  async learnFromUserInteraction(userId, interaction) {
    console.log(`🧠 Dynamic Intelligence: Learning from user ${userId} interaction`);
    
    try {
      // Store interaction pattern
      await this.recordInteractionPattern(userId, interaction);
      
      // Update behavior cache
      this.updateBehaviorCache(userId, interaction);
      
      // Adapt response style based on user preferences
      await this.adaptResponseStyle(userId, interaction);
      
      // Update calendar usage patterns
      await this.updateCalendarPatterns(userId, interaction);
      
      console.log(`✅ Dynamic Intelligence: Successfully learned from user interaction`);
      
    } catch (error) {
      console.error('Dynamic Intelligence learning failed:', error);
    }
  }

  /**
   * Generate intelligent response based on user patterns
   * @param {string} userId - User identifier
   * @param {object} intent - Intent data
   * @param {object} entities - Extracted entities
   * @returns {object} Intelligent response adaptation
   */
  async generateIntelligentResponse(userId, intent, entities) {
    console.log(`🎯 Dynamic Intelligence: Generating intelligent response for ${userId}`);
    
    try {
      const userPatterns = await this.getUserPatterns(userId);
      const responseAdaptations = await this.analyzeResponseAdaptations(userId, intent, entities);
      const calendarContext = await this.getCalendarContext(userId);
      
      return {
        responseStyle: this.selectOptimalResponseStyle(userPatterns),
        timingPreferences: this.extractTimingPreferences(userPatterns),
        calendarPreferences: calendarContext,
        adaptationSuggestions: responseAdaptations.suggestions,
        confidence: responseAdaptations.confidence
      };
      
    } catch (error) {
      console.error('Intelligent response generation failed:', error);
      return this.getDefaultIntelligentResponse();
    }
  }

  /**
   * Handle error scenarios with dynamic intelligence
   * @param {string} userId - User identifier
   * @param {object} error - Error information
   * @param {object} context - Current context
   * @returns {object} Intelligent error response
   */
  async handleErrorWithIntelligence(userId, error, context) {
    console.log(`🛡️ Dynamic Intelligence: Handling error with intelligence for ${userId}`);
    
    try {
      const userPatterns = await this.getUserPatterns(userId);
      const errorHandlingStyle = this.selectErrorHandlingStyle(userPatterns, error);
      const fallbackStrategies = await this.generateFallbackStrategies(userId, error, context);
      
      return {
        messageToUser: this.craftIntelligentErrorMessage(error, errorHandlingStyle),
        fallbackOptions: fallbackStrategies,
        nextSteps: this.suggestNextSteps(userId, error, context),
        recoverySuggestions: this.generateRecoverySuggestions(userId, error)
      };
      
    } catch (intelligenceError) {
      console.error('Intelligent error handling failed:', intelligenceError);
      return this.getDefaultErrorResponse(error);
    }
  }

  /**
   * Analyze user calendar behavior patterns
   * @param {string} userId - User identifier
   * @returns {object} Calendar behavior analysis
   */
  async analyzeCalendarBehavior(userId) {
    try {
      const patterns = this.calendarPreferences.get(userId) || {};
      const behavior = this.userBehaviorCache.get(userId) || {};
      
      return {
        preferredTimeSlots: patterns.preferredTimeSlots || [],
        commonEventTypes: patterns.commonEventTypes || [],
        calendarUsageFrequency: patterns.usageFrequency || 'medium',
        preferenceEvolution: patterns.evolution || [],
        predictionAccuracy: patterns.accuracy || 0.5
      };
      
    } catch (error) {
      console.error('Calendar behavior analysis failed:', error);
      return this.getDefaultBehaviorAnalysis();
    }
  }

  /**
   * Predict optimal calendar actions for user
   * @param {string} userId - User identifier
   * @param {object} currentContext - Current context
   * @returns {object} Predicted optimal actions
   */
  async predictOptimalActions(userId, currentContext) {
    console.log(`🔮 Dynamic Intelligence: Predicting optimal actions for ${userId}`);
    
    try {
      const userPatterns = await this.getUserPatterns(userId);
      const predictions = await this.generateActionPredictions(userPatterns, currentContext);
      
      return {
        suggestedActions: predictions.actions,
        confidence: predictions.confidence,
        reasoning: predictions.reasoning,
        alternativeOptions: predictions.alternatives
      };
      
    } catch (error) {
      console.error('Action prediction failed:', error);
      return this.getDefaultActionPredictions();
    }
  }

  /**
   * Adapt system behavior based on user feedback
   * @param {string} userId - User identifier
   * @param {object} feedback - User feedback
   */
  async adaptFromFeedback(userId, feedback) {
    console.log(`📈 Dynamic Intelligence: Adapting from feedback for ${userId}`);
    
    try {
      // Update feedback patterns
      await this.updateFeedbackPatterns(userId, feedback);
      
      // Adjust response strategies
      await this.adjustResponseStrategies(userId, feedback);
      
      // Update prediction models
      await this.updatePredictionModels(userId, feedback);
      
      console.log(`✅ Dynamic Intelligence: Successfully adapted from feedback`);
      
    } catch (error) {
      console.error('Feedback adaptation failed:', error);
    }
  }

  // Private helper methods

  /**
   * Record interaction pattern in database
   */
  async recordInteractionPattern(userId, interaction) {
    try {
      await this.supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          interaction_type: interaction.type,
          intent: interaction.intent,
          entities: interaction.entities,
          response_time: interaction.responseTime,
          success: interaction.success,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record interaction pattern:', error);
    }
  }

  /**
   * Update in-memory behavior cache
   */
  updateBehaviorCache(userId, interaction) {
    if (!this.userBehaviorCache.has(userId)) {
      this.userBehaviorCache.set(userId, {
        interactions: [],
        preferences: {},
        patterns: {},
        lastUpdated: new Date()
      });
    }
    
    const cache = this.userBehaviorCache.get(userId);
    cache.interactions.push(interaction);
    
    // Keep only recent interactions (last 100)
    if (cache.interactions.length > 100) {
      cache.interactions = cache.interactions.slice(-100);
    }
    
    cache.lastUpdated = new Date();
    this.userBehaviorCache.set(userId, cache);
  }

  /**
   * Select optimal response style based on user patterns
   */
  selectOptimalResponseStyle(userPatterns) {
    if (!userPatterns || !userPatterns.preferences) {
      return 'concise'; // Default style
    }
    
    const preferences = userPatterns.preferences;
    
    // Analyze preference indicators
    const responseStyles = {
      'detailed': preferences.responseLength === 'long' || preferences.detailLevel === 'high',
      'concise': preferences.responseLength === 'short' || preferences.detailLevel === 'low',
      'conversational': preferences.tone === 'casual' || preferences.formality === 'low',
      'professional': preferences.tone === 'formal' || preferences.formality === 'high'
    };
    
    // Return most matching style
    for (const [style, matches] of Object.entries(responseStyles)) {
      if (matches) return style;
    }
    
    return 'balanced'; // Fallback
  }

  /**
   * Extract timing preferences from patterns
   */
  extractTimingPreferences(userPatterns) {
    if (!userPatterns || !userPatterns.interactions) {
      return {
        responseDelay: 'normal',
        pacing: 'standard',
        urgencyHandling: 'default'
      };
    }
    
    const interactions = userPatterns.interactions;
    const timingData = interactions.map(i => i.timing || {}).filter(Boolean);
    
    // Analyze timing patterns
    const avgResponseTime = timingData.reduce((sum, t) => sum + (t.responseTime || 0), 0) / timingData.length;
    const urgencyFrequency = timingData.filter(t => t.urgency === 'high').length;
    
    return {
      responseDelay: avgResponseTime > 5000 ? 'slow' : avgResponseTime < 1000 ? 'fast' : 'normal',
      pacing: urgencyFrequency > 0.3 ? 'urgent' : 'standard',
      urgencyHandling: urgencyFrequency > 0.5 ? 'immediate' : 'default'
    };
  }

  /**
   * Get default intelligent response
   */
  getDefaultIntelligentResponse() {
    return {
      responseStyle: 'balanced',
      timingPreferences: {
        responseDelay: 'normal',
        pacing: 'standard',
        urgencyHandling: 'default'
      },
      calendarPreferences: {},
      adaptationSuggestions: [],
      confidence: 0.5
    };
  }

  /**
   * Select error handling style based on user patterns
   */
  selectErrorHandlingStyle(userPatterns, error) {
    if (!userPatterns || !userPatterns.preferences) {
      return 'informative'; // Default error style
    }
    
    const preferences = userPatterns.preferences;
    
    // Determine error handling preference
    if (preferences.errorDetail === 'high') return 'detailed';
    if (preferences.errorDetail === 'low') return 'brief';
    if (preferences.formality === 'high') return 'formal';
    if (preferences.formality === 'low') return 'casual';
    
    return 'balanced';
  }

  /**
   * Craft intelligent error message
   */
  craftIntelligentErrorMessage(error, handlingStyle) {
    const errorMessages = {
      'detailed': `I encountered an issue: ${error.message}. Let me help you resolve this.`,
      'brief': `Having trouble: ${error.message}. How can I help?`,
      'formal': `An error has occurred: ${error.message}. I will assist in resolving this matter.`,
      'casual': `Oops! ${error.message}. Let's fix this together!`,
      'balanced': `I encountered an issue: ${error.message}. I'm here to help resolve it.`
    };
    
    return errorMessages[handlingStyle] || errorMessages['balanced'];
  }

  /**
   * Get default error response
   */
  getDefaultErrorResponse(error) {
    return {
      messageToUser: `I encountered an issue: ${error.message}. I'm here to help.`,
      fallbackOptions: ['Try again', 'Contact support', 'Check calendar permissions'],
      nextSteps: ['Retry the operation', 'Verify your calendar access'],
      recoverySuggestions: ['Ensure calendar permissions are granted', 'Check internet connection']
    };
  }

  /**
   * Generate action predictions
   */
  async generateActionPredictions(userPatterns, currentContext) {
    // Simple prediction based on patterns
    const commonActions = ['create_event', 'list_events', 'update_event'];
    const predictions = [];
    
    // Analyze patterns for predictions
    const recentActions = userPatterns?.interactions?.slice(-10) || [];
    const actionFrequency = {};
    
    recentActions.forEach(interaction => {
      const action = interaction.intent;
      actionFrequency[action] = (actionFrequency[action] || 0) + 1;
    });
    
    // Most frequent action
    const mostFrequent = Object.entries(actionFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostFrequent) {
      predictions.push({
        action: mostFrequent[0],
        confidence: mostFrequent[1] / recentActions.length,
        reasoning: `Based on your recent activity, you frequently use ${mostFrequent[0]}`
      });
    }
    
    return {
      actions: predictions,
      confidence: predictions.length > 0 ? predictions[0].confidence : 0.3,
      reasoning: 'Pattern-based prediction',
      alternatives: commonActions.filter(a => !predictions.find(p => p.action === a))
    };
  }

  /**
   * Get default action predictions
   */
  getDefaultActionPredictions() {
    return {
      suggestedActions: [
        { action: 'create_event', confidence: 0.3, reasoning: 'Common action' },
        { action: 'list_events', confidence: 0.3, reasoning: 'Common action' }
      ],
      confidence: 0.3,
      reasoning: 'Default predictions',
      alternativeOptions: ['create_event', 'list_events', 'update_event']
    };
  }

  /**
   * Get user patterns from cache
   */
  async getUserPatterns(userId) {
    const cache = this.userBehaviorCache.get(userId);
    
    if (!cache) {
      return {
        interactions: [],
        preferences: {},
        patterns: {}
      };
    }
    
    return cache;
  }

  /**
   * Analyze response adaptations
   */
  async analyzeResponseAdaptations(userId, intent, entities) {
    // Analyze what adaptations might be needed
    const adaptations = {
      suggestions: [],
      confidence: 0.5
    };
    
    // Add context-specific suggestions
    if (intent === 'create_event') {
      adaptations.suggestions.push('Consider adding location information');
      adaptations.confidence += 0.1;
    }
    
    if (intent === 'update_event') {
      adaptations.suggestions.push('Verify time conflicts');
      adaptations.confidence += 0.1;
    }
    
    return adaptations;
  }

  /**
   * Get calendar context
   */
  async getCalendarContext(userId) {
    const patterns = this.calendarPreferences.get(userId) || {};
    
    return {
      preferredCalendars: patterns.preferredCalendars || ['primary'],
      commonLocations: patterns.commonLocations || [],
      typicalDurations: patterns.typicalDurations || [],
      busyTimes: patterns.busyTimes || []
    };
  }

  /**
   * Get default behavior analysis
   */
  getDefaultBehaviorAnalysis() {
    return {
      preferredTimeSlots: [],
      commonEventTypes: [],
      calendarUsageFrequency: 'medium',
      preferenceEvolution: [],
      predictionAccuracy: 0.5
    };
  }

  /**
   * Update feedback patterns
   */
  async updateFeedbackPatterns(userId, feedback) {
    // Store feedback for learning
    if (!this.adaptationHistory.has(userId)) {
      this.adaptationHistory.set(userId, []);
    }
    
    const history = this.adaptationHistory.get(userId);
    history.push({
      feedback: feedback,
      timestamp: new Date(),
      changes: this.extractFeedbackChanges(feedback)
    });
    
    // Keep only recent feedback
    if (history.length > 50) {
      this.adaptationHistory.set(userId, history.slice(-50));
    }
  }

  /**
   * Extract feedback changes
   */
  extractFeedbackChanges(feedback) {
    const changes = [];
    
    if (feedback.rating) {
      changes.push({ type: 'rating', value: feedback.rating });
    }
    
    if (feedback.suggestions) {
      changes.push({ type: 'suggestions', value: feedback.suggestions });
    }
    
    if (feedback.preferences) {
      changes.push({ type: 'preferences', value: feedback.preferences });
    }
    
    return changes;
  }

  /**
   * Adjust response strategies
   */
  async adjustResponseStrategies(userId, feedback) {
    const patterns = this.userBehaviorCache.get(userId);
    if (patterns && feedback.preferences) {
      patterns.preferences = { ...patterns.preferences, ...feedback.preferences };
      this.userBehaviorCache.set(userId, patterns);
    }
  }

  /**
   * Update prediction models
   */
  async updatePredictionModels(userId, feedback) {
    // Update prediction accuracy based on feedback
    const patterns = this.calendarPreferences.get(userId);
    if (patterns && feedback.accuracy) {
      patterns.accuracy = (patterns.accuracy + feedback.accuracy) / 2;
    }
  }

  /**
   * Generate fallback strategies
   */
  async generateFallbackStrategies(userId, error, context) {
    const strategies = [];
    
    if (error.message.includes('permission')) {
      strategies.push({
        strategy: 'Check calendar permissions',
        action: 'request_calendar_access',
        priority: 'high'
      });
    }
    
    if (error.message.includes('network')) {
      strategies.push({
        strategy: 'Retry with network validation',
        action: 'retry_with_validation',
        priority: 'medium'
      });
    }
    
    strategies.push({
      strategy: 'Try alternative approach',
      action: 'use_alternative_method',
      priority: 'low'
    });
    
    return strategies;
  }

  /**
   * Suggest next steps
   */
  suggestNextSteps(userId, error, context) {
    const steps = [];
    
    if (error.message.includes('calendar')) {
      steps.push('Verify calendar connection');
      steps.push('Check calendar permissions');
    }
    
    if (error.message.includes('time')) {
      steps.push('Review event timing');
      steps.push('Check for conflicts');
    }
    
    steps.push('Try the operation again');
    
    return steps;
  }

  /**
   * Generate recovery suggestions
   */
  generateRecoverySuggestions(userId, error) {
    const suggestions = [];
    
    if (error.message.includes('permission')) {
      suggestions.push('Please ensure calendar permissions are granted');
      suggestions.push('Try re-authenticating with Google Calendar');
    }
    
    if (error.message.includes('network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again in a few moments');
    }
    
    suggestions.push('Contact support if the issue persists');
    
    return suggestions;
  }

  /**
   * Adapt response style based on user preferences
   */
  async adaptResponseStyle(userId, interaction) {
    // Update response pattern cache
    if (!this.responsePatterns.has(userId)) {
      this.responsePatterns.set(userId, {
        styles: [],
        preferences: {},
        adaptations: []
      });
    }
    
    const patterns = this.responsePatterns.get(userId);
    
    // Learn from interaction feedback
    if (interaction.feedback) {
      patterns.adaptations.push({
        timestamp: new Date(),
        feedback: interaction.feedback,
        style_change: this.inferStyleChange(interaction.feedback)
      });
    }
  }

  /**
   * Infer style change from feedback
   */
  inferStyleChange(feedback) {
    const changes = [];
    
    if (feedback.length === 'short') {
      changes.push('prefer_concise_responses');
    }
    
    if (feedback.length === 'long') {
      changes.push('prefer_detailed_responses');
    }
    
    if (feedback.tone === 'casual') {
      changes.push('prefer_casual_tone');
    }
    
    if (feedback.tone === 'formal') {
      changes.push('prefer_formal_tone');
    }
    
    return changes;
  }

  /**
   * Update calendar usage patterns
   */
  async updateCalendarPatterns(userId, interaction) {
    if (!this.calendarPreferences.has(userId)) {
      this.calendarPreferences.set(userId, {
        preferredTimeSlots: [],
        commonEventTypes: [],
        usageFrequency: 'medium',
        evolution: [],
        accuracy: 0.5
      });
    }
    
    const patterns = this.calendarPreferences.get(userId);
    
    // Update based on interaction
    if (interaction.intent === 'create_event' && interaction.entities) {
      const { start_time, end_time, event_title } = interaction.entities;
      
      if (start_time) {
        patterns.preferredTimeSlots.push(start_time);
        // Keep only recent times
        patterns.preferredTimeSlots = patterns.preferredTimeSlots.slice(-20);
      }
      
      if (event_title) {
        patterns.commonEventTypes.push(event_title);
        patterns.commonEventTypes = patterns.commonEventTypes.slice(-20);
      }
    }
    
    // Record evolution
    patterns.evolution.push({
      timestamp: new Date(),
      interaction_type: interaction.intent,
      changes: this.detectPatternChanges(patterns)
    });
    
    this.calendarPreferences.set(userId, patterns);
  }

  /**
   * Detect pattern changes
   */
  detectPatternChanges(patterns) {
    const changes = [];
    
    // Detect time preference changes
    if (patterns.preferredTimeSlots.length > 5) {
      const recentTimes = patterns.preferredTimeSlots.slice(-5);
      const earlierTimes = patterns.preferredTimeSlots.slice(-10, -5);
      
      if (JSON.stringify(recentTimes) !== JSON.stringify(earlierTimes)) {
        changes.push('time_preferences_evolving');
      }
    }
    
    return changes;
  }
}

module.exports = DynamicIntelligenceEngine;