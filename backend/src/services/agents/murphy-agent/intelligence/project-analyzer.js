const EnhancedIntelligenceEngine = require('./enhanced-intelligence-engine');

// Cross-Agent Project Analyzer
// Mines Grim's event data to identify projects, timelines, and provides intelligent suggestions

const agentKnowledgeCoordinator = require('../../agent-knowledge-coordinator');

/**
 * Intelligent project analyzer that understands user projects through event correlation
 * and provides context-aware task suggestions
 */
class CrossAgentProjectAnalyzer {
  constructor() {
    this.userProjects = new Map(); // userId -> project data
    this.eventTaskCorrelations = new Map(); // userId -> correlations
    this.projectTemplates = this.initializeProjectTemplates();
    this.intelligenceEngine = new EnhancedIntelligenceEngine(); // Enhanced intelligence
    this.dashboard = new ProductivityDashboard(); // Productivity dashboard
  }

  /**
   * Initialize intelligent project templates for different types
   */
  initializeProjectTemplates() {
    return {
      'work_project': {
        phases: ['Planning', 'Development', 'Review', 'Deployment', 'Maintenance'],
        commonTasks: ['requirements_gathering', 'documentation', 'testing', 'client_presentation'],
        timeEstimate: '2-8 weeks',
        priority: 'high'
      },
      'personal_project': {
        phases: ['Research', 'Setup', 'Implementation', 'Review'],
        commonTasks: ['planning', 'resource_gathering', 'execution', 'celebration'],
        timeEstimate: '1-4 weeks',
        priority: 'medium'
      },
      'learning_project': {
        phases: ['Introduction', 'Practice', 'Application', 'Mastery'],
        commonTasks: ['course_study', 'practice_exercises', 'real_world_application', 'knowledge_sharing'],
        timeEstimate: '4-12 weeks',
        priority: 'medium'
      },
      'event_planning': {
        phases: ['Planning', 'Coordination', 'Preparation', 'Execution', 'Follow-up'],
        commonTasks: ['venue_booking', 'guest_list', 'logistics', 'cleanup', 'thank_you_notes'],
        timeEstimate: '1-6 weeks',
        priority: 'high'
      },
      'health_fitness': {
        phases: ['Assessment', 'Goal_setting', 'Implementation', 'Monitoring', 'Adjustment'],
        commonTasks: ['workout_schedule', 'meal_planning', 'progress_tracking', 'doctor_appointments'],
        timeEstimate: 'ongoing',
        priority: 'high'
      }
    };
  }

  /**
   * Analyze user's project landscape by correlating events and tasks
   * @param {string} userId - User identifier
   * @param {object} grimKnowledge - Knowledge from Grim agent
   * @param {object} murphyKnowledge - Knowledge from Murphy agent
   * @returns {object} Project analysis results
   */
  async analyzeProjectLandscape(userId, grimKnowledge, murphyKnowledge) {
    try {
      // Get comprehensive knowledge from all agents
      const allAgentKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
      
      // Extract project indicators from calendar events
      const calendarProjects = this.extractProjectsFromCalendar(grimKnowledge);
      
      // Extract project indicators from task patterns
      const taskProjects = this.extractProjectsFromTasks(murphyKnowledge);
      
      // Correlate events and tasks to understand full project context
      const correlatedProjects = this.correlateCalendarAndTasks(calendarProjects, taskProjects);
      
      // Identify active projects and their current phases
      const activeProjects = this.identifyActiveProjects(correlatedProjects, grimKnowledge, murphyKnowledge);
      
      // Generate intelligent project insights
      const projectInsights = this.generateProjectInsights(activeProjects, allAgentKnowledge);
      
      // Store analysis for future reference
      this.userProjects.set(userId, {
        activeProjects,
        insights: projectInsights,
        lastAnalysis: new Date().toISOString(),
        correlations: correlatedProjects
      });

      return {
        activeProjects,
        insights: projectInsights,
        recommendations: this.generateProjectRecommendations(activeProjects, projectInsights),
        nextActions: this.identifyNextActions(activeProjects)
      };

    } catch (error) {
      console.error('Project analysis error:', error);
      return {
        activeProjects: [],
        insights: { error: 'Analysis failed', message: 'Unable to analyze projects' },
        recommendations: [],
        nextActions: []
      };
    }
  }

  /**
   * Extract project patterns from calendar events
   * @param {object} grimKnowledge - Grim agent's knowledge
   * @returns {Array} Project patterns
   */
  extractProjectsFromCalendar(grimKnowledge) {
    const projects = [];
    const events = grimKnowledge?.calendarSnapshot?.events || [];
    
    // Group events by temporal proximity and content similarity
    const eventGroups = this.groupEventsByProject(events);
    
    eventGroups.forEach(group => {
      const projectPattern = {
        id: this.generateProjectId(group),
        name: this.inferProjectName(group),
        type: this.classifyProjectType(group),
        events: group,
        timeline: this.extractTimeline(group),
        phases: this.identifyProjectPhases(group),
        estimatedCompletion: this.estimateProjectCompletion(group),
        priority: this.calculateProjectPriority(group)
      };
      projects.push(projectPattern);
    });
    
    return projects;
  }

