// Task Matching Utilities Module
// Handles intelligent task matching and search algorithms

/**
 * Task matching utilities for finding and identifying tasks
 */
class TaskMatchingUtils {
  /**
   * Finds the best matching task from a list
   * @param {Array} tasks - Array of tasks to search through
   * @param {string} searchTitle - Title to match against
   * @param {string} context - Additional context for matching
   * @returns {object|null} Best matching task or null
   */
  findBestMatchingTask(tasks, searchTitle, context = '') {
    if (!Array.isArray(tasks) || !searchTitle) {
      return null;
    }

    const searchLower = searchTitle.toLowerCase().trim();
    
    // First try exact match
    let match = tasks.find(task =>
      task.title && task.title.toLowerCase() === searchLower
    );
    
    if (match) return match;
    
    // Then try partial matches with better scoring
    const matches = tasks
      .filter(task => task.title && task.title.toLowerCase().includes(searchLower))
      .map(task => ({
        task,
        score: this.calculateMatchScore(task.title, searchTitle, context)
      }))
      .sort((a, b) => b.score - a.score);
    
    return matches.length > 0 ? matches[0].task : null;
  }

  /**
   * Calculates match score between task title and search term
   * @param {string} taskTitle - Task title
   * @param {string} searchTerm - Search term
   * @param {string} context - Additional context
   * @returns {number} Match score (higher is better)
   */
  calculateMatchScore(taskTitle, searchTerm, context = '') {
    const title = taskTitle.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    // Exact match gets highest score
    if (title === search) return 100;
    
    // Start of title match gets high score
    if (title.startsWith(search)) return 80;
    
    // Contains match gets medium score
    if (title.includes(search)) return 60;
    
    // Word boundary matches get bonus
    const words = search.split(' ');
    if (words.some(word => title.includes(word))) return 40;
    
    // Context-based scoring
    if (context) {
      const contextWords = context.toLowerCase().split(' ');
      if (contextWords.some(word => title.includes(word))) return 30;
    }
    
    return 0;
  }

  /**
   * Enhanced task matching with multiple strategies
   * @param {Array} tasks - Array of tasks
   * @param {object} searchCriteria - Search criteria
   * @returns {Array} Sorted matches with scores
   */
  enhancedTaskMatching(tasks, searchCriteria) {
    const { title, taskId, context, fuzzyMatch = true } = searchCriteria;
    
    if (!Array.isArray(tasks)) {
      return [];
    }

    let matches = [];

    // Strategy 1: Direct ID match
    if (taskId) {
      const idMatch = tasks.find(task => task.id === taskId);
      if (idMatch) {
        matches.push({ task: idMatch, score: 100, strategy: 'id_match' });
      }
    }

    // Strategy 2: Exact title match
    if (title) {
      const exactMatches = tasks.filter(task =>
        task.title && task.title.toLowerCase() === title.toLowerCase()
      );
      exactMatches.forEach(task => {
        matches.push({ task, score: 90, strategy: 'exact_match' });
      });
    }

    // Strategy 3: Partial title matching
    if (title && fuzzyMatch) {
      const partialMatches = tasks
        .filter(task => {
          const taskTitle = task.title || '';
          const searchTitle = title.toLowerCase();
          
          return taskTitle.toLowerCase().includes(searchTitle) ||
                 searchTitle.toLowerCase().includes(taskTitle.toLowerCase()) ||
                 // Remove emojis and special characters for comparison
                 taskTitle.replace(/[^\w\s]/gi, '').toLowerCase().includes(searchTitle) ||
                 searchTitle.toLowerCase().includes(taskTitle.replace(/[^\w\s]/gi, '').toLowerCase());
        })
        .map(task => ({
          task,
          score: this.calculateMatchScore(task.title, title, context),
          strategy: 'partial_match'
        }));
      
      matches = matches.concat(partialMatches);
    }

    // Strategy 4: Context-based matching
    if (context) {
      const contextMatches = tasks
        .filter(task => {
          const contextWords = context.toLowerCase().split(' ');
          const taskTitle = (task.title || '').toLowerCase();
          
          return contextWords.some(word => 
            word.length > 2 && taskTitle.includes(word)
          );
        })
        .map(task => ({
          task,
          score: this.calculateMatchScore(task.title, title || '', context),
          strategy: 'context_match'
        }));
      
      matches = matches.concat(contextMatches);
    }

    // Remove duplicates and sort by score
    const uniqueMatches = matches.filter((match, index, self) =>
      index === self.findIndex(m => m.task.id === match.task.id)
    );

    return uniqueMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 matches
  }

