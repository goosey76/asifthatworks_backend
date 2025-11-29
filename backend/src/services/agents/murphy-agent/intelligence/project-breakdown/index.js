// Intelligent Project Breakdown Suggestions
// Provides context-aware project breakdown recommendations based on user patterns

class IntelligentProjectBreakdown {
  constructor() {
    this.projectTemplates = this.initializeProjectTemplates();
    this.userPatterns = new Map(); // userId -> pattern data
    this.breakdownHistory = new Map(); // userId -> successful breakdowns
    this.templateMatching = new Map(); // projectId -> matched template
  }

  /**
   * Initialize enhanced project templates with detailed breakdowns
   */
  initializeProjectTemplates() {
    return {
      'work_project': {
        name: 'Work Project',
        phases: [
          {
            name: 'Planning',
            duration: '1-2 weeks',
            tasks: [
              'requirements_gathering',
              'stakeholder_analysis',
              'resource_planning',
              'risk_assessment',
              'project_charter'
            ],
            deliverables: ['Project Charter', 'Requirements Document', 'Risk Register'],
            successCriteria: ['Clear objectives defined', 'Stakeholder buy-in', 'Resources allocated']
          },
          {
            name: 'Design',
            duration: '1-2 weeks', 
            tasks: [
              'solution_design',
              'technical_architecture',
              'ui_ux_design',
              'prototype_creation',
              'design_review'
            ],
            deliverables: ['Design Documents', 'Architecture Diagram', 'UI/UX Mockups'],
            successCriteria: ['Design approved', 'Architecture validated', 'Stakeholder sign-off']
          },
          {
            name: 'Development',
            duration: '3-6 weeks',
            tasks: [
              'sprint_planning',
              'feature_development',
              'code_reviews',
              'unit_testing',
              'integration_testing'
            ],
            deliverables: ['Working Software', 'Test Documentation', 'Code Repository'],
            successCriteria: ['Features implemented', 'Tests passing', 'Code quality met']
          },
          {
            name: 'Testing',
            duration: '1-2 weeks',
            tasks: [
              'test_planning',
              'functional_testing',
              'performance_testing',
              'user_acceptance_testing',
              'bug_fixing'
            ],
            deliverables: ['Test Results', 'Bug Reports', 'User Acceptance Sign-off'],
            successCriteria: ['All tests passed', 'User approval', 'Performance targets met']
          },
          {
            name: 'Deployment',
            duration: '1 week',
            tasks: [
              'deployment_planning',
              'production_deployment',
              'monitoring_setup',
              'user_training',
              'go_live'
            ],
            deliverables: ['Live System', 'Deployment Guide', 'Training Materials'],
            successCriteria: ['Successful deployment', 'System operational', 'Users trained']
          },
          {
            name: 'Maintenance',
            duration: 'Ongoing',
            tasks: [
              'monitoring',
              'bug_fixes',
              'performance_optimization',
              'user_support',
              'updates'
            ],
            deliverables: ['Maintenance Plan', 'Support Documentation', 'Update Logs'],
            successCriteria: ['System stable', 'Users satisfied', 'Issues resolved']
          }
        ],
        contextPatterns: ['client', 'stakeholder', 'business', 'corporate', 'professional'],
        complexity: 'high'
      },
      'personal_project': {
        name: 'Personal Project',
        phases: [
          {
            name: 'Ideation',
            duration: '1-2 weeks',
            tasks: [
              'idea_validation',
              'research',
              'feasibility_study',
              'goal_setting',
              'initial_planning'
            ],
            deliverables: ['Project Idea', 'Research Summary', 'Initial Plan'],
            successCriteria: ['Idea validated', 'Goals defined', 'Feasibility confirmed']
          },
          {
            name: 'Planning',
            duration: '1 week',
            tasks: [
              'detailed_planning',
              'resource_gathering',
              'timeline_creation',
              'milestone_definition'
            ],
            deliverables: ['Project Plan', 'Resource List', 'Timeline'],
            successCriteria: ['Plan complete', 'Resources ready', 'Timeline realistic']
          },
          {
            name: 'Execution',
            duration: '2-8 weeks',
            tasks: [
              'task_execution',
              'progress_monitoring',
              'adjustments',
              'quality_checks'
            ],
            deliverables: ['Work Products', 'Progress Reports', 'Adjustments Log'],
            successCriteria: ['Progress on track', 'Quality maintained', 'Adjustments managed']
          },
          {
            name: 'Completion',
            duration: '1 week',
            tasks: [
              'final_review',
              'documentation',
              'celebration',
              'knowledge_sharing'
            ],
            deliverables: ['Final Product', 'Documentation', 'Lessons Learned'],
            successCriteria: ['Objectives met', 'Documentation complete', 'Satisfaction achieved']
          }
        ],
        contextPatterns: ['personal', 'hobby', 'learning', 'self-improvement', 'fun'],
        complexity: 'medium'
      },
      'learning_project': {
        name: 'Learning Project',
        phases: [
          {
            name: 'Foundation',
            duration: '2-3 weeks',
            tasks: [
              'basics_learning',
              'fundamental_concepts',
              'resource_identification',
              'learning_path_creation'
            ],
            deliverables: ['Learning Plan', 'Resource Library', 'Concept Map'],
            successCriteria: ['Basics understood', 'Resources identified', 'Path clear']
          },
          {
            name: 'Practice',
            duration: '4-6 weeks',
            tasks: [
              'guided_exercises',
              'hands_on_projects',
              'skill_application',
              'feedback_collection'
            ],
            deliverables: ['Practice Work', 'Skill Assessments', 'Progress Tracker'],
            successCriteria: ['Skills improved', 'Confidence gained', 'Progress measurable']
          },
          {
            name: 'Application',
            duration: '3-4 weeks',
            tasks: [
              'real_world_projects',
              'problem_solving',
              'creative_application',
              'peer_collaboration'
            ],
            deliverables: ['Portfolio Projects', 'Solutions', 'Collaboration Evidence'],
            successCriteria: ['Knowledge applied', 'Problems solved', 'Portfolio built']
          },
          {
            name: 'Mastery',
            duration: '2-3 weeks',
            tasks: [
              'advanced_challenges',
              'teaching_others',
              'knowledge_sharing',
              'continuous_improvement'
            ],
            deliverables: ['Advanced Work', 'Teaching Materials', 'Improvement Plan'],
            successCriteria: ['Expertise demonstrated', 'Others taught', 'Continuous plan created']
          }
        ],
        contextPatterns: ['study', 'course', 'skill', 'knowledge', 'education', 'training'],
        complexity: 'medium'
      },
      'event_planning': {
        name: 'Event Planning',
        phases: [
          {
            name: 'Concept',
            duration: '1-2 weeks',
            tasks: [
              'event_concept',
              'budget_planning',
              'venue_research',
              'guest_list_planning'
            ],
            deliverables: ['Event Concept', 'Budget', 'Venue Options', 'Guest List'],
            successCriteria: ['Concept approved', 'Budget set', 'Venue options available']
          },
          {
            name: 'Organization',
            duration: '2-4 weeks',
            tasks: [
              'vendor_booking',
              'logistics_planning',
              'schedule_creation',
              'communication_plan'
            ],
            deliverables: ['Vendor Contracts', 'Logistics Plan', 'Event Schedule'],
            successCriteria: ['Vendors booked', 'Logistics planned', 'Schedule finalized']
          },
          {
            name: 'Preparation',
            duration: '1-2 weeks',
            tasks: [
              'final_preparations',
              'rehearsal',
              'staff_training',
              'equipment_check'
            ],
            deliverables: ['Preparation Checklist', 'Rehearsal Results', 'Training Materials'],
            successCriteria: ['Everything ready', 'Team trained', 'Rehearsal successful']
          },
          {
            name: 'Execution',
            duration: 'Event Day',
            tasks: [
              'event_management',
              'problem_solving',
              'guest_coordination',
              'quality_monitoring'
            ],
            deliverables: ['Event Success', 'Problem Resolution Log', 'Guest Satisfaction'],
            successCriteria: ['Event runs smoothly', 'Guests satisfied', 'Objectives met']
          },
          {
            name: 'Follow-up',
            duration: '1 week',
            tasks: [
              'thank_you_notes',
              'feedback_collection',
              'cleanup',
              'post_event_analysis'
            ],
            deliverables: ['Thank You Notes', 'Feedback Summary', 'Lessons Learned'],
            successCriteria: ['Gratitude expressed', 'Feedback gathered', 'Learnings captured']
          }
        ],
        contextPatterns: ['event', 'party', 'conference', 'wedding', 'celebration', 'meeting'],
        complexity: 'high'
      }
    };
  }

