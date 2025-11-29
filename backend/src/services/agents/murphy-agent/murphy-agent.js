// agent-service/murphy-agent.js

const GoogleTasksClient = require('./tasks/google-tasks-client');
const TaskExtractor = require('./tasks/task-extractor');
const TaskOperations = require('./tasks/task-operations');
const TaskFormatter = require('./formatting/task-formatter');
const MurphyConversational = require('./conversational/murphy-conversational');
const { formatCapabilitiesMessage } = require('../agents-capabilities');
const agentKnowledgeCoordinator = require('../agent-knowledge-coordinator');
require('dotenv').config({ path: '../../.env' }); // Load environment variables

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize conversational layer
const murphyConversational = new MurphyConversational();

const murphyAgent = {
  /**
   * Handles various task-related intents (create, complete, get, update, delete tasks).
   * Uses LLM to extract task details from the original message.
   * @param {string} intent - The intent of the user's request (e.g., 'create_task').
   * @param {object} entities - Extracted entities from the user's message.
   * @param {string} userId - The ID of the user.
   * @returns {object} An object containing a message to the user and a task ID (if applicable).
   */
  async handleTask(intent, entities, userId) {
    console.log(`MURPHY Agent: Handling intent '${intent}' for user ${userId} with entities:`, entities);
    
    const originalMessage = entities.message || '';
    const conversationContext = entities.conversation_context || [];
    
    // Handle self-introduction requests FIRST - before initializing heavy components
    if (intent === 'get_goals') {
      const capabilitiesMessage = formatCapabilitiesMessage('murphy');
      return {
        messageToUser: capabilitiesMessage,
        taskId: null
      };
    }

    // Handle conversational requests that don't need heavy processing
    if (this.shouldHandleConversationally(originalMessage, intent)) {
      console.log('MURPHY: Handling as conversational request');
      const result = await murphyConversational.handleConversational(originalMessage, userId, conversationContext);
      
      // Record the interaction for learning
      murphyConversational.recordInteraction(userId, 'conversational', {
        message: originalMessage,
        intent: intent,
        responseLength: result.messageToUser.length
      });
      
      return result;
    }

    try {
      // Initialize modular components for actual task operations
      const googleTasksClient = new GoogleTasksClient(supabase);
      const taskExtractor = new TaskExtractor();
      
      // Initialize TaskOperations with proper constructor
      const taskOperations = new TaskOperations(googleTasksClient);
      
      const taskFormatter = new TaskFormatter();

      // Extract task details using LLM
      let extractedDetails;
      try {
        extractedDetails = await taskExtractor.extractTaskDetails(originalMessage, conversationContext);
      } catch (llmError) {
        console.error('LLM extraction error:', llmError);
        return {
          messageToUser: taskFormatter.formatErrorMessage('llm_parse'),
          taskId: null
        };
      }

      console.log('Final Extracted task details:', extractedDetails);

      // Route to appropriate operation based on intent
      let result;
      switch (intent) {
        case 'create_task':
          result = await this.handleCreateTask(extractedDetails, taskOperations, taskExtractor, taskFormatter, userId);
          // Track task creation in knowledge base
          if (extractedDetails.task_description) {
            murphyConversational.updateTaskActivity(userId, {
              type: 'create',
              taskDescription: extractedDetails.task_description,
              completed: false,
              dueDate: extractedDetails.due_date
            });
            
            // Update knowledge coordinator with new task activity
            this.updateKnowledgeCoordinator(userId, 'create', extractedDetails);
          }
          break;

        case 'complete_task':
          result = await taskOperations.completeTask(extractedDetails, originalMessage, userId);
          // Track task completion in knowledge base
          murphyConversational.updateTaskActivity(userId, {
            type: 'complete',
            taskDescription: extractedDetails.existing_task_title || extractedDetails.task_description,
            completed: true
          });
          
          // Update knowledge coordinator with completion
          this.updateKnowledgeCoordinator(userId, 'complete', extractedDetails);
          break;

        case 'get_task':
          result = await taskOperations.getTasks(extractedDetails, originalMessage, userId);
          break;

        case 'update_task':
          result = await taskOperations.updateTask(extractedDetails, originalMessage, userId);
          break;

        case 'delete_task':
          result = await taskOperations.deleteTask(extractedDetails, userId);
          break;

        default:
          result = {
            messageToUser: taskFormatter.formatUnknownIntent(),
            taskId: null
          };
      }

      // Record the interaction for learning
      murphyConversational.recordInteraction(userId, intent, {
        message: originalMessage,
        extractedDetails: extractedDetails,
        taskId: result.taskId,
        success: !result.messageToUser.includes('error') && !result.messageToUser.includes('couldn\'t')
      });

      return result;

    } catch (error) {
      console.error('MURPHY Agent error:', error);
      
      // Record failed interaction
      murphyConversational.recordInteraction(userId, 'error', {
        message: originalMessage,
        intent: intent,
        error: error.message
      });
      
      return {
        messageToUser: `Murphy here: Hey, I couldn't process that task. An unexpected error occurred: ${error.message}.`,
        taskId: null
      };
    }
  },

  /**
   * Determines if a message should be handled conversationally rather than as a task operation
   * @param {string} message - The user's message
   * @param {string} intent - The detected intent
   * @returns {boolean} True if should handle conversationally
   */
  shouldHandleConversationally(message, intent) {
    // Always handle greetings and casual messages conversationally
    const conversationalIntents = ['get_goals', 'get_task']; // get_task with casual message
    
    if (conversationalIntents.includes(intent)) {
      // For get_task intent, check if it's actually a casual request
      if (intent === 'get_task') {
        const casualIndicators = [
          'hey murphy', 'hello murphy', 'hi murphy', 'what\'s up',
          'how are you', 'thanks', 'thank you', 'good morning',
          'good afternoon', 'good evening'
        ];
        
        const lowerMessage = message.toLowerCase();
        return casualIndicators.some(indicator => lowerMessage.includes(indicator)) ||
               message.trim().length < 20; // Short messages are likely casual
      }
      
      return true; // get_goals and other conversational intents
    }
    
    // Check if message contains conversational keywords
    const conversationalKeywords = [
      'hey', 'hello', 'hi', 'thanks', 'thank you', 'how are you',
      'what can you do', 'who are you', 'tell me about yourself',
      'good morning', 'good afternoon', 'good evening'
    ];
    
    const lowerMessage = message.toLowerCase();
    return conversationalKeywords.some(keyword => lowerMessage.includes(keyword));
  },

  /**
   * Handles task creation with enhanced response formatting
   * @param {object} extractedDetails - Extracted task details
   * @param {object} taskOperations - Task operations instance
   * @param {object} taskExtractor - Task extractor instance
   * @param {object} taskFormatter - Task formatter instance
   * @returns {Promise<object>} Result with creation status
   */
  async handleCreateTask(extractedDetails, taskOperations, taskExtractor, taskFormatter, userId) {
    if (extractedDetails.task_description) {
      return await taskOperations.createTask(extractedDetails, userId);
    }
    
    const failureMessage = await taskExtractor.generateFailureMessageCreate();
    return { messageToUser: failureMessage, taskId: null };
  },

  /**
   * Get user knowledge summary for agent coordination
   * @param {string} userId - User identifier
   * @returns {object} User knowledge summary
   */
  getUserKnowledge(userId) {
    return murphyConversational.getUserKnowledgeForAgents(userId);
  },

  /**
   * Get rotating user knowledge that can be shared with other agents
   * @param {string} userId - User identifier
   * @returns {object} Rotating knowledge for agent coordination
   */
  getRotatingUserKnowledge(userId) {
    const knowledge = murphyConversational.getUserKnowledgeForAgents(userId);
    
    // Create a rotating summary focused on agent coordination
    return {
      userId: userId,
      timestamp: new Date().toISOString(),
      productivitySnapshot: {
        completionRate: knowledge.productivitySnapshot.completionRate,
        totalTasks: knowledge.productivitySnapshot.totalTasks,
        currentStreak: knowledge.productivitySnapshot.currentStreak,
        favoriteCategory: knowledge.productivitySnapshot.favoriteCategory
      },
      recentPatterns: {
        mostActiveHours: knowledge.recentPatterns.mostActiveHours,
        recentTaskTypes: knowledge.recentPatterns.recentTaskTypes,
        lastActivity: knowledge.recentPatterns.lastActivity
      },
      coordinationHints: {
        preferredCommunication: knowledge.personalizedInsights.communicationStyle,
        optimalInteractionTime: knowledge.personalizedInsights.optimalInteractionTime,
        motivationalTriggers: knowledge.personalizedInsights.motivationalTriggers
      }
    };
  },

  /**
   * Update knowledge coordinator with task activity
   * @param {string} userId - User identifier
   * @param {string} action - Action performed (create, complete, update, delete)
   * @param {object} taskDetails - Task details
   */
  updateKnowledgeCoordinator(userId, action, taskDetails) {
    try {
      // Get current rotating knowledge
      const rotatingKnowledge = this.getRotatingUserKnowledge(userId);
      
      // Update knowledge coordinator
      agentKnowledgeCoordinator.updateAgentKnowledge('murphy', userId, rotatingKnowledge);
      
      console.log(`MURPHY: Updated knowledge coordinator for user ${userId}, action: ${action}`);
    } catch (error) {
      console.error('MURPHY: Failed to update knowledge coordinator:', error);
    }
  },

  /**
   * Initialize knowledge coordination for a user
   * @param {string} userId - User identifier
   */
  initializeKnowledgeCoordination(userId) {
    try {
      // Register Murphy with the knowledge coordinator
      agentKnowledgeCoordinator.registerAgentWithKnowledge('murphy', userId, this);
      
      console.log(`MURPHY: Initialized knowledge coordination for user ${userId}`);
    } catch (error) {
      console.error('MURPHY: Failed to initialize knowledge coordination:', error);
    }
  },

  /**
   * Get other agents' knowledge for coordination
   * @param {string} userId - User identifier
   * @returns {object} Knowledge from other agents
   */
  getOtherAgentsKnowledge(userId) {
    try {
      return agentKnowledgeCoordinator.getRotatedUserKnowledge('murphy', userId);
    } catch (error) {
      console.error('MURPHY: Failed to get other agents knowledge:', error);
      return {};
    }
  }
};

module.exports = murphyAgent;
