// agent-service/date-utils.js

/**
 * Date and time utility functions for task management
 */

/**
 * Parse due date and time into ISO string for Google Tasks
 * @param {string} date - The date in YYYY-MM-DD format or natural language
 * @param {string} time - The time in HH:MM format (optional)
 * @returns {string|null} The ISO formatted date-time string, or null if date is missing
 */
function parseDueDate(date, time = null) {
  if (!date) return null;
  
  // Handle natural language dates
  if (date.toLowerCase() === 'today') {
    const today = new Date().toISOString().split('T')[0];
    return time ? `${today}T${time}:00.000Z` : `${today}T00:00:00.000Z`;
  } else if (date.toLowerCase() === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return time ? `${tomorrowStr}T${time}:00.000Z` : `${tomorrowStr}T00:00:00.000Z`;
  } else if (date.toLowerCase() === 'next week') {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    return time ? `${nextWeekStr}T${time}:00.000Z` : `${nextWeekStr}T00:00:00.000Z`;
  } else if (date.toLowerCase() === 'friday') {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    const nextFridayStr = nextFriday.toISOString().split('T')[0];
    return time ? `${nextFridayStr}T${time}:00.000Z` : `${nextFridayStr}T00:00:00.000Z`;
  }
  
  // Assuming date is in YYYY-MM-DD format
  // If time is provided, use it; otherwise use default 00:00:00
  const timeString = time ? `${time}:00` : '00:00:00';
  return new Date(`${date}T${timeString}.000Z`).toISOString();
}

/**
 * Format a date for display in a user-friendly way
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format (optional)
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(dateString, time = null) {
  if (!dateString) return 'no deadline set';
  
  if (dateString.toLowerCase() === 'today') {
    return time ? `Today at ${time}` : 'Today';
  } else if (dateString.toLowerCase() === 'tomorrow') {
    return time ? `Tomorrow at ${time}` : 'Tomorrow';
  } else {
    // Format date nicely (YYYY-MM-DD → Nov 13th)
    const dateObj = new Date(dateString);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
    return time ? `${formattedDate} at ${time}` : formattedDate;
  }
}

/**
 * Get task status based on due date
 * @param {string} dueDate - Due date in ISO format
 * @returns {string} Task status: 'overdue', 'today', 'upcoming', or 'no_due_date'
 */
function getTaskStatus(dueDate) {
  if (!dueDate) return 'no_due_date';
  
  const currentTime = new Date();
  const taskDue = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dueDate);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) {
    return 'today';
  } else if (taskDate < today) {
    return 'overdue';
  } else {
    return 'upcoming';
  }
}

/**
 * Get formatted date for task display
 * @param {string} dueDate - Due date in ISO format
 * @returns {string} Formatted date with emoji indicator
 */
function getFormattedDateForTask(dueDate) {
  if (!dueDate) return '📅 **No Due Date**';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dueDate);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) {
    return '📅 **Today**';
  } else if (taskDate < today) {
    return '📅 **Overdue**';
  } else {
    const dateString = dueDate.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return `📅 ${dateString}`;
  }
}

module.exports = {
  parseDueDate,
  formatDateForDisplay,
  getTaskStatus,
  getFormattedDateForTask
};
