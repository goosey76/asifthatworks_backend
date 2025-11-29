// agent-service/calendar-utils.js

/**
 * Calendar utility functions for date/time parsing and formatting
 */

/**
 * Parse date and time into an ISO string for Google Calendar
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} time - The time in HH:MM format  
 * @param {string} timeZone - The IANA time zone string (default: 'Europe/Berlin')
 * @returns {string|null} The ISO formatted date-time string, or null if date or time is missing
 */
function parseDateTime(date, time, timeZone = 'Europe/Berlin') {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
}

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} duration - Duration string (e.g., "45 minutes", "1 hour", "30 mins")
 * @returns {string} The calculated end time in HH:MM format
 */
function calculateEndTimeFromDuration(startTime, duration) {
  if (!startTime || !duration) return null;
  
  // Parse start time
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  // Parse duration and calculate end time
  let durationMinutes = 0;
  const durationLower = duration.toLowerCase();
  
  // Extract numbers from duration string
  const durationMatch = durationLower.match(/(\d+)/);
  if (durationMatch) {
    const durationValue = parseInt(durationMatch[1]);
    
    if (durationLower.includes('hour') || durationLower.includes('hr')) {
      durationMinutes = durationValue * 60;
    } else if (durationLower.includes('minute') || durationLower.includes('min')) {
      durationMinutes = durationValue;
    }
  }
  
  // Calculate end time
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  const endHours = endDate.getHours().toString().padStart(2, '0');
  const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
}

/**
 * Parse start and end date and time into an object suitable for Google Calendar API
 * @param {string} date - The date in YYYY-MM-DD format
 * @param {string} startTime - The start time in HH:MM format
 * @param {string} endTime - The end time in HH:MM format (optional)
 * @param {string} duration - Duration string for calculating end time (optional)
 * @param {string} timeZone - The IANA time zone string (default: 'Europe/Berlin')
 * @returns {object} An object containing start and end dateTime and timeZone, or nulls if inputs are missing
 */
function parseStartEndDateTime(date, startTime, endTime, duration = "45 minutes", timeZone = 'Europe/Berlin') {
  if (!date || !startTime) return { start: null, end: null };
  
  // If endTime is missing, try to calculate it from duration
  let finalEndTime = endTime;
  if (!finalEndTime && duration) {
    finalEndTime = calculateEndTimeFromDuration(startTime, duration);
  }
  
  if (!finalEndTime) return { start: null, end: null };
  
  return {
    start: { dateTime: `${date}T${startTime}:00`, timeZone: timeZone },
    end: { dateTime: `${date}T${finalEndTime}:00`, timeZone: timeZone },
  };
}

/**
 * Calculate time range boundaries for calendar queries
 * @param {string} timeRange - The requested time range ('today', 'tomorrow', 'this week', 'next 3 days')
 * @param {string} currentDate - The current date in YYYY-MM-DD format
 * @returns {object} Object containing timeMin, timeMax, and timeRangeDescription
 */
function calculateTimeRange(timeRange, currentDate) {
  let timeMin, timeMax, timeRangeDescription;

  if (timeRange) {
    const timeRangeLower = timeRange.toLowerCase();
    const today = new Date(currentDate);
    
    if (timeRangeLower === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      timeMin = new Date(yesterday);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(yesterday);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'yesterday';
    } else if (timeRangeLower === 'today') {
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'today';
    } else if (timeRangeLower === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      timeMin = new Date(tomorrow);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(tomorrow);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'tomorrow';
    } else if (timeRangeLower === 'this week') {
      // Get the start of the week (Monday)
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      timeMin = new Date(today.setDate(diff));
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(timeMin);
      timeMax.setDate(timeMax.getDate() + 6);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'this week';
    } else if (timeRangeLower === 'next week' || timeRangeLower === 'upcoming week') {
      // Get next week's Monday (the week after this week)
      const dayOfWeek = today.getDay();
      const thisWeekStart = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const nextWeekStart = thisWeekStart + 7;
      timeMin = new Date(today.setDate(nextWeekStart));
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(timeMin);
      timeMax.setDate(timeMax.getDate() + 6);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'next week';
    } else if (timeRangeLower.match(/^next \d+ days$/)) {
      const daysMatch = timeRangeLower.match(/^next (\d+) days$/);
      const days = parseInt(daysMatch[1]);
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + (days - 1));
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = `the next ${days} days`;
    } else if (timeRangeLower.match(/^next \d+ weeks$/)) {
      const weeksMatch = timeRangeLower.match(/^next (\d+) weeks$/);
      const weeks = parseInt(weeksMatch[1]);
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + (weeks * 7) - 1);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = `the next ${weeks} weeks`;
    } else if (timeRangeLower === 'next 2 days') {
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + 1);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'the next 2 days';
    } else if (timeRangeLower === 'next 3 days') {
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + 2);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'the next 3 days';
    } else if (timeRangeLower === 'next 4 days') {
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + 3);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'the next 4 days';
    } else if (timeRangeLower === 'next 5 days') {
      timeMin = new Date(today);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(today);
      timeMax.setDate(timeMax.getDate() + 4);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'the next 5 days';
    } else {
      // Default to today if time_range is not recognized
      timeMin = new Date(currentDate);
      timeMin.setHours(0, 0, 0, 0);
      timeMax = new Date(currentDate);
      timeMax.setHours(23, 59, 59, 999);
      timeRangeDescription = 'today';
    }
  } else {
    // Default to today if no time_range is provided
    timeMin = new Date(currentDate);
    timeMin.setHours(0, 0, 0, 0);
    timeMax = new Date(currentDate);
    timeMax.setHours(23, 59, 59, 999);
    timeRangeDescription = 'today';
  }

  return { timeMin, timeMax, timeRangeDescription };
}

/**
 * Format event data for display with status indicators
 * @param {object} event - The Google Calendar event object
 * @param {number} index - The event index for numbering
 * @param {string} timeRangeDescription - Description of the time range for formatting decisions
 * @returns {string} Formatted event string with status indicator
 */
function formatEventForDisplay(event, index, timeRangeDescription) {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  const eventTitle = event.summary || 'Untitled Event';
  
  // Get current time for status comparison
  const now = new Date();
  const eventStart = new Date(start);
  const eventEnd = end ? new Date(end) : null;
  
  // Determine event status
  let statusIcon = '';
  let timeFormatted = '';
  
  if (event.start.dateTime && event.end.dateTime) {
    // Format time as HH:mm-HH:mm
    const startTime = eventStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const endTime = eventEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    if (now > eventEnd) {
      // Event has ended
      statusIcon = '✅';
      timeFormatted = `~~${startTime}-${endTime}~~`;
    } else if (now >= eventStart && now <= eventEnd) {
      // Event is ongoing
      statusIcon = '🔥';
      timeFormatted = `${startTime}-${endTime}`;
    } else {
      // Event hasn't started yet
      statusIcon = '☑️';
      timeFormatted = `${startTime}-${endTime}`;
    }
  } else {
    // All-day event
    const dateStr = new Date(start).toLocaleDateString('en-GB');
    if (now > new Date(start)) {
      statusIcon = '✅';
      timeFormatted = `~~${dateStr}~~`;
    } else {
      statusIcon = '☑️';
      timeFormatted = dateStr;
    }
  }
  
  return `${index}. ${statusIcon} ${timeFormatted} | ${eventTitle}`;
}

module.exports = {
  parseDateTime,
  parseStartEndDateTime,
  calculateEndTimeFromDuration,
  calculateTimeRange,
  formatEventForDisplay
};
