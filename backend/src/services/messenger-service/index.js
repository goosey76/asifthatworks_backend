// messenger-service/index.js - Enhanced to support both WhatsApp and Telegram

const express = require('express');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Lazy-load adapters to handle missing configuration gracefully
let whatsappAdapter = null;
let telegramAdapter = null;

function getWhatsappAdapter() {
  if (!whatsappAdapter) {
    const WhatsappAdapter = require('./adapters/whatsapp-adapter');
    whatsappAdapter = new WhatsappAdapter();
  }
  return whatsappAdapter;
}

function getTelegramAdapter() {
  if (!telegramAdapter) {
    const TelegramAdapter = require('./adapters/telegram-adapter');
    telegramAdapter = new TelegramAdapter();
  }
  return telegramAdapter;
}

// Lazy-load services to prevent circular dependencies
let jarviService = null;
let userService = null;
let agentService = null;
let memoryService = null;

function getJarviService() {
  if (!jarviService) {
    jarviService = require('../jarvi-service');
  }
  return jarviService;
}

function getUserService() {
  if (!userService) {
    userService = require('../user-service');
  }
  return userService;
}

function getAgentService() {
  if (!agentService) {
    agentService = require('../agents/jarvi-agent');
  }
  return agentService;
}

function getMemoryService() {
  if (!memoryService) {
    memoryService = require('../memory-service');
  }
  return memoryService;
}

