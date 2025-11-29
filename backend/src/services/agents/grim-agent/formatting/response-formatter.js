// agent-service/response-formatter.js

/**
 * Response formatter for Grim agent persona
 */
class ResponseFormatter {
  constructor() {
    this.agentName = 'Grim';
  }

  /**
   * Formats error messages with Grim's personality
   * @param {string} errorType - Type of error that occurred
   * @returns {string} Formatted error message
   */
  formatErrorMessage(errorType) {
    const errorMessages = {
      'llm_parse': "I couldn't parse the event details properly. The universe is working against us today.",
      'calendar_not_connected': "Google Calendar not connected for this user.",
      'invalid_details': "To schedule your event, I need: event title, date (e.g., tomorrow), start time, and end time. Try: 'Create meeting tomorrow at 3pm for 1 hour'.",
      'technical_hiccup': "I encountered a technical hiccup while handling your calendar request. The universe seems to have conspired against us, but I'll pretend it didn't happen.",
      'unrecognized_request': "I don't recognize that request. Try something calendar-related or be more specific."
    };

    return `${this.agentName} here: ${errorMessages[errorType] || 'Something went wrong, but we\'ll get through it.'}`;
  }

  /**
   * Formats success messages for event operations
   * @param {string} operation - Type of operation performed
   * @param {object} details - Additional details for the message
   * @returns {string} Formatted success message
   */
  formatSuccessMessage(operation, details = {}) {
    const successMessages = {
      'event_created': "Event created successfully. I assume you'll actually show up this time.",
      'event_updated': "Event updated successfully. Time bends to your will, apparently.",
      'event_deleted': "Event deleted successfully. Time moves forward, and so do we.",
      'duplicate_event': "That event already exists. Time moves forward, but your calendar refuses to duplicate.",
      'invalid_time': "I need valid date and time to schedule this. Time zones don't lie, and neither should you.",
      'missing_event_id_update': "I need the event ID to update anything. Specificity is crucial.",
      'missing_event_id_delete': "I need the event ID to delete anything. Help me help you.",
      'missing_update_details': "I need something specific to update. Vague suggestions don't work in my world."
    };

    return `${this.agentName} here: ${successMessages[operation] || 'Operation completed successfully.'}`;
  }

  /**
   * Formats multiple events creation response
   * @param {number} createdCount - Number of successfully created events
   * @param {Array} failedEvents - Array of failed event descriptions
   * @returns {string} Formatted response message
   */
  formatMultipleEventsResponse(createdCount, failedEvents) {
    let responseMessage = `${this.agentName} here: I've scheduled ${createdCount} events`;
    
    if (failedEvents.length > 0) {
      responseMessage += `, with ${failedEvents.length} issues:\n• ${failedEvents.join('\n• ')}`;
    }
    
    responseMessage += '.';
    return responseMessage;
  }

  /**
   * Enhanced schedule display with smart time range handling and Grim's personality
   * @param {Array} events - Array of calendar events
   * @param {string} timeRangeDescription - Description of the time range
   * @returns {string} Formatted schedule message
   */
  formatScheduleDisplay(events, timeRangeDescription) {
    // Generate contextual header based on time range
    const headerEmojis = this.getTimeRangeEmojis(timeRangeDescription);
    const contextualGreeting = this.getContextualGreeting(timeRangeDescription, events.length);
    
    let scheduleMessage = `${this.agentName} here:\n\n${headerEmojis} Your ${this.getTimeRangeDisplayTitle(timeRangeDescription)}\n\n`;
    
    if (events.length) {
      // Enhanced event formatting with better visual hierarchy
      scheduleMessage = this.formatEnhancedEvents(scheduleMessage, events, timeRangeDescription);
    } else {
      // Smart empty state messages based on time range
      scheduleMessage += this.getEmptyStateMessage(timeRangeDescription);
    }
    
    // Add contextual closing based on time range and event density
    scheduleMessage += this.getContextualClosing(timeRangeDescription, events.length);
    
    return scheduleMessage;
  }

  /**
   * Get contextual emojis for different time ranges
   */
  getTimeRangeEmojis(timeRangeDescription) {
    const emojiMap = {
      'yesterday': '⏪️',
      'today': '📅',
      'tomorrow': '🔮',
      'the next 2 days': '📆',
      'the next 3 days': '📆',
      'the next 4 days': '📆',
      'the next 5 days': '📆',
      'this week': '📊',
      'next week': '🚀',
      'the next 2 weeks': '📈',
      'the next 4 weeks': '🎯'
    };
    return emojiMap[timeRangeDescription] || '📅';
  }