  /**
   * Generate intelligent project breakdown suggestions
   */
  generateProjectBreakdown(projectData, userId, options = {}) {
    try {
      // Analyze project characteristics
      const projectAnalysis = this.analyzeProjectCharacteristics(projectData);
      
      // Find best matching template
      const matchedTemplate = this.findBestMatchingTemplate(projectAnalysis, options);
      
      // Adapt template based on user patterns
      const adaptedBreakdown = this.adaptBreakdownToUser(matchedTemplate, userId, projectAnalysis);
      
      // Generate specific task suggestions
      const taskSuggestions = this.generateTaskSuggestions(adaptedBreakdown, projectAnalysis, userId);
      
      // Create timeline suggestions
      const timelineSuggestions = this.generateTimelineSuggestions(adaptedBreakdown, projectAnalysis);
      
      const breakdown = {
        projectId: projectData.id || this.generateProjectId(),
        originalData: projectData,
        analysis: projectAnalysis,
        template: matchedTemplate,
        breakdown: adaptedBreakdown,
        taskSuggestions,
        timelineSuggestions,
        confidence: this.calculateBreakdownConfidence(projectAnalysis, matchedTemplate),
        reasoning: this.generateReasoning(matchedTemplate, projectAnalysis),
        alternatives: this.generateAlternativeBreakdowns(projectAnalysis, options)
      };

      // Store successful breakdown for learning
      this.storeBreakdownHistory(userId, breakdown);

      return breakdown;

    } catch (error) {
      console.error('Project breakdown generation error:', error);
      throw error;
    }
  }

