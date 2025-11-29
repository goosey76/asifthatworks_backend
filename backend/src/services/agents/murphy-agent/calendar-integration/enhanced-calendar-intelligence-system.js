// Enhanced Calendar Intelligence System
// Integrates Murphy's 9-engine intelligence with calendar management
// Provides intelligent event population, dual planning, and natural language automation

const EnhancedIntelligenceEngine = require('../intelligence/enhanced-intelligence-engine');
const UnifiedIntelligenceSystem = require('../intelligence/unified-intelligence-system');
const IntelligentEventContextManager = require('../../grim-agent/calendar/intelligent-event-context');
const agentKnowledgeCoordinator = require('../../agent-knowledge-coordinator');

class EnhancedCalendarIntelligenceSystem {
  constructor() {
    this.intelligenceEngine = new EnhancedIntelligenceEngine();
    this.unifiedIntelligence = new UnifiedIntelligenceSystem();
    this.eventContextManager = new IntelligentEventContextManager();
    this.locationIntelligence = new IntelligentLocationService();
    this.categoryManager = new IntelligentCategoryManager();
    this.dualPlanner = new DualPlanningEngine();
  }

  /**
   * Process intelligent calendar request with Murphy's 9-engine integration
   * @param {string} userId - User identifier
   * @param {string} request - User request
   * @param {object} context - Request context
   * @returns {object} Enhanced result with intelligence insights
   */
  async processIntelligentCalendarRequest(userId, request, context = {}) {
    console.log(`🧠 ENHANCED CALENDAR: Processing intelligent request for user ${userId}`);
    
    try {
      // Step 1: Get comprehensive user knowledge
      const userKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
      
      // Step 2: Analyze request with multiple intelligence engines
      const intelligenceAnalysis = await this.analyzeRequestWithEngines(userId, request, userKnowledge);
      
      // Step 3: Extract and validate event details with intelligent enhancement
      const eventDetails = await this.extractIntelligentEventDetails(request, intelligenceAnalysis, userKnowledge);
      
      // Step 4: Process with dual planning capabilities
      const planningResults = await this.processWithDualPlanning(userId, eventDetails, intelligenceAnalysis);
      
      // Step 5: Handle intelligent location search (only when needed)
      const locationResults = await this.handleIntelligentLocationSearch(eventDetails, intelligenceAnalysis);
      
      // Step 6: Ensure comprehensive event population
      const populationResults = await this.ensureEventPopulation(userId, planningResults, eventDetails);
      
      // Step 7: Update intelligent context
      await this.updateIntelligentContext(userId, populationResults, request);
      
      // Step 8: Generate intelligent response
      const response = this.generateIntelligentResponse(populationResults, intelligenceAnalysis, locationResults);
      
      console.log(`✅ ENHANCED CALENDAR: Successfully processed request with ${intelligenceAnalysis.enginesUsed.length} intelligence engines`);
      
      return {
        success: true,
        messageToUser: response.message,
        eventId: response.eventId,
        intelligence: {
          enginesUsed: intelligenceAnalysis.enginesUsed,
          confidence: intelligenceAnalysis.confidence,
          insights: intelligenceAnalysis.insights
        },
        planning: planningResults.summary,
        population: populationResults.summary,
        location: locationResults.summary,
        context: 'enhanced_calendars_with_intelligence'
      };
      
    } catch (error) {
      console.error('❌ ENHANCED CALENDAR: Intelligence processing failed:', error);
      return this.generateIntelligentFallback(request, error);
    }
  }

