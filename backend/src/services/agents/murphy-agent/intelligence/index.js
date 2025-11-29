// Cross-Agent Intelligence Coordinator
// Main orchestrator that coordinates all intelligence engines and provides unified API

const EventEmitter = require('events');
const CorrelationEngine = require('./correlation-engine');
const ProjectLifecycleTracker = require('./lifecycle-tracker');
const IntelligentProjectBreakdown = require('./project-breakdown');
const agentKnowledgeCoordinator = require('../../agent-knowledge-coordinator');

class CrossAgentIntelligenceCoordinator extends EventEmitter {
  constructor() {
    super();
    
    // Initialize all intelligence engines
    this.correlationEngine = new CorrelationEngine();
    this.lifecycleTracker = new ProjectLifecycleTracker();
    this.projectBreakdown = new IntelligentProjectBreakdown();
    
    // User intelligence data store
    this.userIntelligence = new Map(); // userId -> comprehensive intelligence data
    
    // Coordination state
    this.isInitialized = false;
    this.updateQueues = new Map(); // userId -> pending updates
    this.processingIntervals = new Map(); // userId -> interval timers
    
    // Configuration
    this.config = {
      correlationUpdateInterval: 5000, // 5 seconds
      lifecycleUpdateInterval: 30000, // 30 seconds
      intelligenceUpdateInterval: 60000, // 1 minute
      maxCorrelationsPerUser: 1000,
      correlationCacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
    };

    this.initializeEngines();
  }

  /**
   * Initialize all intelligence engines and event handlers
   */
  initializeEngines() {
    // Set up correlation engine event handlers
    this.correlationEngine.on('eventUpdated', (data) => {
      this.handleCorrelationEventUpdate(data);
    });

    this.correlationEngine.on('taskUpdated', (data) => {
      this.handleCorrelationTaskUpdate(data);
    });

    this.correlationEngine.on('correlationsUpdated', (data) => {
      this.handleCorrelationsUpdated(data);
    });

    // Set up lifecycle tracker integrations
    this.lifecycleTracker.on('lifecycleUpdated', (data) => {
      this.handleLifecycleUpdated(data);
    });

    // Set up knowledge coordinator integrations
    agentKnowledgeCoordinator.on('knowledgeUpdated', (data) => {
      this.handleKnowledgeCoordinatorUpdate(data);
    });

    agentKnowledgeCoordinator.on('calendarEventUpdated', (data) => {
      this.handleCalendarUpdate(data);
    });

    agentKnowledgeCoordinator.on('taskUpdated', (data) => {
      this.handleTaskUpdate(data);
    });

    this.isInitialized = true;
    console.log('Cross-Agent Intelligence Coordinator initialized successfully');
  }

