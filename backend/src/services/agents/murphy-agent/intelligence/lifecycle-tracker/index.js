// Project Lifecycle Tracker and Timeline Analysis
// Tracks project phases, identifies bottlenecks, and predicts completion

const EventEmitter = require('events');

class ProjectLifecycleTracker extends EventEmitter {
  constructor() {
    super();
    this.projectPhases = new Map(); // projectId -> phase data
    this.timelineData = new Map(); // projectId -> timeline analytics
    this.completionPredictions = new Map(); // projectId -> prediction data
    this.phaseTemplates = this.initializePhaseTemplates();
  }

  /**
   * Initialize phase templates for different project types
   */
  initializePhaseTemplates() {
    return {
      'work_project': {
        phases: ['Planning', 'Development', 'Review', 'Deployment', 'Maintenance'],
        phaseDurations: {
          'Planning': 7, // days
          'Development': 14,
          'Review': 3,
          'Deployment': 2,
          'Maintenance': 7
        },
        phaseDependencies: {
          'Planning': [],
          'Development': ['Planning'],
          'Review': ['Development'],
          'Deployment': ['Review'],
          'Maintenance': ['Deployment']
        },
        phaseKeywords: {
          'Planning': ['plan', 'design', 'requirements', 'specification'],
          'Development': ['build', 'develop', 'code', 'implement', 'create'],
          'Review': ['review', 'test', 'validate', 'verify', 'check'],
          'Deployment': ['deploy', 'release', 'launch', 'go-live'],
          'Maintenance': ['support', 'fix', 'update', 'maintain']
        }
      },
      'personal_project': {
        phases: ['Research', 'Setup', 'Implementation', 'Review'],
        phaseDurations: {
          'Research': 5,
          'Setup': 3,
          'Implementation': 10,
          'Review': 2
        },
        phaseDependencies: {
          'Research': [],
          'Setup': ['Research'],
          'Implementation': ['Setup'],
          'Review': ['Implementation']
        },
        phaseKeywords: {
          'Research': ['research', 'investigate', 'explore', 'learn'],
          'Setup': ['setup', 'install', 'configure', 'prepare'],
          'Implementation': ['implement', 'execute', 'build', 'create'],
          'Review': ['review', 'evaluate', 'assess', 'complete']
        }
      }
    };
  }

  /**
   * Track project lifecycle based on events and tasks
   */
  trackProjectLifecycle(projectId, projectData) {
    try {
      const projectType = this.classifyProjectType(projectData);
      const template = this.phaseTemplates[projectType];
      
      if (!template) {
        throw new Error(`No template found for project type: ${projectType}`);
      }

      // Analyze current project state
      const currentPhase = this.identifyCurrentPhase(projectData, template);
      const phaseProgress = this.calculatePhaseProgress(projectData, currentPhase, template);
      const timelineAnalysis = this.analyzeTimeline(projectData, template);
      
      // Store lifecycle data
      const lifecycleData = {
        projectId,
        projectType,
        template,
        currentPhase,
        phaseProgress,
        timelineAnalysis,
        lastUpdated: new Date().toISOString(),
        milestones: this.identifyMilestones(projectData, template),
        bottlenecks: this.identifyBottlenecks(projectData, template),
        completionPrediction: this.predictCompletion(projectData, template)
      };

      this.projectPhases.set(projectId, lifecycleData);
      
      // Emit lifecycle updated event
      this.emit('lifecycleUpdated', { projectId, lifecycleData });
      
      return lifecycleData;

    } catch (error) {
      console.error('Project lifecycle tracking error:', error);
      throw error;
    }
  }

