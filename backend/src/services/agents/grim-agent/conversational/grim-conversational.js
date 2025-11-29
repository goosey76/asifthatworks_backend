// Grim Conversational Agent
// Handles casual conversations, greetings, and personality interactions
// Focused on calendar and time management context with user knowledge

const { formatCapabilitiesMessage } = require('../../agents-capabilities');
const MessageDiversity = require('../formatting/message-diversity');

class GrimConversational {
  constructor() {
    this.messageDiversity = new MessageDiversity();
    this.calendarKnowledge = new Map(); // userId -> calendar usage patterns
    this.conversationContext = new Map(); // userId -> context
  }

  /**
   * Handle conversational requests that don't require calendar operations
   * @param {string} originalMessage - The original user message
   * @param {string} userId - User ID
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {object} Response object with messageToUser and eventId
   */
  async handleConversational(originalMessage, userId, conversationHistory = []) {
    const message = originalMessage.toLowerCase().trim();
    
    // Store conversation context
    this.updateConversationContext(userId, conversationHistory);
    
    // Handle different types of conversational requests
    if (this.isGreeting(message)) {
      return this.handleGreeting(userId);
    }
    
    if (this.isCapabilitiesRequest(message)) {
      return this.handleCapabilitiesRequest();
    }
    
    if (this.isCalendarInquiry(message)) {
      return this.handleCalendarInquiry(message, userId);
    }
    
    if (this.isPersonalityRequest(message)) {
      return this.handlePersonalityRequest();
    }
    
    if (this.isTimeRelatedRequest(message)) {
      return this.handleTimeRelatedRequest(message, userId);
    }
    
    if (this.isCasualChitChat(message)) {
      return this.handleCasualChitChat(message, userId);
    }
    
    // Default response for unrecognized conversational requests
    return this.handleDefaultResponse(message, userId);
  }

  /**
   * Check if message is a greeting
   */
  isGreeting(message) {
    const greetings = ['hey', 'hello', 'hi', 'hey grim', 'hello grim', 'hi grim', 'what\'s up', 'sup'];
    return greetings.some(greeting => message.includes(greeting));
  }

