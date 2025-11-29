// user-service/index.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load environment variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Placeholder for user-related functions
const userService = {
  supabase,
  async registerUser(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Error registering user:', error);
      throw error;
    }
    return data;
  },

  async loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
    return data;
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    return data;
  },

  async findUserByPhoneNumber(phoneNumber) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    if (error) {
      // If no rows are found, Supabase returns an error with code 'PGRST116'
      // We should return null in this case, not throw an error.
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user by phone number:', error);
      throw error;
    }
    return data;
  },

  async findUserByTelegramChatId(chatId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_chat_id', chatId.toString())
      .single();
    if (error) {
      // If no rows are found, Supabase returns an error with code 'PGRST116'
      // We should return null in this case, not throw an error.
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user by Telegram chat ID:', error);
      throw error;
    }
    return data;
  },

  async findUserByIdentifier(identifier, platform = 'whatsapp') {
    // identifier can be phone number (WhatsApp) or chat ID (Telegram)
    if (platform === 'telegram') {
      return await this.findUserByTelegramChatId(identifier);
    } else {
      return await this.findUserByPhoneNumber(identifier);
    }
  },

  async linkTelegramChatId(userId, chatId) {
    const { data, error } = await supabase
      .from('users')
      .update({ telegram_chat_id: chatId.toString() })
      .eq('id', userId)
      .select();
    if (error) {
      console.error('Error linking Telegram chat ID:', error);
      throw error;
    }
    return data;
  },

  async linkPhoneNumber(userId, phoneNumber) {
    const { data, error } = await supabase
      .from('users')
      .update({ phone_number: phoneNumber })
      .eq('id', userId)
      .select();
    if (error) {
      console.error('Error linking phone number:', error);
      throw error;
    }
    return data;
  }
};

module.exports = userService;