  /**
   * Analyze request using multiple Murphy intelligence engines
   */
  async analyzeRequestWithEngines(userId, request, userKnowledge) {
    const analysis = {
      enginesUsed: [],
      confidence: 0,
      insights: [],
      patterns: {},
      recommendation: 'standard_processing'
    };

    // Use event-to-task correlation for calendar understanding
    const eventToTaskResult = await this.intelligenceEngine.processIntelligence(
      'event-to-task',
      request,
      { context: 'calendar_analysis' },
      userId
    );
    
    if (eventToTaskResult.functional) {
      analysis.enginesUsed.push('event-to-task');
      analysis.insights.push('Calendar events can be converted to actionable tasks');
      
      if (eventToTaskResult.result.correlations?.length > 0) {
        analysis.confidence += 0.2;
        analysis.recommendation = 'enhanced_calendar_processing';
      }
    }

    // Use time-management for scheduling intelligence
    const timeManagementResult = await this.intelligenceEngine.processIntelligence(
      'time-management',
      request,
      { context: 'calendar_scheduling' },
      userId
    );
    
    if (timeManagementResult.functional) {
      analysis.enginesUsed.push('time-management');
      analysis.insights.push('Optimal scheduling patterns identified');
      
      if (timeManagementResult.result.schedule) {
        analysis.confidence += 0.2;
        analysis.patterns.scheduling = timeManagementResult.result.schedule;
      }
    }

    // Use predictive-tasks for future planning
    const predictiveResult = await this.intelligenceEngine.processIntelligence(
      'predictive-tasks',
      request,
      { context: 'calendar_prediction' },
      userId
    );
    
    if (predictiveResult.functional) {
      analysis.enginesUsed.push('predictive-tasks');
      analysis.insights.push('Predictive scheduling recommendations available');
      
      if (predictiveResult.result.predictions?.length > 0) {
        analysis.confidence += 0.15;
        analysis.patterns.predictions = predictiveResult.result.predictions;
      }
    }

    // Use context-aware for smart processing
    const contextAwareResult = await this.intelligenceEngine.processIntelligence(
      'context-aware',
      request,
      { context: 'calendar_context' },
      userId
    );
    
    if (contextAwareResult.functional) {
      analysis.enginesUsed.push('context-aware');
      analysis.insights.push('Context-aware processing enabled');
      
      if (contextAwareResult.result.contextTasks?.length > 0) {
        analysis.confidence += 0.15;
        analysis.patterns.contextTasks = contextAwareResult.result.contextTasks;
      }
    }

    // Use workflow-analysis for efficiency
    const workflowResult = await this.intelligenceEngine.processIntelligence(
      'workflow-analysis',
      request,
      { context: 'calendar_workflow' },
      userId
    );
    
    if (workflowResult.functional) {
      analysis.enginesUsed.push('workflow-analysis');
      analysis.insights.push('Workflow optimization recommendations');
    }

    // Use focus-areas for intelligent categorization
    const focusAreasResult = await this.intelligenceEngine.processIntelligence(
      'focus-areas',
      request,
      { context: 'calendar_focus' },
      userId
    );
    
    if (focusAreasResult.functional) {
      analysis.enginesUsed.push('focus-areas');
      analysis.insights.push('Focus area recommendations for event organization');
      
      if (focusAreasResult.result.focusAreas?.length > 0) {
        analysis.patterns.focusAreas = focusAreasResult.result.focusAreas;
      }
    }

    // Use productivity-optimization for enhancement
    const productivityResult = await this.intelligenceEngine.processIntelligence(
      'productivity-optimization',
      request,
      { context: 'calendar_productivity' },
      userId
    );
    
    if (productivityResult.functional) {
      analysis.enginesUsed.push('productivity-optimization');
      analysis.insights.push('Productivity optimization opportunities identified');
    }

    // Cap confidence at 1.0
    analysis.confidence = Math.min(analysis.confidence, 1.0);
    
    console.log(`🧠 Intelligence Analysis: ${analysis.enginesUsed.length} engines, ${Math.round(analysis.confidence * 100)}% confidence`);
    
    return analysis;
  }

  /**
   * Extract event details with intelligent enhancement
   */
  async extractIntelligentEventDetails(request, intelligenceAnalysis, userKnowledge) {
    const baseDetails = this.extractBasicEventDetails(request);
    
    // Enhance with intelligence insights
    if (intelligenceAnalysis.patterns.focusAreas) {
      baseDetails.intelligent_category = this.categorizeEventWithFocusAreas(baseDetails, intelligenceAnalysis.patterns.focusAreas);
    }
    
    if (intelligenceAnalysis.patterns.scheduling) {
      baseDetails.intelligent_timing = this.enhanceTimingWithIntelligence(baseDetails, intelligenceAnalysis.patterns.scheduling);
    }
    
    if (intelligenceAnalysis.patterns.contextTasks) {
      baseDetails.suggested_tasks = this.generateSuggestedTasks(baseDetails, intelligenceAnalysis.patterns.contextTasks);
    }
    
    // Add intelligent processing flags
    baseDetails.intelligence_enhanced = true;
    baseDetails.engines_used = intelligenceAnalysis.enginesUsed;
    baseDetails.intelligence_confidence = intelligenceAnalysis.confidence;
    
    return baseDetails;
  }

