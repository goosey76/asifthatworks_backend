// Response Formatting Module
// Handles all user-facing message formatting for task operations

/**
 * Task response formatter for consistent user messaging
 */
class TaskResponseFormatter {
  /**
   * Formats task creation success response
   * @param {object} taskDetails - Task details that were created
   * @param {string} dueText - Formatted due date text
   * @returns {string} Formatted response message
   */
  formatTaskCreationResponse(taskDetails, dueText) {
    const responseTemplates = [
      `Murphy here:\nGot it!\nI added:\n${taskDetails.task_description}\nDue: ${dueText}\nAll set, Chief!`,
      
      `Murphy here:\nPerfect!\nAdded to your list:\n${taskDetails.task_description}\nDue: ${dueText}\nReady to tackle this!`,
      
      `Murphy here:\nDone!\nI created:\n${taskDetails.task_description}\nDue: ${dueText}\nStay focused, Chief!`,
      
      `Murphy here:\nGot your back!\nAdded task:\n${taskDetails.task_description}\nDue: ${dueText}\nOne step closer!`,
      
      `Murphy here:\nAll set!\nI filed:\n${taskDetails.task_description}\nDue: ${dueText}\nYou're on fire today!`
    ];
    
    return responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  }

  /**
   * Formats task creation error response
   * @param {Array} errors - Array of validation errors
   * @returns {string} Formatted error message
   */
  formatTaskCreationError(errors) {
    return `Murphy here: Hey, I couldn't create that task. ${errors.join(' and ')}.`;
  }

  /**
   * Formats task completion response
   * @param {string} taskTitle - Title of completed task
   * @returns {string} Formatted completion message
   */
  formatTaskCompletionResponse(taskTitle = '') {
    const responseTemplates = [
      `🎉 Done! That task is marked complete. Great work, Chief!`,
      `✅ Nice! "${taskTitle}" is completed. You're crushing it!`,
      `🎯 Perfect! Task completed. Keep the momentum going!`,
      `💪 Excellent! "${taskTitle}" is done. You're on fire!`
    ];
    
    return responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  }

  /**
   * Formats task completion error response
   * @param {string} taskName - Name of task that couldn't be found
   * @returns {string} Formatted error message
   */
  formatTaskCompletionError(taskName = '') {
    return `Hmm, I couldn't find that task to mark as complete. Want to try again with the exact task name?`;
  }

  /**
   * Formats task list display with enhanced formatting
   * @param {Array} tasks - Array of task objects
   * @param {string} originalMessage - Original user message for context
   * @param {object} dateUtils - Date utility instance
   * @returns {string} Formatted task list message
   */
  formatTaskList(tasks, originalMessage, dateUtils) {
    if (!tasks || tasks.length === 0) {
      return `📋 *Your Task List*\n\n🎯 _All done, Chief! No pending tasks to worry about._\n\n💪 _Time to focus on what matters most._`;
    }

    const currentTime = new Date();
    const isNextOnly = this.isNextTaskRequest(originalMessage);

    let filteredTasks = tasks;
    if (isNextOnly) {
      filteredTasks = this.filterUpcomingTasks(tasks);
    }

    let formattedMessage = `📋 *Your Task List*\n\n`;
    
    filteredTasks.forEach((task, i) => {
      const taskTitle = task.title || 'Untitled Task';
      const dueDate = task.due ? new Date(task.due) : null;
      
      let taskLine = `${i + 1}. ${taskTitle}`;
      
      // Add due date if available
      if (dueDate) {
        const formattedDate = dateUtils.getFormattedDateForTask(task.due);
        taskLine += ` ${formattedDate}`;
      } else {
        taskLine += ` 📅 **No Due Date**`;
      }
      
      // Add status indicators for priority requests
      if (isNextOnly) {
        if (task.due && new Date(task.due) < currentTime) {
          taskLine = `🚨 ${taskLine}`;
        } else {
          taskLine = `✅ ${taskLine}`;
        }
      }
      
      formattedMessage += `${taskLine}\n`;
    });
    
    if (isNextOnly) {
      formattedMessage += `\n💪 _These are your priority tasks. Let\'s get things done!_`;
    } else {
      formattedMessage += `\n✨ _Stay organized, stay productive!_`;
    }
    
    return formattedMessage;
  }

  /**
   * Formats task update response
   * @returns {string} Formatted update message
   */
  formatTaskUpdateResponse() {
    return `Got it! Updated the task for you. All set, Chief.`;
  }

  /**
   * Formats task update error response
   * @returns {string} Formatted error message
   */
  formatTaskUpdateError() {
    return `Hey, I couldn't update that task. No changes were specified - I need something to update like the title or due date.`;
  }

