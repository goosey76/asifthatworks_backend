// User Knowledge Base System for Murphy Agent
// Tracks user preferences, recent task activity, and provides contextual responses

class UserKnowledgeBase {
  constructor() {
    this.userProfiles = new Map(); // userId -> profile data
    this.taskPatterns = new Map(); // userId -> task usage patterns
    this.conversationMemory = new Map(); // userId -> recent conversation topics
  }

  /**
   * Get or create user profile
   * @param {string} userId - User identifier
   * @returns {object} User profile with preferences and patterns
   */
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        preferences: {
          communicationStyle: 'friendly', // friendly, formal, casual, enthusiastic
          taskComplexity: 'medium', // simple, medium, complex
          reminderFrequency: 'normal', // low, normal, high
          completionStyle: 'brief', // brief, detailed, encouraging
          timeAwareness: 'high' // low, medium, high
        },
        stats: {
          totalTasksCreated: 0,
          totalTasksCompleted: 0,
          favoriteTaskTypes: [],
          mostActiveHours: [],
          averageTasksPerDay: 0,
          completionRate: 0
        },
        recentActivity: {
          lastTaskCreated: null,
          lastTaskCompleted: null,
          recentTaskTypes: [],
          currentProjects: [],
          pendingDeadlines: []
        },
        learningData: {
          taskKeywords: new Map(), // keyword -> frequency
          responsePreferences: new Map(), // response type -> usage count
          interactionPatterns: []
        }
      });
    }
    return this.userProfiles.get(userId);
  }

  /**
   * Update user profile with new task activity
   * @param {string} userId - User identifier
   * @param {object} taskData - Information about the task activity
   */
  updateTaskActivity(userId, taskData) {
    const profile = this.getUserProfile(userId);
    const { type, taskDescription, completed, dueDate } = taskData;

    // Update stats
    if (type === 'create') {
      profile.stats.totalTasksCreated++;
      profile.recentActivity.lastTaskCreated = {
        description: taskDescription,
        timestamp: new Date().toISOString(),
        dueDate: dueDate
      };
      
      // Extract keywords from task description
      this.extractAndStoreKeywords(profile, taskDescription);
      
      // Update task type patterns
      this.updateTaskTypePatterns(profile, taskDescription);
    } else if (type === 'complete') {
      profile.stats.totalTasksCompleted++;
      profile.recentActivity.lastTaskCompleted = {
        description: taskDescription,
        timestamp: new Date().toISOString()
      };
    }

    // Calculate completion rate
    if (profile.stats.totalTasksCreated > 0) {
      profile.stats.completionRate = 
        (profile.stats.totalTasksCompleted / profile.stats.totalTasksCreated) * 100;
    }

    // Update most active hours
    this.updateActiveHours(profile, new Date());
  }

  /**
   * Extract keywords from task description and store frequency
   */
  extractAndStoreKeywords(profile, taskDescription) {
    const words = taskDescription.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    words.forEach(word => {
      const currentCount = profile.learningData.taskKeywords.get(word) || 0;
      profile.learningData.taskKeywords.set(word, currentCount + 1);
    });
  }

  /**
   * Update task type patterns based on description
   */
  updateTaskTypePatterns(profile, taskDescription) {
    const taskTypes = {
      'work': ['meeting', 'project', 'deadline', 'presentation', 'report', 'email'],
      'personal': ['call', 'visit', 'shopping', 'appointment', 'family', 'friend'],
      'health': ['doctor', 'gym', 'exercise', 'medication', 'appointment'],
      'home': ['clean', 'repair', 'organize', 'shopping', 'maintenance'],
      'learning': ['study', 'read', 'course', 'practice', 'research']
    };

    const lowerDescription = taskDescription.toLowerCase();
    let detectedTypes = [];

    Object.entries(taskTypes).forEach(([type, keywords]) => {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        detectedTypes.push(type);
      }
    });

    // Store recent task types
    profile.recentActivity.recentTaskTypes.push(...detectedTypes);
    profile.recentActivity.recentTaskTypes = 
      profile.recentActivity.recentTaskTypes.slice(-10); // Keep last 10

    // Update favorite types
    detectedTypes.forEach(type => {
      const currentCount = profile.stats.favoriteTaskTypes.find(t => t.type === type)?.count || 0;
      const existingIndex = profile.stats.favoriteTaskTypes.findIndex(t => t.type === type);
      
      if (existingIndex >= 0) {
        profile.stats.favoriteTaskTypes[existingIndex].count = currentCount + 1;
      } else {
        profile.stats.favoriteTaskTypes.push({ type, count: 1 });
      }
    });

    // Sort by frequency
    profile.stats.favoriteTaskTypes.sort((a, b) => b.count - a.count);
  }

  /**
   * Update user's most active hours based on current time
   */
  updateActiveHours(profile, currentTime) {
    const hour = currentTime.getHours();
    const existingIndex = profile.stats.mostActiveHours.find(h => h.hour === hour);
    
    if (existingIndex >= 0) {
      existingIndex.count++;
    } else {
      profile.stats.mostActiveHours.push({ hour, count: 1 });
    }

    // Keep only top 5 most active hours
    profile.stats.mostActiveHours.sort((a, b) => b.count - a.count);
    profile.stats.mostActiveHours = profile.stats.mostActiveHours.slice(0, 5);
  }

  /**
   * Get contextual response suggestions based on user profile
   * @param {string} userId - User identifier
   * @param {string} contextType - Type of context (greeting, task_review, etc.)
   * @returns {object} Contextual suggestions and preferences
   */
  getContextualResponse(userId, contextType) {
    const profile = this.getUserProfile(userId);
    const now = new Date();
    const currentHour = now.getHours();

    switch (contextType) {
      case 'greeting':
        return this.getGreetingContext(profile, currentHour);
      
      case 'task_review':
        return this.getTaskReviewContext(profile);
      
      case 'completion_celebration':
        return this.getCompletionContext(profile);
      
      case 'productivity_encouragement':
        return this.getProductivityContext(profile);
      
      case 'task_suggestion':
        return this.getTaskSuggestionContext(profile);
      
      default:
        return { style: 'friendly', intensity: 'medium' };
    }
  }

  /**
   * Get contextual greeting based on user profile and time
   */
  getGreetingContext(profile, currentHour) {
    const timeOfDay = this.getTimeOfDay(currentHour);
    const completionRate = profile.stats.completionRate;
    
    let style = 'friendly';
    let energy = 'medium';
    let focusArea = 'productivity';

    // Adjust style based on completion rate
    if (completionRate > 80) {
      style = 'celebratory';
      energy = 'high';
    } else if (completionRate < 50) {
      style = 'encouraging';
      energy = 'gentle';
    }

    // Determine focus area based on recent activity
    const recentTypes = profile.recentActivity.recentTaskTypes;
    if (recentTypes.length > 0) {
      const mostRecentType = recentTypes[recentTypes.length - 1];
      focusArea = mostRecentType;
    }

    return {
      style,
      energy,
      timeOfDay,
      focusArea,
      completionRate,
      personalizedTouch: this.getPersonalizedTouch(profile)
    };
  }

  /**
   * Get context for task review responses
   */
  getTaskReviewContext(profile) {
    const stats = profile.stats;
    const recentActivity = profile.recentActivity;
    
    return {
      shouldCelebrateProgress: stats.completionRate > 70,
      shouldProvideEncouragement: stats.completionRate < 50,
      recentTaskTypes: recentActivity.recentTaskTypes.slice(-3),
      productivityLevel: this.calculateProductivityLevel(stats),
      nextFocus: this.getNextFocusArea(profile)
    };
  }

  /**
   * Get completion celebration context
   */
  getCompletionContext(profile) {
    const stats = profile.stats;
    
    return {
      celebrationStyle: stats.completionRate > 80 ? 'enthusiastic' : 'warm',
      progressIndicator: this.getProgressIndicator(stats.completionRate),
      momentumMessage: this.getMomentumMessage(stats),
      nextSuggestion: this.getNextTaskSuggestion(profile)
    };
  }

  /**
   * Calculate user's productivity level
   */
  calculateProductivityLevel(stats) {
    const completionRate = stats.completionRate;
    const totalTasks = stats.totalTasksCreated;
    
    if (completionRate > 80 && totalTasks > 10) return 'high';
    if (completionRate > 60 && totalTasks > 5) return 'medium';
    if (completionRate > 40) return 'building';
    return 'starting';
  }

  /**
   * Get next focus area based on user patterns
   */
  getNextFocusArea(profile) {
    const favoriteTypes = profile.stats.favoriteTaskTypes;
    if (favoriteTypes.length > 0) {
      return favoriteTypes[0].type;
    }
    return 'productivity';
  }

  /**
   * Get personalized touch based on user data
   */
  getPersonalizedTouch(profile) {
    const touches = [];
    
    if (profile.stats.totalTasksCompleted > 50) {
      touches.push('veteran');
    } else if (profile.stats.totalTasksCompleted > 20) {
      touches.push('experienced');
    } else if (profile.stats.totalTasksCompleted > 5) {
      touches.push('growing');
    } else {
      touches.push('new');
    }

    if (profile.stats.completionRate > 80) {
      touches.push('high-achiever');
    } else if (profile.stats.completionRate < 50) {
      touches.push('needs-support');
    }

    return touches;
  }

  /**
   * Get time of day description
   */
  getTimeOfDay(hour) {
    if (hour < 6) return 'late-night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get progress indicator based on completion rate
   */
  getProgressIndicator(completionRate) {
    if (completionRate >= 90) return 'excellent';
    if (completionRate >= 75) return 'great';
    if (completionRate >= 60) return 'good';
    if (completionRate >= 40) return 'improving';
    return 'getting-started';
  }

  /**
   * Get momentum message based on stats
   */
  getMomentumMessage(stats) {
    if (stats.completionRate >= 80) {
      return 'You\'re on fire! Your productivity is impressive.';
    } else if (stats.completionRate >= 60) {
      return 'Great momentum! You\'re building solid habits.';
    } else if (stats.completionRate >= 40) {
      return 'Nice progress! Every completed task is a step forward.';
    } else {
      return 'Starting strong! Every expert was once a beginner.';
    }
  }

  /**
   * Get next task suggestion based on patterns
   */
  getNextTaskSuggestion(profile) {
    const favoriteTypes = profile.stats.favoriteTaskTypes;
    if (favoriteTypes.length > 0) {
      return `Ready for your next ${favoriteTypes[0].type} challenge?`;
    }
    return 'Ready to tackle your next priority?';
  }

  /**
   * Record interaction pattern for learning
   * @param {string} userId - User identifier
   * @param {string} interactionType - Type of interaction
   * @param {object} details - Interaction details
   */
  recordInteraction(userId, interactionType, details) {
    const profile = this.getUserProfile(userId);
    
    profile.learningData.interactionPatterns.push({
      type: interactionType,
      details,
      timestamp: new Date().toISOString()
    });

    // Keep only recent patterns (last 50)
    profile.learningData.interactionPatterns = 
      profile.learningData.interactionPatterns.slice(-50);
  }

  /**
   * Get user's rotating knowledge summary
   * @param {string} userId - User identifier
   * @returns {object} Rotating knowledge summary
   */
  getUserKnowledgeSummary(userId) {
    const profile = this.getUserProfile(userId);
    
    return {
      productivitySnapshot: {
        completionRate: profile.stats.completionRate,
        totalTasks: profile.stats.totalTasksCreated,
        currentStreak: this.calculateStreak(profile),
        favoriteCategory: profile.stats.favoriteTaskTypes[0]?.type || 'general'
      },
      recentPatterns: {
        mostActiveHours: profile.stats.mostActiveHours.slice(0, 3),
        recentTaskTypes: profile.recentActivity.recentTaskTypes.slice(-5),
        lastActivity: profile.recentActivity.lastTaskCreated?.timestamp
      },
      personalizedInsights: {
        communicationStyle: profile.preferences.communicationStyle,
        taskComplexity: profile.preferences.taskComplexity,
        optimalInteractionTime: this.getOptimalInteractionTime(profile),
        motivationalTriggers: this.getMotivationalTriggers(profile)
      }
    };
  }

  /**
   * Calculate current productivity streak
   */
  calculateStreak(profile) {
    // Simplified streak calculation - can be enhanced with actual date tracking
    if (profile.stats.completionRate > 70 && profile.stats.totalTasksCompleted > 5) {
      return Math.min(profile.stats.totalTasksCompleted / 5, 30); // Max 30 days
    }
    return 0;
  }

  /**
   * Get optimal interaction time for user
   */
  getOptimalInteractionTime(profile) {
    const activeHours = profile.stats.mostActiveHours;
    if (activeHours.length > 0) {
      return activeHours[0].hour; // Most active hour
    }
    return 14; // Default to 2 PM
  }

  /**
   * Get motivational triggers based on user data
   */
  getMotivationalTriggers(profile) {
    const triggers = [];
    
    if (profile.stats.completionRate < 50) {
      triggers.push('progress-focused');
    } else if (profile.stats.completionRate > 80) {
      triggers.push('achievement-focused');
    }
    
    if (profile.stats.totalTasksCreated > 20) {
      triggers.push('experience-based');
    } else {
      triggers.push('encouragement-focused');
    }

    return triggers;
  }
}

module.exports = UserKnowledgeBase;