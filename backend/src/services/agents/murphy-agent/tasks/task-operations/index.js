// Task Operations Module - Index file
// Exports all modular classes for task operations

// Import modular components (from parent directory)
const { TaskValidator } = require('../validation');
const { TaskResponseFormatter } = require('../formatting');
const { BatchOperationsHandler } = require('../batch-operations');
const { SmartTaskOrganization } = require('../smart-organization');
const { TaskMatchingUtils } = require('../utils');

// Import core operation classes from their individual files
const SingleTaskCreator = require('./single-task-creator');
const TaskCrud = require('./task-crud');

// Import main TaskOperations class directly
const TaskOperationsMain = require('./task-operations');

// Re-export TaskOperations with a different name to avoid circular dependency
const TaskOperations = TaskOperationsMain;

module.exports = {
  // Main orchestrator
  TaskOperations,
  
  // Core operation classes
  SingleTaskCreator,
  TaskCrud,
  
  // Modular components
  TaskValidator,
  TaskResponseFormatter,
  BatchOperationsHandler,
  SmartTaskOrganization,
  TaskMatchingUtils
};