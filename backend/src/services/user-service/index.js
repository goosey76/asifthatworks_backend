// user-service/index.js

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Environment configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Lazy-initialized Supabase client
let supabase = null;
let isInitialized = false;
let initError = null;

// Configuration
const CONFIG = {
  retryAttempts: 3,
  retryDelayMs: 1000,
  queryTimeoutMs: 10000
};

// Error codes that indicate "not found" rather than actual errors
const NOT_FOUND_CODES = ['PGRST116'];

// Initialize Supabase client lazily
function getSupabaseClient() {
  if (supabase) return supabase;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    initError = new Error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
    console.error('[UserService]', initError.message);
    throw initError;
  }
  
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    });
    isInitialized = true;
    console.log('[UserService] Supabase client initialized successfully');
    return supabase;
  } catch (error) {
    initError = error;
    console.error('[UserService] Failed to initialize Supabase:', error.message);
    throw error;
  }
}

// Retry wrapper for database operations
async function withRetry(operation, operationName, maxRetries = CONFIG.retryAttempts) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([
        operation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${operationName} timeout`)), CONFIG.queryTimeoutMs)
        )
      ]);
    } catch (error) {
      lastError = error;
      console.error(`[UserService] ${operationName} attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message.includes('not found') ||
          error.message.includes('validation') ||
          NOT_FOUND_CODES.includes(error.code)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = CONFIG.retryDelayMs * Math.pow(2, attempt - 1);
        console.log(`[UserService] Retrying ${operationName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Custom error class for user service
class UserServiceError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'UserServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

// User service with comprehensive error handling
const userService = {
  // Expose Supabase client getter for compatibility
  get supabase() {
    return getSupabaseClient();
  },
  
  // Check if service is ready
  isReady() {
    try {
      getSupabaseClient();
      return true;
    } catch {
      return false;
    }
  },
  
  // Get initialization error if any
  getInitError() {
    return initError;
  },

  async registerUser(email, password) {
    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new UserServiceError('Valid email address is required', 'INVALID_EMAIL');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new UserServiceError('Password must be at least 6 characters', 'INVALID_PASSWORD');
    }
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
      });
      
      if (error) {
        console.error('[UserService] Registration error:', error.message);
        throw new UserServiceError(
          error.message || 'Registration failed',
          error.code || 'REGISTRATION_ERROR',
          error
        );
      }
      
      console.log('[UserService] User registered successfully:', email);
      return data;
    }, 'registerUser');
  },

  async loginUser(email, password) {
    // Input validation
    if (!email || typeof email !== 'string') {
      throw new UserServiceError('Email is required', 'INVALID_EMAIL');
    }
    if (!password || typeof password !== 'string') {
      throw new UserServiceError('Password is required', 'INVALID_PASSWORD');
    }
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });
      
      if (error) {
        console.error('[UserService] Login error:', error.message);
        throw new UserServiceError(
          error.message || 'Login failed',
          error.code || 'LOGIN_ERROR',
          error
        );
      }
      
      console.log('[UserService] User logged in successfully:', email);
      return data;
    }, 'loginUser');
  },

  async getUserProfile(userId) {
    if (!userId) {
      throw new UserServiceError('User ID is required', 'INVALID_USER_ID');
    }
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (NOT_FOUND_CODES.includes(error.code)) {
          return null;
        }
        console.error('[UserService] Error getting user profile:', error.message);
        throw new UserServiceError(
          'Failed to get user profile',
          'PROFILE_ERROR',
          error
        );
      }
      
      return data;
    }, 'getUserProfile');
  },

  async updateUserProfile(userId, updates) {
    if (!userId) {
      throw new UserServiceError('User ID is required', 'INVALID_USER_ID');
    }
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      throw new UserServiceError('Updates object is required', 'INVALID_UPDATES');
    }
    
    // Sanitize updates - remove any dangerous fields
    const safeUpdates = { ...updates };
    delete safeUpdates.id; // Prevent ID modification
    delete safeUpdates.created_at;
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .update(safeUpdates)
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('[UserService] Error updating user profile:', error.message);
        throw new UserServiceError(
          'Failed to update user profile',
          'UPDATE_ERROR',
          error
        );
      }
      
      console.log('[UserService] User profile updated:', userId);
      return data;
    }, 'updateUserProfile');
  },

  async findUserByPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      return null;
    }
    
    // Normalize phone number
    const normalizedPhone = String(phoneNumber).replace(/\s+/g, '').trim();
    
    try {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('phone_number', normalizedPhone)
        .single();
        
      if (error) {
        if (NOT_FOUND_CODES.includes(error.code)) {
          return null;
        }
        console.error('[UserService] Error finding user by phone number:', error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      // Handle timeout and network errors gracefully
      if (error.message?.includes('timeout')) {
        console.warn('[UserService] Phone lookup timed out');
        return null;
      }
      throw error;
    }
  },

  async findUserByTelegramChatId(chatId) {
    if (!chatId) {
      return null;
    }
    
    const normalizedChatId = String(chatId).trim();
    
    try {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('telegram_chat_id', normalizedChatId)
        .single();
        
      if (error) {
        if (NOT_FOUND_CODES.includes(error.code)) {
          return null;
        }
        console.error('[UserService] Error finding user by Telegram chat ID:', error.message);
        throw error;
      }
      
      return data;
    } catch (error) {
      // Handle timeout and network errors gracefully
      if (error.message?.includes('timeout')) {
        console.warn('[UserService] Telegram chat ID lookup timed out');
        return null;
      }
      throw error;
    }
  },

  async findUserByIdentifier(identifier, platform = 'whatsapp') {
    if (!identifier) {
      return null;
    }
    
    console.log(`[UserService] Finding user by ${platform} identifier:`, identifier);
    
    if (platform === 'telegram') {
      return this.findUserByTelegramChatId(identifier);
    } else {
      return this.findUserByPhoneNumber(identifier);
    }
  },

  async linkTelegramChatId(userId, chatId) {
    if (!userId) {
      throw new UserServiceError('User ID is required', 'INVALID_USER_ID');
    }
    if (!chatId) {
      throw new UserServiceError('Telegram chat ID is required', 'INVALID_CHAT_ID');
    }
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .update({ telegram_chat_id: String(chatId).trim() })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('[UserService] Error linking Telegram chat ID:', error.message);
        throw new UserServiceError(
          'Failed to link Telegram chat ID',
          'LINK_ERROR',
          error
        );
      }
      
      console.log('[UserService] Telegram chat ID linked for user:', userId);
      return data;
    }, 'linkTelegramChatId');
  },

  async linkPhoneNumber(userId, phoneNumber) {
    if (!userId) {
      throw new UserServiceError('User ID is required', 'INVALID_USER_ID');
    }
    if (!phoneNumber) {
      throw new UserServiceError('Phone number is required', 'INVALID_PHONE');
    }
    
    const normalizedPhone = String(phoneNumber).replace(/\s+/g, '').trim();
    
    return withRetry(async () => {
      const db = getSupabaseClient();
      const { data, error } = await db
        .from('users')
        .update({ phone_number: normalizedPhone })
        .eq('id', userId)
        .select();
        
      if (error) {
        console.error('[UserService] Error linking phone number:', error.message);
        throw new UserServiceError(
          'Failed to link phone number',
          'LINK_ERROR',
          error
        );
      }
      
      console.log('[UserService] Phone number linked for user:', userId);
      return data;
    }, 'linkPhoneNumber');
  },
  
  // Test database connection
  async testConnection() {
    try {
      const db = getSupabaseClient();
      const { error } = await db.from('users').select('count').limit(1);
      if (error && !NOT_FOUND_CODES.includes(error.code)) {
        console.error('[UserService] Connection test failed:', error.message);
        return false;
      }
      console.log('[UserService] Connection test successful');
      return true;
    } catch (error) {
      console.error('[UserService] Connection test error:', error.message);
      return false;
    }
  }
};

module.exports = userService;
