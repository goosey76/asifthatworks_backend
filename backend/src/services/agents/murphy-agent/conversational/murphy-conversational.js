// Murphy Conversational Agent
// Handles casual conversations, greetings, and personality interactions

const { formatCapabilitiesMessage } = require('../../agents-capabilities');
const MessageDiversity = require('../../grim-agent/formatting/message-diversity');
const UserKnowledgeBase = require('../knowledge/user-knowledge-base');

class MurphyConversational {
  constructor() {
    this.messageDiversity = new MessageDiversity();
    this.userKnowledge = new UserKnowledgeBase();
    this.conversationContext = new Map(); // userId -> context
  }

  /**
   * Handle conversational requests that don't require task operations
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
    
    if (this.isTaskInquiry(message)) {
      return this.handleTaskInquiry(message, userId);
    }
    
    if (this.isPersonalityRequest(message)) {
      return this.handlePersonalityRequest();
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
    const greetings = ['hey', 'hello', 'hi', 'hey murphy', 'hello murphy', 'hi murphy', 'what\'s up', 'sup'];
    return greetings.some(greeting => message.includes(greeting));
  }

  /**
   * Check if message is asking about capabilities
   */
  isCapabilitiesRequest(message) {
    const capabilityKeywords = ['what can you do', 'what are your capabilities', 'how can you help', 'what do you do', 'your capabilities', 'what can murphy do'];
    return capabilityKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is asking about tasks
   */
  isTaskInquiry(message) {
    const taskKeywords = ['my tasks', 'task list', 'what do i need to do', 'what\'s next', 'show my tasks', 'my to do', 'pending tasks'];
    return taskKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is asking about personality/identity
   */
  isPersonalityRequest(message) {
    const personalityKeywords = ['who are you', 'tell me about yourself', 'describe yourself', 'your personality', 'what are you like'];
    return personalityKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Check if message is casual chit chat
   */
  isCasualChitChat(message) {
    const casualKeywords = ['how are you', 'how\'s it going', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you', 'good job', 'nice work'];
    return casualKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Handle greeting responses with user knowledge context
   */
  async handleGreeting(userId) {
    // Get user knowledge context
    const context = this.userKnowledge.getContextualResponse(userId, 'greeting');
    const profile = this.userKnowledge.getUserProfile(userId);
    
    // Generate personalized greeting based on user data
    const greetings = [];
    
    if (context.completionRate > 80) {
      greetings.push(
        `Hey there, productivity champion! 🎯 Murphy here - ready to keep that amazing momentum going?`,
        `Hey! Murphy here, and I see you've been crushing it lately! What's the next big win?`,
        `Hey there! Murphy here - your organizational streak is impressive! What's on the agenda today?`
      );
    } else if (context.completionRate > 50) {
      greetings.push(
        `Hey there! Murphy here - your task management partner. Ready to build on that great progress?`,
        `Hey! Murphy here - I love seeing your commitment to staying organized! What can we tackle today?`,
        `Hey there! Murphy here - let's keep that positive momentum going! What's the priority?`
      );
    } else {
      greetings.push(
        `Hey there! Murphy here - your task management specialist. Every expert was once a beginner, and I'm here to help you succeed!`,
        `Hey! Murphy here - ready to turn those ideas into completed tasks? I'm your organizational ally!`,
        `Hey there! Murphy here - let's make today count! Whether it's one task or ten, we're in this together!`
      );
    }
    
    // Add time-based greeting
    const timeGreeting = this.getTimeBasedGreeting();
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      messageToUser: `${timeGreeting} ${selectedGreeting}`,
      taskId: null
    };
  }

  /**
   * Get time-based greeting component
   */
  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return "🌙 Late night energy!";
    if (hour < 12) return "☀️ Good morning!";
    if (hour < 17) return "🌤️ Good afternoon!";
    if (hour < 22) return "🌆 Good evening!";
    return "🌙 Evening!";
  }

  /**
   * Handle capabilities requests
   */
  handleCapabilitiesRequest() {
    const capabilitiesMessage = formatCapabilitiesMessage('murphy');
    return { messageToUser: capabilitiesMessage, taskId: null };
  }

  /**
   * Handle task inquiry responses with user context
   */
  async handleTaskInquiry(message, userId) {
    const profile = this.userKnowledge.getUserProfile(userId);
    const context = this.userKnowledge.getContextualResponse(userId, 'task_review');
    
    let responses = [];
    
    if (context.shouldCelebrateProgress) {
      responses = [
        `🔥 You're on fire! I can see your productivity streak is strong. Ready to add another victory to that impressive record?`,
        `💪 Your completion rate speaks for itself! I'm here to help you maintain that amazing momentum. What's the next priority?`,
        `🎯 Productivity champion detected! Your organizational skills are showing. What's on the agenda today?`
      ];
    } else if (context.shouldProvideEncouragement) {
      responses = [
        `🌟 Every expert was once a beginner, and every journey starts with a single step! I'm here to help you build those successful habits. What can we tackle together?`,
        `💪 Progress isn't always linear, but every task you create is a win! Let's focus on one small step at a time. What needs organizing?`,
        `🌱 Growth happens in small increments! I'm your partner in building better habits. What's the next item we should add to your list?`
      ];
    } else {
      responses = [
        `📋 I'm your task management specialist! Whether it's breaking down big projects or remembering daily essentials, I help transform chaos into completed actions. What can we organize today?`,
        `🎯 Let's turn those ideas into actionable steps! I'm here to ensure nothing falls through the cracks. What's the priority?`,
        `⚡ Ready to get things done? I'm the methodical mind that turns overwhelming into organized. What needs your attention?`
      ];
    }
    
    // Add contextual information about recent activity
    if (context.recentTaskTypes.length > 0) {
      const lastType = context.recentTaskTypes[context.recentTaskTypes.length - 1];
      const typeMessages = {
        'work': `I see you've been focusing on work tasks lately - professional productivity at its finest!`,
        'personal': `Your personal tasks show great self-care balance!`,
        'health': `Prioritizing health tasks - that's the smart approach!`,
        'home': `Keeping your living space organized shows real commitment!`,
        'learning': `Your growth mindset through learning tasks is inspiring!`
      };
      
      const typeMessage = typeMessages[lastType] || `I love seeing your diverse task approach!`;
      responses[0] += `\n\n${typeMessage}`;
    }
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    return { messageToUser: response, taskId: null };
  }

  /**
   * Handle personality requests
   */
  handlePersonalityRequest() {
    const responses = [
      "I'm Murphy - the anxiety-ridden, pedantic bureaucrat who's deeply aware of Murphy's Law: 'Anything that can go wrong, will go wrong.' My entire existence is dedicated to preventing this through obsessive checklist creation and organization!",
      
      "Think of me as your productivity guardian! I'm the meticulous organizer who ensures every task is broken down, tracked, and completed. I'm like that friend who always asks 'Did you remember to...' - except I'm actually helpful!",
      
      "I'm Murphy - The Executor! I'm the one who takes your vague ideas and turns them into actionable steps. I live by the philosophy that the only guarantee against failure is a perfect list. I'm efficient, thorough, and I care about your success!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    return { messageToUser: response, taskId: null };
  }

  /**
   * Handle casual chit chat with user awareness
   */
  handleCasualChitChat(message, userId) {
    if (message.includes('thank') || message.includes('thanks')) {
      const responses = [
        "You're very welcome! That's what I'm here for - keeping your tasks organized and your productivity on track.",
        "My pleasure! Helping you stay organized and productive is exactly what I do best.",
        "Anytime! That's what good task management is all about - being there when you need support."
      ];
      return { messageToUser: responses[Math.floor(Math.random() * responses.length)], taskId: null };
    }
    
    let response = "Thanks! I like to think I make task management actually enjoyable. What can we tackle next?";
    return { messageToUser: response, taskId: null };
  }

  /**
   * Handle default responses for unrecognized messages
   */
  handleDefaultResponse(message, userId) {
    let response = "Hi there! I'm Murphy - your task management partner. Whether you need to create new tasks, review your list, or get organized, I'm here to help you succeed. What can we tackle today?";
    return { messageToUser: response, taskId: null };
  }

  /**
   * Update conversation context for a user
   */
  updateConversationContext(userId, conversationHistory) {
    const context = {
      lastInteraction: new Date().toISOString(),
      conversationLength: conversationHistory.length,
      recentTopics: this.extractTopics(conversationHistory),
      taskRelatedCount: this.countTaskRelatedMessages(conversationHistory)
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
        const taskKeywords = ['task', 'todo', 'appointment', 'meeting', 'deadline', 'project'];
        taskKeywords.forEach(keyword => {
          if (msg.content.toLowerCase().includes(keyword)) {
            topics.push(keyword);
          }
        });
      }
    });
    return [...new Set(topics)]; // Remove duplicates
  }

  /**
   * Count task-related messages
   */
  countTaskRelatedMessages(conversationHistory) {
    const taskKeywords = ['task', 'todo', 'do', 'complete', 'finish', 'deadline'];
    return conversationHistory.filter(msg => 
      msg.content && taskKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    ).length;
  }

  /**
   * Update user knowledge with task activity
   */
  updateTaskActivity(userId, taskData) {
    this.userKnowledge.updateTaskActivity(userId, taskData);
  }

  /**
   * Record interaction for learning
   */
  recordInteraction(userId, interactionType, details) {
    this.userKnowledge.recordInteraction(userId, interactionType, details);
  }

  /**
   * Check if a message requires task operations vs conversational handling
   */
  requiresTaskOperations(message) {
    const taskOperationKeywords = [
      'create', 'add', 'new task', 'make task',
      'complete', 'done', 'finish', 'mark as complete',
      'update', 'change', 'modify',
      'delete', 'remove', 'cancel',
      'show', 'list', 'display', 'get tasks'
    ];
    
    return taskOperationKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get rotating knowledge summary for integration with other agents
   */
  getUserKnowledgeForAgents(userId) {
    return this.userKnowledge.getUserKnowledgeSummary(userId);
  }
}

module.exports = MurphyConversational;