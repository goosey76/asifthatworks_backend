require('dotenv').config({ path: '../../../.env' });
const axios = require('axios');

class WhatsappAdapter {
  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    if (!this.phoneNumberId || !this.accessToken) {
      console.error('WhatsApp API credentials are not fully configured. Please check your .env file.');
    }
  }

  async handleWebhook(payload) {
    console.log('WhatsApp webhook payload:', JSON.stringify(payload, null, 2));

    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = payload.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (message && contact) {
      const from = message.from;
      const normalizedFrom = from.startsWith('+') ? from : `+${from}`;
      const messageText = message.text?.body;

      console.log(`Received message from ${normalizedFrom}: "${messageText}"`);
      return { from: normalizedFrom, messageText, status: 'received', messageId: message.id };
    }

    return { status: 'ignored', message: 'No new message or contact found in payload' };
  }

  async sendMessage(to, message) {
    console.log(`Attempting to send WhatsApp message to ${to}: ${message}`);
    
    if (!this.phoneNumberId || !this.accessToken) {
      console.error('WhatsApp API credentials are not configured. Message not sent.');
      return { status: 'failed', message: 'API credentials missing' };
    }

    try {
      // Ensure message is properly formatted as a string
      const messageText = typeof message === 'string' ? message : String(message);
      
      // Truncate message if too long (WhatsApp limit is 4096 chars)
      const truncatedMessage = messageText.length > 4096 ? messageText.substring(0, 4093) + '...' : messageText;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: truncatedMessage
        }
      };

      console.log('WhatsApp API payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('WhatsApp message sent successfully:', response.data);
      return { status: 'sent', messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
      return {
        status: 'failed',
        message: error.response ? error.response.data : error.message,
        details: {
          payload: { to: to, messageLength: typeof message === 'string' ? message.length : 0 },
          errorType: error.constructor.name
        }
      };
    }
  }
}

module.exports = WhatsappAdapter;