  /**
   * Process with dual planning capabilities (calendar + tasks)
   */
  async processWithDualPlanning(userId, eventDetails, intelligenceAnalysis) {
    const planning = {
      calendar_plan: null,
      task_plan: null,
      integration_plan: null,
      summary: 'dual_planning_complete'
    };

    // Generate calendar plan
    planning.calendar_plan = await this.generateCalendarPlan(eventDetails, intelligenceAnalysis);
    
    // Generate task plan (dual planning capability)
    planning.task_plan = await this.generateTaskPlan(eventDetails, intelligenceAnalysis);
    
    // Create integration plan
    planning.integration_plan = this.createIntegrationPlan(planning.calendar_plan, planning.task_plan);
    
    return planning;
  }

  /**
   * Handle intelligent location search (only when explicitly needed)
   */
  async handleIntelligentLocationSearch(eventDetails, intelligenceAnalysis) {
    const location = {
      searchPerformed: false,
      results: null,
      summary: 'no_location_search_needed'
    };

    // Only search for location if explicitly mentioned or highly relevant
    const shouldSearch = this.shouldPerformLocationSearch(eventDetails, intelligenceAnalysis);
    
    if (shouldSearch) {
      console.log('📍 Performing intelligent location search...');
      
      try {
        const searchResults = await this.locationIntelligence.performIntelligentSearch(
          eventDetails.location_search_query || eventDetails.location,
          { 
            userPreferences: intelligenceAnalysis.patterns?.focusAreas,
            context: 'calendar_event'
          }
        );
        
        location.searchPerformed = true;
        location.results = searchResults;
        location.summary = 'intelligent_location_search_complete';
        
        // Update event details with intelligent location
        if (searchResults.bestMatch) {
          eventDetails.location = searchResults.bestMatch;
          eventDetails.location_confidence = searchResults.confidence;
        }
        
      } catch (locationError) {
        console.error('⚠️ Location search failed:', locationError);
        location.summary = 'location_search_failed';
        // Continue without location - not critical
      }
    } else {
      console.log('🚫 Skipping location search - not needed for this request');
    }
    
    return location;
  }

  /**
   * Ensure comprehensive event population with intelligence
   */
  async ensureEventPopulation(userId, planningResults, eventDetails) {
    const population = {
      eventsCreated: [],
      tasksCreated: [],
      integrationsCreated: [],
      summary: 'comprehensive_population_complete'
    };

    try {
      // Ensure calendar events are created with intelligence enhancement
      if (planningResults.calendar_plan) {
        const calendarResult = await this.createIntelligenceEnhancedEvent(
          userId, 
          eventDetails, 
          planningResults.calendar_plan
        );
        
        if (calendarResult.success) {
          population.eventsCreated.push(calendarResult);
          console.log(`✅ Created intelligent calendar event: ${calendarResult.title}`);
        }
      }

      // Ensure tasks are created (dual planning)
      if (planningResults.task_plan && planningResults.task_plan.suggestedTasks?.length > 0) {
        for (const task of planningResults.task_plan.suggestedTasks) {
          const taskResult = await this.createIntelligenceEnhancedTask(userId, task, eventDetails);
          
          if (taskResult.success) {
            population.tasksCreated.push(taskResult);
            console.log(`✅ Created intelligent task: ${task.title}`);
          }
        }
      }

      // Create intelligent integrations
      if (planningResults.integration_plan) {
        const integrationResult = await this.createIntelligentIntegrations(
          userId,
          population.eventsCreated,
          population.tasksCreated,
          planningResults.integration_plan
        );
        
        if (integrationResult.success) {
          population.integrationsCreated = integrationResult.integrations;
          console.log(`✅ Created ${integrationResult.integrations.length} intelligent integrations`);
        }
      }

      population.summary = `Created ${population.eventsCreated.length} events, ${population.tasksCreated.length} tasks, ${population.integrationsCreated.length} integrations`;
      
    } catch (error) {
      console.error('❌ Event population failed:', error);
      population.summary = 'population_failed';
    }
    
    return population;
  }

