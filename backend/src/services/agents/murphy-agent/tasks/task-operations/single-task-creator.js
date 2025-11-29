// Single task creation module
const dateUtils = require('../../utils/date-utils');

/**
 * Handles single task creation operations
 */
class SingleTaskCreator {
  constructor(googleTasksClient) {
    this.tasksClient = googleTasksClient;
    this.dateUtils = dateUtils;
  }

  /**
   * Creates a new task with enhanced validation and error handling
   * @param {object} taskDetails - Task details including description and due date
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with creation status
   */
  async createTask(taskDetails, userId) {
    try {
      // Validate task details first
      const validation = this.isValidForCreation(taskDetails);
      if (!validation.isValid) {
        return {
          messageToUser: `Murphy here: Hey, I couldn't create that task. ${validation.errors.join(' and ')}.`,
          taskId: null,
          success: false,
          errors: validation.errors
        };
      }
      
      const tasks = await this.tasksClient.getTasksClient(userId);
      
      const taskResource = {
        title: taskDetails.task_description.trim(),
      };
      
      // Use enhanced date parsing with due_time support
      // Default: no due date unless specifically requested
      if (taskDetails.due_date) {
        try {
          taskResource.due = this.dateUtils.parseDueDate(taskDetails.due_date, taskDetails.due_time);
        } catch (dateError) {
          console.error('Date parsing error:', dateError);
          return {
            messageToUser: `Murphy here: Hey, I couldn't create that task. Invalid date format provided.`,
            taskId: null,
            success: false,
            errors: ['Invalid date format']
          };
        }
      }

      const result = await tasks.tasks.insert({
        tasklist: '@default',
        requestBody: taskResource,
      });
      
      // Create a clean, motivating response format
      const dueText = this.dateUtils.formatDateForDisplay(taskDetails.due_date, taskDetails.due_time);
      
      // Create varied, motivating response templates
      const responseTemplates = [
        `Murphy here:\nGot it!\nI added:\n${taskDetails.task_description}\nDue: ${dueText}\nAll set, Chief!`,
        
        `Murphy here:\nPerfect!\nAdded to your list:\n${taskDetails.task_description}\nDue: ${dueText}\nReady to tackle this!`,
        
        `Murphy here:\nDone!\nI created:\n${taskDetails.task_description}\nDue: ${dueText}\nStay focused, Chief!`,
        
        `Murphy here:\nGot your back!\nAdded task:\n${taskDetails.task_description}\nDue: ${dueText}\nOne step closer!`,
        
        `Murphy here:\nAll set!\nI filed:\n${taskDetails.task_description}\nDue: ${dueText}\nYou're on fire today!`
      ];
      
      // Select a random response template for variety
      const randomTemplate = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
      
      console.log(`MURPHY: Task created successfully for user ${userId}:`, {
        taskId: result.data?.id,
        description: taskDetails.task_description,
        dueDate: taskDetails.due_date
      });
      
      return {
        messageToUser: randomTemplate,
        taskId: result.data?.id,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Task creation error:', error);
      
      // Provide user-friendly error messages based on error type
      let errorMessage = 'Murphy here: Hey, I couldn\'t create that task. An unexpected error occurred.';
      
      if (error.message?.includes('Google Tasks')) {
        errorMessage = 'Murphy here: Hey, I couldn\'t create that task. Google Tasks isn\'t connected properly.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Murphy here: Hey, I couldn\'t create that task. Too many requests - please try again in a moment.';
      }
      
      return {
        messageToUser: errorMessage,
        taskId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Validates task creation parameters with enhanced validation
   * @param {object} taskDetails - Task details to validate
   * @returns {object} Validation result with isValid boolean and error messages
   */
  isValidForCreation(taskDetails) {
    const errors = [];
    
    if (!taskDetails) {
      errors.push('Task details are required');
      return { isValid: false, errors };
    }
    
    if (!taskDetails.task_description || taskDetails.task_description.trim().length === 0) {
      errors.push('Task description is required');
    } else if (taskDetails.task_description.trim().length > 500) {
      errors.push('Task description is too long (max 500 characters)');
    }
    
    // Validate due date format if provided
    if (taskDetails.due_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(taskDetails.due_date)) {
        errors.push('Invalid due date format (expected YYYY-MM-DD)');
      } else {
        const dueDate = new Date(taskDetails.due_date);
        if (isNaN(dueDate.getTime())) {
          errors.push('Due date is not a valid date');
        }
      }
    }
    
    // Validate due time format if provided
    if (taskDetails.due_time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(taskDetails.due_time)) {
        errors.push('Invalid due time format (expected HH:MM)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  /**
   * Creates multiple tasks (batch processing)
   * @param {Array} tasks - Array of task details
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with creation summary
   */
  /**
   * Creates multiple tasks with enhanced validation and error handling
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

    // Validate each task before attempting creation
    for (let i = 0; i < tasks.length; i++) {
      try {
        const task = tasks[i];
        
        // Validate task using the enhanced validation
        const validation = this.isValidForCreation(task);
        if (validation.isValid) {
          const result = await this.createTask(task, userId);
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
        } else {
          results.failed.push({
            title: task.task_description || `Task ${i + 1}`,
            reason: validation.errors?.join(', ') || 'Invalid task details'
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

    // Generate comprehensive summary
    let summaryMessage = `Murphy here:\n\n📝 Task Creation Summary:\n`;
    
    if (results.created.length > 0) {
      summaryMessage += `✅ Successfully created ${results.created.length} task(s):\n`;
      results.created.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task.title}`;
        if (task.dueDate !== 'No due date') {
          summaryMessage += ` (Due: ${task.dueDate})`;
        }
        summaryMessage += '\n';
      });
    }

    if (results.failed.length > 0) {
      summaryMessage += `❌ Failed to create ${results.failed.length} task(s):\n`;
      results.failed.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task.title} - ${task.reason}\n`;
      });
    }

    // Add motivational closing based on results
    if (results.created.length > 0 && results.failed.length === 0) {
      summaryMessage += '\n🎉 Perfect! All tasks created successfully. You\'re on fire!';
    } else if (results.created.length > 0) {
      summaryMessage += '\n💪 Great start! Let\'s fix those failed tasks and keep the momentum going.';
    } else {
      summaryMessage += '\n🔧 Let\'s troubleshoot these issues and get your tasks created!';
    }

    console.log(`MURPHY: Batch creation completed - ${results.created.length} created, ${results.failed.length} failed`);

    return {
      messageToUser: summaryMessage,
      taskId: null,
      details: results,
      success: results.created.length > 0
    };
  }
}

module.exports = SingleTaskCreator;