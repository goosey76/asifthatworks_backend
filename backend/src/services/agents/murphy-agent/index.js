// agents/murphy-agent/index.js

const murphyAgent = require('./murphy-agent');

const murphyAgentModule = {
  /**
   * Main entry point for Murphy agent
   * Handles task-related requests
   */
  async handleTask(intent, entities, userId) {
    console.log('Murphy Agent: Handling task intent:', intent);
    return await murphyAgent.handleTask(intent, entities, userId);
  },

  /**
   * Create new task
   */
  async createTask(taskDetails, userId) {
    console.log('Murphy Agent: Creating task');
    return await murphyAgent.handleTask('create_task', taskDetails, userId);
  },

  /**
   * Get tasks
   */
  async getTasks(filterOptions, userId) {
    console.log('Murphy Agent: Getting tasks');
    return await murphyAgent.handleTask('get_task', filterOptions, userId);
  },

  /**
   * Complete task
   */
  async completeTask(taskDetails, userId) {
    console.log('Murphy Agent: Completing task');
    return await murphyAgent.handleTask('complete_task', taskDetails, userId);
  },

  /**
   * Update task
   */
  async updateTask(taskDetails, userId) {
    console.log('Murphy Agent: Updating task');
    return await murphyAgent.handleTask('update_task', taskDetails, userId);
  },

  /**
   * Delete task
   */
  async deleteTask(taskDetails, userId) {
    console.log('Murphy Agent: Deleting task');
    return await murphyAgent.handleTask('delete_task', taskDetails, userId);
  }
};

module.exports = murphyAgentModule;