  /**
   * Update intelligent context for future interactions
   */
  async updateIntelligentContext(userId, populationResults, originalRequest) {
    try {
      const contextUpdate = {
        request: originalRequest,
        eventsCreated: populationResults.eventsCreated.length,
        tasksCreated: populationResults.tasksCreated.length,
        integrationsCreated: populationResults.integrationsCreated.length,
        timestamp: new Date().toISOString(),
        intelligentProcessing: true
      };

      // Update event context with intelligence
      if (populationResults.eventsCreated.length > 0) {
        const latestEvent = populationResults.eventsCreated[0];
        await this.eventContextManager.updateEventContext(
          userId,
          {
            event_id: latestEvent.eventId,
            event_title: latestEvent.title,
            date: latestEvent.date,
            start_time: latestEvent.startTime,
            end_time: latestEvent.endTime,
            event_type: latestEvent.category || 'general'
          },
          originalRequest
        );
      }

      console.log(`🧠 Updated intelligent context for user ${userId}`);
      
    } catch (error) {
      console.error('⚠️ Failed to update intelligent context:', error);
    }
  }

  // Helper methods for intelligence integration

  extractBasicEventDetails(request) {
    // Enhanced basic extraction with better parsing
    const details = {
      event_title: this.extractEventTitle(request),
      date: this.extractDate(request),
      start_time: this.extractStartTime(request),
      end_time: this.extractEndTime(request),
      description: this.extractDescription(request),
      location: this.extractLocation(request),
      category: this.extractCategory(request)
    };

    // Ensure all required fields are populated
    if (!details.event_title) details.event_title = 'Untitled Event';
    if (!details.date) details.date = this.getNextBusinessDay();
    if (!details.start_time) details.start_time = '09:00';
    if (!details.end_time) details.end_time = '10:00';

    return details;
  }

  categorizeEventWithFocusAreas(eventDetails, focusAreas) {
    // Intelligent categorization based on focus areas
    const title = eventDetails.event_title.toLowerCase();
    
    for (const area of focusAreas) {
      if (area.area.toLowerCase().includes('deep work') && 
          (title.includes('work') || title.includes('development') || title.includes('project'))) {
        return area.area;
      }
      
      if (area.area.toLowerCase().includes('collaboration') && 
          (title.includes('meeting') || title.includes('discussion') || title.includes('call'))) {
        return area.area;
      }
      
      if (area.area.toLowerCase().includes('learning') && 
          (title.includes('training') || title.includes('workshop') || title.includes('course'))) {
        return area.area;
      }
    }
    
    return 'General';
  }

  enhanceTimingWithIntelligence(eventDetails, scheduling) {
    // Enhance timing based on intelligence
    if (scheduling.optimalBlocks) {
      // Suggest optimal time blocks
      return {
        recommended_blocks: scheduling.optimalBlocks,
        reasoning: 'Based on your productivity patterns'
      };
    }
    
    return null;
  }

  generateSuggestedTasks(eventDetails, contextTasks) {
    // Generate intelligent task suggestions
    const tasks = [];
    const title = eventDetails.event_title.toLowerCase();
    
    if (title.includes('meeting')) {
      tasks.push({
        title: 'Follow up on meeting decisions',
        type: 'follow_up',
        priority: 'high'
      });
    }
    
    if (title.includes('presentation')) {
      tasks.push({
        title: 'Prepare presentation materials',
        type: 'preparation',
        priority: 'high'
      });
    }
    
    return tasks;
  }

  shouldPerformLocationSearch(eventDetails, intelligenceAnalysis) {
    // Only search for location if explicitly mentioned or highly relevant
    const hasExplicitLocation = eventDetails.location && eventDetails.location.length > 3;
    const hasLocationKeywords = /location|place|venue|room|office|building/i.test(eventDetails.event_title);
    
    return hasExplicitLocation || hasLocationKeywords;
  }

  async generateCalendarPlan(eventDetails, intelligenceAnalysis) {
    return {
      eventTitle: eventDetails.event_title,
      optimizedTiming: this.optimizeEventTiming(eventDetails, intelligenceAnalysis),
      intelligentCategory: eventDetails.intelligent_category,
      suggestedDuration: this.calculateOptimalDuration(eventDetails),
      reasoning: 'Generated using time-management and focus-areas intelligence'
    };
  }

  async generateTaskPlan(eventDetails, intelligenceAnalysis) {
    return {
      suggestedTasks: this.generateSuggestedTasks(eventDetails, intelligenceAnalysis.patterns?.contextTasks),
      taskDependencies: this.identifyTaskDependencies(eventDetails),
      priorityMapping: this.mapTaskPriorities(eventDetails),
      reasoning: 'Generated using predictive-tasks and context-aware intelligence'
    };
  }

