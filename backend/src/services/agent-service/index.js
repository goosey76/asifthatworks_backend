// agent-service/index.js

// Agent service router - orchestrates between JARVI, GRIM, and MURPHY agents
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' }); // Load environment variables

// Import the new organized agents
const jarviAgent = require('../agents/jarvi-agent');
const grimAgent = require('../agents/grim-agent');
const murphyAgent = require('../agents/murphy-agent');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const agentService = {
  supabase,
  jarviAgent,
  grimAgent,
  murphyAgent,
  
  async getAgentConfig(agentName) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('name', agentName)
      .single();

    if (error) {
      console.error(`Error fetching agent config for ${agentName}:`, error);
      return null;
    }
    return data;
  },

  async createAgentConfig(agentData) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agentData])
      .select();

    if (error) {
      console.error('Error creating agent config:', error);
      throw error;
    }
    return data[0];
  },

  async updateAgentConfig(agentId, agentData) {
    const { data, error } = await supabase
      .from('agents')
      .update(agentData)
      .eq('id', agentId)
      .select();

    if (error) {
      console.error(`Error updating agent config for ${agentId}:`, error);
      throw error;
    }
    return data[0];
  },

  async delegateTask(intent, entities, userId) {
    console.log(`Delegating task for intent: ${intent} with entities:`, entities);
    
    // Use the new agent routing through jarviAgent
    const delegationJson = {
      Recipient: intent.includes('event') ? 'Grim' : 'Murphy',
      RequestType: intent.replace('_', ' '),
      Message: entities.message || JSON.stringify(entities)
    };

    try {
      return await jarviAgent.routeDelegation(delegationJson, { userId });
    } catch (error) {
      console.error('Error in delegation:', error);
      return { 
        status: 'failed', 
        message: 'Delegation failed: ' + error.message,
        error: error 
      };
    }
  }
};

module.exports = agentService;