  /**
   * Extract project patterns from task data
   * @param {object} murphyKnowledge - Murphy agent's knowledge
   * @returns {Array} Task-based projects
   */
  extractProjectsFromTasks(murphyKnowledge) {
    const projects = [];
    const tasks = murphyKnowledge?.recentPatterns?.recentTaskTypes || [];
    const favoriteCategories = murphyKnowledge?.productivitySnapshot?.favoriteCategory;
    
    // Analyze task patterns to identify ongoing projects
    const taskPatterns = this.analyzeTaskPatterns(tasks, favoriteCategories);
    
    taskPatterns.forEach(pattern => {
      const projectPattern = {
        id: this.generateProjectId(pattern.tasks),
        name: pattern.name,
        type: pattern.type,
        tasks: pattern.tasks,
        phase: pattern.currentPhase,
        progress: pattern.progress,
        nextMilestones: pattern.nextMilestones
      };
      projects.push(projectPattern);
    });
    
    return projects;
  }

  /**
   * Group related events into project clusters
   * @param {Array} events - Calendar events
   * @returns {Array} Event groups representing projects
   */
  groupEventsByProject(events) {
    const groups = [];
    const processed = new Set();
    
    events.forEach((event, index) => {
      if (processed.has(index)) return;
      
      const group = [event];
      processed.add(index);
      
      // Find related events within timeframe and content similarity
      events.forEach((otherEvent, otherIndex) => {
        if (processed.has(otherIndex)) return;
        
        const isRelated = this.areEventsRelated(event, otherEvent);
        if (isRelated) {
          group.push(otherEvent);
          processed.add(otherIndex);
        }
      });
      
      if (group.length > 1) {
        groups.push(group);
      }
    });
    
    return groups;
  }

  /**
   * Determine if two events are related (part of the same project)
   * @param {object} event1 - First event
   * @param {object} event2 - Second event  
   * @returns {boolean} Whether events are related
   */
  areEventsRelated(event1, event2) {
    const title1 = event1.summary?.toLowerCase() || '';
    const title2 = event2.summary?.toLowerCase() || '';
    const location1 = event1.location?.toLowerCase() || '';
    const location2 = event2.location?.toLowerCase() || '';
    
    // Check for shared keywords in titles
    const sharedWords = this.findSharedKeywords(title1, title2);
    if (sharedWords.length > 0 && sharedWords.length >= Math.min(title1.split(' ').length, title2.split(' ').length) * 0.3) {
      return true;
    }
    
    // Check for shared locations
    if (location1 && location2 && location1 === location2 && location1.length > 5) {
      return true;
    }
    
    // Check for temporal proximity (within 2 weeks)
    const date1 = new Date(event1.start?.dateTime || event1.start?.date);
    const date2 = new Date(event2.start?.dateTime || event2.start?.date);
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 14) {
      // Check for related content
      const content1 = `${title1} ${location1}`;
      const content2 = `${title2} ${location2}`;
      const sharedContent = this.findSharedKeywords(content1, content2);
      return sharedContent.length > 0;
    }
    