  /**
   * Formats task deletion response
   * @param {string} taskTitle - Title of deleted task
   * @returns {string} Formatted deletion message
   */
  formatTaskDeletionResponse(taskTitle) {
    return `Done! "${taskTitle}" is gone. One less thing on your plate.`;
  }

  /**
   * Formats task deletion error response
   * @param {string} searchTerm - Task that couldn't be found
   * @param {string} suggestions - Optional suggestions
   * @returns {string} Formatted error message
   */
  formatTaskDeletionError(searchTerm, suggestions = '') {
    if (suggestions) {
      return `Murphy here: I couldn't find "${searchTerm}" to delete. ${suggestions}`;
    }
    return `Couldn't find that task to delete. Want to try again with the exact task name?`;
  }

  /**
   * Formats batch operation summary
   * @param {object} results - Batch operation results
   * @returns {string} Formatted summary message
   */
  formatBatchOperationSummary(results) {
    let summaryMessage = `Murphy here:\n\n🎯 *Batch Operation Summary*\n\n`;
    summaryMessage += `✅ **Successful:** ${results.summary.successful}\n`;
    summaryMessage += `❌ **Failed:** ${results.summary.failed}\n`;
    summaryMessage += `📊 **Total:** ${results.summary.total}\n\n`;
    
    if (results.summary.successful > 0) {
      summaryMessage += `💪 *Great work getting things organized!*\n`;
    }
    
    if (results.summary.failed > 0) {
      summaryMessage += `🔧 *Let's troubleshoot those failed operations.*\n`;
    }
    
    return summaryMessage;
  }

  /**
   * Formats batch creation summary
   * @param {object} results - Batch creation results
   * @returns {string} Formatted summary message
   */
  formatBatchCreationSummary(results) {
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

    return summaryMessage;
  }

  /**
   * Formats smart task organization results
   * @param {object} categorizedTasks - Categorized tasks object
   * @param {Array} suggestions - Organization suggestions
   * @returns {string} Formatted organization message
   */
  formatSmartOrganization(categorizedTasks, suggestions) {
    let message = `Murphy here:\n\n🧠 *Smart Task Organization*\n\n`;
    
    if (categorizedTasks.work.length > 0) {
      message += `💼 **Work Tasks:** ${categorizedTasks.work.length}\n`;
    }
    if (categorizedTasks.personal.length > 0) {
      message += `👤 **Personal Tasks:** ${categorizedTasks.personal.length}\n`;
    }
    if (categorizedTasks.health.length > 0) {
      message += `💪 **Health Tasks:** ${categorizedTasks.health.length}\n`;
    }
    if (categorizedTasks.home.length > 0) {
      message += `🏠 **Home Tasks:** ${categorizedTasks.home.length}\n`;
    }
    if (categorizedTasks.learning.length > 0) {
      message += `📚 **Learning Tasks:** ${categorizedTasks.learning.length}\n`;
    }
    
    message += `\n💡 **Suggestions:**\n`;
    message += `• Create dedicated task lists for each category\n`;
    message += `• Focus on high-priority tasks first\n`;
    message += `• Consider due dates for task scheduling\n`;
    message += `\n✨ *Let's get you organized and productive!*`;
    
    return message;
  }

  /**
   * Checks if the message is asking for priority/next tasks
   * @param {string} message - User message
   * @returns {boolean} True if asking for next tasks
   */
  isNextTaskRequest(message) {
    return message.toLowerCase().includes('what\'s next') ||
           message.toLowerCase().includes('what tasks are next') ||
           message.toLowerCase().includes('what\'s coming up') ||
           message.toLowerCase().includes('urgent') ||
           message.toLowerCase().includes('priority') ||
           message.toLowerCase().includes('overdue');
  }

  /**
   * Filters tasks to show only upcoming ones
   * @param {Array} tasks - Array of tasks
   * @returns {Array} Filtered upcoming tasks
   */
  filterUpcomingTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.due) return true; // Include tasks without due dates
      const taskDue = new Date(task.due).toISOString().split('T')[0];
      return taskDue >= today; // Include tasks due today or in the future
    });
  }

  /**
   * Formats general error response
   * @param {string} operation - Operation that failed
   * @param {string} errorType - Type of error
   * @returns {string} Formatted error message
   */
  formatGeneralError(operation, errorType = 'unexpected') {
    const errorMessages = {
      unexpected: 'Hey, I couldn\'t complete that. An unexpected error occurred.',
      google_tasks: 'Hey, I couldn\'t complete that. Google Tasks isn\'t connected properly.',
      quota: 'Hey, I couldn\'t complete that. Too many requests - please try again in a moment.',
      not_found: 'I couldn\'t find that to complete the operation. It may have already been removed.',
      permission: 'I don\'t have permission to complete that operation.'
    };

    return `Murphy here: ${errorMessages[errorType] || errorMessages.unexpected}`;
  }
}

module.exports = TaskResponseFormatter;