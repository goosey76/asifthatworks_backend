// Enhanced Task Operations Module - Main orchestrator class
// Handles both individual task operations and task list CRUD operations using modular components

const SingleTaskCreator = require('./task-operations/single-task-creator');
const TaskCrud = require('./task-operations/task-crud');
const { TaskValidator } = require('./validation');
const { TaskResponseFormatter } = require('./formatting');
const { BatchOperationsHandler } = require('./batch-operations');
const { SmartTaskOrganization } = require('./smart-organization');
const { TaskMatchingUtils } = require('./utils');
const TaskListOperations = require('./tasklist-operations');

/**
 * Enhanced task operations module - Main orchestrator
 * Delegates operations to specialized modular classes for both tasks and tasklists
 */
class TaskOperations {
  constructor(googleTasksClient) {
    this.tasksClient = googleTasksClient;
    
    // Initialize modular components
    this.taskValidator = new TaskValidator();
    this.formatter = new TaskResponseFormatter();
    this.taskMatching = new TaskMatchingUtils();
    this.smartOrganization = new SmartTaskOrganization();
    
    // Initialize core operation classes
    this.singleTaskCreator = new SingleTaskCreator(googleTasksClient);
    this.taskCrud = new TaskCrud(googleTasksClient);
    this.taskListOperations = new TaskListOperations(googleTasksClient);
    
    // Initialize batch operations handler
    this.batchHandler = new BatchOperationsHandler(this);
  }

  // ========================================
  // INDIVIDUAL TASK OPERATIONS
  // ========================================