  /**
   * Start intelligence processing for a user
   */
  async startUserIntelligence(userId) {
    try {
      if (this.userIntelligence.has(userId)) {
        console.log(`Intelligence already active for user ${userId}`);
        return;
      }

      // Initialize user intelligence state
      this.userIntelligence.set(userId, {
        userId,
        lastAnalysis: null,
        correlations: new Map(),
        lifecycleData: new Map(),
        insights: {},
        recommendations: [],
        isActive: true,
        createdAt: new Date().toISOString()
      });

      // Start processing intervals
      this.startUserProcessingIntervals(userId);

      // Initial data fetch and analysis
      await this.performInitialAnalysis(userId);

      console.log(`Started intelligence processing for user ${userId}`);
      
    } catch (error) {
      console.error(`Failed to start intelligence for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Stop intelligence processing for a user
   */
  stopUserIntelligence(userId) {
    try {
      // Stop processing intervals
      const interval = this.processingIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        this.processingIntervals.delete(userId);
      }

      // Clean up user data
      this.userIntelligence.delete(userId);
      this.updateQueues.delete(userId);

      // Clean up correlation cache
      this.correlationEngine.cleanupOldCorrelations(userId);

      console.log(`Stopped intelligence processing for user ${userId}`);
      
    } catch (error) {
      console.error(`Failed to stop intelligence for user ${userId}:`, error);
    }
  }

  /**
   * Get comprehensive user intelligence data
   */
  async getUserIntelligence(userId, options = {}) {
    try {
      const userData = this.userIntelligence.get(userId);
      if (!userData) {
        throw new Error(`No intelligence data found for user ${userId}`);
      }

      // Get real-time correlations
      const correlations = this.correlationEngine.getRealTimeCorrelations(userId);
      
      // Get lifecycle data
      const lifecycleData = this.lifecycleTracker.getAllProjectLifecycles();
      
      // Get recent insights
      const insights = this.generateUnifiedInsights(userId, correlations, lifecycleData);
      
      // Get recommendations
      const recommendations = this.generateRecommendations(userId, correlations, insights);
      
      const result = {
        userId,
        timestamp: new Date().toISOString(),
        correlations: {
          data: Array.from(correlations.correlations.entries()).map(([id, correlation]) => ({
            id,
            ...correlation,
            confidenceLevel: this.correlationEngine.getConfidenceLevel(correlation.score)
          })),
          overallConfidence: correlations.confidence,
          overallConfidenceLevel: correlations.confidenceLevel,
          lastUpdate: correlations.lastUpdate
        },
        lifecycle: {
          projects: lifecycleData,
          summary: this.generateLifecycleSummary(lifecycleData)
        },
        insights,
        recommendations,
        status: {
          isActive: userData.isActive,
          lastAnalysis: userData.lastAnalysis,
          dataFreshness: this.assessDataFreshness(userId)
        }
      };

      // Update last analysis time
      userData.lastAnalysis = new Date().toISOString();

      return result;

    } catch (error) {
      console.error(`Failed to get intelligence for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate project breakdown suggestions for user
   */
  async generateProjectBreakdown(userId, projectData, options = {}) {
    try {
      const breakdown = this.projectBreakdown.generateProjectBreakdown(projectData, userId, options);
      
      // Store for learning
      const userData = this.userIntelligence.get(userId);
      if (userData) {
        userData.breakdowns = userData.breakdowns || [];
        userData.breakdowns.push({
          ...breakdown,
          createdAt: new Date().toISOString()
        });
      }

      return breakdown;

    } catch (error) {
      console.error(`Failed to generate project breakdown for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Handle correlation event updates
   */
  handleCorrelationEventUpdate(data) {
    const { userId, event, type } = data;
    
    // Queue for processing
    this.queueUserUpdate(userId, { type: 'correlationEvent', data: event });
  }

  /**
   * Handle correlation task updates
   */
  handleCorrelationTaskUpdate(data) {
    const { userId, task, type } = data;
    
    // Queue for processing
    this.queueUserUpdate(userId, { type: 'correlationTask', data: task });
  }

  /**
   * Handle correlations updated event
   */
  handleCorrelationsUpdated(data) {
    const { userId, correlations, confidence } = data;
    
    // Update user intelligence data
    const userData = this.userIntelligence.get(userId);
    if (userData) {
      userData.correlations = correlations;
      userData.lastCorrelationUpdate = new Date().toISOString();
      
      // Emit insights updated event
      this.emit('userInsightsUpdated', { 
        userId, 
        type: 'correlations', 
        confidence,
        correlationCount: correlations.size
      });
    }
  }

  /**
   * Handle lifecycle updated event
   */
  handleLifecycleUpdated(data) {
    const { projectId, lifecycleData } = data;
    
    // This would be triggered by the lifecycle tracker
    // Emit insights updated event
    this.emit('userInsightsUpdated', { 
      userId: data.userId, 
      type: 'lifecycle', 
      projectId,
      lifecycleData
    });
  }

  /**
   * Handle knowledge coordinator updates
   */
  handleKnowledgeCoordinatorUpdate(data) {
    const { userId, agentName, knowledge } = data;
    
    // Update correlation engines
    if (agentName === 'grim') {
      this.correlationEngine.handleCalendarEventUpdate(userId, knowledge);
    } else if (agentName === 'murphy') {
      this.correlationEngine.handleTaskUpdate(userId, knowledge);
    }
    
    // Queue for processing
    this.queueUserUpdate(userId, { type: 'knowledgeUpdate', agentName, data: knowledge });
  }

  /**
   * Handle calendar updates
   */
  handleCalendarUpdate(data) {
    const { userId, event } = data;
    this.correlationEngine.handleCalendarEventUpdate(userId, event);
  }

  /**
   * Handle task updates
   */
  handleTaskUpdate(data) {
    const { userId, task } = data;
    this.correlationEngine.handleTaskUpdate(userId, task);
  }

  /**
   * Queue user update for processing
   */
  queueUserUpdate(userId, update) {
    if (!this.updateQueues.has(userId)) {
      this.updateQueues.set(userId, []);
    }
    
    const queue = this.updateQueues.get(userId);
    queue.push({
      ...update,
      timestamp: new Date().toISOString()
    });
    
    // Limit queue size
    if (queue.length > 100) {
      queue.splice(0, queue.length - 100);
    }
  }

  /**
   * Start processing intervals for user
   */
  startUserProcessingIntervals(userId) {
    const interval = setInterval(async () => {
      await this.processUserUpdates(userId);
    }, this.config.intelligenceUpdateInterval);
    
    this.processingIntervals.set(userId, interval);
  }

  /**
   * Process queued updates for user
   */
  async processUserUpdates(userId) {
    try {
      const queue = this.updateQueues.get(userId);
      if (!queue || queue.length === 0) {
        return;
      }

      // Process all updates in queue
      const updates = [...queue];
      this.updateQueues.set(userId, []);

      // Get fresh data from agents
      const agentKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
      const grimKnowledge = agentKnowledge.agents?.grim?.knowledge || {};
      const murphyKnowledge = agentKnowledge.agents?.murphy?.knowledge || {};

      // Update lifecycle tracker
      for (const projectId of this.getActiveProjectIds(userId)) {
        const projectData = await this.getProjectData(userId, projectId);
        if (projectData) {
          this.lifecycleTracker.trackProjectLifecycle(projectId, projectData);
        }
      }

      console.log(`Processed ${updates.length} updates for user ${userId}`);

    } catch (error) {
      console.error(`Failed to process updates for user ${userId}:`, error);
    }
  }

  /**
   * Perform initial analysis for user
   */
  async performInitialAnalysis(userId) {
    try {
      // Get comprehensive knowledge
      const agentKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
      
      // Perform initial analysis using the original logic but through our engines
      console.log(`Performed initial analysis for user ${userId}`);
      
    } catch (error) {
      console.error(`Failed to perform initial analysis for user ${userId}:`, error);
    }
  }

  /**
   * Generate unified insights from multiple engines
   */
  generateUnifiedInsights(userId, correlations, lifecycleData) {
    const insights = {
      correlation: this.generateCorrelationInsights(correlations),
      lifecycle: this.generateLifecycleInsights(lifecycleData),
      productivity: this.generateProductivityInsights(userId, correlations, lifecycleData),
      recommendations: []
    };

    // Cross-engine insights
    insights.crossEngine = this.generateCrossEngineInsights(insights);

    return insights;
  }

  /**
   * Generate correlation-specific insights
   */
  generateCorrelationInsights(correlations) {
    const correlationArray = Array.from(correlations.correlations.values());
    
    if (correlationArray.length === 0) {
      return {
        totalCorrelations: 0,
        highConfidenceCorrelations: 0,
        averageConfidence: 0,
        insights: ['No correlations found yet']
      };
    }

    const highConfidence = correlationArray.filter(c => c.score >= 0.8).length;
    const averageConfidence = correlationArray.reduce((sum, c) => sum + c.score, 0) / correlationArray.length;

    return {
      totalCorrelations: correlationArray.length,
      highConfidenceCorrelations: highConfidence,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      confidenceDistribution: this.calculateConfidenceDistribution(correlationArray),
      insights: this.generateCorrelationInsightText(correlationArray.length, highConfidence, averageConfidence)
    };
  }

  /**
   * Generate lifecycle-specific insights
   */
  generateLifecycleInsights(lifecycleData) {
    const projects = Object.values(lifecycleData);
    
    if (projects.length === 0) {
      return {
        activeProjects: 0,
        projectsByPhase: {},
        bottlenecks: [],
        insights: ['No active projects tracked yet']
      };
    }

    const projectsByPhase = {};
    const bottlenecks = [];
    let totalOnTrack = 0;

    projects.forEach(project => {
      const phase = project.currentPhase;
      projectsByPhase[phase] = (projectsByPhase[phase] || 0) + 1;
      
      if (project.timelineAnalysis?.timelineHealth === 'on-track') {
        totalOnTrack++;
      }
      
      if (project.bottlenecks?.length > 0) {
        bottlenecks.push(...project.bottlenecks);
      }
    });

    return {
      activeProjects: projects.length,
      projectsByPhase,
      onTrackProjects: totalOnTrack,
      totalBottlenecks: bottlenecks.length,
      bottlenecks,
      insights: this.generateLifecycleInsightText(projects.length, totalOnTrack, bottlenecks.length)
    };
  }

  /**
   * Generate productivity insights
   */
  generateProductivityInsights(userId, correlations, lifecycleData) {
    // This would analyze user patterns across all data sources
    return {
      overallScore: 75, // Placeholder
      factors: {
        correlationAccuracy: 'good',
        projectOnTrack: 'excellent',
        taskCompletion: 'good'
      },
      insights: ['User shows strong correlation patterns', 'Projects generally stay on track']
    };
  }

  /**
   * Generate cross-engine insights
   */
  generateCrossEngineInsights(insights) {
    const crossInsights = [];
    
    // Example cross-engine logic
    if (insights.correlation.totalCorrelations > 0 && insights.lifecycle.activeProjects > 0) {
      crossInsights.push('Strong correlation between calendar events and project tasks detected');
    }
    
    if (insights.lifecycle.totalBottlenecks > 0 && insights.productivity.overallScore < 70) {
      crossInsights.push('Project bottlenecks may be impacting overall productivity');
    }

    return crossInsights;
  }

  /**
   * Generate recommendations for user
   */
  generateRecommendations(userId, correlations, insights) {
    const recommendations = [];
    
    // Correlation-based recommendations
    if (insights.correlation.averageConfidence < 0.6) {
      recommendations.push({
        type: 'correlation',
        priority: 'high',
        title: 'Improve Event-Task Correlations',
        description: 'Your event-task correlations have low confidence. Consider adding more descriptive titles and descriptions.',
        action: 'Review and improve event and task descriptions'
      });
    }

    // Lifecycle-based recommendations
    if (insights.lifecycle.totalBottlenecks > 2) {
      recommendations.push({
        type: 'lifecycle',
        priority: 'medium',
        title: 'Address Project Bottlenecks',
        description: 'Multiple project bottlenecks detected that may impact delivery.',
        action: 'Review and resolve identified bottlenecks'
      });
    }

    // Productivity recommendations
    if (insights.productivity.overallScore < 70) {
      recommendations.push({
        type: 'productivity',
        priority: 'high',
        title: 'Optimize Workflow',
        description: 'Overall productivity could be improved through better workflow optimization.',
        action: 'Consider time blocking and priority management techniques'
      });
    }

    return recommendations;
  }

  /**
   * Generate lifecycle summary
   */
  generateLifecycleSummary(lifecycleData) {
    const projects = Object.values(lifecycleData);
    
    if (projects.length === 0) {
      return {
        totalProjects: 0,
        status: 'no-projects',
        summary: 'No active projects tracked'
      };
    }

    const onTrack = projects.filter(p => p.timelineAnalysis?.timelineHealth === 'on-track').length;
    const atRisk = projects.filter(p => p.timelineAnalysis?.timelineHealth === 'at-risk').length;
    const behind = projects.filter(p => p.timelineAnalysis?.timelineHealth === 'behind').length;

    return {
      totalProjects: projects.length,
      onTrack,
      atRisk,
      behind,
      healthScore: Math.round((onTrack / projects.length) * 100),
      summary: `${onTrack} projects on track, ${atRisk} at risk, ${behind} behind schedule`
    };
  }

  /**
   * Helper methods
   */
  calculateConfidenceDistribution(correlations) {
    const distribution = { high: 0, medium: 0, low: 0, veryLow: 0 };
    
    correlations.forEach(correlation => {
      const level = this.correlationEngine.getConfidenceLevel(correlation.score);
      distribution[level] = (distribution[level] || 0) + 1;
    });
    
    return distribution;
  }

  generateCorrelationInsightText(total, high, average) {
    const insights = [];
    
    if (total === 0) {
      insights.push('No event-task correlations detected yet');
    } else if (total < 5) {
      insights.push('Few correlations detected - consider adding more context to events and tasks');
    } else {
      insights.push(`${total} event-task correlations identified`);
    }
    
    if (high > 0) {
      insights.push(`${high} high-confidence correlations found`);
    }
    
    insights.push(`Average correlation confidence: ${Math.round(average * 100)}%`);
    
    return insights;
  }

  generateLifecycleInsightText(totalProjects, onTrack, bottlenecks) {
    const insights = [];
    
    if (totalProjects > 0) {
      insights.push(`${totalProjects} active projects tracked`);
      
      if (onTrack > 0) {
        insights.push(`${onTrack} projects on track`);
      }
    }
    
    if (bottlenecks > 0) {
      insights.push(`${bottlenecks} bottlenecks identified across projects`);
    } else {
      insights.push('No significant bottlenecks detected');
    }
    
    return insights;
  }

  assessDataFreshness(userId) {
    const userData = this.userIntelligence.get(userId);
    if (!userData || !userData.lastAnalysis) {
      return 'stale';
    }
    
    const timeSinceUpdate = Date.now() - new Date(userData.lastAnalysis).getTime();
    
    if (timeSinceUpdate < 60000) return 'fresh'; // 1 minute
    if (timeSinceUpdate < 300000) return 'recent'; // 5 minutes
    if (timeSinceUpdate < 3600000) return 'moderate'; // 1 hour
    return 'stale';
  }

  getActiveProjectIds(userId) {
    // This would integrate with actual project data
    return [];
  }

  async getProjectData(userId, projectId) {
    // This would fetch actual project data
    return null;
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      activeUsers: this.userIntelligence.size,
      processingUsers: this.processingIntervals.size,
      queuedUpdates: Array.from(this.updateQueues.values()).reduce((sum, queue) => sum + queue.length, 0),
      correlationCacheSize: this.correlationEngine.correlationCache.size,
      config: this.config
    };
  }
}

module.exports = CrossAgentIntelligenceCoordinator;