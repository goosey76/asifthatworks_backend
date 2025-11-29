// Task List CRUD operations module

/**
 * Handles task list CRUD operations (Create, Read, Update, Delete)
 */
class TaskListOperations {
  constructor(googleTasksClient) {
    this.tasksClient = googleTasksClient;
  }

  /**
   * Gets all task lists for the user
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with formatted tasklist list
   */
  async getTaskLists(userId) {
    try {
      console.log('MURPHY: Getting all task lists for user:', userId);
      
      const result = await this.tasksClient.getTaskLists(userId);
      const tasklists = result.data.items || [];
      
      // Format for WhatsApp-friendly display
      const formatTaskListsForWhatsApp = (tasklists) => {
        if (tasklists.length === 0) {
          return `📋 *Your Task Lists*\n\n📝 No custom task lists found. You're using the default list.`;
        }

        let formattedMessage = `📋 *Your Task Lists*\n\n`;
        
        tasklists.forEach((tasklist, i) => {
          const listTitle = tasklist.title || 'Unnamed List';
          const isDefault = tasklist.id === '@default';
          const defaultIndicator = isDefault ? ' (Default)' : '';
          
          formattedMessage += `${i + 1}. ${listTitle}${defaultIndicator}\n`;
        });
        
        formattedMessage += `\n💪 *Stay organized across all your projects!*`;
        return formattedMessage;
      };

      const formattedLists = formatTaskListsForWhatsApp(tasklists);
      
      console.log(`MURPHY: Found ${tasklists.length} task lists`);
      
      return {
        messageToUser: formattedLists,
        tasklistId: null,
        tasklists: tasklists,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Error getting task lists:', error);
      
      let errorMessage = 'Murphy here: Hey, I couldn\'t get your task lists. An unexpected error occurred.';
      
      if (error.message?.includes('Google Tasks not connected')) {
        errorMessage = 'Murphy here: Hey, I couldn\'t get your task lists. Google Tasks isn\'t connected properly.';
      }
      
      return {
        messageToUser: errorMessage,
        tasklistId: null,
        tasklists: [],
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Creates a new task list
   * @param {object} tasklistDetails - Tasklist details including title
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with creation status
   */
  async createTaskList(tasklistDetails, userId) {
    try {
      // Validate tasklist details
      const validation = this.isValidForCreation(tasklistDetails);
      if (!validation.isValid) {
        return {
          messageToUser: `Murphy here: Hey, I couldn\'t create that task list. ${validation.errors.join(' and ')}.`,
          tasklistId: null,
          success: false,
          errors: validation.errors
        };
      }
      
      console.log('MURPHY: Creating new task list:', tasklistDetails.title);
      
      const result = await this.tasksClient.createTaskList(userId, tasklistDetails.title);
      
      console.log(`MURPHY: Task list created successfully:`, {
        tasklistId: result.data?.id,
        title: tasklistDetails.title
      });
      
      const responseTemplates = [
        `Murphy here:\nPerfect!\nI created a new task list:\n${tasklistDetails.title}\nTime to get organized, Chief!`,
        
        `Murphy here:\nDone!\nAdded your new task list:\n${tasklistDetails.title}\nStay focused on your goals!`,
        
        `Murphy here:\nGot it!\nCreated task list:\n${tasklistDetails.title}\nYou're building great habits!`,
        
        `Murphy here:\nAll set!\nI made you a new list:\n${tasklistDetails.title}\nReady to tackle new projects!`,
        
        `Murphy here:\nCreated!\nNew task list ready:\n${tasklistDetails.title}\nLet\'s make progress happen!`
      ];
      
      const randomTemplate = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
      
      return {
        messageToUser: randomTemplate,
        tasklistId: result.data?.id,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Task list creation error:', error);
      
      let errorMessage = 'Murphy here: Hey, I couldn\'t create that task list. An unexpected error occurred.';
      
      if (error.message?.includes('Google Tasks')) {
        errorMessage = 'Murphy here: Hey, I couldn\'t create that task list. Google Tasks isn\'t connected properly.';
      } else if (error.message?.includes('already exists')) {
        errorMessage = 'Murphy here: Hey, a task list with that name already exists. Try a different name!';
      }
      
      return {
        messageToUser: errorMessage,
        tasklistId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Updates an existing task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with update status
   */
  async updateTaskList(extractedDetails, userId) {
    try {
      const { existing_tasklist_title, tasklist_id, new_title } = extractedDetails;
      
      if (!new_title || new_title.trim().length === 0) {
        return {
          messageToUser: 'Murphy here: Hey, I couldn\'t update that task list. You need to provide a new name.',
          tasklistId: null,
          success: false
        };
      }
      
      let tasklistId = tasklist_id;
      
      // If no ID provided but we have a title, find the task list
      if (!tasklistId && existing_tasklist_title) {
        console.log(`Searching for task list to update: "${existing_tasklist_title}"`);
        
        const matchingList = await this.tasksClient.findTaskListByTitle(userId, existing_tasklist_title);
        
        if (matchingList) {
          tasklistId = matchingList.id;
          console.log(`Found task list to update: "${matchingList.title}" with ID: ${tasklistId}`);
        } else {
          return {
            messageToUser: `Murphy here: I couldn\'t find "${existing_tasklist_title}" to update. Want to check your task lists first?`,
            tasklistId: null,
            success: false
          };
        }
      }
      
      if (!tasklistId) {
        return {
          messageToUser: 'Murphy here: Hey, I couldn\'t update that task list. No specific task list was identified.',
          tasklistId: null,
          success: false
        };
      }
      
      console.log('MURPHY: Updating task list:', tasklistId);
      
      const result = await this.tasksClient.updateTaskList(userId, tasklistId, new_title);
      
      console.log('MURPHY: Task list updated successfully');
      
      return {
        messageToUser: `Got it! Updated "${existing_tasklist_title || 'that task list'}" to "${new_title}". All set, Chief!`,
        tasklistId: tasklistId,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Task list update error:', error);
      
      let errorMessage = 'Murphy here: Hey, I couldn\'t update that task list. An unexpected error occurred.';
      
      if (error.message?.includes('not found')) {
        errorMessage = 'Murphy here: I couldn\'t find that task list to update. It may have been removed.';
      }
      
      return {
        messageToUser: errorMessage,
        tasklistId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Deletes a task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with deletion status
   */
  async deleteTaskList(extractedDetails, userId) {
    try {
      const { existing_tasklist_title, tasklist_id } = extractedDetails;
      
      let tasklistId = tasklist_id;
      let tasklistTitle = existing_tasklist_title || 'Unknown task list';
      
      // If no ID provided but we have a title, find the task list
      if (!tasklistId && existing_tasklist_title) {
        console.log(`Searching for task list to delete: "${existing_tasklist_title}"`);
        
        const matchingList = await this.tasksClient.findTaskListByTitle(userId, existing_tasklist_title);
        
        if (matchingList) {
          tasklistId = matchingList.id;
          tasklistTitle = matchingList.title;
          console.log(`Found task list to delete: "${matchingList.title}" with ID: ${tasklistId}`);
        } else {
          return {
            messageToUser: `Murphy here: I couldn\'t find "${existing_tasklist_title}" to delete. Want to check your task lists first?`,
            tasklistId: null,
            success: false
          };
        }
      }
      
      if (!tasklistId) {
        return {
          messageToUser: 'Murphy here: Hey, I couldn\'t delete that task list. No specific task list was identified.',
          tasklistId: null,
          success: false
        };
      }
      
      // Don't allow deleting default task list
      if (tasklistId === '@default') {
        return {
          messageToUser: 'Murphy here: Hey, I can\'t delete the default task list. That\'s your main task list!',
          tasklistId: null,
          success: false
        };
      }
      
      console.log('MURPHY: Deleting task list:', tasklistId);
      
      await this.tasksClient.deleteTaskList(userId, tasklistId);
      
      console.log('MURPHY: Task list deleted successfully');
      
      return {
        messageToUser: `Done! Deleted "${tasklistTitle}". One less thing to manage!`,
        tasklistId: tasklistId,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Task list deletion error:', error);
      
      let errorMessage = 'Murphy here: Hey, I couldn\'t delete that task list. An unexpected error occurred.';
      
      if (error.message?.includes('not found')) {
        errorMessage = 'Murphy here: I couldn\'t find that task list to delete. It may have already been removed.';
      }
      
      return {
        messageToUser: errorMessage,
        tasklistId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Gets detailed information about a specific task list
   * @param {object} extractedDetails - Extracted tasklist details
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Result with task list details
   */
  async getTaskListDetails(extractedDetails, userId) {
    try {
      const { existing_tasklist_title, tasklist_id } = extractedDetails;
      
      let tasklistId = tasklist_id;
      
      // If no ID provided but we have a title, find the task list
      if (!tasklistId && existing_tasklist_title) {
        const matchingList = await this.tasksClient.findTaskListByTitle(userId, existing_tasklist_title);
        
        if (matchingList) {
          tasklistId = matchingList.id;
        } else {
          return {
            messageToUser: `Murphy here: I couldn\'t find "${existing_tasklist_title}". Want to check your task lists first?`,
            tasklistId: null,
            success: false
          };
        }
      }
      
      if (!tasklistId) {
        return {
          messageToUser: 'Murphy here: Hey, I couldn\'t get that task list details. No specific task list was identified.',
          tasklistId: null,
          success: false
        };
      }
      
      console.log('MURPHY: Getting task list details:', tasklistId);
      
      // Get task list info and stats
      const [listResult, stats] = await Promise.all([
        this.tasksClient.getTaskList(userId, tasklistId),
        this.tasksClient.getTaskListStats(userId, tasklistId)
      ]);
      
      const tasklist = listResult.data;
      
      let message = `📋 *${tasklist.title}*\n\n`;
      message += `📊 **Statistics:**\n`;
      message += `• Total tasks: ${stats.totalTasks}\n`;
      message += `• Incomplete: ${stats.incompleteTasks}\n`;
      message += `• Completed: ${stats.completedTasks}\n`;
      message += `• Completion rate: ${stats.completionRate}%\n\n`;
      message += `💪 *Great work staying organized!*`;
      
      return {
        messageToUser: message,
        tasklistId: tasklistId,
        tasklist: tasklist,
        stats: stats,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Error getting task list details:', error);
      
      return {
        messageToUser: 'Murphy here: Hey, I couldn\'t get those task list details. An unexpected error occurred.',
        tasklistId: null,
        success: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Validates tasklist creation parameters
   * @param {object} tasklistDetails - Tasklist details to validate
   * @returns {object} Validation result
   */
  isValidForCreation(tasklistDetails) {
    const errors = [];
    
    if (!tasklistDetails) {
      errors.push('Task list details are required');
      return { isValid: false, errors };
    }
    
    if (!tasklistDetails.title || tasklistDetails.title.trim().length === 0) {
      errors.push('Task list title is required');
    } else if (tasklistDetails.title.trim().length > 100) {
      errors.push('Task list title is too long (max 100 characters)');
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(tasklistDetails.title)) {
      errors.push('Task list title contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }
}

module.exports = TaskListOperations;