  /**
   * Analyze project characteristics for template matching
   */
  analyzeProjectCharacteristics(projectData) {
    const content = [
      ...projectData.events?.map(e => `${e.summary || ''} ${e.description || ''} ${e.location || ''}`) || [],
      ...projectData.tasks?.map(t => `${t.title || ''} ${t.notes || ''}`) || []
    ].join(' ').toLowerCase();

    const analysis = {
      keywords: this.extractKeywords(content),
      complexity: this.assessComplexity(projectData),
      duration: this.estimateDuration(projectData),
      scope: this.assessScope(projectData),
      stakeholders: this.identifyStakeholders(content),
      deliverableTypes: this.identifyDeliverableTypes(content),
      timeConstraints: this.assessTimeConstraints(projectData),
      resourceRequirements: this.assessResourceRequirements(content)
    };

    return analysis;
  }

  /**
   * Extract meaningful keywords from project content
   */
  extractKeywords(content) {
    const words = content.split(/\s+/).filter(word => 
      word.length > 3 && 
      !this.isStopWord(word.toLowerCase())
    );

    const keywordFreq = {};
    words.forEach(word => {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    });

    // Return top keywords
    return Object.entries(keywordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, freq]) => ({ word, frequency: freq }));
  }

  /**
   * Assess project complexity
   */
  assessComplexity(projectData) {
    let complexityScore = 0;
    
    // Event count factor
    const eventCount = projectData.events?.length || 0;
    complexityScore += Math.min(eventCount * 0.1, 2);
    
    // Task count factor
    const taskCount = projectData.tasks?.length || 0;
    complexityScore += Math.min(taskCount * 0.05, 1.5);
    
    // Time span factor
    const timeSpan = this.calculateTimeSpan(projectData);
    complexityScore += Math.min(timeSpan * 0.02, 1);
    
    // Stakeholder count factor
    const stakeholderCount = this.identifyStakeholders(
      [projectData.events?.map(e => e.description), projectData.tasks?.map(t => t.notes)]
        .flat().join(' ').toLowerCase()
    ).length;
    complexityScore += Math.min(stakeholderCount * 0.3, 1.5);

    if (complexityScore < 2) return 'low';
    if (complexityScore < 4) return 'medium';
    return 'high';
  }

  /**
   * Find best matching template for project
   */
  findBestMatchingTemplate(projectAnalysis, options = {}) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [templateId, template] of Object.entries(this.projectTemplates)) {
      const score = this.calculateTemplateMatchScore(template, projectAnalysis);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { id: templateId, ...template, matchScore: score };
      }
    }

    // If no good match found, use a default template
    if (bestScore < 0.3) {
      return { 
        id: 'default', 
        name: 'Generic Project', 
        matchScore: 0.3,
        phases: this.createDefaultPhases(projectAnalysis)
      };
    }

    return bestMatch;
  }

  /**
   * Calculate how well a template matches the project
   */
  calculateTemplateMatchScore(template, projectAnalysis) {
    let score = 0;
    
    // Keyword matching
    const templateKeywords = template.contextPatterns || [];
    const projectKeywords = projectAnalysis.keywords.map(k => k.word);
    
    const matchingKeywords = templateKeywords.filter(keyword => 
      projectKeywords.some(pKeyword => pKeyword.includes(keyword) || keyword.includes(pKeyword))
    );
    
    score += (matchingKeywords.length / templateKeywords.length) * 0.4;
    
    // Complexity matching
    if (template.complexity === projectAnalysis.complexity) {
      score += 0.3;
    } else if (
      (template.complexity === 'high' && projectAnalysis.complexity === 'medium') ||
      (template.complexity === 'medium' && projectAnalysis.complexity === 'low')
    ) {
      score += 0.2;
    }
    
    // Duration matching (simplified)
    if (template.estimatedDuration === projectAnalysis.duration) {
      score += 0.2;
    }
    
    // Scope matching
    if (template.scope === projectAnalysis.scope) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Adapt breakdown based on user patterns and preferences
   */
  adaptBreakdownToUser(template, userId, projectAnalysis) {
    const userPattern = this.userPatterns.get(userId) || {};
    const adaptedPhases = [...template.phases];

    // Adapt phases based on user completion patterns
    adaptedPhases.forEach((phase, index) => {
      const userPhaseHistory = userPattern.phases?.[phase.name] || {};
      
      // Adjust duration based on user's historical completion times
      if (userPhaseHistory.averageDuration) {
        const adjustmentFactor = this.calculateDurationAdjustment(userPhaseHistory.averageDuration, phase.duration);
        phase.duration = this.adjustPhaseDuration(phase.duration, adjustmentFactor);
      }
      
      // Adjust task complexity based on user preferences
      if (userPhaseHistory.preferredTaskSize) {
        phase.tasks = this.adjustTaskSize(phase.tasks, userPhaseHistory.preferredTaskSize);
      }
      
      // Add personal context
      phase.personalContext = this.generatePersonalContext(phase, userPattern);
    });

    return {
      ...template,
      phases: adaptedPhases,
      adaptations: this.generateAdaptationNotes(adaptedPhases, userPattern)
    };
  }

  /**
   * Generate specific task suggestions for each phase
   */
  generateTaskSuggestions(breakdown, projectAnalysis, userId) {
    const suggestions = {};

    breakdown.phases.forEach(phase => {
      const baseTasks = phase.tasks || [];
      const contextualTasks = this.generateContextualTasks(phase, projectAnalysis);
      const personalizedTasks = this.generatePersonalizedTasks(phase, userId);
      
      suggestions[phase.name] = {
        base: baseTasks,
        contextual: contextualTasks,
        personalized: personalizedTasks,
        priority: this.assignTaskPriorities([...baseTasks, ...contextualTasks, ...personalizedTasks]),
        estimatedEffort: this.estimateTaskEffort([...baseTasks, ...contextualTasks, ...personalizedTasks])
      };
    });

    return suggestions;
  }

  /**
   * Generate timeline suggestions for the breakdown
   */
  generateTimelineSuggestions(breakdown, projectAnalysis) {
    const timeline = {
      phases: [],
      milestones: [],
      criticalPath: [],
      bufferTime: []
    };

    let currentDate = new Date();
    
    breakdown.phases.forEach((phase, index) => {
      const phaseDuration = this.parsePhaseDuration(phase.duration);
      const phaseEnd = new Date(currentDate);
      phaseEnd.setDate(phaseEnd.getDate() + phaseDuration);
      
      timeline.phases.push({
        name: phase.name,
        startDate: currentDate.toISOString(),
        endDate: phaseEnd.toISOString(),
        duration: phaseDuration,
        dependencies: this.getPhaseDependencies(breakdown, phase.name)
      });
      
      // Add milestone for phase completion
      timeline.milestones.push({
        name: `${phase.name} Complete`,
        date: phaseEnd.toISOString(),
        phase: phase.name,
        critical: this.isCriticalMilestone(phase, index)
      });
      
      // Add buffer time
      if (index < breakdown.phases.length - 1) {
        const bufferDays = this.calculateBufferTime(phase, breakdown.phases[index + 1]);
        const bufferStart = new Date(phaseEnd);
        bufferStart.setDate(bufferStart.getDate() + 1);
        const bufferEnd = new Date(bufferStart);
        bufferEnd.setDate(bufferEnd.getDate() + bufferDays);
        
        timeline.bufferTime.push({
          startDate: bufferStart.toISOString(),
          endDate: bufferEnd.toISOString(),
          duration: bufferDays,
          reason: 'Transition buffer'
        });
        
        currentDate = bufferEnd;
      } else {
        currentDate = phaseEnd;
      }
    });

    return timeline;
  }

  /**
   * Generate alternative breakdown options
   */
  generateAlternativeBreakdowns(projectAnalysis, options) {
    const alternatives = [];
    
    // Generate simplified version
    alternatives.push({
      id: 'simplified',
      name: 'Simplified Approach',
      description: 'Condensed version with fewer phases',
      phases: this.createSimplifiedBreakdown(projectAnalysis),
     适用场景: 'Tight timeline or limited resources'
    });

    // Generate detailed version
    alternatives.push({
      id: 'detailed',
      name: 'Detailed Approach',
      description: 'Comprehensive breakdown with more granular tasks',
      phases: this.createDetailedBreakdown(projectAnalysis),
     适用场景: 'Complex project requiring thorough planning'
    });

    return alternatives;
  }

  /**
   * Calculate confidence in breakdown suggestions
   */
  calculateBreakdownConfidence(projectAnalysis, template) {
    let confidence = 0;
    
    // Template match confidence
    confidence += template.matchScore * 0.4;
    
    // Data completeness
    const completeness = this.assessDataCompleteness(projectAnalysis);
    confidence += completeness * 0.3;
    
    // Historical success
    const historicalSuccess = this.assessHistoricalSuccess(template, projectAnalysis);
    confidence += historicalSuccess * 0.2;
    
    // User pattern match
    const patternMatch = this.assessUserPatternMatch(projectAnalysis);
    confidence += patternMatch * 0.1;

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Generate reasoning for breakdown suggestions
   */
  generateReasoning(template, projectAnalysis) {
    const reasoning = [];
    
    reasoning.push(`Template selected: ${template.name} (${Math.round(template.matchScore * 100)}% match)`);
    
    if (template.matchScore > 0.7) {
      reasoning.push('Strong template match based on project characteristics and context.');
    } else if (template.matchScore > 0.5) {
      reasoning.push('Moderate template match with some customizations applied.');
    } else {
      reasoning.push('Limited template match, using generic breakdown with adjustments.');
    }

    // Add complexity reasoning
    reasoning.push(`Complexity assessed as ${projectAnalysis.complexity} based on project scope and requirements.`);

    // Add timeline reasoning
    reasoning.push(`Estimated duration: ${projectAnalysis.duration}, adapted for user patterns.`);

    return reasoning;
  }

  /**
   * Helper methods for task generation and analysis
   */
  generateContextualTasks(phase, projectAnalysis) {
    const contextualTasks = [];
    
    // Add tasks based on project-specific keywords
    const relevantKeywords = projectAnalysis.keywords
      .filter(k => k.frequency > 2)
      .slice(0, 5)
      .map(k => k.word);
    
    relevantKeywords.forEach(keyword => {
      contextualTasks.push(`${keyword}_research`);
      contextualTasks.push(`${keyword}_implementation`);
    });

    return contextualTasks;
  }

  generatePersonalizedTasks(phase, userId) {
    // This would integrate with user's historical patterns
    // For now, return empty array
    return [];
  }

  assignTaskPriorities(tasks) {
    return tasks.map((task, index) => ({
      task,
      priority: index < tasks.length * 0.3 ? 'high' : 
                index < tasks.length * 0.7 ? 'medium' : 'low',
      reason: this.getPriorityReason(task, index, tasks.length)
    }));
  }

  estimateTaskEffort(tasks) {
    return tasks.map(task => ({
      task,
      estimatedHours: this.estimateTaskHours(task),
      complexity: this.assessTaskComplexity(task)
    }));
  }

  // Additional helper methods would be implemented here...
  isStopWord(word) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return stopWords.includes(word);
  }

  calculateTimeSpan(projectData) {
    const dates = [
      ...(projectData.events || []).map(e => new Date(e.start?.dateTime || e.start?.date)).filter(d => !isNaN(d)),
      ...(projectData.tasks || []).map(t => new Date(t.due || t.updated)).filter(d => !isNaN(d))
    ].sort((a, b) => a - b);
    
    if (dates.length < 2) return 1;
    return Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24));
  }

  identifyStakeholders(content) {
    const stakeholderKeywords = ['client', 'customer', 'manager', 'team', 'stakeholder', 'user', 'audience'];
    return stakeholderKeywords.filter(keyword => content.includes(keyword));
  }

  identifyDeliverableTypes(content) {
    const deliverableTypes = [];
    if (content.includes('document') || content.includes('report')) deliverableTypes.push('documentation');
    if (content.includes('presentation')) deliverableTypes.push('presentation');
    if (content.includes('software') || content.includes('app') || content.includes('system')) deliverableTypes.push('software');
    if (content.includes('design') || content.includes('mockup')) deliverableTypes.push('design');
    return deliverableTypes;
  }

  assessTimeConstraints(projectData) {
    // Simplified assessment based on due dates
    const tasks = projectData.tasks || [];
    const urgentTasks = tasks.filter(t => {
      if (!t.due) return false;
      const daysToDue = (new Date(t.due) - new Date()) / (1000 * 60 * 60 * 24);
      return daysToDue <= 7 && t.priority === 'high';
    });
    
    return urgentTasks.length > 0 ? 'tight' : 'moderate';
  }

  assessResourceRequirements(content) {
    const resourceKeywords = ['team', 'budget', 'equipment', 'software', 'external'];
    const resourceMentions = resourceKeywords.filter(keyword => content.includes(keyword));
    return resourceMentions.length > 2 ? 'high' : resourceMentions.length > 0 ? 'medium' : 'low';
  }

  parsePhaseDuration(duration) {
    // Parse duration string like "1-2 weeks" to number of days
    if (typeof duration === 'number') return duration;
    
    const match = duration.match(/(\d+)-?(\d+)?\s*(day|week|month)/);
    if (!match) return 7; // Default 7 days
    
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    const unit = match[3];
    
    const days = (min + max) / 2;
    switch (unit) {
      case 'day': return Math.round(days);
      case 'week': return Math.round(days * 7);
      case 'month': return Math.round(days * 30);
      default: return 7;
    }
  }

  generateProjectId() {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder methods for complex logic
  estimateDuration() { return 'moderate'; }
  assessScope() { return 'medium'; }
  createDefaultPhases() { return []; }
  calculateDurationAdjustment() { return 1.0; }
  adjustPhaseDuration() { return '1 week'; }
  adjustTaskSize() { return []; }
  generatePersonalContext() { return {}; }
  generateAdaptationNotes() { return []; }
  getPhaseDependencies() { return []; }
  isCriticalMilestone() { return false; }
  calculateBufferTime() { return 2; }
  createSimplifiedBreakdown() { return []; }
  createDetailedBreakdown() { return []; }
  assessDataCompleteness() { return 0.5; }
  assessHistoricalSuccess() { return 0.5; }
  assessUserPatternMatch() { return 0.5; }
  getPriorityReason() { return 'Standard priority'; }
  estimateTaskHours() { return 4; }
  assessTaskComplexity() { return 'medium'; }

  /**
   * Store breakdown history for learning
   */
  storeBreakdownHistory(userId, breakdown) {
    if (!this.breakdownHistory.has(userId)) {
      this.breakdownHistory.set(userId, []);
    }
    
    const history = this.breakdownHistory.get(userId);
    history.push({
      ...breakdown,
      createdAt: new Date().toISOString(),
      success: false // Would be updated based on user feedback
    });
    
    // Keep only last 50 breakdowns
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }
}

module.exports = IntelligentProjectBreakdown;