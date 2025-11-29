// Task Validation Module
// Handles all validation logic for task operations

/**
 * Task validation class for ensuring data integrity
 */
class TaskValidator {
  /**
   * Validates task creation parameters with enhanced validation
   * @param {object} taskDetails - Task details to validate
   * @returns {object} Validation result with isValid boolean and error messages
   */
  validateTaskCreation(taskDetails) {
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
   * Validates task list operations
   * @param {object} tasklistDetails - Task list details to validate
   * @returns {object} Validation result
   */
  validateTaskListCreation(tasklistDetails) {
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
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  /**
   * Validates batch operation parameters
   * @param {Array} operations - Array of operations to validate
   * @returns {object} Validation result
   */
  validateBatchOperations(operations) {
    const errors = [];
    
    if (!Array.isArray(operations)) {
      errors.push('Operations must be provided as an array');
      return { isValid: false, errors };
    }
    
    if (operations.length === 0) {
      errors.push('At least one operation must be provided');
    }
    
    if (operations.length > 50) {
      errors.push('Too many operations (max 50 allowed)');
    }
    
    // Validate each operation
    operations.forEach((operation, index) => {
      if (!operation.type) {
        errors.push(`Operation ${index + 1}: Type is required`);
      }
      
      if (!operation.data) {
        errors.push(`Operation ${index + 1}: Data is required`);
      }
      
      const validTypes = ['task_create', 'task_complete', 'task_update', 'task_delete', 'tasklist_create', 'tasklist_update', 'tasklist_delete'];
      if (operation.type && !validTypes.includes(operation.type)) {
        errors.push(`Operation ${index + 1}: Invalid operation type`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  /**
   * Validates task completion/extraction details
   * @param {object} extractedDetails - Extracted details to validate
   * @returns {object} Validation result
   */
  validateTaskExtraction(extractedDetails) {
    const errors = [];
    
    if (!extractedDetails) {
      errors.push('Task extraction details are required');
      return { isValid: false, errors };
    }
    
    if (!extractedDetails.task_id && !extractedDetails.existing_task_title) {
      errors.push('Either task_id or existing_task_title must be provided');
    }
    
    if (extractedDetails.existing_task_title) {
      if (extractedDetails.existing_task_title.trim().length === 0) {
        errors.push('Task title cannot be empty');
      } else if (extractedDetails.existing_task_title.trim().length > 500) {
        errors.push('Task title is too long (max 500 characters)');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }

  /**
   * Validates user parameters
   * @param {string} userId - User ID to validate
   * @returns {object} Validation result
   */
  validateUserId(userId) {
    const errors = [];
    
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      errors.push('Valid user ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }
}

module.exports = TaskValidator;