  /**
   * Get contextual greeting based on time range and event count
   */
  getContextualGreeting(timeRangeDescription, eventCount) {
    const greetings = {
      'yesterday': `Let's see what${eventCount === 0 ? ' didn\'t happen' : ' happened'} yesterday...`,
      'today': `Your agenda for today${eventCount === 0 ? ', such as it is' : ''}:`,
      'tomorrow': `Peering into the crystal ball for tomorrow...`,
      'next week': `Planning ahead, are we? Here's what awaits next week:`,
      'this week': `This week's symphony of commitments:`,
      'the next 2 days': `The immediate future (next 2 days):`,
      'the next 3 days': `The near future (next 3 days):`,
      'the next 4 days': `Your upcoming commitments (next 4 days):`,
      'the next 5 days': `The week ahead (next 5 days):`,
      'the next 2 weeks': `Long-term planning mode (next 2 weeks):`,
      'the next 4 weeks': `Strategic horizon (next 4 weeks):`
    };
    return greetings[timeRangeDescription] || `Your schedule for ${timeRangeDescription}:`;
  }

  /**
   * Get appropriate display title for the time range
   */
  getTimeRangeDisplayTitle(timeRangeDescription) {
    const titleMap = {
      'yesterday': 'Past Schedule',
      'today': 'Complete Schedule - Today',
      'tomorrow': 'Tomorrow\'s Agenda',
      'next week': 'Next Week\'s Roadmap',
      'this week': 'This Week\'s Overview',
      'the next 2 days': 'Next 2 Days',
      'the next 3 days': 'Next 3 Days',
      'the next 4 days': 'Next 4 Days',
      'the next 5 days': 'Next 5 Days',
      'the next 2 weeks': 'Next 2 Weeks',
      'the next 4 weeks': 'Next 4 Weeks'
    };
    return titleMap[timeRangeDescription] || `Schedule - ${timeRangeDescription}`;
  }

  /**
   * Format events with enhanced visual presentation
   */
  formatEnhancedEvents(scheduleMessage, events, timeRangeDescription) {
    let eventNumber = 1;
    
    // Group events by day for multi-day ranges
    if (this.isMultiDayRange(timeRangeDescription)) {
      const eventsByDay = this.groupEventsByDay(events);
      
      for (const [day, dayEvents] of Object.entries(eventsByDay)) {
        scheduleMessage += `📅 **${day}**\n`;
        
        dayEvents.forEach(event => {
          const formattedEvent = this.formatSingleEvent(event, eventNumber, timeRangeDescription);
          scheduleMessage += `${formattedEvent}\n`;
          eventNumber++;
        });
        
        scheduleMessage += '\n';
      }
    } else {
      // Single day format
      events.forEach(event => {
        const formattedEvent = this.formatSingleEvent(event, eventNumber, timeRangeDescription);
        scheduleMessage += `${formattedEvent}\n`;
        eventNumber++;
      });
    }
    
    return scheduleMessage;
  }

