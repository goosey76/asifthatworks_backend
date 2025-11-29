// agents/jarvi-agent/index.js

const intentAnalysis = require('./intent-analysis');
const ResponseRandomizer = require('../../response-randomizer');
const { formatCapabilitiesMessage } = require('../agents-capabilities');

const responseRandomizer = new ResponseRandomizer();

const jarviAgent = {
  /**
   * Main entry point for JARVI agent
   * Analyzes user intent and routes requests to appropriate agents
   */
  async analyzeIntent(messagePayload) {
    console.log('JARVI Agent: Analyzing intent for message:', messagePayload);
    return await intentAnalysis.analyzeIntent(messagePayload);
  },

  /**
   * Route delegation to appropriate agent with randomized response
   */
  async routeDelegation(delegationJson, messagePayload) {
    console.log('JARVI Agent: Routing delegation:', delegationJson);
    
    if (!delegationJson || !delegationJson.Recipient) {
      throw new Error('Invalid delegation JSON');
    }

    try {
      // Handle self-introduction requests
      if (delegationJson.RequestType === 'get_goals' && delegationJson.Recipient === 'JARVI') {
        // For JARVI self-introduction, use first person and include specialist agent information
        const capabilitiesMessage = formatCapabilitiesMessage('jarvi', true, true);
        return {
          response: capabilitiesMessage,
          agent: 'JARVI'
        };
      }

      switch (delegationJson.Recipient) {
        case 'Grim':
          // Handle Grim's self-introduction
          if (delegationJson.RequestType === 'get_goals') {
            const capabilitiesMessage = formatCapabilitiesMessage('grim');
            return {
              response: capabilitiesMessage,
              agent: 'JARVI'
            };
          }
          
          // Get randomized delegation response for context
          const delegationResponse = responseRandomizer.getJarviDelegationResponse();
          
          // Import Grim agent dynamically with correct path
          const grimAgent = require('../grim-agent');
          
          // Create proper entities object for Grim agent
          const grimMessageContent = typeof delegationJson.Message === 'string' 
            ? delegationJson.Message 
            : JSON.stringify(delegationJson.Message);
            
            const grimEntities = {
            message: grimMessageContent,
            originalPayload: messagePayload
          };
          
          const grimResult = await grimAgent.handleCalendarIntent(delegationJson.RequestType, grimEntities, messagePayload.userId);
          
          return {
            jarviDelegationMessage: delegationResponse,
            grimResponse: grimResult.messageToUser || grimResult.response,
            eventId: grimResult.eventId,
            agent: 'JARVI'
          };
          
        case 'Murphy':
          // Handle Murphy's self-introduction
          if (delegationJson.RequestType === 'get_goals') {
            const capabilitiesMessage = formatCapabilitiesMessage('murphy');
            return {
              response: capabilitiesMessage,
              agent: 'JARVI'
            };
          }
          
          // Get randomized delegation response for context
          const delegationResponseMurphy = responseRandomizer.getJarviDelegationResponse();
          
          // Import Murphy agent dynamically
          const murphyAgent = require('../murphy-agent/murphy-agent');
          
          // Create proper entities object for Murphy agent
          const messageContent = typeof delegationJson.Message === 'string' 
            ? delegationJson.Message 
            : JSON.stringify(delegationJson.Message);
            
            const murphyEntities = {
            message: messageContent,
            originalPayload: messagePayload,
            conversation_context: messagePayload.conversation_context || []
          };
          
          const murphyResult = await murphyAgent.handleTask(delegationJson.RequestType, murphyEntities, messagePayload.userId);
          
          return {
            jarviDelegationMessage: delegationResponseMurphy,
            murphyResponse: murphyResult.messageToUser || murphyResult.response,
            agent: 'JARVI'
          };
          
        default:
          throw new Error(`Unknown recipient: ${delegationJson.Recipient}`);
      }
    } catch (error) {
      console.error('JARVI Agent: Error routing delegation:', error);
      return {
        response: "Delegation failed. Even I can't fix this mess.",
        agent: 'JARVI',
        error: error.message
      };
    }
  },

  /**
   * Get agent configuration - with actual database IDs
   */
  async getAgentConfig(agentName) {
    console.log('JARVI Agent: Getting config for:', agentName);
    try {
      // Return actual database IDs
      const configs = {
        'JARVI': { id: '9a177e70-3fad-47ff-b7ee-379fe2ffcc05', name: 'JARVI', type: 'intent_analyzer' },
        'Grim': { id: 'cb2e24aa-5891-4106-8bb7-5ccf47d9a10c', name: 'GRIM', type: 'calendar_manager' },
        'Murphy': { id: '22ca0826-def1-4eb8-bc7a-f547570cf5a0', name: 'MURPHY', type: 'task_manager' }
      };
      return configs[agentName] || null;
    } catch (error) {
      console.log('Agent config error (likely test user):', error.message);
      // Return hardcoded config for test users
      return {
        'JARVI': { id: 'test-jarvi-id', name: 'JARVI', type: 'intent_analyzer' },
        'Grim': { id: 'test-grim-id', name: 'GRIM', type: 'calendar_manager' },
        'Murphy': { id: 'test-murphy-id', name: 'MURPHY', type: 'task_manager' }
      }[agentName] || null;
    }
  },

  /**
   * Delegate task to appropriate agent - FOLLOW LLM DELEGATION EXACTLY
   * This method now accepts the exact delegation JSON from the LLM instead of creating its own
   */
  async delegateTask(delegationJson, entities, userId) {
    console.log('JARVI Agent: Following LLM delegation:', delegationJson);
    
    if (!delegationJson || !delegationJson.Recipient || !delegationJson.RequestType) {
      throw new Error('Invalid delegation JSON from LLM');
    }

    return await this.routeDelegation(delegationJson, { userId, ...entities });
  }
};

module.exports = jarviAgent;
