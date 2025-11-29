#!/usr/bin/env node

/**
 * Telegram Webhook Setup Script
 * This script sets up your Telegram bot to use webhooks instead of polling
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Telegram Webhook Setup');
console.log('=========================\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    }).on('error', reject);
  });
}

async function setupWebhook() {
  // Get bot token
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('❌ TELEGRAM_BOT_TOKEN not found in environment');
    console.log('Please set it in your .env file first');
    return;
  }

  // Get public URL
  console.log('🌐 To set up webhooks, you need a public URL');
  console.log('For local development, use ngrok: https://ngrok.com/');
  console.log('Example ngrok command: ngrok http 3000\n');
  
  const publicUrl = await askQuestion('Enter your public webhook URL (e.g., https://your-domain.com): ');
  
  if (!publicUrl) {
    console.log('❌ No URL provided');
    return;
  }

  const webhookUrl = `${publicUrl}/api/v1/messages/telegram/webhook`;
  
  console.log(`\n🔗 Setting webhook to: ${webhookUrl}`);
  
  try {
    const response = await makeRequest(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    
    if (response.statusCode === 200 && response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📡 Your bot will now receive messages at: ${webhookUrl}`);
      console.log('\n📝 Next steps:');
      console.log('1. Make sure your server is running and accessible at the public URL');
      console.log('2. Test by sending a message to your bot');
      console.log('3. Check server logs for incoming webhook requests');
    } else {
      console.log('❌ Failed to set webhook');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Error setting webhook:', error.message);
  }
}

async function getWebhookInfo() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log('❌ TELEGRAM_BOT_TOKEN not found in environment');
    return;
  }

  try {
    const response = await makeRequest(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    
    if (response.statusCode === 200 && response.data.ok) {
      const webhook = response.data.result;
      console.log('📊 Current Webhook Status:');
      if (webhook.url) {
        console.log(`✅ Webhook URL: ${webhook.url}`);
        console.log(`📊 Pending updates: ${webhook.pending_update_count}`);
        console.log(`📏 Max connections: ${webhook.max_connections || '40 (default)'}`);
      } else {
        console.log('ℹ️  No webhook configured (using long polling)');
      }
    } else {
      console.log('❌ Failed to get webhook info');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Error getting webhook info:', error.message);
  }
}

async function main() {
  console.log('Choose an option:');
  console.log('1. Set up webhook');
  console.log('2. Check current webhook status');
  console.log('3. Exit\n');
  
  const choice = await askQuestion('Enter your choice (1-3): ');
  
  switch (choice) {
    case '1':
      await setupWebhook();
      break;
    case '2':
      await getWebhookInfo();
      break;
    case '3':
      console.log('👋 Goodbye!');
      break;
    default:
      console.log('❌ Invalid choice');
  }
  
  rl.close();
}

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});