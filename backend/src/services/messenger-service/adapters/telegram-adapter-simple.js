require('dotenv').config({ path: '../../../.env' });
const TelegramBot = require('node-telegram-bot-api');

class TelegramSimpleAdapter {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!this.botToken) {
      console.error('Telegram bot token is not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.');
      return;
    }

    // Initialize bot with polling - but handle conflicts gracefully
    try {
      this.bot = new TelegramBot(this.botToken, { 
        polling: {
          interval: 300,
          autoStart: true,
          params: {
            timeout: 10
          }
        }
      });
      
      console.log('✅ Telegram bot initialized with polling');
      
      // Handle polling errors gracefully
      this.bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
          console.log('⚠️  Multiple bot instances detected - stopping this instance');
          this.bot.stopPolling();
        } else {
          console.error('Telegram polling error:', error.message);
        }
      });
      
    } catch (error) {
      console.error('Error initializing Telegram bot:', error.message);
    }
  }

  async handleWebhook(payload) {
    console.log('Telegram webhook payload:', JSON.stringify(payload, null, 2));

    // Telegram webhook payload structure
    const message = payload.message;
    const chat = message?.chat;
    const from = message?.from;

    if (message && chat && from) {
      const chatId = chat.id.toString();
      const userId = from.id.toString();
      const messageText = message.text;
      const username = from.username || `${from.first_name} ${from.last_name || ''}`.trim();

      console.log(`Received message from ${username} (${userId}) in chat ${chatId}: "${messageText}"`);
      return { 
        from: chatId, 
        messageText, 
        status: 'received', 
        messageId: message.message_id.toString(),
        userId: userId,
        username: username,
        chatId: chatId
      };
    }

    return { status: 'ignored', message: 'No new message found in payload' };
  }

  async sendMessage(chatId, message) {
    console.log(`Attempting to send Telegram message to ${chatId}: ${message}`);
    
    if (!this.bot) {
      console.error('Telegram bot is not initialized. Message not sent.');
      return { status: 'failed', message: 'Bot not initialized' };
    }

    try {
      // Ensure message is properly formatted as a string
      const messageText = typeof message === 'string' ? message : String(message);
      
      // Truncate message if too long (Telegram limit is 4096 chars for regular messages)
      const truncatedMessage = messageText.length > 4096 ? messageText.substring(0, 4093) + '...' : messageText;
      
      console.log('Sending to Telegram:', { chatId, messageLength: truncatedMessage.length });

      const result = await this.bot.sendMessage(chatId, truncatedMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      console.log('✅ Telegram message sent successfully:', result.message_id);
      return { status: 'sent', messageId: result.message_id.toString() };
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error.message);
      return {
        status: 'failed',
        message: error.message,
        details: {
          chatId: chatId,
          messageLength: typeof message === 'string' ? message.length : 0,
          errorType: error.constructor.name
        }
      };
    }
  }

  // Method to stop the bot (for graceful shutdown)
  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log('Telegram bot polling stopped');
    }
  }

  // Method to get bot info
  async getBotInfo() {
    if (!this.bot) {
      return null;
    }
    
    try {
      const botInfo = await this.bot.getMe();
      return botInfo;
    } catch (error) {
      console.error('Error getting bot info:', error.message);
      return null;
    }
  }
}

module.exports = TelegramSimpleAdapter;