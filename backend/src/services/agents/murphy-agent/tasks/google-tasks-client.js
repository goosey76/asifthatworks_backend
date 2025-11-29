// Enhanced Google Tasks API integration module with tasklist operations

const { google } = require('googleapis');

/**
 * Google Tasks API integration module with comprehensive tasklist operations
 */
class GoogleTasksClient {
  constructor(supabase) {
    this.supabase = supabase;
    this.google = google;
  }

  /**
   * Retrieves an authenticated Google Tasks client for a given user
   * Fetches credentials from Supabase and handles token refreshing
   * @param {string} userId - The ID of the user
   * @returns {object} An authenticated Google Tasks API client
   * @throws {Error} If Google Tasks credentials are not found for the user
   */
  async getTasksClient(userId) {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('provider', 'google_tasks')
      .single();

    if (error || !data) {
      console.error('Error fetching Google Tasks credentials:', error);
      throw new Error('Google Tasks not connected for this user.');
    }

    const { access_token, refresh_token, expiry_date } = data.credentials;

    const oauth2Client = new this.google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/v1/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    });

    // Refresh token if expired
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        console.log('Refresh token obtained, updating Supabase...');
        await this.supabase
          .from('integrations')
          .update({ credentials: { ...data.credentials, ...tokens } })
          .eq('user_id', userId)
          .eq('provider', 'google_tasks');
      }
    });

    return this.google.tasks({ version: 'v1', auth: oauth2Client });
  }

  // ========================================
  // TASKLIST OPERATIONS (CRUD for task lists)
  // ========================================

  /**
   * Gets all task lists for the user
   * @param {string} userId - User ID for tasklist access
   * @returns {Promise<object>} Tasklists list result
   */
  async getTaskLists(userId) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasklists.list();
  }

  /**
   * Creates a new task list
   * @param {string} userId - User ID for tasklist creation
   * @param {string} title - Task list title
   * @returns {Promise<object>} Created task list result
   */
  async createTaskList(userId, title) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasklists.insert({
      requestBody: {
        title: title.trim()
      }
    });
  }

  /**
   * Updates an existing task list
   * @param {string} userId - User ID for tasklist access
   * @param {string} tasklistId - Task list ID to update
   * @param {string} title - New title for the task list
   * @returns {Promise<object>} Updated task list result
   */
  async updateTaskList(userId, tasklistId, title) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasklists.patch({
      tasklist: tasklistId,
      requestBody: {
        title: title.trim()
      }
    });
  }

  /**
   * Deletes a task list
   * @param {string} userId - User ID for tasklist access
   * @param {string} tasklistId - Task list ID to delete
   * @returns {Promise<object>} Deletion result
   */
  async deleteTaskList(userId, tasklistId) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasklists.delete({
      tasklist: tasklistId
    });
  }

  /**
   * Gets a specific task list by ID
   * @param {string} userId - User ID for tasklist access
   * @param {string} tasklistId - Task list ID to retrieve
   * @returns {Promise<object>} Task list result
   */
  async getTaskList(userId, tasklistId) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasklists.get({
      tasklist: tasklistId
    });
  }

  // ========================================
  // TASK OPERATIONS (Enhanced)
  // ========================================

  /**
   * Creates a task in a specific task list
   * @param {string} userId - User ID for task access
   * @param {string} tasklistId - Task list ID (defaults to @default)
   * @param {object} taskResource - Task resource object
   * @returns {Promise<object>} Created task result
   */
  async createTaskInList(userId, tasklistId = '@default', taskResource) {
    const tasks = await this.getTasksClient(userId);
    return await tasks.tasks.insert({
      tasklist: tasklistId,
      requestBody: taskResource
    });
  }

  /**
   * Gets tasks from a specific task list
   * @param {string} userId - User ID for task access
   * @param {string} tasklistId - Task list ID (defaults to @default)
   * @param {object} options - Query options
   * @returns {Promise<object>} Tasks list result
   */
  async getTasksFromList(userId, tasklistId = '@default', options = {}) {
    const tasks = await this.getTasksClient(userId);
    const queryParams = {
      tasklist: tasklistId,
      showCompleted: options.showCompleted !== undefined ? options.showCompleted : false,
      showHidden: options.showHidden !== undefined ? options.showHidden : false,
    };
    
    if (options.pageToken) {
      queryParams.pageToken = options.pageToken;
    }
    
    if (options.maxResults) {
      queryParams.maxResults = options.maxResults;
    }
    
    return await tasks.tasks.list(queryParams);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Finds a task list by title (case-insensitive)
   * @param {string} userId - User ID for tasklist access
   * @param {string} title - Title to search for
   * @returns {Promise<object|null>} Found task list or null
   */
  async findTaskListByTitle(userId, title) {
    try {
      const result = await this.getTaskLists(userId);
      const tasklists = result.data.items || [];
      
      return tasklists.find(list => 
        list.title && 
        list.title.toLowerCase() === title.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error finding task list by title:', error);
      return null;
    }
  }

  /**
   * Gets task statistics for a task list
   * @param {string} userId - User ID for task access
   * @param {string} tasklistId - Task list ID (defaults to @default)
   * @returns {Promise<object>} Task statistics
   */
  async getTaskListStats(userId, tasklistId = '@default') {
    try {
      const tasks = await this.getTasksClient(userId);
      
      const [allTasks, completedTasks] = await Promise.all([
        this.getTasksFromList(userId, tasklistId, { showCompleted: true }),
        this.getTasksFromList(userId, tasklistId, { showCompleted: false })
      ]);
      
      const all = allTasks.data.items || [];
      const incomplete = completedTasks.data.items || [];
      
      return {
        totalTasks: all.length,
        incompleteTasks: incomplete.length,
        completedTasks: all.length - incomplete.length,
        completionRate: all.length > 0 ? ((all.length - incomplete.length) / all.length * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error getting task list stats:', error);
      return {
        totalTasks: 0,
        incompleteTasks: 0,
        completedTasks: 0,
        completionRate: 0
      };
    }
  }
}

module.exports = GoogleTasksClient;