  /**
   * Searches for tasks with multiple criteria
   * @param {Array} tasks - Array of tasks to search
   * @param {object} criteria - Search criteria
   * @returns {Array} Matching tasks
   */
  searchTasks(tasks, criteria) {
    const {
      title,
      status,
      dueDate,
      priority,
      category,
      completedAfter,
      completedBefore
    } = criteria;

    return tasks.filter(task => {
      // Title search
      if (title && !(task.title || '').toLowerCase().includes(title.toLowerCase())) {
        return false;
      }

      // Status filter
      if (status && task.status !== status) {
        return false;
      }

      // Due date filter
      if (dueDate && task.due !== dueDate) {
        return false;
      }

      // Priority filter
      if (priority && task.priority !== priority) {
        return false;
      }

      // Category filter
      if (category && task.category !== category) {
        return false;
      }

      // Completion date filters
      if (completedAfter && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const afterDate = new Date(completedAfter);
        if (completedDate < afterDate) {
          return false;
        }
      }

      if (completedBefore && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const beforeDate = new Date(completedBefore);
        if (completedDate > beforeDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generates helpful suggestions when task not found
   * @param {Array} tasks - Available tasks
   * @param {string} searchTerm - Original search term
   * @param {number} maxSuggestions - Maximum number of suggestions
   * @returns {string} Suggestion message
   */
  generateTaskSuggestions(tasks, searchTerm, maxSuggestions = 3) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return 'Your task list is currently empty.';
    }
    
    // Find similar tasks
    const similarTasks = tasks
      .filter(task => task.title)
      .map(task => ({
        title: task.title,
        score: this.calculateMatchScore(task.title, searchTerm)
      }))
      .filter(item => item.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
    
    if (similarTasks.length > 0) {
      const taskNames = similarTasks.map(item => `"${item.title}"`).join(', ');
      return `Did you mean one of these: ${taskNames}?`;
    }
    
    return 'Here are your current tasks that you could reference: ' +
           tasks.slice(0, maxSuggestions).map(task => `"${task.title}"`).join(', ') + '.';
  }

  /**
   * Finds tasks by fuzzy text matching
   * @param {Array} tasks - Array of tasks
   * @param {string} query - Search query
   * @param {number} threshold - Similarity threshold (0-1)
   * @returns {Array} Fuzzy matched tasks with scores
   */
  fuzzySearchTasks(tasks, query, threshold = 0.6) {
    if (!Array.isArray(tasks) || !query) {
      return [];
    }

    return tasks
      .map(task => {
        const title = task.title || '';
        const similarity = this.calculateSimilarity(title, query);
        
        return {
          task,
          similarity,
          matchedText: this.findMatchingText(title, query)
        };
      })
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculates text similarity using Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const distance = matrix[len1][len2];
    return 1 - distance / Math.max(len1, len2);
  }

  /**
   * Finds the matching text between two strings
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {string} Matching portion
   */
  findMatchingText(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          return word1.length > word2.length ? word1 : word2;
        }
      }
    }
    
    return '';
  }

  /**
   * Suggests task titles based on partial input
   * @param {Array} tasks - Array of existing tasks
   * @param {string} partial - Partial title input
   * @param {number} maxSuggestions - Maximum suggestions
   * @returns {Array} Suggested titles
   */
  suggestTaskTitles(tasks, partial, maxSuggestions = 5) {
    if (!Array.isArray(tasks) || !partial) {
      return [];
    }

    const partialLower = partial.toLowerCase();
    
    const suggestions = tasks
      .filter(task => task.title && task.title.toLowerCase().includes(partialLower))
      .map(task => ({
        title: task.title,
        relevance: this.calculateMatchScore(task.title, partial)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions)
      .map(item => item.title);

    return suggestions;
  }

  /**
   * Groups similar tasks together
   * @param {Array} tasks - Array of tasks
   * @param {number} similarityThreshold - Threshold for grouping
   * @returns {Array} Groups of similar tasks
   */
  groupSimilarTasks(tasks, similarityThreshold = 0.7) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return [];
    }

    const groups = [];
    const processed = new Set();

    for (let i = 0; i < tasks.length; i++) {
      if (processed.has(i)) continue;

      const currentTask = tasks[i];
      const group = [currentTask];
      processed.add(i);

      // Find similar tasks
      for (let j = i + 1; j < tasks.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateSimilarity(
          currentTask.title || '',
          tasks[j].title || ''
        );

        if (similarity >= similarityThreshold) {
          group.push(tasks[j]);
          processed.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Validates task matching criteria
   * @param {object} criteria - Matching criteria
   * @returns {object} Validation result
   */
  validateMatchingCriteria(criteria) {
    const errors = [];
    
    if (!criteria) {
      errors.push('Matching criteria are required');
      return { isValid: false, errors };
    }

    if (!criteria.title && !criteria.taskId) {
      errors.push('At least one of title or taskId must be provided');
    }

    if (criteria.title && typeof criteria.title !== 'string') {
      errors.push('Title must be a string');
    }

    if (criteria.taskId && typeof criteria.taskId !== 'string') {
      errors.push('TaskId must be a string');
    }

    if (criteria.fuzzyMatch && typeof criteria.fuzzyMatch !== 'boolean') {
      errors.push('FuzzyMatch must be a boolean');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }
}

module.exports = TaskMatchingUtils;