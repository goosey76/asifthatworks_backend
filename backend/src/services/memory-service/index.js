// memory-service/index.js

require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const memoryService = {
  supabase,

  async storeConversation(userId, agentId, messages) {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, agent_id: agentId, messages: messages }])
      .select();

    if (error) {
      console.error('Error storing conversation:', error);
      throw error;
    }
    return data[0];
  },

  async getConversationHistory(userId, agentId, limit = 10) {
    const { data, error } = await supabase
      .from('conversations')
      .select('messages')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
    return data.map(row => row.messages).flat();
  },

  async storeForeverBrain(userId, conversationId, summary, context, type = 'general') {
    const { data, error } = await supabase
      .from('forever_brain')
      .insert([{ user_id: userId, conversation_id: conversationId, summary: summary, context: context, type: type }])
      .select();

    if (error) {
      console.error('Error storing Forever Brain memory:', error);
      throw error;
    }
    return data[0];
  },

  async getForeverBrain(userId, type = null, limit = 5) {
    let query = supabase
      .from('forever_brain')
      .select('summary, context, type')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching Forever Brain memories:', error);
      throw error;
    }
    return data;
  },

  // New functions for user_goals
  async saveUserGoal(userId, goalData) {
    const { data, error } = await supabase
      .from('user_goals')
      .insert([{ user_id: userId, ...goalData }])
      .select();

    if (error) {
      console.error('Error saving user goal:', error);
      throw error;
    }
    return data[0];
  },

  async getUserGoals(userId, status = 'active') {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user goals:', error);
      throw error;
    }
    return data;
  },

  async updateUserGoalProgress(userId, goalId, progressNote) {
    const { data: existingGoal, error: fetchError } = await supabase
      .from('user_goals')
      .select('progress_notes')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching existing goal for progress update:', fetchError);
      throw fetchError;
    }

    const updatedProgressNotes = existingGoal.progress_notes ? [...existingGoal.progress_notes, progressNote] : [progressNote];

    const { data, error } = await supabase
      .from('user_goals')
      .update({ progress_notes: updatedProgressNotes, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error updating user goal progress:', error);
      throw error;
    }
    return data[0];
  },

  // New functions for user_preferences
  async saveUserPreference(userId, key, value) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ user_id: userId, preference_key: key, preference_value: value, updated_at: new Date().toISOString() }], { onConflict: ['user_id', 'preference_key'] })
      .select();

    if (error) {
      console.error('Error saving user preference:', error);
      throw error;
    }
    return data[0];
  },

  async getUserPreference(userId, key) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_value')
      .eq('user_id', userId)
      .eq('preference_key', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching user preference:', error);
      throw error;
    }
    return data ? data.preference_value : null;
  }
};

module.exports = memoryService;
