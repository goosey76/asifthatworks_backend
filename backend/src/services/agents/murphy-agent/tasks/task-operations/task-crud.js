// Task CRUD operations module (Create, Read, Update, Delete)
const dateUtils = require('../../utils/date-utils');

/**
 * Handles task CRUD operations (Read, Update, Delete)
 */
class TaskCrud {
  constructor(googleTasksClient) {
    this.tasksClient = googleTasksClient;
    this.dateUtils = dateUtils;
  }

  /**
   * Gets all tasks for the user
   * @param {object} extractedDetails - Extracted details including filtering preferences
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with formatted task list
   */
  async getTasks(extractedDetails, originalMessage, userId) {
    const tasks = await this.tasksClient.getTasksClient(userId);
    
    const res = await tasks.tasks.list({
      tasklist: '@default',
      showCompleted: false,
      showHidden: false,
    });
    const taskItems = res.data.items;

    // Helper function to format tasks in WhatsApp-friendly format
    const formatTasksForWhatsApp = (tasks, message) => {
      if (!tasks || tasks.length === 0) {
        return `📋 *Your Task List*\n\n🎯 _All done, Chief! No pending tasks to worry about._\n\n💪 _Time to focus on what matters most._`;
      }

      // Get current time for status comparison
      const currentTime = new Date();
      console.log('Current time for task status:', currentTime.toISOString());

      // Check if this is a "what's next" or "urgent" request
      const isNextOnly = message.toLowerCase().includes('what\'s next') ||
                        message.toLowerCase().includes('what tasks are next') ||
                        message.toLowerCase().includes('what\'s coming up') ||
                        message.toLowerCase().includes('urgent') ||
                        message.toLowerCase().includes('priority') ||
                        message.toLowerCase().includes('overdue');

      let filteredTasks = tasks;
      if (isNextOnly) {
        // Filter for upcoming/due soon tasks only
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = tasks.filter(task => {
          if (!task.due) return true; // Include tasks without due dates
          const taskDue = new Date(task.due).toISOString().split('T')[0];
          // Include tasks due today or in the future
          return taskDue >= today;
        });
        console.log(`Filtered to ${filteredTasks.length} upcoming tasks from ${tasks.length} total`);
      }

      let formattedMessage = `📋 *Your Task List*\n\n`;
      
      filteredTasks.forEach((task, i) => {
        const taskTitle = task.title || 'Untitled Task';
        const dueDate = task.due ? new Date(task.due) : null;
        
        let taskLine = `${i + 1}. ${taskTitle}`;
        
        // Add due date if available
        if (dueDate) {
          const formattedDate = this.dateUtils.getFormattedDateForTask(task.due);
          taskLine += ` ${formattedDate}`;
        } else {
          taskLine += ` 📅 **No Due Date**`;
        }
        
        // Add status indicators
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
    };

    const formattedTasks = formatTasksForWhatsApp(taskItems, originalMessage);
    return { messageToUser: formattedTasks, taskId: null };
  }

  /**
   * Completes a task
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with completion status
   */
  async completeTask(extractedDetails, originalMessage, userId) {
    const tasks = await this.tasksClient.getTasksClient(userId);
    let taskIdToComplete = extractedDetails.task_id;
    
    // If no task_id provided but we have an existing_task_title, search for the task
    if (!taskIdToComplete && extractedDetails.existing_task_title) {
      console.log(`Searching for task to complete with title: "${extractedDetails.existing_task_title}"`);
      
      try {
        // Get all tasks, including recently created ones
        const res = await tasks.tasks.list({
          tasklist: '@default',
          showCompleted: false,
          showHidden: false,
        });
        
        const taskList = res.data.items;
        
        // Enhanced matching: First try exact match, then partial match
        let matchingTask = null;
        
        // 1. Try exact match first
        matchingTask = taskList.find(task =>
          task.title &&
          task.title.toLowerCase() === extractedDetails.existing_task_title.toLowerCase()
        );
        
        // 2. If no exact match, try enhanced title matching (with emoji)
        if (!matchingTask) {
          matchingTask = taskList.find(task => {
            const taskTitle = task.title || '';
            const searchTitle = extractedDetails.existing_task_title;
            
            return taskTitle.toLowerCase().includes(searchTitle.toLowerCase()) ||
                   searchTitle.toLowerCase().includes(taskTitle.toLowerCase()) ||
                   // Remove emojis for comparison
                   taskTitle.replace(/[^\w\s]/gi, '').toLowerCase().includes(searchTitle.toLowerCase()) ||
                   searchTitle.toLowerCase().includes(taskTitle.replace(/[^\w\s]/gi, '').toLowerCase());
          });
        }
        
        // 3. If user said "that task" or "the one I just created", prioritize the most recent task
        if (!matchingTask && (originalMessage.toLowerCase().includes('that task') || originalMessage.toLowerCase().includes('the one') || originalMessage.toLowerCase().includes('just created'))) {
          console.log('User said "that task" - prioritizing most recently created task');
          matchingTask = taskList[0]; // Assuming first task in list is most recent
        }
        
        if (matchingTask) {
          taskIdToComplete = matchingTask.id;
          console.log(`Found matching task to complete: "${matchingTask.title}" with ID: ${taskIdToComplete}`);
        } else {
          console.log(`No matching task found for completion with title: "${extractedDetails.existing_task_title}"`);
          console.log('Available tasks for debugging:', taskList.map(t => t.title));
        }
      } catch (searchError) {
        console.error('Error searching for tasks to complete:', searchError);
      }
    }
    
    if (taskIdToComplete) {
      console.log('MURPHY: Completing Google Task.');
      await tasks.tasks.patch({
        tasklist: '@default',
        task: taskIdToComplete,
        requestBody: { status: 'completed' },
      });
      return { messageToUser: `🎉 Done! That task is marked complete. Great work, Chief!`, taskId: taskIdToComplete };
    }
    return { messageToUser: `Hmm, I couldn't find that task to mark as complete. Want to try again with the exact task name?`, taskId: null };
  }

  /**
   * Updates an existing task
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} originalMessage - Original user message for context
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with update status
   */
  async updateTask(extractedDetails, originalMessage, userId) {
    const tasks = await this.tasksClient.getTasksClient(userId);
    let taskIdToUpdate = extractedDetails.task_id;
    
    // If no task_id provided but we have an existing_task_title, search for the task
    if (!taskIdToUpdate && extractedDetails.existing_task_title) {
      console.log(`Searching for task to update with title: "${extractedDetails.existing_task_title}"`);
      
      try {
        // Get all tasks, including recently created ones
        const res = await tasks.tasks.list({
          tasklist: '@default',
          showCompleted: false,
          showHidden: false,
        });
        
        const taskList = res.data.items;
        
        // Enhanced matching: First try exact match, then partial match
        let matchingTask = null;
        
        // 1. Try exact match first
        matchingTask = taskList.find(task =>
          task.title &&
          task.title.toLowerCase() === extractedDetails.existing_task_title.toLowerCase()
        );
        
        // 2. If no exact match, try enhanced title matching (with emoji)
        if (!matchingTask) {
          matchingTask = taskList.find(task => {
            const taskTitle = task.title || '';
            const searchTitle = extractedDetails.existing_task_title;
            
            return taskTitle.toLowerCase().includes(searchTitle.toLowerCase()) ||
                   searchTitle.toLowerCase().includes(taskTitle.toLowerCase()) ||
                   // Remove emojis for comparison
                   taskTitle.replace(/[^\w\s]/gi, '').toLowerCase().includes(searchTitle.toLowerCase()) ||
                   searchTitle.toLowerCase().includes(taskTitle.replace(/[^\w\s]/gi, '').toLowerCase());
          });
        }
        
        // 3. If user said "that task" or "the one I just created", prioritize the most recent task
        if (!matchingTask && (originalMessage.toLowerCase().includes('that task') || originalMessage.toLowerCase().includes('the one') || originalMessage.toLowerCase().includes('just created'))) {
          console.log('User said "that task" - prioritizing most recently created task');
          matchingTask = taskList[0]; // Assuming first task in list is most recent
        }
        
        if (matchingTask) {
          taskIdToUpdate = matchingTask.id;
          console.log(`Found matching task to update: "${matchingTask.title}" with ID: ${taskIdToUpdate}`);
        } else {
          console.log(`No matching task found for update with title: "${extractedDetails.existing_task_title}"`);
          console.log('Available tasks for debugging:', taskList.map(t => t.title));
        }
      } catch (searchError) {
        console.error('Error searching for tasks to update:', searchError);
      }
    }
    
    if (taskIdToUpdate) {
      console.log('MURPHY: Updating Google Task.');
      const taskResource = {};
      if (extractedDetails.task_description) taskResource.title = extractedDetails.task_description;
      if (extractedDetails.due_date) {
        taskResource.due = this.dateUtils.parseDueDate(extractedDetails.due_date, extractedDetails.due_time);
      }

      if (Object.keys(taskResource).length === 0) {
        return { messageToUser: `Hey, I couldn't update that task. No changes were specified - I need something to update like the title or due date.`, taskId: null };
      }

      await tasks.tasks.patch({
        tasklist: '@default',
        task: taskIdToUpdate,
        requestBody: taskResource,
      });
      return { messageToUser: `Got it! Updated the task for you. All set, Chief.`, taskId: taskIdToUpdate };
    }
    
    return { messageToUser: `Hey, I couldn't update that task. No changes were specified - I need something to update like the title or due date.`, taskId: null };
  }

  /**
   * Deletes a task with enhanced error handling and validation
   * @param {object} extractedDetails - Extracted task details including task_id or existing_task_title
   * @param {string} userId - User ID for task access
   * @returns {Promise<object>} Result with deletion status
   */
  async deleteTask(extractedDetails, userId) {
    try {
      // Validate input parameters
      if (!extractedDetails) {
        return {
          messageToUser: `Murphy here: Hey, I couldn't delete that task. No task details provided.`,
          taskId: null,
          success: false
        };
      }

      const tasks = await this.tasksClient.getTasksClient(userId);
      let taskIdToDelete = extractedDetails.task_id;
      let taskTitle = extractedDetails.existing_task_title || 'Unknown task';
      
      // If no task_id provided but we have an existing_task_title, search for the task
      if (!taskIdToDelete && extractedDetails.existing_task_title) {
        console.log(`Searching for task to delete with title: "${extractedDetails.existing_task_title}"`);
        
        try {
          const res = await tasks.tasks.list({
            tasklist: '@default',
            showCompleted: false,
            showHidden: false,
          });
          
          const taskList = res.data.items || [];
          if (taskList.length === 0) {
            return {
              messageToUser: `Murphy here: I couldn't find any tasks to delete. Your task list appears to be empty.`,
              taskId: null,
              success: false
            };
          }
          
          // Enhanced matching with better error handling
          const matchingTask = this.findBestMatchingTask(taskList, extractedDetails.existing_task_title);
          
          if (matchingTask) {
            taskIdToDelete = matchingTask.id;
            taskTitle = matchingTask.title;
            console.log(`Found matching task to delete: "${matchingTask.title}" with ID: ${taskIdToDelete}`);
          } else {
            console.log(`No matching task found for deletion with title: "${extractedDetails.existing_task_title}"`);
            // Provide helpful suggestions
            const suggestions = this.generateTaskSuggestions(taskList, extractedDetails.existing_task_title);
            return {
              messageToUser: `Murphy here: I couldn't find "${extractedDetails.existing_task_title}" to delete. ${suggestions}`,
              taskId: null,
              success: false
            };
          }
        } catch (searchError) {
          console.error('Error searching for tasks to delete:', searchError);
          return {
            messageToUser: `Murphy here: Hey, I couldn't search for tasks to delete. A system error occurred.`,
            taskId: null,
            success: false,
            errors: [searchError.message]
          };
        }
      }
      
      if (!taskIdToDelete) {
        return {
          messageToUser: `Murphy here: Hey, I couldn't delete that task. No specific task was identified. Please try again with the exact task name.`,
          taskId: null,
          success: false
        };
      }
      
      console.log('MURPHY: Deleting Google Task:', taskTitle);
      
      await tasks.tasks.delete({
        tasklist: '@default',
        task: taskIdToDelete,
      });
      
      console.log(`MURPHY: Task deleted successfully: ${taskTitle}`);
      
      return {
        messageToUser: `Done! "${taskTitle}" is gone. One less thing on your plate.`,
        taskId: taskIdToDelete,
        success: true
      };
      
    } catch (error) {
      console.error('MURPHY: Task deletion error:', error);
      
      let errorMessage = `Murphy here: Hey, I couldn't delete that task. An unexpected error occurred.`;
      
      if (error.message?.includes('not found')) {
        errorMessage = `Murphy here: I couldn't find that task to delete. It may have already been removed.`;
      } else if (error.message?.includes('permission')) {
        errorMessage = `Murphy here: I don't have permission to delete that task.`;
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
   * Helper method to find the best matching task from a list
   * @param {Array} tasks - Array of tasks to search through
   * @param {string} searchTitle - Title to match against
   * @returns {object|null} Best matching task or null
   */
  findBestMatchingTask(tasks, searchTitle) {
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
        score: this.calculateMatchScore(task.title, searchTitle)
      }))
      .sort((a, b) => b.score - a.score);
    
    return matches.length > 0 ? matches[0].task : null;
  }

  /**
   * Calculate match score between task title and search term
   * @param {string} taskTitle - Task title
   * @param {string} searchTerm - Search term
   * @returns {number} Match score (higher is better)
   */
  calculateMatchScore(taskTitle, searchTerm) {
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
    
    return 0;
  }

  /**
   * Generate helpful suggestions when task not found
   * @param {Array} tasks - Available tasks
   * @param {string} searchTerm - Original search term
   * @returns {string} Suggestion message
   */
  generateTaskSuggestions(tasks, searchTerm) {
    if (tasks.length === 0) {
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
      .slice(0, 3);
    
    if (similarTasks.length > 0) {
      const taskNames = similarTasks.map(item => `"${item.title}"`).join(', ');
      return `Did you mean one of these: ${taskNames}?`;
    }
    
    return 'Here are your current tasks that you could delete: ' +
           tasks.slice(0, 3).map(task => `"${task.title}"`).join(', ') + '.';
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
        const result = await this.completeTask(taskDetails, `complete multiple tasks`, userId);
        
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

    let summaryMessage = `Murphy here:\n\n🎯 Batch Task Completion:\n`;
    
    if (results.completed.length > 0) {
      summaryMessage += `✅ Completed ${results.completed.length} task(s):\n`;
      results.completed.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task}\n`;
      });
    }

    if (results.failed.length > 0) {
      summaryMessage += `❌ Failed to complete ${results.failed.length} task(s):\n`;
      results.failed.forEach((task, index) => {
        summaryMessage += `${index + 1}. ${task}\n`;
      });
    }

    summaryMessage += '\n💪 Great job getting things done!';

    return {
      messageToUser: summaryMessage,
      taskId: null,
      details: results
    };
  }
}

module.exports = TaskCrud;