// Async handler wrapper for proper error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Send message with timeout and retry
async function sendMessageWithRetry(adapter, identifier, message, maxRetries = 2) {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        adapter.sendMessage(identifier, message),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Message send timeout')), 10000)
        )
      ]);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`[Messenger] Send attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

// Delayed message send with proper error handling
function sendDelayedMessage(adapter, identifier, message, delay = 1500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      try {
        const result = await sendMessageWithRetry(adapter, identifier, message);
        resolve(result);
      } catch (error) {
        console.error('[Messenger] Delayed message send failed:', error.message);
        reject(error);
      }
    }, delay);
    
    // Allow cleanup if needed
    timer.unref?.();
  });
}


// Detect which platform the message is from
function detectPlatform(payload) {
  // Check for Telegram webhook structure
  if (payload.update_id !== undefined && (payload.message || payload.edited_message || payload.callback_query)) {
    return 'telegram';
  }
  
  // Check for WhatsApp webhook structure
  if (payload.entry && payload.object === 'whatsapp_business_account') {
    return 'whatsapp';
  }
  
  // Legacy WhatsApp check
  if (payload.entry && payload.object) {
    return 'whatsapp';
  }
  
  return 'unknown';
}

// Get the appropriate adapter for the platform
function getAdapter(platform) {
  switch (platform) {
    case 'telegram':
      return getTelegramAdapter();
    case 'whatsapp':
      return getWhatsappAdapter();
    default:
      throw new Error(`Unknown or unsupported platform: ${platform}`);
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

// Clean response helper function
function cleanJarviResponse(response) {
  if (!response || typeof response !== 'string') {
    return response || '';
  }
  
  let cleanResponse = response.trim();
  
  // Remove quotation marks that wrap the entire response
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
    const nonPrefixLines = lines.filter(line =>
      !line.match(/^(direct answer|answer|response|based on|here is)/i)
    );
    
    if (nonPrefixLines.length > 0) {
      cleanResponse = nonPrefixLines.sort((a, b) => b.length - a.length)[0];
    } else {
      cleanResponse = lines[lines.length - 1];
    }
  }
  
  return cleanResponse;
}

// Process delegation with proper error handling
async function processDelegation(adapter, identifier, user, jarviResponse, platform) {
  const { Recipient, RequestType, Message } = jarviResponse.delegationJson;
  
  // Get conversation history for context (last 15 messages)
  let conversationContext = [];
  try {
    const memory = getMemoryService();
    const agent = getAgentService();
    const jarviAgentConfig = await agent.getAgentConfig('JARVI');
    if (jarviAgentConfig) {
      conversationContext = await memory.getConversationHistory(user.id, jarviAgentConfig.id, 15);
    }
  } catch (contextError) {
    console.log('[Messenger] Could not fetch conversation context:', contextError.message);
  }
  
  const entities = {
    message: Message,
    conversation_context: conversationContext
  };

  const agent = getAgentService();
  const delegationResult = await agent.delegateTask(jarviResponse.delegationJson, entities, user.id);
  
  console.log('[Messenger] Delegation result received:', {
    hasResponse: !!delegationResult?.response,
    hasGrimResponse: !!delegationResult?.grimResponse,
    hasMurphyResponse: !!delegationResult?.murphyResponse
  });
  
  // Send the delegation result back to the user
  if (delegationResult && (delegationResult.response || delegationResult.grimResponse || delegationResult.murphyResponse)) {
    console.log(`[Messenger] Sending delegation messages to ${platform}...`);
    
    // Send JARVI's delegation message first
    if (delegationResult.jarviDelegationMessage) {
      await sendMessageWithRetry(adapter, identifier, delegationResult.jarviDelegationMessage);
    }
    
    // Send agent response with a delay (properly handled)
    const agentResponse = delegationResult.grimResponse || delegationResult.murphyResponse || delegationResult.response;
    if (agentResponse) {
      try {
        await sendDelayedMessage(adapter, identifier, agentResponse, 1500);
        console.log(`[Messenger] ${platform} agent response sent, eventId:`, delegationResult.eventId);
      } catch (sendError) {
        console.error(`[Messenger] Failed to send agent response to ${platform}:`, sendError.message);
      }
    }
    
  } else if (delegationResult) {
    console.log('[Messenger] No structured response found, sending raw result...');
    try {
      await sendDelayedMessage(adapter, identifier, JSON.stringify(delegationResult), 1500);
    } catch (sendError) {
      console.error('[Messenger] Failed to send raw delegation result:', sendError.message);
    }
  } else {
    console.log('[Messenger] No delegation result found at all');
  }

  return delegationResult;
}

// Webhook for both WhatsApp and Telegram
router.post('/webhook', asyncHandler(async (req, res) => {
  const requestId = req.requestId || `msg-${Date.now()}`;
  console.log(`[Messenger] Webhook received [${requestId}]:`, JSON.stringify(req.body, null, 2).substring(0, 500));
  
  const platform = detectPlatform(req.body);
  console.log(`[Messenger] Detected platform: ${platform}`);
  
  if (platform === 'unknown') {
    console.error('[Messenger] Unknown platform in webhook payload');
    return res.status(400).json({ error: 'Unknown platform', requestId });
  }
  
  const adapter = getAdapter(platform);
  const webhookResult = await adapter.handleWebhook(req.body);
  const { from, messageText, status, messageId, userId, username, chatId } = webhookResult;

  if (status === 'ignored') {
    return res.status(200).json({ message: 'Message ignored', requestId });
  }

  // Validate message text
  if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
    console.log('[Messenger] Empty or invalid message text received');
    return res.status(200).json({ message: 'Empty message ignored', requestId });
  }

  // Find user by identifier (phone for WhatsApp, chat ID for Telegram)
  const identifier = platform === 'telegram' ? chatId : from;
  const user = await getUserService().findUserByIdentifier(identifier, platform);

  if (!user) {
    console.log(`[Messenger] User with identifier ${identifier} not found.`);
    const welcomeMessage = platform === 'telegram'
      ? "Welcome! I don't recognize you yet. Please register with your email first, then I can help you with calendar and task management! 📅✨"
      : "It looks like you're not registered. Please register with your email and then link your phone number.";
    
    try {
      await sendMessageWithRetry(adapter, identifier, welcomeMessage);
    } catch (sendError) {
      console.error('[Messenger] Failed to send welcome message:', sendError.message);
    }
    
    return res.status(200).json({
      message: 'User not found, welcome message sent',
      requestId
    });
  }

  // Analyze intent with JARVI
  const jarviResponse = await getJarviService().analyzeIntent({ userId: user.id, text: messageText });

  // Handle direct response (no delegation)
  if (jarviResponse.responseToUser && !jarviResponse.delegationJson) {
    console.log('[Messenger] JARVI direct response (no delegation)');
    
    const cleanResponse = cleanJarviResponse(jarviResponse.responseToUser);
    
    try {
      await sendMessageWithRetry(adapter, identifier, cleanResponse);
    } catch (sendError) {
      console.error('[Messenger] Failed to send JARVI response:', sendError.message);
    }
    
    return res.status(200).json({
      messengerResult: { from: identifier, messageText, status, platform },
      jarviResponse,
      requestId
    });
  }

  // Handle delegation
  if (jarviResponse.delegationJson) {
    console.log('[Messenger] JARVI delegation detected');
    
    const delegationResult = await processDelegation(adapter, identifier, user, jarviResponse, platform);

    return res.status(200).json({
      messengerResult: { from: identifier, messageText, status, platform },
      jarviResponse,
      delegationResult,
      requestId
    });
  }

  // Fallback response
  res.status(200).json({
    messengerResult: { from: identifier, messageText, status, platform },
    jarviResponse,
    requestId
  });
}));

// Telegram-specific webhook endpoint (alternative to combined webhook)
router.post('/telegram/webhook', asyncHandler(async (req, res) => {
  const requestId = req.requestId || `tg-${Date.now()}`;
  console.log(`[Messenger] Telegram webhook received [${requestId}]`);
  
  const adapter = getTelegramAdapter();
  const webhookResult = await adapter.handleWebhook(req.body);
  const { from, messageText, status, messageId, userId, username, chatId } = webhookResult;

  if (status === 'ignored') {
    return res.status(200).json({ message: 'Message ignored', requestId });
  }

  // Validate message
  if (!messageText || messageText.trim().length === 0) {
    return res.status(200).json({ message: 'Empty message ignored', requestId });
  }

  const user = await getUserService().findUserByIdentifier(chatId, 'telegram');

  if (!user) {
    console.log(`[Messenger] User with Telegram chat ID ${chatId} not found.`);
    const welcomeMessage = "Welcome! I don't recognize you yet. Please register with your email first, then I can help you with calendar and task management! 📅✨";
    
    try {
      await sendMessageWithRetry(adapter, chatId, welcomeMessage);
    } catch (sendError) {
      console.error('[Messenger] Failed to send welcome message:', sendError.message);
    }
    
    return res.status(200).json({ message: 'User not found, welcome sent', requestId });
  }

  const jarviResponse = await getJarviService().analyzeIntent({ userId: user.id, text: messageText });

  // Handle direct response
  if (jarviResponse.responseToUser && !jarviResponse.delegationJson) {
    const cleanResponse = cleanJarviResponse(jarviResponse.responseToUser);
    try {
      await sendMessageWithRetry(adapter, chatId, cleanResponse);
    } catch (sendError) {
      console.error('[Messenger] Failed to send Telegram response:', sendError.message);
    }
  } else if (jarviResponse.delegationJson) {
    // Process delegation for Telegram
    await processDelegation(adapter, chatId, user, jarviResponse, 'telegram');
  }

  res.status(200).json({ success: true, platform: 'telegram', requestId });
}));

// Health check for messenger service
router.get('/health', (req, res) => {
  let whatsappStatus = 'not initialized';
  let telegramStatus = 'not initialized';
  
  try {
    whatsappStatus = getWhatsappAdapter() ? 'configured' : 'not configured';
  } catch (e) {
    whatsappStatus = 'error: ' + e.message;
  }
  
  try {
    telegramStatus = getTelegramAdapter() ? 'configured' : 'not configured';
  } catch (e) {
    telegramStatus = 'error: ' + e.message;
  }
  
  res.json({
    service: 'messenger',
    status: 'healthy',
    adapters: {
      whatsapp: whatsappStatus,
      telegram: telegramStatus
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler for this router
router.use((err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  console.error(`[Messenger] Error [${requestId}]:`, err.message);
  
  // Always return 200 for webhooks to prevent retries from messaging platforms
  // But include error info in the response for debugging
  res.status(200).json({
    error: 'Webhook processing error',
    message: err.message,
    requestId,
    // Don't expose stack in production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = router;