  /**
   * Creates a new task with enhanced validation and error handling
   * @param {object} taskDetails - Task details including description and due date
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with creation status
   */
  async createTask(taskDetails, userId) {
    try {
      // Validate input parameters
      const userValidation = this.taskValidator.validateUserId(userId);
      if (!userValidation.isValid) {
        return {
          messageToUser: this.formatter.formatGeneralError('task creation', 'validation'),
          taskId: null,
          success: false,
          errors: userValidation.errors
        };
      }

      // Validate task creation details
      const validation = this.taskValidator.validateTaskCreation(taskDetails);
      if (!validation.isValid) {
        return {
          messageToUser: this.formatter.formatTaskCreationError(validation.errors),
          taskId: null,
          success: false,
          errors: validation.errors
        };
      }
      
      // Delegate to single task creator
      const result = await this.singleTaskCreator.createTask(taskDetails, userId);
      
      console.log(`MURPHY: Task creation completed for user ${userId}:`, {
        taskId: result.taskId,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      console.error('MURPHY: Task creation error:', error);
      
      let errorType = 'unexpected';
      if (error.message?.includes('Google Tasks')) errorType = 'google_tasks';
      else if (error.message?.includes('quota')) errorType = 'quota';
      
      return {
        messageToUser: this.formatter.formatGeneralError('task creation', errorType),
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Creates multiple tasks with enhanced validation and error handling
   * @param {Array} tasks - Array of task details
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with creation summary
   */
  async createMultipleTasks(tasks, userId) {
    // Validate batch operations
    const validation = this.taskValidator.validateBatchOperations(tasks);
    if (!validation.isValid) {
      return {
        messageToUser: `Murphy here: I couldn't create those tasks. ${validation.errors.join(' and ')}.`,
        taskId: null,
        success: false,
        errors: validation.errors
      };
    }

    // Use batch handler for creation
    const result = await this.batchHandler.createMultipleTasks(tasks, userId);
    
    return {
      messageToUser: this.formatter.formatBatchCreationSummary(result.details),
      taskId: null,
      details: result.details,
      success: result.success
    };
  }

  /**
   * Completes a task with enhanced matching and error handling
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with completion status
   */
  async completeTask(extractedDetails, originalMessage, userId) {
    try {
      // Validate input parameters
      const userValidation = this.taskValidator.validateUserId(userId);
      if (!userValidation.isValid) {
        return {
          messageToUser: this.formatter.formatGeneralError('task completion', 'validation'),
          taskId: null,
          success: false,
          errors: userValidation.errors
        };
      }

      // Validate extraction details
      const extractionValidation = this.taskValidator.validateTaskExtraction(extractedDetails);
      if (!extractionValidation.isValid) {
        return {
          messageToUser: this.formatter.formatTaskCompletionError(extractedDetails.existing_task_title),
          taskId: null,
          success: false,
          errors: extractionValidation.errors
        };
      }
      
      // Delegate to task CRUD
      const result = await this.taskCrud.completeTask(extractedDetails, originalMessage, userId);
      
      // Enhance response with formatter if needed
      if (!result.taskId) {
        const suggestions = this.taskMatching.generateTaskSuggestions(
          await this.getAllTasksForUser(userId), 
          extractedDetails.existing_task_title
        );
        result.messageToUser = this.formatter.formatTaskDeletionError(
          extractedDetails.existing_task_title, 
          suggestions
        );
      }
      
      return result;
      
    } catch (error) {
      console.error('MURPHY: Task completion error:', error);
      return {
        messageToUser: this.formatter.formatGeneralError('task completion', 'unexpected'),
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Gets all tasks for the user with enhanced formatting
   * @param {object} extractedDetails - Extracted details including filtering preferences
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with formatted task list
   */
  async getTasks(extractedDetails, originalMessage, userId) {
    try {
      // Validate user ID
      const userValidation = this.taskValidator.validateUserId(userId);
      if (!userValidation.isValid) {
        return {
          messageToUser: this.formatter.formatGeneralError('task retrieval', 'validation'),
          taskId: null,
          success: false,
          errors: userValidation.errors
        };
      }
      
      // Delegate to task CRUD
      const result = await this.taskCrud.getTasks(extractedDetails, originalMessage, userId);
      
      // Enhance formatting if we have tasks
      if (result.details && Array.isArray(result.details)) {
        result.messageToUser = this.formatter.formatTaskList(
          result.details, 
          originalMessage, 
          this.singleTaskCreator.dateUtils
        );
      }
      
      return result;
      
    } catch (error) {
      console.error('MURPHY: Task retrieval error:', error);
      return {
        messageToUser: this.formatter.formatGeneralError('task retrieval', 'unexpected'),
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Updates an existing task with enhanced matching
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with update status
   */
  async updateTask(extractedDetails, originalMessage, userId) {
    try {
      // Validate input parameters
      const userValidation = this.taskValidator.validateUserId(userId);
      const extractionValidation = this.taskValidator.validateTaskExtraction(extractedDetails);
      
      if (!userValidation.isValid || !extractionValidation.isValid) {
        return {
          messageToUser: this.formatter.formatTaskUpdateError(),
          taskId: null,
          success: false,
          errors: [...(userValidation.errors || []), ...(extractionValidation.errors || [])]
        };
      }
      
      // Delegate to task CRUD
      const result = await this.taskCrud.updateTask(extractedDetails, originalMessage, userId);
      
      return result;
      
    } catch (error) {
      console.error('MURPHY: Task update error:', error);
      return {
        messageToUser: this.formatter.formatGeneralError('task update', 'unexpected'),
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Deletes a task with enhanced error handling and suggestions
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with deletion status
   */
  async deleteTask(extractedDetails, userId) {
    try {
      // Validate input parameters
      const userValidation = this.taskValidator.validateUserId(userId);
      const extractionValidation = this.taskValidator.validateTaskExtraction(extractedDetails);
      
      if (!userValidation.isValid || !extractionValidation.isValid) {
        return {
          messageToUser: this.formatter.formatTaskDeletionError(
            extractedDetails.existing_task_title || 'Unknown task'
          ),
          taskId: null,
          success: false,
          errors: [...(userValidation.errors || []), ...(extractionValidation.errors || [])]
        };
      }
      
      // Delegate to task CRUD
      const result = await this.taskCrud.deleteTask(extractedDetails, userId);
      
      // Enhance with suggestions if deletion failed
      if (!result.success && extractedDetails.existing_task_title) {
        const allTasks = await this.getAllTasksForUser(userId);
        const suggestions = this.taskMatching.generateTaskSuggestions(allTasks, extractedDetails.existing_task_title);
        result.messageToUser = this.formatter.formatTaskDeletionError(extractedDetails.existing_task_title, suggestions);
      }
      
      return result;
      
    } catch (error) {
      console.error('MURPHY: Task deletion error:', error);
      return {
        messageToUser: this.formatter.formatGeneralError('task deletion', 'unexpected'),
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Batch completes multiple tasks
   * @param {Array} tasksToComplete - Array of task identifiers to complete
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with batch completion summary
   */
  async completeMultipleTasks(tasksToComplete, userId) {
    const result = await this.batchHandler.completeMultipleTasks(tasksToComplete, userId);
    
    let summaryMessage = `Murphy here:\n\n🎯 Batch Task Completion:\n`;
    
    if (result.details.completed.length > 0) {
      summaryMessage += `✅ Completed ${result.details.completed.length} task(s):\n`;
      result.details.completed.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task}\n`;
      });
    }

    if (result.details.failed.length > 0) {
      summaryMessage += `❌ Failed to complete ${result.details.failed.length} task(s):\n`;
      result.details.failed.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task}\n`;
      });
    }

    summaryMessage += '\n💪 Great job getting things done!';

    return {
      messageToUser: summaryMessage,
      taskId: null,
      details: result.details
    };
  }

  // ========================================
  // TASK LIST OPERATIONS (CRUD on task lists)
  // ========================================

  /**
   * Gets all task lists for the user
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with formatted tasklist list
   */
  async getTaskLists(userId) {
    return await this.taskListOperations.getTaskLists(userId);
  }

  /**
   * Creates a new task list
   * @param {object} tasklistDetails - Tasklist details including title
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with creation status
   */
  async createTaskList(tasklistDetails, userId) {
    // Validate task list creation
    const validation = this.taskValidator.validateTaskListCreation(tasklistDetails);
    if (!validation.isValid) {
      return {
        messageToUser: `Murphy here: I couldn't create that task list. ${validation.errors.join(' and ')}.`,
        taskId: null,
        success: false,
        errors: validation.errors
      };
    }
    
    return await this.taskListOperations.createTaskList(tasklistDetails, userId);
  }

  /**
   * Updates an existing task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with update status
   */
  async updateTaskList(extractedDetails, userId) {
    return await this.taskListOperations.updateTaskList(extractedDetails, userId);
  }

  /**
   * Deletes a task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with deletion status
   */
  async deleteTaskList(extractedDetails, userId) {
    return await this.taskListOperations.deleteTaskList(extractedDetails, userId);
  }

  /**
   * Gets detailed information about a specific task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with task list details
   */
  async getTaskListDetails(extractedDetails, userId) {
    return await this.taskListOperations.getTaskListDetails(extractedDetails, userId);
  }

  // ========================================
  // ENHANCED BATCH OPERATIONS
  // ========================================

  /**
   * Batch operations for multiple tasks across different task lists
   * @param {Array} operations - Array of operations to perform
   * @param {string} userId - User ID for operations access
   * @returns {Promise<object>} Result with batch operation summary
   */
  async batchTaskOperations(operations, userId) {
    // Validate batch operations
    const validation = this.taskValidator.validateBatchOperations(operations);
    if (!validation.isValid) {
      return {
        messageToUser: `Murphy here: I couldn't process those batch operations. ${validation.errors.join(' and ')}.`,
        details: null,
        success: false,
        errors: validation.errors
      };
    }
    
    const result = await this.batchHandler.batchTaskOperations(operations, userId);
    
    return {
      messageToUser: this.formatter.formatBatchOperationSummary(result.details),
      details: result.details,
      success: result.success
    };
  }

  // ========================================
  // INTELLIGENT TASK MANAGEMENT
  // ========================================

  /**
   * Smart task organization - auto-categorizes and organizes tasks
   * @param {object} extractedDetails - Extracted details for organization
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with organization status
   */
  async smartTaskOrganization(extractedDetails, originalMessage, userId) {
    try {
      console.log('MURPHY: Starting smart task organization');
      
      // Get all tasks
      const tasksResult = await this.getTasks(extractedDetails, originalMessage, userId);
      
      if (!tasksResult.success) {
        return tasksResult;
      }
      
      // Get all task lists
      const tasklistsResult = await this.getTaskLists(userId);
      
      if (!tasklistsResult.success) {
        return tasklistsResult;
      }
      
      const tasks = tasksResult.details || [];
      const tasklists = tasklistsResult.tasklists || [];
      
      // Auto-categorize tasks and suggest task list organization
      const categorizedTasks = this.smartOrganization.autoCategorizeTasks(tasks);
      const suggestions = this.smartOrganization.generateOrganizationSuggestions(categorizedTasks);
      
      const message = this.formatter.formatSmartOrganization(categorizedTasks, suggestions);
      
      return {
        messageToUser: message,
        categorizedTasks: categorizedTasks,
        suggestions: suggestions,
        organizationAnalysis: this.smartOrganization.analyzeTaskOrganization(categorizedTasks, suggestions),
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Smart organization error:', error);
      
      return {
        messageToUser: 'Murphy here: Hey, I couldn\'t organize your tasks. An unexpected error occurred.',
        success: false,
        errors: [error.message]
      };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Helper method to get all tasks for a user (for internal use)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getAllTasksForUser(userId) {
    try {
      const tasks = await this.tasksClient.getTasksClient(userId);
      const res = await tasks.tasks.list({
        tasklist: '@default',
        showCompleted: false,
        showHidden: false,
      });
      return res.data.items || [];
    } catch (error) {
      console.error('Error getting tasks for user:', error);
      return [];
    }
  }

  /**
   * Enhanced task matching with multiple strategies
   * @param {Array} tasks - Array of tasks
   * @param {object} searchCriteria - Search criteria
   * @returns {Array} Sorted matches with scores
   */
  enhancedTaskMatching(tasks, searchCriteria) {
    return this.taskMatching.enhancedTaskMatching(tasks, searchCriteria);
  }

  /**
   * Fuzzy search tasks
   * @param {Array} tasks - Array of tasks
   * @param {string} query - Search query
   * @param {number} threshold - Similarity threshold
   * @returns {Array} Fuzzy matched tasks with scores
   */
  fuzzySearchTasks(tasks, query, threshold = 0.6) {
    return this.taskMatching.fuzzySearchTasks(tasks, query, threshold);
  }
}

module.exports = TaskOperations;