  /**
   * Format a single event with enhanced visual indicators
   */
  formatSingleEvent(event, eventNumber, timeRangeDescription) {
    const start = event.start.dateTime || event.start.date;
    const eventTitle = event.summary || 'Untitled Event';
    
    let formattedTime = '';
    let timeIcon = '⏰';
    
    if (event.start.dateTime) {
      const date = new Date(start);
      
      // Enhanced time formatting based on context
      if (this.isMultiDayRange(timeRangeDescription)) {
        formattedTime = date.toLocaleDateString('en-GB', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        formattedTime = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } else {
      formattedTime = new Date(start).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      timeIcon = '📅';
    }
    
    // Add status indicator based on current time
    const statusIndicator = this.getEventStatusIndicator(start);
    
    return `${eventNumber}. ${statusIndicator} ${formattedTime} | ${eventTitle}`;
  }

  /**
   * Get event status indicator based on current time
   */
  getEventStatusIndicator(eventStart) {
    const now = new Date();
    const eventDateTime = new Date(eventStart);
    
    if (!eventStart.includes('T')) {
      // All-day event
      return '☑️';
    }
    
    const eventEndTime = new Date(eventDateTime);
    // Assume 1-hour events if no end time (simplified)
    eventEndTime.setHours(eventEndTime.getHours() + 1);
    
    if (now > eventEndTime) {
      return '✅'; // Completed
    } else if (now >= eventDateTime && now <= eventEndTime) {
      return '🔥'; // Ongoing
    } else {
      return '☑️'; // Upcoming
    }
  }

  /**
   * Group events by day for multi-day ranges
   */
  groupEventsByDay(events) {
    const eventsByDay = {};
    
    events.forEach(event => {
      const start = event.start.dateTime || event.start.date;
      const date = new Date(start).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
      
      if (!eventsByDay[date]) {
        eventsByDay[date] = [];
      }
      eventsByDay[date].push(event);
    });
    
    return eventsByDay;
  }

  /**
   * Check if time range spans multiple days
   */
  isMultiDayRange(timeRangeDescription) {
    const multiDayRanges = [
      'the next 2 days', 'the next 3 days', 'the next 4 days', 'the next 5 days',
      'this week', 'next week', 'the next 2 weeks', 'the next 4 weeks'
    ];
    return multiDayRanges.includes(timeRangeDescription);
  }

  /**
   * Get smart empty state messages
   */
  getEmptyStateMessage(timeRangeDescription) {
    const emptyMessages = {
      'yesterday': 'A clean slate yesterday. Either you were productive or just avoiding commitments—hard to say which.',
      'today': 'A surprisingly light day today. Perfect for actually finishing something for once.',
      'tomorrow': 'Tomorrow appears to be wide open. Use it wisely or fill it regretfully—your choice.',
      'next week': 'Next week is mysteriously empty. Either you\'re finally learning to say no, or the universe is testing you.',
      'this week': 'This week\'s schedule is... minimal. Let\'s see if that lasts.',
      'the next 2 days': 'The next 2 days are blissfully empty. Don\'t let that fool you—it won\'t last.',
      'the next 3 days': 'A 3-day vacuum of commitments. Enjoy the calm before the inevitable storm.',
      'the next 4 days': 'Four days of potential. Will you fill them with purpose or procrastination?',
      'the next 5 days': 'Five days of open possibility. The calendar gods are being kind... for now.',
      'the next 2 weeks': 'Two weeks of clean schedule. This is either zen-like planning or denial.',
      'the next 4 weeks': 'Four weeks of strategic emptiness. Either you\'re very organized or very optimistic.'
    };
    
    return emptyMessages[timeRangeDescription] || `No events scheduled for ${timeRangeDescription}. Enjoy the silence.\n\n`;
  }

  /**
   * Get contextual closing based on time range and event density
   */
  getContextualClosing(timeRangeDescription, eventCount) {
    let closing = '';
    
    // Base personality closing
    if (eventCount === 0) {
      closing = 'Sometimes the most productive day is one with nothing scheduled.\n\n';
    } else if (eventCount <= 2) {
      closing = 'A light load—handle it with grace.\n\n';
    } else if (eventCount <= 5) {
      closing = 'Manageable chaos. Keep your energy focused.\n\n';
    } else {
      closing = 'Ambitious scheduling. May the coffee be strong and the Wi-Fi stable.\n\n';
    }
    
    // Add time-range specific wisdom
    const timeSpecific = {
      'yesterday': 'Yesterday\'s lessons shape tomorrow\'s choices.',
      'today': 'Make today count—no pressure, but the calendar is watching.',
      'tomorrow': 'Prepare well for tomorrow; fortune favors the organized.',
      'next week': 'Planning ahead is wisdom. Acting on those plans is victory.',
      'this week': 'This week\'s momentum builds toward greater achievements.',
      'the next 2 days': 'Two days can change everything. Make them count.',
      'the next 3 days': 'Three days of potential—unlock them wisely.',
      'the next 4 days': 'Four days to build something meaningful.',
      'the next 5 days': 'Five days to either excel or explain why you didn\'t.',
      'the next 2 weeks': 'Two weeks to transform intention into action.',
      'the next 4 weeks': 'Four weeks to level up your game entirely.'
    };
    
    if (timeSpecific[timeRangeDescription]) {
      closing += timeSpecific[timeRangeDescription];
    } else {
      closing += 'Time waits for no one, but it does keep good records.';
    }
    
    closing += `\n\n— ${this.agentName}`;
    return closing;
  }

  /**
   * Formats location search results
   * @param {string} query - Original search query
   * @param {string|null} result - Search result or null
   * @returns {string} Formatted location message
   */
  formatLocationSearchResult(query, result) {
    if (result) {
      return `Location search for "${query}" returned: "${result}"`;
    } else {
      return `No results found for location search: "${query}"`;
    }
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
    return `GRIM Agent: ${operation} - ${JSON.stringify(data, null, 2)}`;
  }

  /**
   * Formats diagnostic error messages based on specific failure analysis
   * @param {object} diagnosis - Diagnostic information from LLM
   * @returns {string} Formatted diagnostic error message
   */
  formatDiagnosticError(diagnosis) {
    if (!diagnosis) {
      return "Grim here: I'm having trouble understanding your request. Could you be more specific about the event details?";
    }

    let message = "Grim here: ";
    
    if (diagnosis.issue_description) {
      message += `${diagnosis.issue_description}\\n\\n`;
    }
    
    if (diagnosis.missing_fields && diagnosis.missing_fields.length > 0) {
      message += `Missing: ${diagnosis.missing_fields.join(', ')}\\n`;
    }
    
    if (diagnosis.how_to_fix && diagnosis.how_to_fix.length > 0) {
      message += `Try: ${diagnosis.how_to_fix.join(' ')}`;
    } else {
      message += `Please provide: title, time (e.g., 3-4pm), and date.`;
    }
    
    return message;
  }
}

module.exports = ResponseFormatter;