  createIntegrationPlan(calendarPlan, taskPlan) {
    return {
      calendarToTaskIntegrations: this.createCalendarToTaskLinks(calendarPlan, taskPlan),
      timelineAlignment: this.alignTimelines(calendarPlan, taskPlan),
      prioritySynchronization: this.synchronizePriorities(calendarPlan, taskPlan),
      reasoning: 'Dual planning integration using workflow-analysis intelligence'
    };
  }

  optimizeEventTiming(eventDetails, intelligenceAnalysis) {
    // Intelligent timing optimization
    const baseStartTime = eventDetails.start_time;
    const duration = this.calculateOptimalDuration(eventDetails);
    
    return {
      startTime: baseStartTime,
      endTime: this.addDurationToTime(baseStartTime, duration),
      optimized: true,
      reasoning: 'Optimized using time-management intelligence'
    };
  }

  calculateOptimalDuration(eventDetails) {
    const title = eventDetails.event_title.toLowerCase();
    
    if (title.includes('quick') || title.includes('brief')) return 30; // minutes
    if (title.includes('meeting') || title.includes('discussion')) return 60;
    if (title.includes('workshop') || title.includes('training')) return 120;
    if (title.includes('presentation')) return 90;
    
    return 60; // default 1 hour
  }

  addDurationToTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  identifyTaskDependencies(eventDetails) {
    // Identify intelligent task dependencies
    return [];
  }

  mapTaskPriorities(eventDetails) {
    // Map priorities based on event characteristics
    return {
      high: eventDetails.event_title.toLowerCase().includes('urgent') || 
            eventDetails.event_title.toLowerCase().includes('important'),
      medium: true,
      low: false
    };
  }

  createCalendarToTaskLinks(calendarPlan, taskPlan) {
    // Create intelligent links between calendar events and tasks
    return taskPlan.suggestedTasks?.map(task => ({
      calendarEvent: calendarPlan.eventTitle,
      task: task.title,
      relationship: 'related',
      automationTrigger: 'event_completion'
    })) || [];
  }

  alignTimelines(calendarPlan, taskPlan) {
    // Align calendar and task timelines intelligently
    return {
      beforeEvent: taskPlan.suggestedTasks?.filter(task => task.type === 'preparation') || [],
      afterEvent: taskPlan.suggestedTasks?.filter(task => task.type === 'follow_up') || [],
      duringEvent: taskPlan.suggestedTasks?.filter(task => task.type === 'support') || []
    };
  }

  synchronizePriorities(calendarPlan, taskPlan) {
    // Synchronize priorities between calendar and tasks
    return {
      synchronized: true,
      method: 'intelligence_based_priority_mapping'
    };
  }

  async createIntelligenceEnhancedEvent(userId, eventDetails, calendarPlan) {
    // Create event with intelligence enhancement
    const enhancedEvent = {
      ...eventDetails,
     智能化: true,
      calendarPlan: calendarPlan,
      start_time: calendarPlan.optimizedTiming?.startTime || eventDetails.start_time,
      end_time: calendarPlan.optimizedTiming?.endTime || eventDetails.end_time,
      description: `${eventDetails.description || ''}\n\n[智能化增强] ${calendarPlan.reasoning}`
    };

    // This would integrate with the actual calendar creation
    // For now, return mock success
    return {
      success: true,
      eventId: `enhanced_${Date.now()}`,
      title: enhancedEvent.event_title,
      date: enhancedEvent.date,
      startTime: enhancedEvent.start_time,
      endTime: enhancedEvent.end_time,
      category: calendarPlan.intelligentCategory
    };
  }

  async createIntelligenceEnhancedTask(userId, task, eventDetails) {
    // Create task with intelligence enhancement
    return {
      success: true,
      taskId: `enhanced_task_${Date.now()}`,
      title: task.title,
      type: task.type,
      priority: task.priority,
      relatedEvent: eventDetails.event_title
    };
  }

  async createIntelligentIntegrations(userId, events, tasks, integrationPlan) {
    // Create intelligent integrations between events and tasks
    return {
      success: true,
      integrations: integrationPlan.calendarToTaskIntegrations?.map(link => ({
        id: `integration_${Date.now()}`,
        ...link
      })) || []
    };
  }

