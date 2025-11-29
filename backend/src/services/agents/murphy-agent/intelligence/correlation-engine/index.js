// Real-time Event-to-Task Correlation Engine
// Handles real-time correlation between calendar events and tasks with confidence scoring

const EventEmitter = require('events');

class CorrelationEngine extends EventEmitter {
  constructor() {
    super();
    this.correlationCache = new Map(); // userId -> cached correlation data
    this.lastUpdateTimestamps = new Map(); // userId -> last update time
    this.confidenceThresholds = {
      low: 0.3,
      medium: 0.6,
      high: 0.8
    };
    this.correlationAlgorithms = new Map();
    this.initializeAlgorithms();
  }

  /**
   * Initialize correlation algorithms
   */
  initializeAlgorithms() {
    this.correlationAlgorithms.set('keyword', this.calculateKeywordCorrelation.bind(this));
    this.correlationAlgorithms.set('timeline', this.calculateTimelineCorrelation.bind(this));
    this.correlationAlgorithms.set('contextual', this.calculateContextualCorrelation.bind(this));
    this.correlationAlgorithms.set('behavioral', this.calculateBehavioralCorrelation.bind(this));
  }

  /**
   * Handle real-time calendar event updates
   */
  handleCalendarEventUpdate(userId, event) {
    this.emit('eventUpdated', { userId, event, type: 'calendar' });
    this.updateCorrelations(userId, 'calendar', event);
  }

  /**
   * Handle real-time task updates
   */
  handleTaskUpdate(userId, task) {
    this.emit('taskUpdated', { userId, task, type: 'task' });
    this.updateCorrelations(userId, 'task', task);
  }

  /**
   * Update correlations after real-time data changes
   */
  updateCorrelations(userId, source, data) {
    try {
      const currentTime = new Date().toISOString();
      this.lastUpdateTimestamps.set(userId, currentTime);

      // Get cached correlations or initialize
      let cached = this.correlationCache.get(userId) || {
        correlations: new Map(),
        confidenceScores: new Map(),
        lastUpdate: null
      };

      // Update correlations based on the new data
      const updatedCorrelations = this.recalculateCorrelations(userId, source, data, cached);
      
      // Store updated correlations
      this.correlationCache.set(userId, {
        ...cached,
        correlations: updatedCorrelations,
        lastUpdate: currentTime
      });

      // Emit correlation updated event
      this.emit('correlationsUpdated', { 
        userId, 
        correlations: updatedCorrelations,
        source,
        confidence: this.calculateOverallConfidence(updatedCorrelations)
      });

    } catch (error) {
      console.error('Correlation update error:', error);
    }
  }

  /**
   * Recalculate correlations after data changes
   */
  recalculateCorrelations(userId, source, data, cached) {
    const correlations = new Map(cached.correlations);
    
    if (source === 'calendar') {
      this.updateCalendarCorrelations(data, correlations);
    } else if (source === 'task') {
      this.updateTaskCorrelations(data, correlations);
    }

    return correlations;
  }