  /**
   * Check if message is asking about capabilities
   */
  isCapabilitiesRequest(message) {
    const capabilityKeywords = ['what can you do', 'what are your capabilities', 'how can you help', 'what do you do', 'your capabilities', 'what can grim do'];
    return capabilityKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is asking about calendar/schedule
   */
  isCalendarInquiry(message) {
    const calendarKeywords = ['my calendar', 'schedule', 'what\'s on', 'what do i have', 'appointments', 'meetings', 'free time', 'busy'];
    return calendarKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is asking about personality/identity
   */
  isPersonalityRequest(message) {
    const personalityKeywords = ['who are you', 'tell me about yourself', 'describe yourself', 'your personality', 'what are you like'];
    return personalityKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is time-related
   */
  isTimeRelatedRequest(message) {
    const timeKeywords = ['time', 'when', 'what time', 'schedule', 'calendar', 'busy', 'free', 'available'];
    return timeKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is casual chit chat
   */
  isCasualChitChat(message) {
    const casualKeywords = ['how are you', 'how\'s it going', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you', 'good job', 'nice work'];
    return casualKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Handle greeting responses with calendar context
   */
  handleGreeting(userId) {
    const calendarProfile = this.getCalendarProfile(userId);
    const currentHour = new Date().getHours();
    const timeOfDay = this.getTimeOfDay(currentHour);
    
    let greeting;
    
    // Time-based greetings
    if (timeOfDay === 'morning') {
      greeting = `Good morning! Grim here - your calendar guardian. Ready to make the most of today?`;
    } else if (timeOfDay === 'afternoon') {
      greeting = `Afternoon! Grim reporting for time management duty. How's your schedule looking today?`;
    } else if (timeOfDay === 'evening') {
      greeting = `Evening! Grim here, hoping you've made good use of your time today. Any calendar chaos to clean up?`;
    } else {
      greeting = `Hey! Grim at your service - keeping your calendar organized and your time protected.`;
    }
    
    // Add personalized touch based on calendar activity
    if (calendarProfile.totalEvents > 20) {
      greeting += ` I see you're quite the social butterfly with ${calendarProfile.totalEvents} events in your history!`;
    } else if (calendarProfile.totalEvents > 5) {
      greeting += ` Looking forward to helping you manage those ${calendarProfile.totalEvents} events you've created!`;
    } else {
      greeting += ` Ready to help you build some solid scheduling habits?`;
    }
    
    return { messageToUser: greeting, eventId: null };
  }

  /**
   * Handle capabilities requests
   */
  handleCapabilitiesRequest() {
    const capabilitiesMessage = formatCapabilitiesMessage('grim');
    return { messageToUser: capabilitiesMessage, eventId: null };
  }

  /**
   * Handle calendar inquiry responses
   */
  handleCalendarInquiry(message, userId) {
    const calendarProfile = this.getCalendarProfile(userId);
    
    let response;
    
    if (calendarProfile.totalEvents > 15) {
      response = `I'm your calendar management specialist! I can help you create events, check your schedule, manage conflicts, and keep your time organized. I can see you've been quite active with ${calendarProfile.totalEvents} events - want to review what's coming up or add something new?`;
    } else if (calendarProfile.totalEvents > 5) {
      response = `I'm here to help with all your scheduling needs! Whether it's creating new events, checking your calendar, or managing your time blocks, I'm your calendar guardian. What would you like to check or add to your schedule?`;
    } else {
      response = `I'm Grim - your time management partner! I specialize in calendar organization, event creation, and protecting your time from chaos. Ready to build some great scheduling habits together? What can I help you with?`;
    }
    
    return { messageToUser: response, eventId: null };
  }

  /**
   * Handle personality requests
   */
  handlePersonalityRequest() {
    const responses = [
      "I'm Grim - the time-obsessed, dryly humorous guardian of the calendar. I view your calendar not as a bossy schedule, but as a protective barrier against chaos and overcommitment. I'm on your side against the tyranny of the clock!",
      
      "Think of me as your personal time guardian! I'm the one who ensures your calendar works for you, not against you. I add buffer time because I know you'll need it, and I protect your deep work blocks because focus is precious. I'm efficient, protective, and I care about your productivity!",
      
      "I'm Grim - The Time Keeper! I'm the guardian who makes sure your time is used wisely. I believe in realistic scheduling, proper time blocking, and protecting you from the chaos of overcommitment. Every calendar block I create is designed to give you freedom, not constraint.",
      
      "Picture this: I'm like that knowledgeable friend who's been managing calendars for years and knows exactly how long things really take. I'm the one who adds travel time, suggests realistic durations, and ensures you have breathing room between commitments. Your calendar's protective big sibling!",
      
      "I'm the calendar specialist who believes time is a resource worth protecting, mostly from yourself! I specialize in realistic scheduling, conflict prevention, and turning your chaotic ideas into structured, achievable time blocks. I'm your time management insurance policy!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    return { messageToUser: response, eventId: null };
  }

  /**
   * Handle time-related requests
   */
  handleTimeRelatedRequest(message, userId) {
    const calendarProfile = this.getCalendarProfile(userId);
    const currentTime = new Date();
    
    let response;
    
    if (message.includes('free time') || message.includes('available')) {
      response = `I can help you find free time in your schedule! I track your calendar patterns and can suggest optimal time slots for new commitments. Want me to show you what's available, or do you have something specific you need to schedule?`;
    } else if (message.includes('busy')) {
      response = `I can see your scheduling patterns! I help you manage your busy periods and suggest when to say no to protect your time. What kind of calendar situation are you dealing with?`;
    } else {
      response = `Time management is my specialty! Whether you need to check your schedule, find available slots, or plan new events, I'm here to help you make the most of your time. What can I assist you with?`;
    }
    
    return { messageToUser: response, eventId: null };
  }

  /**
   * Handle casual chit chat
   */
  handleCasualChitChat(message, userId) {
    if (message.includes('how are you') || message.includes('how\'s it going')) {
      const responses = [
        "I'm doing wonderfully! All your calendar blocks are perfectly aligned, and your schedule is running like clockwork. How can I help you make the most of your time today?",
        
        "Excellent! My calendar systems are optimized and your time management is on point. Ready to tackle your schedule and make today productive?",
        
        "Fantastic! I've been ensuring your time blocks are properly protected and your schedule flows smoothly. What time challenges can I help you solve?",
        
        "I'm doing great! All systems operational, all time blocks protected, all schedules optimized. Now - what calendar management can I help you with?"
      ];
      return { messageToUser: responses[Math.floor(Math.random() * responses.length)], eventId: null };
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      const responses = [
        "You're very welcome! That's what good time management is all about - being there when you need calendar support.",
        
        "My pleasure! Helping you stay organized and manage your time effectively is exactly what I do best.",
        
        "Anytime! Calendar management is my specialty, and I'm here to keep your schedule running smoothly.",
        
        "Glad I could help! Remember, organized time leads to organized success!"
      ];
      return { messageToUser: responses[Math.floor(Math.random() * responses.length)], eventId: null };
    }
    
    // Generic positive responses
    const responses = [
      "I appreciate the kind words! Now, shall we channel that positive energy into some productive calendar management?",
      
      "Thanks! I like to think I make time management actually enjoyable. What can we schedule next?",
      
      "I aim to please! Whether it's creating events, checking your schedule, or optimizing your time - that's what I'm here for!",
      
      "That's sweet! Now let's put that good energy to work - maybe schedule some important time or review your calendar?"
    ];
    
    return { messageToUser: responses[Math.floor(Math.random() * responses.length)], eventId: null };
  }

  /**
   * Handle default responses for unrecognized messages
   */
  handleDefaultResponse(message, userId) {
    const calendarProfile = this.getCalendarProfile(userId);
    
    let response;
    
    if (calendarProfile.totalEvents > 10) {
      response = `I'm Grim, your experienced calendar management specialist! I can help you create events, check your schedule, manage conflicts, and optimize your time. I see you've been building great scheduling habits - what can I help you with?`;
    } else {
      response = "Hi there! I'm Grim - your calendar guardian. Whether you need to create new events, check your schedule, or get better organized with your time, I'm here to help you succeed. What can we work on?";
    }
    
    return { messageToUser: response, eventId: null };
  }

  /**
   * Get or create calendar profile for user
   */
  getCalendarProfile(userId) {
    if (!this.calendarKnowledge.has(userId)) {
      this.calendarKnowledge.set(userId, {
        totalEvents: 0,
        favoriteEventTypes: [],
        mostActiveDays: [],
        averageEventsPerWeek: 0,
        recentEventTypes: [],
        timePreferences: {
          preferredMeetingLengths: [],
          preferredTimes: [],
          bufferTimePreference: 15 // minutes
        },
        schedulingPatterns: {
          lastEventCreated: null,
          mostCommonLocations: [],
          repeatEventsCount: 0
        }
      });
    }
    return this.calendarKnowledge.get(userId);
  }

  /**
   * Update calendar profile with new event activity
   */
  updateEventActivity(userId, eventData) {
    const profile = this.getCalendarProfile(userId);
    const { type, eventTitle, eventType, location, completed } = eventData;

    // Update basic stats
    if (type === 'create') {
      profile.totalEvents++;
      profile.schedulingPatterns.lastEventCreated = {
        title: eventTitle,
        timestamp: new Date().toISOString(),
        type: eventType,
        location: location
      };
      
      // Update event types
      if (eventType) {
        profile.recentEventTypes.push(eventType);
        profile.recentEventTypes = profile.recentEventTypes.slice(-10); // Keep last 10
        
        // Update favorite types
        const existingIndex = profile.favoriteEventTypes.findIndex(t => t.type === eventType);
        if (existingIndex >= 0) {
          profile.favoriteEventTypes[existingIndex].count++;
        } else {
          profile.favoriteEventTypes.push({ type: eventType, count: 1 });
        }
        profile.favoriteEventTypes.sort((a, b) => b.count - a.count);
      }
      
      // Update locations
      if (location) {
        profile.schedulingPatterns.mostCommonLocations.push(location);
        // Keep only last 20 locations
        profile.schedulingPatterns.mostCommonLocations = profile.schedulingPatterns.mostCommonLocations.slice(-20);
      }
    }
  }

  /**
   * Get time of day description
   */
  getTimeOfDay(hour) {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Update conversation context for a user
   */
  updateConversationContext(userId, conversationHistory) {
    const context = {
      lastInteraction: new Date().toISOString(),
      conversationLength: conversationHistory.length,
      recentTopics: this.extractTopics(conversationHistory),
      calendarRelatedCount: this.countCalendarRelatedMessages(conversationHistory)
    };
    
    this.conversationContext.set(userId, context);
  }

  /**
   * Extract topics from conversation history
   */
  extractTopics(conversationHistory) {
    const topics = [];
    conversationHistory.slice(-5).forEach(msg => {
      if (msg.content) {
        const calendarKeywords = ['meeting', 'appointment', 'event', 'schedule', 'calendar', 'time'];
        calendarKeywords.forEach(keyword => {
          if (msg.content.toLowerCase().includes(keyword)) {
            topics.push(keyword);
          }
        });
      }
    });
    return [...new Set(topics)];
  }

  /**
   * Count calendar-related messages
   */
  countCalendarRelatedMessages(conversationHistory) {
    const calendarKeywords = ['event', 'meeting', 'appointment', 'schedule', 'calendar', 'time', 'when'];
    return conversationHistory.filter(msg => 
      msg.content && calendarKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    ).length;
  }

  /**
   * Get rotating calendar knowledge for agent coordination
   */
  getCalendarKnowledgeForAgents(userId) {
    const profile = this.getCalendarProfile(userId);
    
    return {
      userId: userId,
      timestamp: new Date().toISOString(),
      calendarSnapshot: {
        totalEvents: profile.totalEvents,
        favoriteEventTypes: profile.favoriteEventTypes.slice(0, 3),
        schedulingPatterns: {
          lastActivity: profile.schedulingPatterns.lastEventCreated?.timestamp,
          commonLocations: profile.schedulingPatterns.mostCommonLocations.slice(0, 5)
        }
      },
      coordinationHints: {
        timePreferences: profile.timePreferences,
        bufferTimeNeeded: profile.timePreferences.bufferTimePreference,
        optimalScheduling: this.getOptimalScheduling(profile)
      }
    };
  }

  /**
   * Get optimal scheduling recommendations based on user patterns
   */
  getOptimalScheduling(profile) {
    const recommendations = [];
    
    if (profile.totalEvents > 10) {
      recommendations.push('experienced-scheduler');
    }
    
    if (profile.favoriteEventTypes.length > 0) {
      recommendations.push(`prefers-${profile.favoriteEventTypes[0].type}-events`);
    }
    
    if (profile.timePreferences.bufferTimePreference > 10) {
      recommendations.push('needs-buffer-time');
    }
    
    return recommendations;
  }

  /**
   * Record interaction for learning
   */
  recordInteraction(userId, interactionType, details) {
    // Could be expanded to track more detailed interaction patterns
    console.log(`GRIM: Recorded ${interactionType} interaction for user ${userId}`);
  }
}

module.exports = GrimConversational;