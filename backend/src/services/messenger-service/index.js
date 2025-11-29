// messenger-service/index.js - Enhanced to support both WhatsApp and Telegram

const express = require('express');
const router = express.Router();
const WhatsappAdapter = require('./adapters/whatsapp-adapter');
const TelegramAdapter = require('./adapters/telegram-adapter');
require('dotenv').config({ path: '../../.env' });
const llmService = require('../llm-service');
const jarviService = require('../jarvi-service');
const userService = require('../user-service');
const agentService = require('../agents/jarvi-agent');

// Initialize WhatsApp adapter
const whatsappAdapter = new WhatsappAdapter();

// Initialize Telegram adapter
const telegramAdapter = new TelegramAdapter();


// Detect which platform the message is from
function detectPlatform(payload) {
  // Check for Telegram webhook structure
  if (payload.update_id && payload.message) {
    return 'telegram';
  }
  
  // Check for WhatsApp webhook structure
  if (payload.entry && payload.object) {
    return 'whatsapp';
  }
  
  return 'unknown';
}

// Get the appropriate adapter for the platform
function getAdapter(platform) {
  switch (platform) {
    case 'telegram':
      return telegramAdapter;
    case 'whatsapp':
      return whatsappAdapter;
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

// Webhook verification for WhatsApp
router.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      console.error('Webhook verification failed: Token mismatch or mode not subscribe.');
      res.sendStatus(403);
    }
  } else {
    console.error('Webhook verification failed: Missing mode or token.');
    res.sendStatus(403);
  }
});