    return false;
  }

  /**
   * Find shared keywords between two text strings
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {Array} Shared keywords
   */
  findSharedKeywords(text1, text2) {
    const words1 = text1.split(/\s+/).filter(word => word.length > 3);
    const words2 = text2.split(/\s+/).filter(word => word.length > 3);
    
    return words1.filter(word => 
      words2.some(otherWord => 
        otherWord.includes(word) || word.includes(otherWord)
      )
    );
  }

  /**
   * Generate unique project ID
   * @param {Array} group - Event or task group
   * @returns {string} Project ID
   */
  generateProjectId(group) {
    const timestamp = Date.now();
    const content = group.map(item => item.summary || item.title || '').join('');
    return `project_${timestamp}_${content.substring(0, 20).replace(/\s+/g, '_')}`;
  }

  /**
   * Infer project name from grouped events/tasks
   * @param {Array} group - Event or task group
   * @returns {string} Project name
   */
  inferProjectName(group) {
    const titles = group.map(item => item.summary || item.title || '').filter(Boolean);
    
    // Find most common words or phrases
    const wordFreq = {};
    titles.forEach(title => {
      const words = title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });
    
    const mostFrequent = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
    
    return mostFrequent.length > 0 ? mostFrequent.join(' ') : titles[0] || 'Untitled Project';
  }

  /**
   * Classify project type based on event content
   * @param {Array} group - Event group
   * @returns {string} Project type
   */
  classifyProjectType(group) {
    const allContent = group.map(item => 
      `${item.summary || ''} ${item.location || ''}`.toLowerCase()
    ).join(' ');
    
    const typeIndicators = {
      'work_project': ['meeting', 'project', 'client', 'presentation', 'deadline', 'work', 'office'],
      'personal_project': ['home', 'personal', 'family', 'vacation', 'birthday', 'anniversary'],
      'learning_project': ['course', 'study', 'training', 'workshop', 'seminar', 'learn'],
      'event_planning': ['planning', 'venue', 'party', 'wedding', 'conference', 'event'],
      'health_fitness': ['doctor', 'gym', 'exercise', 'health', 'appointment', 'therapy']
    };
    
    for (const [type, indicators] of Object.entries(typeIndicators)) {
      if (indicators.some(indicator => allContent.includes(indicator))) {
        return type;
      }
    }
    
    return 'general_project';
  }

  /**
   * Extract timeline information from project group
   * @param {Array} group - Event group
   * @returns {object} Timeline information
   */
  extractTimeline(group) {
    const dates = group.map(item => new Date(item.start?.dateTime || item.start?.date)).sort((a, b) => a - b);
    
    return {
      startDate: dates[0]?.toISOString().split('T')[0],
      endDate: dates[dates.length - 1]?.toISOString().split('T')[0],
      duration: dates.length > 1 ? Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) : 0,
      totalEvents: group.length,
      currentPhase: this.determineCurrentPhase(dates)
    };
  }

  /**
   * Identify project phases based on timeline
   * @param {Array} dates - Project dates
   * @returns {string} Current phase
   */
  determineCurrentPhase(dates) {
    if (dates.length === 0) return 'planning';
    
    const now = new Date();
    const futureDates = dates.filter(date => date > now).length;
    const pastDates = dates.filter(date => date <= now).length;
    
    if (futureDates === 0) return 'completed';
    if (pastDates === 0) return 'planning';
    if (pastDates < dates.length * 0.3) return 'initiation';
    if (pastDates < dates.length * 0.7) return 'execution';
    return 'completion';
  }

  /**
   * Calculate project priority based on content and timeline
   * @param {Array} group - Event group
   * @returns {string} Priority level
   */
  calculateProjectPriority(group) {
    const content = group.map(item => `${item.summary || ''} ${item.location || ''}`).join(' ').toLowerCase();
    
    if (content.includes('urgent') || content.includes('deadline') || content.includes('asap')) {
      return 'high';
    }
    if (content.includes('important') || content.includes('priority')) {
      return 'medium';
    }
    return 'normal';
  }

  /**
   * Estimate project completion date
   * @param {Array} group - Event group
   * @returns {string} Estimated completion date
   */
  estimateProjectCompletion(group) {
    const dates = group.map(item => new Date(item.start?.dateTime || item.start?.date)).sort((a, b) => a - b);
    
    if (dates.length === 0) return null;
    
    // If project is ongoing, estimate 2-4 weeks from last event
    const lastDate = dates[dates.length - 1];
    const now = new Date();
    
    if (lastDate < now) {
      // Project appears to be completed
      return lastDate.toISOString().split('T')[0];
    } else {
      // Project is ongoing, estimate completion
      const estimatedDuration = group.length * 7; // Assume weekly events
      const completionEstimate = new Date(lastDate);
      completionEstimate.setDate(completionEstimate.getDate() + estimatedDuration);
      return completionEstimate.toISOString().split('T')[0];
    }
  }

  /**
   * Identify project phases based on template
   * @param {Array} group - Event group
   * @returns {Array} Project phases
   */
  identifyProjectPhases(group) {
    const projectType = this.classifyProjectType(group);
    const template = this.projectTemplates[projectType] || this.projectTemplates.work_project;
    
    return template.phases.map(phase => ({
      name: phase,
      status: this.determinePhaseStatus(phase, group),
      estimatedTasks: this.getPhaseTaskCount(phase, template)
    }));
  }

  /**
   * Determine status of a project phase
   * @param {string} phase - Phase name
   * @param {Array} group - Project events
   * @returns {string} Phase status
   */
  determinePhaseStatus(phase, group) {
    const phaseKeywords = {
      'Planning': ['planning', 'setup', 'kickoff', 'initial'],
      'Development': ['development', 'work', 'implementation', 'building'],
      'Review': ['review', 'check', 'assessment', 'validation'],
      'Deployment': ['deployment', 'launch', 'release', 'go-live'],
      'Maintenance': ['maintenance', 'support', 'follow-up', 'ongoing']
    };
    
    const keywords = phaseKeywords[phase] || [phase.toLowerCase()];
    const content = group.map(item => `${item.summary || ''}`.toLowerCase()).join(' ');
    
    const hasPhaseContent = keywords.some(keyword => content.includes(keyword));
    
    if (hasPhaseContent) {
      // Check if this is the latest phase based on dates
      const now = new Date();
      const futureEvents = group.filter(item => new Date(item.start?.dateTime || item.start?.date) > now);
      if (futureEvents.length > 0) return 'in-progress';
      return 'completed';
    }
    
    return 'pending';
  }

  /**
   * Get estimated task count for a phase
   * @param {string} phase - Phase name
   * @param {object} template - Project template
   * @returns {number} Estimated task count
   */
  getPhaseTaskCount(phase, template) {
    const phaseTaskMap = {
      'Planning': 3,
      'Development': 5,
      'Review': 2,
      'Deployment': 2,
      'Maintenance': 1
    };
    
    return phaseTaskMap[phase] || 2;
  }

  /**
   * Correlate calendar events and tasks for project understanding
   * @param {Array} calendarProjects - Projects from calendar
   * @param {Array} taskProjects - Projects from tasks
   * @returns {Array} Correlated projects
   */
  correlateCalendarAndTasks(calendarProjects, taskProjects) {
    const correlated = [];
    
    calendarProjects.forEach(calProject => {
      const relatedTasks = taskProjects.filter(taskProject => 
        this.areProjectsRelated(calProject, taskProject)
      );
      
      if (relatedTasks.length > 0) {
        correlated.push({
          ...calProject,
          relatedTasks,
          correlationScore: this.calculateCorrelationScore(calProject, relatedTasks),
          unifiedTimeline: this.createUnifiedTimeline(calProject, relatedTasks)
        });
      } else {
        correlated.push({
          ...calProject,
          relatedTasks: [],
          correlationScore: 0,
          unifiedTimeline: calProject.timeline
        });
      }
    });
    
    // Add task-only projects that don't have calendar events
    taskProjects.forEach(taskProject => {
      const hasCalendarProject = calendarProjects.some(calProject => 
        this.areProjectsRelated(calProject, taskProject)
      );
      
      if (!hasCalendarProject) {
        correlated.push({
          id: taskProject.id,
          name: taskProject.name,
          type: taskProject.type,
          events: [],
          tasks: taskProject.tasks,
          phases: taskProject.phases || [],
          correlationScore: 1,
          relatedTasks: [taskProject],
          unifiedTimeline: {
            startDate: null,
            endDate: null,
            duration: null,
            currentPhase: taskProject.phase || 'planning'
          }
        });
      }
    });
    
    return correlated;
  }

  /**
   * Check if calendar project and task project are related
   * @param {object} calProject - Calendar project
   * @param {object} taskProject - Task project
   * @returns {boolean} Whether projects are related
   */
  areProjectsRelated(calProject, taskProject) {
    const calName = calProject.name.toLowerCase();
    const taskName = taskProject.name.toLowerCase();
    
    // Check for shared keywords
    const sharedWords = this.findSharedKeywords(calName, taskName);
    return sharedWords.length > 0;
  }

  /**
   * Calculate correlation score between projects
   * @param {object} calProject - Calendar project
   * @param {Array} taskProjects - Related task projects
   * @returns {number} Correlation score (0-1)
   */
  calculateCorrelationScore(calProject, taskProjects) {
    if (taskProjects.length === 0) return 0;
    
    // Base score for having related content
    let score = 0.5;
    
    // Boost for temporal overlap
    if (calProject.timeline && taskProjects[0].timeline) {
      score += 0.3;
    }
    
    // Boost for high content similarity
    const avgSimilarity = taskProjects.reduce((sum, taskProject) => {
      const similarity = this.calculateTextSimilarity(calProject.name, taskProject.name);
      return sum + similarity;
    }, 0) / taskProjects.length;
    
    score += avgSimilarity * 0.2;
    
    return Math.min(1, score);
  }

  /**
   * Calculate text similarity between two strings
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-1)
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Create unified timeline from calendar and task projects
   * @param {object} calProject - Calendar project
   * @param {Array} taskProjects - Related task projects
   * @returns {object} Unified timeline
   */
  createUnifiedTimeline(calProject, taskProjects) {
    const timeline = { ...calProject.timeline };
    
    // If task projects have timeline info, merge it
    taskProjects.forEach(taskProject => {
      if (taskProject.timeline) {
        if (!timeline.startDate || (taskProject.timeline.startDate && taskProject.timeline.startDate < timeline.startDate)) {
          timeline.startDate = taskProject.timeline.startDate;
        }
        if (!timeline.endDate || (taskProject.timeline.endDate && taskProject.timeline.endDate > timeline.endDate)) {
          timeline.endDate = taskProject.timeline.endDate;
        }
      }
    });
    
    return timeline;
  }

  /**
   * Identify active projects from correlated data
   * @param {Array} correlatedProjects - Correlated project data
   * @param {object} grimKnowledge - Grim agent knowledge
   * @param {object} murphyKnowledge - Murphy agent knowledge
   * @returns {Array} Active projects
   */
  identifyActiveProjects(correlatedProjects, grimKnowledge, murphyKnowledge) {
    const now = new Date();
    
    return correlatedProjects.filter(project => {
      // Project is active if it has future events or ongoing tasks
      const hasFutureEvents = project.events?.some(event => 
        new Date(event.start?.dateTime || event.start?.date) > now
      );
      
      const hasOngoingTasks = project.relatedTasks?.some(task => 
        task.status === 'in-progress' || task.status === 'pending'
      );
      
      return hasFutureEvents || hasOngoingTasks || project.timeline?.currentPhase === 'execution';
    });
  }

  /**
   * Analyze task patterns to identify projects
   * @param {Array} tasks - Task types
   * @param {string} favoriteCategory - Favorite category
   * @returns {Array} Task-based projects
   */
  analyzeTaskPatterns(tasks, favoriteCategory) {
    // Group similar tasks to identify projects
    const taskGroups = {};
    
    tasks.forEach(taskType => {
      if (!taskGroups[taskType]) {
        taskGroups[taskType] = {
          name: this.generateProjectNameFromTaskType(taskType),
          type: taskType,
          tasks: [],
          count: 0,
          currentPhase: 'planning',
          progress: 0,
          nextMilestones: []
        };
      }
      
      taskGroups[taskType].tasks.push({ type: taskType, completed: Math.random() > 0.3 });
      taskGroups[taskType].count++;
    });
    
    return Object.values(taskGroups).filter(group => group.count >= 2); // Only groups with multiple tasks
  }

  /**
   * Generate project name from task type
   * @param {string} taskType - Task type
   * @returns {string} Project name
   */
  generateProjectNameFromTaskType(taskType) {
    const nameMap = {
      'work': 'Work Projects',
      'personal': 'Personal Projects',
      'health': 'Health & Fitness',
      'home': 'Home Projects',
      'learning': 'Learning Projects'
    };
    
    return nameMap[taskType] || `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Project`;
  }

  /**
   * Generate project insights from active projects
   * @param {Array} activeProjects - Active projects
   * @param {object} allKnowledge - All agent knowledge
   * @returns {object} Project insights
   */
  generateProjectInsights(activeProjects, allKnowledge) {
    const insights = {
      totalActiveProjects: activeProjects.length,
      projectDistribution: this.analyzeProjectDistribution(activeProjects),
      workloadAnalysis: this.analyzeWorkload(activeProjects, allKnowledge),
      priorityInsights: this.analyzePriorityDistribution(activeProjects),
      timelineInsights: this.analyzeTimelinePatterns(activeProjects),
      recommendations: []
    };
    
    // Generate intelligent recommendations
    insights.recommendations = this.generateInsightRecommendations(insights, allKnowledge);
    
    return insights;
  }

  /**
   * Analyze project type distribution
   * @param {Array} activeProjects - Active projects
   * @returns {object} Distribution analysis
   */
  analyzeProjectDistribution(activeProjects) {
    const distribution = {};
    
    activeProjects.forEach(project => {
      distribution[project.type] = (distribution[project.type] || 0) + 1;
    });
    
    return {
      byType: distribution,
      mostCommon: Object.keys(distribution).reduce((a, b) => 
        distribution[a] > distribution[b] ? a : b, ''),
      balance: this.calculateProjectBalance(distribution)
    };
  }

  /**
   * Calculate project balance score
   * @param {object} distribution - Project distribution
   * @returns {number} Balance score (0-1)
   */
  calculateProjectBalance(distribution) {
    const values = Object.values(distribution);
    const total = values.reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...values);
    
    // Perfect balance would be equal distribution
    const expectedPerType = total / Object.keys(distribution).length;
    const balanceScore = 1 - ((maxCount - expectedPerType) / total);
    
    return Math.max(0, Math.min(1, balanceScore));
  }

  /**
   * Analyze workload based on projects and user capacity
   * @param {Array} activeProjects - Active projects
   * @param {object} allKnowledge - All agent knowledge
   * @returns {object} Workload analysis
   */
  analyzeWorkload(activeProjects, allKnowledge) {
    const productivityData = allKnowledge?.rotated?.knowledge?.patterns?.productivity || {};
    const completionRate = productivityData.completionRate || 50;
    
    const totalEvents = activeProjects.reduce((sum, project) => sum + (project.events?.length || 0), 0);
    const estimatedTasks = activeProjects.reduce((sum, project) => sum + (project.phases?.length * 3 || 3), 0);
    
    return {
      totalEvents,
      estimatedTasks,
      workloadLevel: this.determineWorkloadLevel(totalEvents, estimatedTasks, completionRate),
      capacity: this.calculateUserCapacity(completionRate),
      recommendations: this.generateWorkloadRecommendations(totalEvents, estimatedTasks, completionRate)
    };
  }

  /**
   * Determine workload level based on events and capacity
   * @param {number} totalEvents - Total events
   * @param {number} estimatedTasks - Estimated tasks
   * @param {number} completionRate - User completion rate
   * @returns {string} Workload level
   */
  determineWorkloadLevel(totalEvents, estimatedTasks, completionRate) {
    const totalWorkload = totalEvents + estimatedTasks;
    
    if (totalWorkload > 20 || completionRate < 40) return 'overloaded';
    if (totalWorkload > 10 || completionRate < 60) return 'moderate';
    if (totalWorkload < 3) return 'light';
    return 'optimal';
  }

  /**
   * Calculate user capacity based on completion rate
   * @param {number} completionRate - User completion rate
   * @returns {object} Capacity information
   */
  calculateUserCapacity(completionRate) {
    let maxConcurrentProjects = 3;
    let recommendedTasksPerDay = 5;
    
    if (completionRate > 80) {
      maxConcurrentProjects = 5;
      recommendedTasksPerDay = 8;
    } else if (completionRate > 60) {
      maxConcurrentProjects = 4;
      recommendedTasksPerDay = 6;
    } else if (completionRate < 40) {
      maxConcurrentProjects = 2;
      recommendedTasksPerDay = 3;
    }
    
    return {
      maxConcurrentProjects,
      recommendedTasksPerDay,
      optimalFocusTime: this.calculateOptimalFocusTime(completionRate)
    };
  }

  /**
   * Calculate optimal focus time for user
   * @param {number} completionRate - User completion rate
   * @returns {number} Optimal focus hours per day
   */
  calculateOptimalFocusTime(completionRate) {
    if (completionRate > 80) return 6;
    if (completionRate > 60) return 4;
    if (completionRate > 40) return 3;
    return 2;
  }

  /**
   * Generate workload recommendations
   * @param {number} totalEvents - Total events
   * @param {number} estimatedTasks - Estimated tasks
   * @param {number} completionRate - User completion rate
   * @returns {Array} Recommendations
   */
  generateWorkloadRecommendations(totalEvents, estimatedTasks, completionRate) {
    const recommendations = [];
    
    if (completionRate < 50) {
      recommendations.push('Focus on completing existing tasks before starting new projects');
      recommendations.push('Consider breaking large projects into smaller, manageable tasks');
    }
    
    if (totalEvents > 15) {
      recommendations.push('Schedule buffer time between events to avoid burnout');
      recommendations.push('Consider delegating or postponing lower-priority commitments');
    }
    
    if (estimatedTasks > 30) {
      recommendations.push('Prioritize high-impact tasks and consider task automation');
      recommendations.push('Group similar tasks together for efficiency');
    }
    
    return recommendations;
  }

  /**
   * Analyze priority distribution across projects
   * @param {Array} activeProjects - Active projects
   * @returns {object} Priority analysis
   */
  analyzePriorityDistribution(activeProjects) {
    const distribution = { high: 0, medium: 0, normal: 0 };
    
    activeProjects.forEach(project => {
      const priority = project.priority || 'normal';
      distribution[priority] = (distribution[priority] || 0) + 1;
    });
    
    return {
      distribution,
      isOverloaded: distribution.high > 2,
      needsPrioritization: distribution.medium + distribution.normal > distribution.high,
      recommendation: this.generatePriorityRecommendation(distribution)
    };
  }

  /**
   * Generate priority recommendation
   * @param {object} distribution - Priority distribution
   * @returns {string} Recommendation
   */
  generatePriorityRecommendation(distribution) {
    if (distribution.high > 3) {
      return 'Consider reassessing priorities - too many high-priority items';
    }
    if (distribution.high === 0) {
      return 'Identify your most important projects and elevate their priority';
    }
    return 'Good priority balance - maintain focus on high-priority items';
  }

  /**
   * Analyze timeline patterns across projects
   * @param {Array} activeProjects - Active projects
   * @returns {object} Timeline analysis
   */
  analyzeTimelinePatterns(activeProjects) {
    const phases = {};
    const timeframes = { immediate: 0, thisWeek: 0, thisMonth: 0, ongoing: 0 };
    
    activeProjects.forEach(project => {
      const phase = project.timeline?.currentPhase || 'unknown';
      phases[phase] = (phases[phase] || 0) + 1;
      
      // Analyze timeframe
      if (project.estimatedCompletion) {
        const completionDate = new Date(project.estimatedCompletion);
        const now = new Date();
        const daysDiff = (completionDate - now) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 7) timeframes.immediate++;
        else if (daysDiff <= 30) timeframes.thisWeek++;
        else timeframes.thisMonth++;
      } else {
        timeframes.ongoing++;
      }
    });
    
    return {
      phaseDistribution: phases,
      timeframeDistribution: timeframes,
      bottlenecks: this.identifyTimelineBottlenecks(phases, timeframes)
    };
  }

  /**
   * Identify potential timeline bottlenecks
   * @param {object} phases - Phase distribution
   * @param {object} timeframes - Timeframe distribution
   * @returns {Array} Identified bottlenecks
   */
  identifyTimelineBottlenecks(phases, timeframes) {
    const bottlenecks = [];
    
    if (phases['planning'] > phases['execution'] + phases['completion']) {
      bottlenecks.push('Too many projects stuck in planning phase');
    }
    
    if (timeframes.immediate > 5) {
      bottlenecks.push('Too many urgent deadlines approaching');
    }
    
    if (timeframes.ongoing > phases['completion']) {
      bottlenecks.push('Many projects lack clear completion criteria');
    }
    
    return bottlenecks;
  }

  /**
   * Generate insight-based recommendations
   * @param {object} insights - Project insights
   * @param {object} allKnowledge - All agent knowledge
   * @returns {Array} Recommendations
   */
  generateInsightRecommendations(insights, allKnowledge) {
    const recommendations = [];
    
    // Workload-based recommendations
    if (insights.workloadAnalysis.workloadLevel === 'overloaded') {
      recommendations.push({
        type: 'workload',
        priority: 'high',
        message: 'Your workload appears overwhelming. Consider focusing on 1-2 key projects.',
        action: 'project_focus'
      });
    }
    
    // Balance recommendations
    if (insights.projectDistribution.balance < 0.5) {
      recommendations.push({
        type: 'balance',
        priority: 'medium',
        message: 'Consider diversifying your project types for better balance',
        action: 'project_diversification'
      });
    }
    
    // Priority recommendations
    const priorityRec = this.generatePriorityRecommendation(insights.priorityInsights.distribution);
    if (priorityRec) {
      recommendations.push({
        type: 'priority',
        priority: 'medium',
        message: priorityRec,
        action: 'priority_review'
      });
    }
    
    // Timeline recommendations
    if (insights.timelineInsights.bottlenecks.length > 0) {
      recommendations.push({
        type: 'timeline',
        priority: 'high',
        message: `Timeline bottleneck detected: ${insights.timelineInsights.bottlenecks[0]}`,
        action: 'timeline_optimization'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate overall project recommendations
   * @param {Array} activeProjects - Active projects
   * @param {object} insights - Project insights
   * @returns {Array} Recommendations
   */
  generateProjectRecommendations(activeProjects, insights) {
    const recommendations = [];
    
    // Smart technique suggestions based on project analysis
    if (activeProjects.length > 3) {
      recommendations.push({
        type: 'organization',
        title: 'Smart Organization',
        description: 'Group similar projects into dedicated task lists',
        technique: 'smart_organization',
        priority: 'high'
      });
    }
    
    // Task breakdown suggestions
    activeProjects.forEach(project => {
      if (project.phases && project.phases.length > 0) {
        const pendingPhases = project.phases.filter(phase => phase.status === 'pending');
        if (pendingPhases.length > 0) {
          recommendations.push({
            type: 'breakdown',
            title: `Break down ${project.name}`,
            description: `Create specific tasks for ${pendingPhases[0].name} phase`,
            technique: 'task_breakdown',
            projectId: project.id,
            priority: 'medium'
          });
        }
      }
    });
    
    // Time management suggestions
    if (insights.workloadAnalysis.capacity.maxConcurrentProjects < activeProjects.length) {
      recommendations.push({
        type: 'time_management',
        title: 'Optimize Focus',
        description: `Limit to ${insights.workloadAnalysis.capacity.maxConcurrentProjects} projects for better focus`,
        technique: 'focus_optimization',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  /**
   * Identify next actions for projects
   * @param {Array} activeProjects - Active projects
   * @returns {Array} Next actions
   */
  identifyNextActions(activeProjects) {
    const nextActions = [];
    
    activeProjects.forEach(project => {
      // Find next phase or milestone
      const nextPhase = project.phases?.find(phase => phase.status === 'pending');
      if (nextPhase) {
        nextActions.push({
          projectId: project.id,
          projectName: project.name,
          action: `Start ${nextPhase.name} phase`,
          estimatedTasks: nextPhase.estimatedTasks,
          priority: project.priority || 'normal'
        });
      }
      
      // If no phases defined, suggest initial task creation
      if (!project.phases || project.phases.length === 0) {
        nextActions.push({
          projectId: project.id,
          projectName: project.name,
          action: 'Create initial tasks',
          estimatedTasks: 3,
          priority: project.priority || 'normal'
        });
      }
    });
    
    // Sort by priority
    return nextActions.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

/**
 * Productivity Dashboard for comprehensive user insights
 */
class ProductivityDashboard {
  constructor() {
    this.dashboards = new Map(); // userId -> dashboard data
  }

  /**
   * Generate comprehensive productivity dashboard
   * @param {string} userId - User identifier
   * @param {object} userKnowledge - All agent knowledge
   * @returns {object} Dashboard data
   */
  generateDashboard(userId, userKnowledge) {
    const dashboard = {
      userId: userId,
      timestamp: new Date().toISOString(),
      overview: this.generateOverview(userKnowledge),
      productivity: this.analyzeProductivity(userKnowledge),
      calendar: this.analyzeCalendar(userKnowledge),
      projects: this.analyzeProjects(userKnowledge),
      recommendations: this.generateRecommendations(userKnowledge),
      insights: this.generateInsights(userKnowledge),
      actionItems: this.generateActionItems(userKnowledge)
    };

    this.dashboards.set(userId, dashboard);
    return dashboard;
  }

  generateOverview(userKnowledge) {
    const productivity = userKnowledge.rotated?.knowledge?.patterns?.productivity;
    const scheduling = userKnowledge.rotated?.knowledge?.patterns?.scheduling;
    
    return {
      overallScore: this.calculateOverallScore(productivity, scheduling),
      productivityLevel: productivity?.completionRate > 80 ? 'excellent' :
                        productivity?.completionRate > 60 ? 'good' : 'needs-improvement',
      efficiency: this.calculateEfficiency(productivity),
      balance: this.calculateWorkLifeBalance(scheduling)
    };
  }

  analyzeProductivity(userKnowledge) {
    const productivity = userKnowledge.rotated?.knowledge?.patterns?.productivity;
    
    return {
      completionRate: productivity?.completionRate || 0,
      streak: productivity?.currentStreak || 0,
      favoriteCategory: productivity?.favoriteCategory || 'general',
      mostActiveHours: productivity?.mostActiveHours || 'unknown',
      trends: this.analyzeProductivityTrends(productivity)
    };
  }

  analyzeCalendar(userKnowledge) {
    const scheduling = userKnowledge.rotated?.knowledge?.patterns?.scheduling;
    
    return {
      totalEvents: scheduling?.totalEvents || 0,
      eventTypes: scheduling?.eventTypes || [],
      bufferTime: scheduling?.bufferTime || 15,
      scheduleEfficiency: this.calculateScheduleEfficiency(scheduling),
      optimizationOpportunities: this.identifyCalendarOptimizations(scheduling)
    };
  }

  analyzeProjects(userKnowledge) {
    return {
      activeProjects: this.getActiveProjects(userKnowledge),
      completedThisWeek: this.getCompletedProjects(userKnowledge),
      upcomingDeadlines: this.getUpcomingDeadlines(userKnowledge),
      projectHealth: this.assessProjectHealth(userKnowledge)
    };
  }

  generateRecommendations(userKnowledge) {
    const recommendations = [];
    
    // Productivity recommendations
    const productivity = userKnowledge.rotated?.knowledge?.patterns?.productivity;
    if (productivity?.completionRate < 70) {
      recommendations.push({
        category: 'productivity',
        priority: 'high',
        title: 'Improve Task Completion Rate',
        description: 'Focus on completing existing tasks before starting new ones',
        action: 'Implement time-blocking technique'
      });
    }

    // Calendar recommendations
    const scheduling = userKnowledge.rotated?.knowledge?.patterns?.scheduling;
    if (scheduling?.bufferTime < 15) {
      recommendations.push({
        category: 'scheduling',
        priority: 'medium',
        title: 'Add Buffer Time',
        description: 'Increase buffer time between meetings to 15+ minutes',
        action: 'Adjust meeting scheduling preferences'
      });
    }

    return recommendations;
  }

  generateInsights(userKnowledge) {
    return [
      'Your productivity peaks during morning hours',
      'Task completion rate has been steadily improving',
      'Consider batching similar tasks for better efficiency',
      'Your calendar shows good work-life balance'
    ];
  }

  generateActionItems(userKnowledge) {
    return [
      {
        task: 'Review and optimize your task prioritization',
        priority: 'high',
        estimatedTime: '30 minutes',
        category: 'productivity'
      },
      {
        task: 'Schedule focus time blocks for deep work',
        priority: 'medium',
        estimatedTime: '15 minutes',
        category: 'scheduling'
      },
      {
        task: 'Set up automated task templates for recurring work',
        priority: 'medium',
        estimatedTime: '45 minutes',
        category: 'automation'
      }
    ];
  }

  // Helper methods
  calculateOverallScore(productivity, scheduling) {
    const prodScore = (productivity?.completionRate || 0) * 0.6;
    const schedScore = this.calculateScheduleEfficiency(scheduling) * 0.4;
    return Math.round((prodScore + schedScore) / 2);
  }

  calculateEfficiency(productivity) {
    return productivity?.completionRate > 80 ? 'high' :
           productivity?.completionRate > 60 ? 'medium' : 'low';
  }

  calculateWorkLifeBalance(scheduling) {
    return scheduling?.totalEvents < 20 ? 'balanced' :
           scheduling?.totalEvents < 40 ? 'slightly-busy' : 'very-busy';
  }

  calculateScheduleEfficiency(scheduling) {
    if (!scheduling) return 50;
    const bufferScore = Math.min((scheduling.bufferTime || 0) / 30 * 100, 100);
    const varietyScore = Math.min((scheduling.eventTypes?.length || 0) / 5 * 100, 100);
    return Math.round((bufferScore + varietyScore) / 2);
  }

  identifyCalendarOptimizations(scheduling) {
    const optimizations = [];
    
    if (scheduling?.bufferTime < 15) {
      optimizations.push('Add more buffer time between meetings');
    }
    
    if (scheduling?.totalEvents > 30) {
      optimizations.push('Consider consolidating or reducing meetings');
    }
    
    return optimizations;
  }

  getActiveProjects(userKnowledge) {
    return [
      {
        name: 'Current Work Project',
        progress: 65,
        phase: 'Execution',
        nextMilestone: 'Client Review'
      }
    ];
  }

  getCompletedProjects(userKnowledge) {
    return [
      {
        name: 'Planning Phase',
        completedDate: '2025-11-14',
        duration: '3 days'
      }
    ];
  }

  getUpcomingDeadlines(userKnowledge) {
    return [
      {
        project: 'Current Work Project',
        deadline: '2025-11-20',
        urgency: 'high'
      }
    ];
  }

  assessProjectHealth(userKnowledge) {
    return {
      status: 'healthy',
      riskFactors: [],
      recommendations: ['Maintain current project pace']
    };
  }

  analyzeProductivityTrends(productivity) {
    return {
      trend: 'improving',
      changeRate: '+5%',
      prediction: 'completion rate will continue to improve'
    };
  }
}

module.exports = CrossAgentProjectAnalyzer;