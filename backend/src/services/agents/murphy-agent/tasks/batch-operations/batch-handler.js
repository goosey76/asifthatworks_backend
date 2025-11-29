// Batch Operations Handler Module
// Handles batch operations for multiple tasks across different task lists

/**
 * Batch operations handler for task management
 */
class BatchOperationsHandler {
  constructor(taskOperations) {
    this.taskOperations = taskOperations;
  }

  /**
   * Batch operations for multiple tasks across different task lists
   * @param {Array} operations - Array of operations to perform
   * @param {string} userId - User ID for operations access
   * @returns {Promise<object>} Result with batch operation summary
   */
  async batchTaskOperations(operations, userId) {
    try {
      console.log(`MURPHY: Starting batch operations with ${operations.length} items`);
      
      const results = {
        successful: [],
        failed: [],
        summary: {
          total: operations.length,
          successful: 0,
          failed: 0
        }
      };

      for (const operation of operations) {
        try {
          let result;
          
          switch (operation.type) {
            case 'task_create':
              result = await this.taskOperations.createTask(operation.data, userId);
              break;
            case 'task_complete':
              result = await this.taskOperations.completeTask(operation.data, 'batch operation', userId);
              break;
            case 'task_update':
              result = await this.taskOperations.updateTask(operation.data, 'batch operation', userId);
              break;
            case 'task_delete':
              result = await this.taskOperations.deleteTask(operation.data, userId);
              break;
            case 'tasklist_create':
              result = await this.taskOperations.createTaskList(operation.data, userId);
              break;
            case 'tasklist_update':
              result = await this.taskOperations.updateTaskList(operation.data, userId);
              break;
            case 'tasklist_delete':
              result = await this.taskOperations.deleteTaskList(operation.data, userId);
              break;
            default:
              throw new Error(`Unknown operation type: ${operation.type}`);
          }
          
          if (result.success) {
            results.successful.push({
              type: operation.type,
              data: operation.data,
              result: result
            });
            results.summary.successful++;
          } else {
            results.failed.push({
              type: operation.type,
              data: operation.data,
              error: result.errors || ['Operation failed']
            });
            results.summary.failed++;
          }
          
        } catch (error) {
          results.failed.push({
            type: operation.type,
            data: operation.data,
            error: [error.message]
          });
          results.summary.failed++;
        }
      }

      console.log(`MURPHY: Batch operations completed - ${results.summary.successful} successful, ${results.summary.failed} failed`);
      
      return {
        details: results,
        success: results.summary.successful > 0
      };
      
    } catch (error) {
      console.error('MURPHY: Batch operations error:', error);
      
      return {
        details: null,
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
    const results = {
      completed: [],
      failed: []
    };

    for (let i = 0; i < tasksToComplete.length; i++) {
      try {
        const taskDetails = { existing_task_title: tasksToComplete[i] };
        const result = await this.taskOperations.completeTask(taskDetails, `complete multiple tasks`, userId);
        
        if (result.taskId) {
          results.completed.push(tasksToComplete[i]);
        } else {
          results.failed.push(tasksToComplete[i]);
        }
      } catch (error) {
        console.error(`Error completing task ${i + 1}:`, error);
        results.failed.push(tasksToComplete[i]);
      }
    }

    return {
      details: results
    };
  }

  /**
   * Batch creates multiple tasks with enhanced validation
   * @param {Array} tasks - Array of task details
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with creation summary
   */
  async createMultipleTasks(tasks, userId) {
    const results = {
      created: [],
      failed: []
    };

    console.log(`MURPHY: Starting batch creation of ${tasks.length} tasks for user ${userId}`);

    for (let i = 0; i < tasks.length; i++) {
      try {
        const task = tasks[i];
        const result = await this.taskOperations.createTask(task, userId);
        
        if (result.success) {
          results.created.push({
            title: task.task_description,
            dueDate: task.due_date || 'No due date',
            message: result.messageToUser,
            taskId: result.taskId
          });
        } else {
          results.failed.push({
            title: task.task_description || `Task ${i + 1}`,
            reason: result.errors?.join(', ') || 'Unknown error during creation'
          });
        }
      } catch (error) {
        console.error(`Error creating task ${i + 1}:`, error);
        results.failed.push({
          title: tasks[i].task_description || `Task ${i + 1}`,
          reason: `System error: ${error.message}`
        });
      }
    }

    console.log(`MURPHY: Batch creation completed - ${results.created.length} created, ${results.failed.length} failed`);

    return {
      details: results,
      success: results.created.length > 0
    };
  }

  /**
   * Batch processes multiple task updates
   * @param {Array} updates - Array of task update operations
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with update summary
   */
  async batchUpdateTasks(updates, userId) {
    const results = {
      updated: [],
      failed: []
    };

    for (let i = 0; i < updates.length; i++) {
      try {
        const update = updates[i];
        const result = await this.taskOperations.updateTask(update, 'batch update', userId);
        
        if (result.taskId) {
          results.updated.push({
            originalTitle: update.existing_task_title,
            updatedTitle: update.task_description || update.existing_task_title,
            taskId: result.taskId
          });
        } else {
          results.failed.push({
            originalTitle: update.existing_task_title || `Task ${i + 1}`,
            reason: 'Update operation failed'
          });
        }
      } catch (error) {
        console.error(`Error updating task ${i + 1}:`, error);
        results.failed.push({
          originalTitle: updates[i].existing_task_title || `Task ${i + 1}`,
          reason: `System error: ${error.message}`
        });
      }
    }

    return {
      details: results
    };
  }

  /**
   * Batch processes multiple task deletions
   * @param {Array} deletions - Array of task deletion operations
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with deletion summary
   */
  async batchDeleteTasks(deletions, userId) {
    const results = {
      deleted: [],
      failed: []
    };

    for (let i = 0; i < deletions.length; i++) {
      try {
        const deletion = deletions[i];
        const result = await this.taskOperations.deleteTask(deletion, userId);
        
        if (result.taskId) {
          results.deleted.push({
            title: deletion.existing_task_title || 'Unknown task',
            taskId: result.taskId
          });
        } else {
          results.failed.push({
            title: deletion.existing_task_title || `Task ${i + 1}`,
            reason: 'Delete operation failed'
          });
        }
      } catch (error) {
        console.error(`Error deleting task ${i + 1}:`, error);
        results.failed.push({
          title: deletions[i].existing_task_title || `Task ${i + 1}`,
          reason: `System error: ${error.message}`
        });
      }
    }

    return {
      details: results
    };
  }

  /**
   * Processes operations in parallel for better performance
   * @param {Array} operations - Array of operations to perform
   * @param {string} userId - User ID for operations access
   * @param {object} options - Processing options
   * @returns {Promise<object>} Result with parallel processing summary
   */
  async batchTaskOperationsParallel(operations, userId, options = {}) {
    const { maxConcurrency = 5 } = options;
    
    try {
      console.log(`MURPHY: Starting parallel batch operations with ${operations.length} items (max concurrency: ${maxConcurrency})`);
      
      const results = {
        successful: [],
        failed: [],
        summary: {
          total: operations.length,
          successful: 0,
          failed: 0,
          startTime: new Date().toISOString(),
          endTime: null
        }
      };

      // Process operations in batches to avoid overwhelming the API
      for (let i = 0; i < operations.length; i += maxConcurrency) {
        const batch = operations.slice(i, i + maxConcurrency);
        
        const batchPromises = batch.map(async (operation) => {
          try {
            let result;
            
            switch (operation.type) {
              case 'task_create':
                result = await this.taskOperations.createTask(operation.data, userId);
                break;
              case 'task_complete':
                result = await this.taskOperations.completeTask(operation.data, 'parallel batch operation', userId);
                break;
              case 'task_update':
                result = await this.taskOperations.updateTask(operation.data, 'parallel batch operation', userId);
                break;
              case 'task_delete':
                result = await this.taskOperations.deleteTask(operation.data, userId);
                break;
              case 'tasklist_create':
                result = await this.taskOperations.createTaskList(operation.data, userId);
                break;
              case 'tasklist_update':
                result = await this.taskOperations.updateTaskList(operation.data, userId);
                break;
              case 'tasklist_delete':
                result = await this.taskOperations.deleteTaskList(operation.data, userId);
                break;
              default:
                throw new Error(`Unknown operation type: ${operation.type}`);
            }
            
            return { operation, result, error: null };
            
          } catch (error) {
            return { operation, result: null, error: error.message };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        
        // Process batch results
        batchResults.forEach(({ operation, result, error }) => {
          if (error || !result.success) {
            results.failed.push({
              type: operation.type,
              data: operation.data,
              error: error ? [error] : (result.errors || ['Operation failed'])
            });
            results.summary.failed++;
          } else {
            results.successful.push({
              type: operation.type,
              data: operation.data,
              result: result
            });
            results.summary.successful++;
          }
        });
      }
      
      results.summary.endTime = new Date().toISOString();
      const duration = new Date(results.summary.endTime) - new Date(results.summary.startTime);
      console.log(`MURPHY: Parallel batch operations completed in ${duration}ms - ${results.summary.successful} successful, ${results.summary.failed} failed`);
      
      return {
        details: results,
        success: results.summary.successful > 0
      };
      
    } catch (error) {
      console.error('MURPHY: Parallel batch operations error:', error);
      
      return {
        details: null,
        success: false,
        errors: [error.message]
      };
    }
  }
}

module.exports = BatchOperationsHandler;