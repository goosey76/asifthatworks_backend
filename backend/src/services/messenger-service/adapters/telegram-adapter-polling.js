require('dotenv').config({ path: '../../../.env' });
const TelegramBot = require('node-telegram-bot-api');

class TelegramPollingAdapter {
  constructor(messageHandler) {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.messageHandler = messageHandler;
    
    if (!this.botToken) {
      console.error('Telegram bot token is not configured. Please set TELEGRAM_BOT_TOKEN in your .env file.');
      return;
    }

    // Initialize bot with polling
    try {
      this.bot = new TelegramBot(this.botToken, { 
        polling: {
          interval: 1000,
          autoStart: true,
          params: {
            timeout: 10
          }
        }
      });
      
      console.log('✅ Telegram bot initialized with polling');
      
      // Handle incoming messages
      this.bot.on('message', async (msg) => {
        try {
          console.log('📱 Telegram message received:', msg);
          
          const chatId = msg.chat.id.toString();
          const messageText = msg.text;
          const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name || ''}`.trim();
          
          console.log(`💬 Processing message from ${username}: "${messageText}"`);
          
          // Call the message handler if provided
          if (this.messageHandler) {
            await this.messageHandler({
              chatId,
              messageText,
              userId: msg.from.id.toString(),
              username,
              messageId: msg.message_id.toString()
            });
          }
        } catch (error) {
          console.error('❌ Error processing Telegram message:', error);
        }
      });
      
      // Handle polling errors gracefully
      this.bot.on('polling_error', (error) => {
        if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
          console.log('⚠️  Multiple bot instances detected - stopping this instance');
          this.bot.stopPolling();
        } else {
          console.error('❌ Telegram polling error:', error.message);
        }
      });
      
    } catch (error) {
      console.error('❌ Error initializing Telegram bot:', error.message);
    }
  }

  async handleWebhook(payload) {
    console.log('Telegram webhook payload:', JSON.stringify(payload, null, 2));

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
    console.log(`📤 Attempting to send Telegram message to ${chatId}`);
    
    if (!this.bot) {
      console.error('❌ Telegram bot is not initialized. Message not sent.');
      return { status: 'failed', message: 'Bot not initialized' };
    }

    try {
      const messageText = typeof message === 'string' ? message : String(message);
      const truncatedMessage = messageText.length > 4096 ? messageText.substring(0, 4093) + '...' : messageText;
      
      console.log(`💬 Sending message (${truncatedMessage.length} chars)`);

      const result = await this.bot.sendMessage(chatId, truncatedMessage, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      console.log('✅ Telegram message sent successfully!', result.message_id);
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

  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      console.log('Telegram bot polling stopped');
    }
  }

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

module.exports = TelegramPollingAdapter;