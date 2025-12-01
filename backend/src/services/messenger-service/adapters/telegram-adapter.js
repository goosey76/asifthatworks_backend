const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const TelegramBot = require('node-telegram-bot-api');

// Telegram API error codes that indicate retryable errors
const RETRYABLE_ERROR_CODES = [
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504  // Gateway Timeout
];

// Error codes that indicate the message cannot be delivered
const PERMANENT_ERROR_CODES = [
  400, // Bad Request (invalid chat_id, etc.)
  401, // Unauthorized
  403, // Forbidden (bot blocked by user)
  404  // Not Found
];

class TelegramAdapter {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.bot = null;
    this.isInitialized = false;
    this.initError = null;
    
    this._initialize();
  }

  _initialize() {
    if (!this.botToken) {
      this.initError = new Error('Telegram bot token is not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.');
      console.error('[TelegramAdapter]', this.initError.message);
      return;
    }

    try {
      // Initialize bot WITHOUT polling (webhook mode)
      this.bot = new TelegramBot(this.botToken, {
        polling: false,
        request: {
          timeout: 30000 // 30 second timeout for API requests
        }
      });
      
      this.isInitialized = true;
      console.log('[TelegramAdapter] Bot initialized in webhook mode');
    } catch (error) {
      this.initError = error;
      console.error('[TelegramAdapter] Failed to initialize:', error.message);
    }
  }

  // Check if adapter is ready to use
  isReady() {
    return this.isInitialized && this.bot !== null;
  }

  // Get initialization error if any
  getInitError() {
    return this.initError;
  }

  async handleWebhook(payload) {
    console.log('[TelegramAdapter] Processing webhook payload');

    try {
      // Handle different types of Telegram updates
      const message = payload.message || payload.edited_message;
      const callbackQuery = payload.callback_query;
      
      // Handle callback queries (button clicks)
      if (callbackQuery) {
        const chat = callbackQuery.message?.chat;
        const from = callbackQuery.from;
        
        if (chat && from) {
          return {
            from: chat.id.toString(),
            messageText: callbackQuery.data || '',
            status: 'callback',
            messageId: callbackQuery.id,
            userId: from.id.toString(),
            username: from.username || `${from.first_name || ''} ${from.last_name || ''}`.trim(),
            chatId: chat.id.toString(),
            isCallback: true
          };
        }
      }
      
      // Handle regular messages
      const chat = message?.chat;
      const from = message?.from;

      if (message && chat && from) {
        const chatId = chat.id.toString();
        const userId = from.id.toString();
        const messageText = message.text || message.caption || '';
        const username = from.username || `${from.first_name || ''} ${from.last_name || ''}`.trim();

        // Log only essential info to avoid log bloat
        console.log(`[TelegramAdapter] Message from ${username} (${userId}): "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`);
        
        return {
          from: chatId,
          messageText,
          status: 'received',
          messageId: message.message_id.toString(),
          userId: userId,
          username: username,
          chatId: chatId,
          // Additional metadata that might be useful
          hasPhoto: !!message.photo,
          hasDocument: !!message.document,
          hasVoice: !!message.voice,
          replyToMessageId: message.reply_to_message?.message_id?.toString()
        };
      }

      return { status: 'ignored', message: 'No processable message found in payload' };
      
    } catch (error) {
      console.error('[TelegramAdapter] Error processing webhook:', error.message);
      return {
        status: 'error',
        message: error.message,
        error: error
      };
    }
  }

  // Escape HTML special characters for Telegram HTML parse mode
  _escapeHtml(text) {
    if (typeof text !== 'string') return String(text);
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Sanitize message for safe sending (handle HTML issues)
  _sanitizeMessage(message) {
    if (typeof message !== 'string') {
      message = String(message);
    }
    
    // Check for unbalanced HTML tags that could cause issues
    const htmlTagPattern = /<\/?[a-z][^>]*>/gi;
    const tags = message.match(htmlTagPattern) || [];
    
    // If there are potential HTML issues, escape the whole message
    if (tags.length > 0) {
      // Check for common problematic patterns
      const hasUnbalancedTags = /<[^>]*$/.test(message) || /^[^<]*>/.test(message);
      if (hasUnbalancedTags) {
        return this._escapeHtml(message);
      }
    }
    
    return message;
  }

  async sendMessage(chatId, message, options = {}) {
    const logPrefix = `[TelegramAdapter] [${chatId}]`;
    
    if (!this.isReady()) {
      const error = this.initError || new Error('Bot not initialized');
      console.error(`${logPrefix} Cannot send - ${error.message}`);
      return {
        status: 'failed',
        message: error.message,
        error: error
      };
    }

    // Validate inputs
    if (!chatId) {
      return { status: 'failed', message: 'Chat ID is required' };
    }
    
    if (!message && message !== 0) {
      return { status: 'failed', message: 'Message content is required' };
    }

    // Prepare message
    let messageText = typeof message === 'string' ? message : String(message);
    
    // Sanitize and truncate message
    messageText = this._sanitizeMessage(messageText);
    const MAX_LENGTH = 4096;
    const truncatedMessage = messageText.length > MAX_LENGTH
      ? messageText.substring(0, MAX_LENGTH - 3) + '...'
      : messageText;
    
    console.log(`${logPrefix} Sending message (${truncatedMessage.length} chars)`);

    // Configure send options
    const sendOptions = {
      parse_mode: options.parseMode || 'HTML',
      disable_web_page_preview: options.disablePreview !== false,
      disable_notification: options.silent || false,
      ...options.extra
    };

    // Retry logic
    const maxRetries = options.maxRetries || 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.bot.sendMessage(chatId, truncatedMessage, sendOptions);
        
        console.log(`${logPrefix} Message sent successfully (attempt ${attempt})`);
        return {
          status: 'sent',
          messageId: result.message_id.toString(),
          attempt: attempt
        };
        
      } catch (error) {
        lastError = error;
        const errorCode = error.response?.statusCode || error.code;
        
        console.error(`${logPrefix} Send attempt ${attempt} failed:`, error.message);
        
        // Check if it's a permanent error (don't retry)
        if (PERMANENT_ERROR_CODES.includes(errorCode)) {
          console.error(`${logPrefix} Permanent error (${errorCode}), not retrying`);
          break;
        }
        
        // Check if it's a parse error (try without HTML)
        if (error.message.includes('parse') || error.message.includes('HTML')) {
          console.log(`${logPrefix} HTML parse error, retrying with plain text`);
          sendOptions.parse_mode = undefined;
        }
        
        // If retryable and not last attempt, wait before retry
        if (attempt < maxRetries && RETRYABLE_ERROR_CODES.includes(errorCode)) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`${logPrefix} Retrying in ${backoffMs}ms...`);
          await this._sleep(backoffMs);
        }
      }
    }

    // All retries failed
    return {
      status: 'failed',
      message: lastError?.message || 'Unknown error',
      error: lastError,
      details: {
        chatId: chatId,
        messageLength: truncatedMessage.length,
        attempts: maxRetries
      }
    };
  }

  // Helper sleep function
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to set webhook URL (for production setup)
  async setWebhook(webhookUrl, options = {}) {
    if (!this.isReady()) {
      throw this.initError || new Error('Bot not initialized');
    }
    
    try {
      const webhookOptions = {
        url: webhookUrl,
        max_connections: options.maxConnections || 40,
        allowed_updates: options.allowedUpdates || ['message', 'edited_message', 'callback_query'],
        drop_pending_updates: options.dropPending || false
      };
      
      const result = await this.bot.setWebHook(webhookUrl, webhookOptions);
      console.log('[TelegramAdapter] Webhook set successfully:', webhookUrl);
      return result;
    } catch (error) {
      console.error('[TelegramAdapter] Error setting webhook:', error.message);
      throw error;
    }
  }

  // Method to delete webhook
  async deleteWebhook(dropPending = false) {
    if (!this.isReady()) {
      throw this.initError || new Error('Bot not initialized');
    }
    
    try {
      const result = await this.bot.deleteWebHook({ drop_pending_updates: dropPending });
      console.log('[TelegramAdapter] Webhook deleted');
      return result;
    } catch (error) {
      console.error('[TelegramAdapter] Error deleting webhook:', error.message);
      throw error;
    }
  }

  // Method to get webhook info
  async getWebhookInfo() {
    if (!this.isReady()) {
      return null;
    }
    
    try {
      return await this.bot.getWebHookInfo();
    } catch (error) {
      console.error('[TelegramAdapter] Error getting webhook info:', error.message);
      return null;
    }
  }

  // Method to get bot info
  async getBotInfo() {
    if (!this.isReady()) {
      return null;
    }
    
    try {
      const botInfo = await this.bot.getMe();
      return botInfo;
    } catch (error) {
      console.error('[TelegramAdapter] Error getting bot info:', error.message);
      return null;
    }
  }

  // Send typing indicator
  async sendTypingIndicator(chatId) {
    if (!this.isReady()) return false;
    
    try {
      await this.bot.sendChatAction(chatId, 'typing');
      return true;
    } catch (error) {
      console.error('[TelegramAdapter] Error sending typing indicator:', error.message);
      return false;
    }
  }
}

module.exports = TelegramAdapter;