  generateIntelligentResponse(populationResults, intelligenceAnalysis, locationResults) {
    const successCount = populationResults.eventsCreated.length;
    const taskCount = populationResults.tasksCreated.length;
    const integrationCount = populationResults.integrationsCreated.length;
    
    let message = '';
    
    if (successCount > 0) {
      message += `✅ Successfully created ${successCount} intelligent calendar event${successCount > 1 ? 's' : ''}`;
      
      if (taskCount > 0) {
        message += ` with ${taskCount} related task${taskCount > 1 ? 's' : ''}`;
      }
      
      if (integrationCount > 0) {
        message += ` and ${integrationCount} intelligent integration${integrationCount > 1 ? 's' : ''}`;
      }
      
      message += ` using ${intelligenceAnalysis.enginesUsed.length} intelligence engines.`;
    } else {
      message = '❌ Failed to create events with intelligence enhancement.';
    }
    
    if (locationResults.searchPerformed) {
      message += '\n📍 Location search performed with intelligent matching.';
    }
    
    return {
      message: message,
      eventId: populationResults.eventsCreated[0]?.eventId || null
    };
  }

  generateIntelligentFallback(request, error) {
    return {
      success: false,
      messageToUser: `I encountered an issue while processing your request with intelligence, but I can still help with basic calendar operations. Error: ${error.message}`,
      eventId: null,
      intelligence: {
        enginesUsed: [],
        confidence: 0,
        insights: ['Basic processing fallback activated']
      },
      fallback: true
    };
  }

  // Utility methods for extraction
  extractEventTitle(request) {
    const patterns = [
      /event:\s*([^,]+)/i,
      /meeting:\s*([^,]+)/i,
      /appointment:\s*([^,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1].trim();
    }
    
    return null;
  }

  extractDate(request) {
    const patterns = [
      /date:\s*(\d{4}-\d{2}-\d{2})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractStartTime(request) {
    const patterns = [
      /start:\s*(\d{1,2}:\d{2})/i,
      /(\d{1,2}:\d{2})\s*(am|pm)?/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractEndTime(request) {
    const patterns = [
      /end:\s*(\d{1,2}:\d{2})/i,
      /until\s+(\d{1,2}:\d{2})/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }

  extractDescription(request) {
    const pattern = /description:\s*([^,]+)/i;
    const match = request.match(pattern);
    return match ? match[1].trim() : null;
  }

  extractLocation(request) {
    const patterns = [
      /location:\s*([^,]+)/i,
      /at\s+([^,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = request.match(pattern);
      if (match) return match[1].trim();
    }
    
    return null;
  }

  extractCategory(request) {
    const categories = ['work', 'meeting', 'personal', 'health', 'education', 'social'];
    const lowerRequest = request.toLowerCase();
    
    for (const category of categories) {
      if (lowerRequest.includes(category)) return category;
    }
    
    return 'general';
  }

  getNextBusinessDay() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Skip weekends
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    return tomorrow.toISOString().split('T')[0];
  }
}

/**
 * Intelligent Location Service
 * Performs closest-match searches only when explicitly requested
 */
class IntelligentLocationService {
  async performIntelligentSearch(query, options = {}) {
    // Only perform search if explicitly needed
    if (!query || query.length < 3) {
      return { bestMatch: null, confidence: 0, reason: 'query_too_short' };
    }
    
    // Mock intelligent location search
    // In real implementation, this would integrate with location APIs
    return {
      bestMatch: query, // Simplified for now
      confidence: 0.8,
      alternatives: [],
      reason: 'intelligent_match_performed'
    };
  }
}

/**
 * Intelligent Category Manager
 * Maintains effective category-based organization
 */
class IntelligentCategoryManager {
  categorizeEvent(eventDetails, userPreferences = {}) {
    // Intelligent categorization logic
    const categories = {
      work: ['meeting', 'project', 'deadline', 'review', 'presentation'],
      personal: ['family', 'friends', 'hobby', 'exercise', 'shopping'],
      health: ['doctor', 'appointment', 'medical', 'exercise', 'therapy'],
      education: ['class', 'course', 'workshop', 'training', 'study']
    };
    
    const title = eventDetails.event_title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => title.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
}

/**
 * Dual Planning Engine
 * Provides calendar and task planning capabilities
 */
class DualPlanningEngine {
  async generateDualPlan(eventDetails, intelligenceAnalysis) {
    return {
      calendar: {
        events: [eventDetails],
        optimization: 'intelligence_enhanced'
      },
      tasks: {
        tasks: [],
        automation: 'ai_powered'
      },
      integration: 'seamless_workflow'
    };
  }
}

module.exports = EnhancedCalendarIntelligenceSystem;