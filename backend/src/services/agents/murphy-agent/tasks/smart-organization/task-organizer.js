// Smart Task Organization Module
// Handles intelligent task categorization and organization suggestions

/**
 * Smart task organization class for intelligent task management
 */
class SmartTaskOrganization {
  /**
   * Smart task organization - auto-categorizes and organizes tasks
   * @param {object} categorizedTasks - Categorized tasks object
   * @param {Array} suggestions - Organization suggestions
   * @returns {object} Organization analysis results
   */
  analyzeTaskOrganization(categorizedTasks, suggestions) {
    return {
      categorizedTasks,
      suggestions,
      totalTasks: this.getTotalTaskCount(categorizedTasks),
      organizationScore: this.calculateOrganizationScore(categorizedTasks),
      priorityTasks: this.identifyPriorityTasks(categorizedTasks),
      timeSensitiveTasks: this.identifyTimeSensitiveTasks(categorizedTasks)
    };
  }

  /**
   * Auto-categorizes tasks based on keywords
   * @param {Array} tasks - Array of tasks to categorize
   * @returns {object} Categorized tasks
   */
  autoCategorizeTasks(tasks) {
    const categories = {
      work: [],
      personal: [],
      health: [],
      home: [],
      learning: []
    };
    
    const keywords = {
      work: ['meeting', 'project', 'deadline', 'work', 'office', 'client', 'presentation', 'report', 'email', 'call', 'conference'],
      personal: ['birthday', 'anniversary', 'vacation', 'personal', 'family', 'friend', 'social', 'gift', 'party'],
      health: ['doctor', 'exercise', 'gym', 'workout', 'meditation', 'health', 'appointment', 'checkup', 'medicine', 'therapy'],
      home: ['clean', 'repair', 'grocery', 'shopping', 'house', 'home', 'appliance', 'maintenance', 'laundry', 'cooking'],
      learning: ['course', 'study', 'learn', 'read', 'book', 'education', 'training', 'skill', 'exam', 'research']
    };
    
    tasks.forEach(task => {
      const title = (task.title || '').toLowerCase();
      let categorized = false;
      
      for (const [category, categoryKeywords] of Object.entries(keywords)) {
        if (categoryKeywords.some(keyword => title.includes(keyword))) {
          categories[category].push(task);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categories.personal.push(task); // Default to personal
      }
    });
    
    return categories;
  }

  /**
   * Generates organization suggestions based on categorized tasks
   * @param {object} categorizedTasks - Categorized tasks object
   * @returns {Array} Organization suggestions
   */
  generateOrganizationSuggestions(categorizedTasks) {
    const suggestions = [];
    
    Object.entries(categorizedTasks).forEach(([category, tasks]) => {
      if (tasks.length >= 3) {
        suggestions.push(`Consider creating a "${category}" task list for better organization`);
      }
      
      // Check for due date clustering
      const tasksWithDueDates = tasks.filter(task => task.due);
      if (tasksWithDueDates.length >= 2) {
        suggestions.push(`You have ${tasksWithDueDates.length} ${category} tasks with due dates - consider time-blocking`);
      }
    });
    
    // Priority-based suggestions
    const highPriorityCount = Object.values(categorizedTasks)
      .flat().filter(task => task.priority === 'high').length;
    
    if (highPriorityCount >= 2) {
      suggestions.push('Focus on high-priority tasks first - they\'re driving your progress');
    }
    
    return suggestions;
  }

  /**
   * Calculates organization score based on task distribution
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {number} Organization score (0-100)
   */
  calculateOrganizationScore(categorizedTasks) {
    const totalTasks = this.getTotalTaskCount(categorizedTasks);
    if (totalTasks === 0) return 100;
    
    let score = 100;
    
    // Penalize for too many uncategorized tasks
    const personalTasks = categorizedTasks.personal.length;
    const otherTasks = totalTasks - personalTasks;
    
    if (personalTasks > totalTasks * 0.6) {
      score -= 20; // Too many personal tasks might indicate poor categorization
    }
    
    // Bonus for balanced distribution across categories
    const categories = Object.keys(categorizedTasks).filter(key => key !== 'personal');
    const usedCategories = categories.filter(cat => categorizedTasks[cat].length > 0);
    
    if (usedCategories.length >= 3) {
      score += 10; // Good distribution
    }
    
    // Check for task list organization opportunities
    const categoriesWithMultipleTasks = categories.filter(cat => categorizedTasks[cat].length >= 3);
    score -= categoriesWithMultipleTasks.length * 5; // Each category with 3+ tasks could benefit from a dedicated list
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identifies priority tasks across all categories
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {object} Priority tasks by category
   */
  identifyPriorityTasks(categorizedTasks) {
    const priorityTasks = {
      urgent: [],
      high: [],
      medium: [],
      low: []
    };
    
    Object.entries(categorizedTasks).forEach(([category, tasks]) => {
      tasks.forEach(task => {
        const priority = this.determineTaskPriority(task);
        if (priorityTasks[priority]) {
          priorityTasks[priority].push({
            ...task,
            category,
            priority
          });
        }
      });
    });
    
    return priorityTasks;
  }

  /**
   * Determines priority level for a task
   * @param {object} task - Task object
   * @returns {string} Priority level
   */
  determineTaskPriority(task) {
    const title = (task.title || '').toLowerCase();
    const dueDate = task.due ? new Date(task.due) : null;
    
    // Check for explicit priority indicators
    if (title.includes('urgent') || title.includes('asap') || title.includes('critical')) {
      return 'urgent';
    }
    
    // Check for time sensitivity
    if (dueDate) {
      const now = new Date();
      const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 1) return 'urgent';
      if (daysDiff <= 3) return 'high';
      if (daysDiff <= 7) return 'medium';
    }
    
    // Check for priority keywords
    const highPriorityKeywords = ['important', 'priority', 'deadline', 'due'];
    const mediumPriorityKeywords = ['should', 'need to', 'plan to'];
    
    if (highPriorityKeywords.some(keyword => title.includes(keyword))) {
      return 'high';
    }
    
    if (mediumPriorityKeywords.some(keyword => title.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Identifies time-sensitive tasks
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {object} Time-sensitive tasks by urgency
   */
  identifyTimeSensitiveTasks(categorizedTasks) {
    const timeSensitive = {
      overdue: [],
      dueToday: [],
      dueThisWeek: [],
      noDueDate: []
    };
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    Object.values(categorizedTasks).flat().forEach(task => {
      if (!task.due) {
        timeSensitive.noDueDate.push(task);
      } else {
        const taskDue = new Date(task.due).toISOString().split('T')[0];
        
        if (taskDue < today) {
          timeSensitive.overdue.push(task);
        } else if (taskDue === today) {
          timeSensitive.dueToday.push(task);
        } else if (taskDue <= weekFromNow) {
          timeSensitive.dueThisWeek.push(task);
        }
      }
    });
    
    return timeSensitive;
  }

  /**
   * Gets total task count across all categories
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {number} Total task count
   */
  getTotalTaskCount(categorizedTasks) {
    return Object.values(categorizedTasks).reduce((total, tasks) => total + tasks.length, 0);
  }

  /**
   * Generates smart scheduling suggestions
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {Array} Scheduling suggestions
   */
  generateSchedulingSuggestions(categorizedTasks) {
    const suggestions = [];
    const totalTasks = this.getTotalTaskCount(categorizedTasks);
    
    if (totalTasks > 20) {
      suggestions.push('You have many tasks - consider breaking larger tasks into smaller subtasks');
    }
    
    // Analyze task distribution by category for scheduling
    Object.entries(categorizedTasks).forEach(([category, tasks]) => {
      if (tasks.length >= 5) {
        suggestions.push(`Consider dedicating specific time blocks for ${category} tasks`);
      }
      
      const tasksWithDueDates = tasks.filter(task => task.due);
      if (tasksWithDueDates.length >= 3) {
        const urgentTasks = tasksWithDueDates.filter(task => {
          const dueDate = new Date(task.due);
          const daysDiff = (dueDate - new Date()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 2;
        });
        
        if (urgentTasks.length >= 2) {
          suggestions.push(`Focus on ${urgentTasks.length} urgent ${category} tasks first`);
        }
      }
    });
    
    return suggestions;
  }

  /**
   * Analyzes task completion patterns
   * @param {Array} tasks - Array of tasks with completion status
   * @returns {object} Completion pattern analysis
   */
  analyzeCompletionPatterns(tasks) {
    const patterns = {
      completionRate: 0,
      averageCompletionTime: 0,
      commonCompletionDays: {},
      categoryPreferences: {}
    };
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    patterns.completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Analyze completion patterns by category
    const categoryCompletion = {};
    completedTasks.forEach(task => {
      const category = task.category || 'uncategorized';
      if (!categoryCompletion[category]) {
        categoryCompletion[category] = { completed: 0, total: 0 };
      }
      categoryCompletion[category].completed++;
    });
    
    // Calculate category preferences
    Object.entries(categoryCompletion).forEach(([category, stats]) => {
      const totalTasksInCategory = tasks.filter(task => (task.category || 'uncategorized') === category).length;
      stats.total = totalTasksInCategory;
      stats.rate = totalTasksInCategory > 0 ? (stats.completed / totalTasksInCategory) * 100 : 0;
    });
    
    patterns.categoryPreferences = categoryCompletion;
    
    return patterns;
  }

  /**
   * Suggests optimal task prioritization
   * @param {object} categorizedTasks - Categorized tasks
   * @returns {Array} Prioritized task suggestions
   */
  suggestTaskPrioritization(categorizedTasks) {
    const suggestions = [];
    
    // Get all tasks with priority scores
    const allTasks = Object.entries(categorizedTasks).flatMap(([category, tasks]) => 
      tasks.map(task => ({ ...task, category, priorityScore: this.calculatePriorityScore(task) }))
    );
    
    // Sort by priority score
    allTasks.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Suggest top priorities
    if (allTasks.length > 0) {
      suggestions.push(`Start with: "${allTasks[0].title}" (${allTasks[0].category})`);
    }
    
    if (allTasks.length > 1) {
      suggestions.push(`Follow up with: "${allTasks[1].title}" (${allTasks[1].category})`);
    }
    
    // Group suggestions by time sensitivity
    const urgentTasks = allTasks.filter(task => this.determineTaskPriority(task) === 'urgent');
    if (urgentTasks.length > 0) {
      suggestions.push(`Focus on ${urgentTasks.length} urgent tasks first`);
    }
    
    return suggestions;
  }

  /**
   * Calculates priority score for a task
   * @param {object} task - Task object
   * @returns {number} Priority score
   */
  calculatePriorityScore(task) {
    let score = 0;
    
    // Base score
    score += 10;
    
    // Due date urgency
    if (task.due) {
      const dueDate = new Date(task.due);
      const daysDiff = (dueDate - new Date()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 0) score += 50; // Overdue
      else if (daysDiff <= 1) score += 40; // Due today
      else if (daysDiff <= 3) score += 30; // Due soon
      else if (daysDiff <= 7) score += 20; // Due this week
    } else {
      score += 5; // No due date gets small boost for flexibility
    }
    
    // Task title keywords
    const title = (task.title || '').toLowerCase();
    if (title.includes('urgent') || title.includes('asap')) score += 30;
    if (title.includes('important') || title.includes('priority')) score += 20;
    if (title.includes('deadline') || title.includes('due')) score += 15;
    
    // Category weight (work tasks typically higher priority)
    const category = this.getTaskCategory(title);
    if (category === 'work') score += 10;
    else if (category === 'health') score += 8;
    else if (category === 'learning') score += 5;
    
    return score;
  }

  /**
   * Gets task category from title
   * @param {string} title - Task title
   * @returns {string} Category
   */
  getTaskCategory(title) {
    const keywords = {
      work: ['meeting', 'project', 'deadline', 'work', 'office', 'client'],
      health: ['doctor', 'exercise', 'gym', 'workout', 'health', 'appointment'],
      personal: ['birthday', 'anniversary', 'vacation', 'family', 'friend'],
      home: ['clean', 'repair', 'grocery', 'house', 'appliance'],
      learning: ['course', 'study', 'learn', 'read', 'book', 'education']
    };
    
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => title.includes(keyword))) {
        return category;
      }
    }
    
    return 'personal';
  }
}

module.exports = SmartTaskOrganization;