  /**
   * Classify project type based on content analysis
   */
  classifyProjectType(projectData) {
    const content = [
      ...projectData.events?.map(e => `${e.summary || ''} ${e.description || ''}`) || [],
      ...projectData.tasks?.map(t => `${t.title || ''} ${t.notes || ''}`) || []
    ].join(' ').toLowerCase();

    // Score each project type based on keyword matching
    const scores = {};
    for (const [type, template] of Object.entries(this.phaseTemplates)) {
      scores[type] = 0;
      
      // Count keyword matches
      for (const [phase, keywords] of Object.entries(template.phaseKeywords)) {
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            scores[type]++;
          }
        }
      }
    }

    // Return type with highest score
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  /**
   * Identify current project phase
   */
  identifyCurrentPhase(projectData, template) {
    const content = [
      ...projectData.events?.map(e => `${e.summary || ''} ${e.description || ''}`) || [],
      ...projectData.tasks?.map(t => `${t.title || ''} ${t.notes || ''}`) || []
    ].join(' ').toLowerCase();

    // Find phase with most keyword matches in recent activity
    const phaseScores = {};
    for (const [phase, keywords] of Object.entries(template.phaseKeywords)) {
      phaseScores[phase] = keywords.reduce((score, keyword) => {
        return score + (content.match(new RegExp(keyword, 'g')) || []).length;
      }, 0);
    }

    // Return phase with highest score
    const currentPhase = Object.entries(phaseScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return currentPhase || template.phases[0];
  }

  /**
   * Calculate progress within current phase
   */
  calculatePhaseProgress(projectData, currentPhase, template) {
    const phaseIndex = template.phases.indexOf(currentPhase);
    const totalPhases = template.phases.length;
    
    // Base progress calculation
    let progress = (phaseIndex / totalPhases) * 100;
    
    // Add phase-specific progress indicators
    const phaseKeywords = template.phaseKeywords[currentPhase] || [];
    const recentContent = this.getRecentActivityContent(projectData, 7); // Last 7 days
    
    let keywordMatches = 0;
    for (const keyword of phaseKeywords) {
      const matches = (recentContent.match(new RegExp(keyword, 'g')) || []).length;
      keywordMatches += matches;
    }
    
    // Adjust progress based on activity
    if (keywordMatches > 5) progress += 10;
    else if (keywordMatches > 2) progress += 5;
    
    return Math.min(Math.max(progress, 0), 100);
  }

  /**
   * Analyze project timeline for patterns and insights
   */
  analyzeTimeline(projectData, template) {
    const events = projectData.events || [];
    const tasks = projectData.tasks || [];
    
    // Extract all dates
    const eventDates = events.map(e => new Date(e.start?.dateTime || e.start?.date)).filter(d => !isNaN(d));
    const taskDates = tasks.map(t => new Date(t.due || t.updated)).filter(d => !isNaN(d));
    const allDates = [...eventDates, ...taskDates].sort((a, b) => a - b);
    
    if (allDates.length === 0) {
      return {
        startDate: null,
        endDate: null,
        duration: 0,
        phaseDurations: {},
        timelineHealth: 'unknown'
      };
    }

    const startDate = allDates[0];
    const endDate = allDates[allDates.length - 1];
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // days
    
    // Calculate average time per phase
    const phaseDurations = {};
    const currentDate = new Date();
    for (let i = 0; i < template.phases.length; i++) {
      const phase = template.phases[i];
      const phaseStart = new Date(startDate);
      phaseStart.setDate(phaseStart.getDate() + i * template.phaseDurations[phase]);
      const phaseEnd = new Date(phaseStart);
      phaseEnd.setDate(phaseEnd.getDate() + template.phaseDurations[phase]);
      
      phaseDurations[phase] = {
        planned: template.phaseDurations[phase],
        actual: i < template.phases.length - 1 ? 
          Math.ceil((Math.min(phaseEnd, currentDate) - phaseStart) / (1000 * 60 * 60 * 24)) :
          Math.ceil((currentDate - phaseStart) / (1000 * 60 * 60 * 24)),
        onTrack: phaseEnd >= currentDate
      };
    }

    // Determine timeline health
    let timelineHealth = 'healthy';
    const delayedPhases = Object.values(phaseDurations).filter(p => !p.onTrack).length;
    if (delayedPhases > template.phases.length * 0.5) {
      timelineHealth = 'behind';
    } else if (delayedPhases > 0) {
      timelineHealth = 'at-risk';
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      phaseDurations,
      timelineHealth,
      activity: this.calculateActivityRate(allDates)
    };
  }

  /**
   * Identify project milestones
   */
  identifyMilestones(projectData, template) {
    const milestones = [];
    const events = projectData.events || [];
    const tasks = projectData.tasks || [];
    
    // Phase transition milestones
    template.phases.forEach((phase, index) => {
      const phaseStartDate = new Date();
      phaseStartDate.setDate(phaseStartDate.getDate() + index * template.phaseDurations[phase]);
      
      milestones.push({
        id: `${template.phases.join('-')}-${phase}`,
        name: `${phase} Phase Start`,
        date: phaseStartDate.toISOString(),
        type: 'phase_start',
        phase,
        critical: index === 0 || index === template.phases.length - 1
      });
    });

    return milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Identify timeline bottlenecks
   */
  identifyBottlenecks(projectData, template) {
    const bottlenecks = [];
    const events = projectData.events || [];
    const tasks = projectData.tasks || [];
    
    // Check for long gaps between activities
    const sortedActivities = [
      ...events.map(e => ({ date: new Date(e.start?.dateTime || e.start?.date), type: 'event' })),
      ...tasks.map(t => ({ date: new Date(t.due || t.updated), type: 'task' }))
    ].filter(a => !isNaN(a.date)).sort((a, b) => a.date - b.date);
    
    for (let i = 1; i < sortedActivities.length; i++) {
      const gap = (sortedActivities[i].date - sortedActivities[i - 1].date) / (1000 * 60 * 60 * 24);
      if (gap > 7) { // More than 7 days gap
        bottlenecks.push({
          type: 'activity_gap',
          severity: gap > 14 ? 'high' : 'medium',
          description: `${Math.round(gap)} days gap between activities`,
          date: sortedActivities[i].date.toISOString(),
          impact: 'schedule'
        });
      }
    }

    return bottlenecks;
  }

  /**
   * Predict project completion
   */
  predictCompletion(projectData, template) {
    const currentDate = new Date();
    const tasks = projectData.tasks || [];
    
    // Calculate current progress
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;
    
    // Estimate remaining time based on current velocity
    const remainingTasks = totalTasks - completedTasks;
    const avgTaskTime = this.estimateAverageTaskTime(tasks);
    const estimatedRemainingDays = remainingTasks * avgTaskTime;
    
    // Calculate completion date
    const completionDate = new Date(currentDate);
    completionDate.setDate(completionDate.getDate() + estimatedRemainingDays);
    
    // Calculate confidence based on data quality
    const dataQuality = this.calculateDataQuality(projectData);
    const confidence = Math.min(dataQuality * 0.8 + (1 - dataQuality) * 0.5, 0.9);
    
    return {
      estimatedCompletionDate: completionDate.toISOString(),
      confidence,
      confidenceLevel: this.getConfidenceLevel(confidence),
      factors: {
        taskProgress,
        remainingTasks,
        averageTaskTime: avgTaskTime,
        dataQuality
      },
      scenarios: this.generateCompletionScenarios(projectData, template)
    };
  }

  /**
   * Get confidence level from score
   */
  getConfidenceLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very-low';
  }

  /**
   * Helper methods
   */
  getRecentActivityContent(projectData, days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentEvents = (projectData.events || []).filter(e => {
      const date = new Date(e.start?.dateTime || e.start?.date);
      return date >= cutoff;
    });
    
    const recentTasks = (projectData.tasks || []).filter(t => {
      const date = new Date(t.updated || t.due);
      return date >= cutoff;
    });
    
    return [
      ...recentEvents.map(e => `${e.summary || ''} ${e.description || ''}`),
      ...recentTasks.map(t => `${t.title || ''} ${t.notes || ''}`)
    ].join(' ');
  }

  calculateActivityRate(dates) {
    if (dates.length < 2) return 0;
    
    const totalDays = Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24));
    return dates.length / totalDays; // activities per day
  }

  estimateAverageTaskTime(tasks) {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.due);
    if (completedTasks.length === 0) return 2; // Default 2 days
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created || Date.now());
      const due = new Date(task.due);
      return sum + (due - created) / (1000 * 60 * 60 * 24);
    }, 0);
    
    return Math.max(totalTime / completedTasks.length, 0.5); // Minimum 0.5 days
  }

  calculateDataQuality(projectData) {
    let quality = 0;
    let factors = 0;
    
    // Events quality
    if (projectData.events && projectData.events.length > 0) {
      quality += 0.3;
    }
    factors++;
    
    // Tasks quality
    if (projectData.tasks && projectData.tasks.length > 0) {
      quality += 0.3;
    }
    factors++;
    
    // Task completion data
    const completedTasks = (projectData.tasks || []).filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      quality += 0.2;
    }
    factors++;
    
    // Date information quality
    const hasDates = (projectData.events || []).some(e => e.start?.dateTime || e.start?.date) ||
                    (projectData.tasks || []).some(t => t.due || t.updated);
    if (hasDates) {
      quality += 0.2;
    }
    factors++;
    
    return quality;
  }

  generateCompletionScenarios(projectData, template) {
    // Generate optimistic, realistic, and pessimistic scenarios
    return {
      optimistic: this.calculateScenario(projectData, template, 0.8),
      realistic: this.calculateScenario(projectData, template, 1.0),
      pessimistic: this.calculateScenario(projectData, template, 1.3)
    };
  }

  calculateScenario(projectData, template, multiplier) {
    const tasks = projectData.tasks || [];
    const remainingTasks = tasks.filter(t => t.status !== 'completed').length;
    const avgTaskTime = this.estimateAverageTaskTime(tasks);
    const daysToComplete = remainingTasks * avgTaskTime * multiplier;
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);
    
    return {
      estimatedDays: daysToComplete,
      completionDate: completionDate.toISOString(),
      probability: multiplier === 1.0 ? 0.6 : (multiplier < 1.0 ? 0.2 : 0.2)
    };
  }

  /**
   * Get lifecycle data for a project
   */
  getProjectLifecycle(projectId) {
    return this.projectPhases.get(projectId);
  }

  /**
   * Get all tracked projects
   */
  getAllProjectLifecycles() {
    const result = {};
    for (const [projectId, data] of this.projectPhases) {
      result[projectId] = data;
    }
    return result;
  }

  /**
   * Remove lifecycle data for a project
   */
  removeProjectLifecycle(projectId) {
    this.projectPhases.delete(projectId);
    this.timelineData.delete(projectId);
    this.completionPredictions.delete(projectId);
  }

  /**
   * Update lifecycle data
   */
  updateProjectLifecycle(projectId, projectData) {
    return this.trackProjectLifecycle(projectId, projectData);
  }
}

module.exports = ProjectLifecycleTracker;