// Webhook for both WhatsApp and Telegram
router.post('/webhook', async (req, res) => {
  console.log('Messenger webhook received:', JSON.stringify(req.body, null, 2));
  
  try {
    const platform = detectPlatform(req.body);
    console.log(`Detected platform: ${platform}`);
    
    if (platform === 'unknown') {
      console.error('Unknown platform in webhook payload');
      return res.status(400).json({ error: 'Unknown platform' });
    }
    
    const adapter = getAdapter(platform);
    const { from, messageText, status, messageId, userId, username, chatId } = await adapter.handleWebhook(req.body);

    if (status === 'ignored') {
      return res.status(200).json({ message: 'Message ignored' });
    }

    // Find user by identifier (phone for WhatsApp, chat ID for Telegram)
    const identifier = platform === 'telegram' ? chatId : from;
    const user = await userService.findUserByIdentifier(identifier, platform);

    if (!user) {
      // Handle case where user is not found
      console.log(`User with identifier ${identifier} not found.`);
      const welcomeMessage = platform === 'telegram' 
        ? "Welcome! I don't recognize you yet. Please register with your email first, then I can help you with calendar and task management! 📅✨"
        : "It looks like you're not registered. Please register with your email and then link your phone number.";
      await adapter.sendMessage(identifier, welcomeMessage);
      return res.status(404).json({ error: 'User not found' });
    }

    // Assuming the webhook payload contains a message that needs intent analysis
    const jarviResponse = await jarviService.analyzeIntent({ userId: user.id, text: messageText });

    // Send JARVI's response to the user with improved logic
    if (jarviResponse.responseToUser && !jarviResponse.delegationJson) {
      console.log('JARVI direct response (no delegation):', jarviResponse.responseToUser);
      
      // Clean the response to extract only the text content
      let cleanResponse = jarviResponse.responseToUser;
      
      // Remove quotation marks that wrap the entire response
      cleanResponse = cleanResponse.trim();
      if ((cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) ||
          (cleanResponse.startsWith("'") && cleanResponse.endsWith("'"))) {
        cleanResponse = cleanResponse.slice(1, -1);
      }
      
      // Remove common LLM response prefixes and formatting
      cleanResponse = cleanResponse.replace(/^Direct Answer:\s*/gi, '');
      cleanResponse = cleanResponse.replace(/^Answer:\s*/gi, '');
      cleanResponse = cleanResponse.replace(/^Response:\s*/gi, '');
      cleanResponse = cleanResponse.replace(/^Here is the response:\s*/gi, '');
      cleanResponse = cleanResponse.replace(/^Here's your answer:\s*/gi, '');
      cleanResponse = cleanResponse.replace(/^Based on your question:\s*/gi, '');
      
      // Remove any markdown formatting
      cleanResponse = cleanResponse.replace(/```[\s\S]*?```/g, '');
      cleanResponse = cleanResponse.replace(/`([^`]+)`/g, '$1');
      cleanResponse = cleanResponse.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleanResponse = cleanResponse.replace(/\*([^*]+)\*/g, '$1');
      
      // Remove any JSON-like patterns that might be included in text
      cleanResponse = cleanResponse.replace(/\{[^}]+\}/g, '');
      cleanResponse = cleanResponse.replace(/\[[^\]]+\]/g, '');
      
      // Clean up any extra whitespace and line breaks
      cleanResponse = cleanResponse.trim();
      
      // Handle multi-line responses more intelligently
      const lines = cleanResponse.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length > 1) {
        // If multiple lines, try to identify the actual response vs headers/prefixes
        const nonPrefixLines = lines.filter(line =>
          !line.match(/^(direct answer|answer|response|based on|here is)/i)
        );
        
        if (nonPrefixLines.length > 0) {
          // Use the longest non-prefix line as it's likely the actual response
          cleanResponse = nonPrefixLines.sort((a, b) => b.length - a.length)[0];
        } else {
          // If all lines look like headers, take the last non-empty line
          cleanResponse = lines[lines.length - 1];
        }
      }
      
      // Send JARVI's response only for non-delegation requests
      await adapter.sendMessage(identifier, cleanResponse);
    } else if (jarviResponse.delegationJson) {
      console.log('JARVI delegation detected - only agent response will be sent');
    }

    // If there's a delegation JSON, process it
    if (jarviResponse.delegationJson) {
      const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
      // Map Recipient to agent name and RequestType to intent for agentService.delegateTask
      const agentName = Recipient.toLowerCase(); // 'grim' or 'murphy'
      const intent = RequestType.toLowerCase().replace(' ', '_'); // e.g., 'create_event'
      
      // Get conversation history for context (last 15 messages)
      let conversationContext = [];
      try {
        const memoryService = require('../memory-service');
        // Get JARVI's agent ID for conversation history
        const jarviAgentConfig = await agentService.getAgentConfig('JARVI');
        if (jarviAgentConfig) {
          conversationContext = await memoryService.getConversationHistory(user.id, jarviAgentConfig.id, 15);
        }
      } catch (contextError) {
        console.log('Could not fetch conversation context:', contextError.message);
      }
      
      const entities = {
        message: Message, // Original message
        conversation_context: conversationContext // Add context for better understanding
      };

      // Pass the original delegation JSON directly instead of reconstructing it
      const delegationResult = await agentService.delegateTask(jarviResponse.delegationJson, entities, user.id);
      
      console.log('=== DELEGATION DEBUG ===');
      console.log('Delegation result:', delegationResult);
      console.log('Has response:', delegationResult?.response ? 'YES' : 'NO');
      console.log('Message length:', delegationResult?.response?.length || 0);
      console.log('=== END DEBUG ===');
      
      // Send the delegation result back to the user (separately from JARVI's response)
      if (delegationResult && (delegationResult.response || delegationResult.grimResponse || delegationResult.murphyResponse)) {
        console.log(`Sending delegation messages to ${platform}...`);
        
        // Send JARVI's delegation message first
        if (delegationResult.jarviDelegationMessage) {
          await adapter.sendMessage(identifier, delegationResult.jarviDelegationMessage);
        }
        
        // Send agent response with a delay
        setTimeout(async () => {
          const agentResponse = delegationResult.grimResponse || delegationResult.murphyResponse || delegationResult.response;
          if (agentResponse) {
            const sendResult = await adapter.sendMessage(identifier, agentResponse);
            console.log(`${platform} send result:`, sendResult);
            console.log('Event ID for background handling:', delegationResult.eventId);
          }
        }, 1500); // 1.5 second delay
        
      } else if (delegationResult) {
        console.log('No response found, sending raw delegation result...');
        // If delegationResult exists but doesn't have response, send the whole object as a string
        setTimeout(async () => {
          await adapter.sendMessage(identifier, JSON.stringify(delegationResult));
        }, 1500);
      } else {
        console.log('No delegation result found at all!');
      }

      res.status(200).json({ 
        messengerResult: { from: identifier, messageText, status, platform }, 
        jarviResponse, 
        delegationResult 
      });
    } else {
      // If no delegation, just return JARVI's direct response
      res.status(200).json({ 
        messengerResult: { from: identifier, messageText, status, platform }, 
        jarviResponse 
      });
    }
  } catch (error) {
    console.error('Error handling messenger webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Telegram-specific webhook endpoint (alternative to combined webhook)
router.post('/telegram/webhook', async (req, res) => {
  console.log('Telegram webhook received:', JSON.stringify(req.body, null, 2));
  
  try {
    const adapter = telegramAdapter;
    const { from, messageText, status, messageId, userId, username, chatId } = await adapter.handleWebhook(req.body);

    if (status === 'ignored') {
      return res.status(200).json({ message: 'Message ignored' });
    }

    const user = await userService.findUserByIdentifier(chatId, 'telegram');

    if (!user) {
      console.log(`User with Telegram chat ID ${chatId} not found.`);
      const welcomeMessage = "Welcome! I don't recognize you yet. Please register with your email first, then I can help you with calendar and task management! 📅✨";
      await adapter.sendMessage(chatId, welcomeMessage);
      return res.status(404).json({ error: 'User not found' });
    }

    const jarviResponse = await jarviService.analyzeIntent({ userId: user.id, text: messageText });

    // Handle responses similar to the main webhook but specifically for Telegram
    if (jarviResponse.responseToUser && !jarviResponse.delegationJson) {
      await adapter.sendMessage(chatId, jarviResponse.responseToUser);
    } else if (jarviResponse.delegationJson) {
      // Process delegation for Telegram
      const delegationResult = await agentService.delegateTask(jarviResponse.delegationJson, { message: messageText }, user.id);
      
      if (delegationResult && (delegationResult.response || delegationResult.grimResponse || delegationResult.murphyResponse)) {
        if (delegationResult.jarviDelegationMessage) {
          await adapter.sendMessage(chatId, delegationResult.jarviDelegationMessage);
        }
        
        setTimeout(async () => {
          const agentResponse = delegationResult.grimResponse || delegationResult.murphyResponse || delegationResult.response;
          if (agentResponse) {
            await adapter.sendMessage(chatId, agentResponse);
          }
        }, 1500);
      }
    }

    res.status(200).json({ success: true, platform: 'telegram' });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    res.status(500).json({ error: 'Failed to process Telegram webhook' });
  }
});

// Health check for messenger service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    whatsapp: whatsappAdapter ? 'configured' : 'not configured',
    telegram: telegramAdapter ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
