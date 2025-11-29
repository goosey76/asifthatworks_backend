// agent-service/task-formatter.js

/**
 * Response formatter for Murphy agent persona
 */
class TaskFormatter {
  constructor() {
    this.agentName = 'Murphy';
  }

  /**
   * Formats error messages with Murphy's personality
   * @param {string} errorType - Type of error that occurred
   * @returns {string} Formatted error message
   */
  formatErrorMessage(errorType) {
    const errorMessages = {
      'llm_parse': "Hey, I couldn't process that task. The details were too vague, or the system needs a valid due date to file it.",
      'google_tasks_not_connected': "Hey, I couldn't process that task. Google Tasks isn't connected for this user.",
      'invalid_details': "Hey, I couldn't create that task. The details were too vague, or the system needs a valid due date to file it.",
      'technical_hiccup': "Hey, I couldn't process that task. An unexpected error occurred.",
      'unrecognized_request': "Hey, I don't recognize that request. Try something task-related or be more specific."
    };

    return `${this.agentName} here: ${errorMessages[errorType] || 'Something went wrong, but we\'ll get through it.'}`;
  }

  /**
   * Formats success messages for task operations
   * @param {string} operation - Type of operation performed
   * @param {object} details - Additional details for the message
   * @returns {string} Formatted success message
   */
  formatSuccessMessage(operation, details = {}) {
    const successMessages = {
      'task_created': "Got it! I added the task for you. All set, Chief!",
      'task_completed': "🎉 Done! That task is marked complete. Great work, Chief!",
      'task_updated': "Got it! Updated the task for you. All set, Chief.",
      'task_deleted': "Done! That task is gone. One less thing on your plate.",
      'task_not_found_complete': "Hmm, I couldn't find that task to mark as complete. Want to try again with the exact task name?",
      'task_not_found_update': "Hey, I couldn't update that task. No changes were specified - I need something to update like the title or due date.",
      'task_not_found_delete': "Couldn't find that task to delete. Want to try again with the exact task name?"
    };

    return `${this.agentName} here: ${successMessages[operation] || 'Operation completed successfully.'}`;
  }

  /**
   * Formats task creation responses with variety
   * @param {string} taskDescription - The task description
   * @param {string} dueText - Formatted due date text
   * @returns {string} Formatted response message
   */
  formatTaskCreation(taskDescription, dueText) {
    const responseTemplates = [
      `Murphy here:\nGot it!\nI added:\n${taskDescription}\nDue: ${dueText}\nAll set, Chief!`,
      
      `Murphy here:\nPerfect!\nAdded to your list:\n${taskDescription}\nDue: ${dueText}\nReady to tackle this!`,
      
      `Murphy here:\nDone!\nI created:\n${taskDescription}\nDue: ${dueText}\nStay focused, Chief!`,
      
      `Murphy here:\nGot your back!\nAdded task:\n${taskDescription}\nDue: ${dueText}\nOne step closer!`,
      
      `Murphy here:\nAll set!\nI filed:\n${taskDescription}\nDue: ${dueText}\nYou're on fire today!`
    ];
    
    // Select a random response template for variety
    return responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  }

  /**
   * Formats task list display with Murphy's personality
   * @param {Array} tasks - Array of task objects
   * @param {string} originalMessage - Original user message for context
   * @returns {string} Formatted task list message
   */
  formatTaskList(tasks, originalMessage) {
    if (!tasks || tasks.length === 0) {
      return `�� *Your Task List*\n\n🎯 _All done, Chief! No pending tasks to worry about._\n\n💪 _Time to focus on what matters most._`;
    }

    // Check if this is a "what's next" or "urgent" request
    const isNextOnly = originalMessage.toLowerCase().includes('what\'s next') ||
                      originalMessage.toLowerCase().includes('what tasks are next') ||
                      originalMessage.toLowerCase().includes('what\'s coming up') ||
                      originalMessage.toLowerCase().includes('urgent') ||
                      originalMessage.toLowerCase().includes('priority') ||
                      originalMessage.toLowerCase().includes('overdue');

    let formattedMessage = `📋 *Your Task List*\n\n`;
    
    tasks.forEach((task, i) => {
      const taskTitle = task.title || 'Untitled Task';
      const dueDate = task.due ? new Date(task.due) : null;
      
      let taskLine = `${i + 1}. ${taskTitle}`;
      
      // Add due date if available
      if (dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate.getTime() === today.getTime()) {
          taskLine += ` 📅 **Today**`;
        } else if (taskDate < today) {
          taskLine += ` 🚨 **Overdue**`;
        } else {
          const dateString = dueDate.toLocaleDateString('en-GB', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          taskLine += ` 📅 ${dateString}`;
        }
      } else {
        taskLine += ` �� **No Due Date**`;
      }
      
      // Add status indicators
      if (isNextOnly) {
        if (task.due && new Date(task.due) < new Date()) {
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
   * Formats general informational messages
   * @param {string} message - The message to format
   * @returns {string} Formatted message with agent persona
   */
  formatInfoMessage(message) {
    return `${this.agentName} here: ${message}`;
  }

  /**
   * Formats debugging/log messages
   * @param {string} operation - Operation being performed
   * @param {object} data - Data being processed
   * @returns {string} Formatted debug message
   */
  formatDebugMessage(operation, data) {
    return `MURPHY Agent: ${operation} - ${JSON.stringify(data, null, 2)}`;
  }

  /**
   * Formats failure messages for missing task description
   * @returns {string} Formatted failure message
   */
  formatMissingTaskDescription() {
    return this.formatErrorMessage('invalid_details');
  }

  /**
   * Formats failure messages for missing task ID
   * @param {string} taskTitle - The task title that couldn't be found
   * @returns {string} Formatted failure message
   */
  formatMissingTaskId(taskTitle) {
    return `Hey, I couldn't update that task. No changes were specified - I need something to update like the title or due date.`;
  }

  /**
   * Formats failure messages for missing task to complete
   * @returns {string} Formatted failure message
   */
  formatTaskNotFoundComplete() {
    return `Hmm, I couldn't find that task to mark as complete. Want to try again with the exact task name?`;
  }

  /**
   * Formats failure messages for missing task to delete
   * @returns {string} Formatted failure message
   */
  formatTaskNotFoundDelete() {
    return `Couldn't find that task to delete. Want to try again with the exact task name?`;
  }

  /**
   * Formats unknown intent messages
   * @returns {string} Formatted unknown intent message
   */
  formatUnknownIntent() {
    return this.formatErrorMessage('unrecognized_request');
  }
}

module.exports = TaskFormatter;