  /**
   * Update calendar-based correlations
   */
  updateCalendarCorrelations(event, correlations) {
    // Find related tasks and update correlation scores
    const relatedTasks = this.findRelatedTasks(event);
    relatedTasks.forEach(task => {
      const correlationId = `${event.id}-${task.id}`;
      const score = this.calculateEnhancedCorrelationScore(event, task);
      
      correlations.set(correlationId, {
        event,
        task,
        score,
        algorithm: this.selectBestAlgorithm(event, task),
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Update task-based correlations
   */
  updateTaskCorrelations(task, correlations) {
    // Find related events and update correlation scores
    const relatedEvents = this.findRelatedEvents(task);
    relatedEvents.forEach(event => {
      const correlationId = `${event.id}-${task.id}`;
      const score = this.calculateEnhancedCorrelationScore(event, task);
      
      correlations.set(correlationId, {
        event,
        task,
        score,
        algorithm: this.selectBestAlgorithm(event, task),
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Enhanced correlation scoring with multiple algorithms
   */
  calculateEnhancedCorrelationScore(event, task) {
    let totalScore = 0;
    let algorithmCount = 0;

    // Apply all correlation algorithms
    for (const [name, algorithm] of this.correlationAlgorithms) {
      const score = algorithm(event, task);
      if (score !== null) {
        totalScore += score;
        algorithmCount++;
      }
    }

    // Return average if we have multiple algorithms
    return algorithmCount > 0 ? totalScore / algorithmCount : 0;
  }

  /**
   * Keyword-based correlation calculation
   */
  calculateKeywordCorrelation(event, task) {
    const eventText = `${event.summary || ''} ${event.description || ''} ${event.location || ''}`.toLowerCase();
    const taskText = `${task.title || ''} ${task.notes || ''}`.toLowerCase();
    
    const eventWords = new Set(eventText.split(/\s+/).filter(word => word.length > 2));
    const taskWords = new Set(taskText.split(/\s+/).filter(word => word.length > 2));
    
    const intersection = new Set([...eventWords].filter(word => taskWords.has(word)));
    const union = new Set([...eventWords, ...taskWords]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Timeline-based correlation calculation
   */
  calculateTimelineCorrelation(event, task) {
    const eventDate = new Date(event.start?.dateTime || event.start?.date);
    const taskDueDate = new Date(task.due || task.updated);
    
    // Calculate days between event and task
    const daysDiff = Math.abs(eventDate - taskDueDate) / (1000 * 60 * 60 * 24);
    
    // Score higher for tasks due close to event date
    if (daysDiff <= 1) return 1.0;
    if (daysDiff <= 3) return 0.8;
    if (daysDiff <= 7) return 0.6;
    if (daysDiff <= 14) return 0.4;
    return 0.2;
  }

  /**
   * Contextual correlation calculation
   */
  calculateContextualCorrelation(event, task) {
    let score = 0;
    
    // Check for explicit task references in event
    const eventText = `${event.summary || ''} ${event.description || ''}`.toLowerCase();
    const taskTitle = task.title?.toLowerCase() || '';
    
    if (eventText.includes(taskTitle.substring(0, 10))) {
      score += 0.4;
    }
    
    // Check for meeting-related tasks
    if (event.summary?.toLowerCase().includes('meeting') && task.title?.toLowerCase().includes('follow')) {
      score += 0.3;
    }
    
    // Check for deadline-related correlations
    if (task.due && event.start) {
      const taskDue = new Date(task.due);
      const eventDate = new Date(event.start.dateTime || event.start.date);
      
      if (taskDue.toDateString() === eventDate.toDateString()) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Behavioral correlation calculation
   */
  calculateBehavioralCorrelation(event, task) {
    // This would use historical patterns of user behavior
    // For now, return a neutral score
    return 0.5;
  }

  /**
   * Select the best correlation algorithm for given event/task pair
   */
  selectBestAlgorithm(event, task) {
    const scores = {};
    for (const [name, algorithm] of this.correlationAlgorithms) {
      scores[name] = algorithm(event, task);
    }
    
    // Return the algorithm with highest score
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  /**
   * Find tasks related to an event
   */
  findRelatedTasks(event) {
    // This would integrate with Murphy's task database
    // For now, return empty array
    return [];
  }

  /**
   * Find events related to a task
   */
  findRelatedEvents(task) {
    // This would integrate with Grim's calendar database
    // For now, return empty array
    return [];
  }

  /**
   * Calculate overall confidence score for user correlations
   */
  calculateOverallConfidence(correlations) {
    if (correlations.size === 0) return 0;
    
    let totalScore = 0;
    let validScores = 0;
    
    for (const correlation of correlations.values()) {
      if (correlation.score !== undefined) {
        totalScore += correlation.score;
        validScores++;
      }
    }
    
    return validScores > 0 ? totalScore / validScores : 0;
  }

  /**
   * Get correlation confidence level
   */
  getConfidenceLevel(score) {
    if (score >= this.confidenceThresholds.high) return 'high';
    if (score >= this.confidenceThresholds.medium) return 'medium';
    if (score >= this.confidenceThresholds.low) return 'low';
    return 'very-low';
  }

  /**
   * Get real-time correlations for a user
   */
  getRealTimeCorrelations(userId) {
    const cached = this.correlationCache.get(userId);
    if (!cached) return { correlations: new Map(), confidence: 0 };
    
    return {
      correlations: cached.correlations,
      confidence: this.calculateOverallConfidence(cached.correlations),
      confidenceLevel: this.getConfidenceLevel(this.calculateOverallConfidence(cached.correlations)),
      lastUpdate: cached.lastUpdate
    };
  }

  /**
   * Setup webhook endpoints for real-time updates
   */
  setupWebhooks(userId, endpoints) {
    this.webhookEndpoints.set(userId, endpoints);
  }

  /**
   * Cleanup old correlation data
   */
  cleanupOldCorrelations(userId, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cached = this.correlationCache.get(userId);
    if (!cached) return;
    
    const now = Date.now();
    const correlations = new Map();
    
    for (const [id, correlation] of cached.correlations) {
      const correlationTime = new Date(correlation.timestamp).getTime();
      if (now - correlationTime < maxAge) {
        correlations.set(id, correlation);
      }
    }
    
    this.correlationCache.set(userId, {
      ...cached,
      correlations
    });
  }
}

module.exports = CorrelationEngine;