#!/usr/bin/env node

/**
 * Bot Token Verification Script
 * This script helps you verify your Telegram bot token works correctly
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Telegram Bot Token Verification');
console.log('==================================\n');

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

async function verifyBotToken(token) {
  console.log(`\n🔍 Verifying bot token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
  
  try {
    const response = await makeRequest(`https://api.telegram.org/bot${token}/getMe`);
    
    if (response.statusCode === 200 && response.data.ok) {
      console.log('✅ SUCCESS: Bot token is valid!');
      console.log(`🤖 Bot Name: ${response.data.result.first_name}`);
      console.log(`📱 Username: @${response.data.result.username}`);
      console.log(`🆔 Bot ID: ${response.data.result.id}`);
      
      if (response.data.result.can_join_groups !== undefined) {
        console.log(`👥 Can join groups: ${response.data.result.can_join_groups ? 'Yes' : 'No'}`);
      }
      if (response.data.result.can_read_all_group_messages !== undefined) {
        console.log(`📖 Can read all messages: ${response.data.result.can_read_all_group_messages ? 'Yes' : 'No'}`);
      }
      if (response.data.result.supports_inline_queries !== undefined) {
        console.log(`🔍 Supports inline queries: ${response.data.result.supports_inline_queries ? 'Yes' : 'No'}`);
      }
      
      return true;
    } else if (response.data.error_code) {
      console.log('❌ ERROR: Bot token verification failed');
      console.log(`Error Code: ${response.data.error_code}`);
      console.log(`Description: ${response.data.description}`);
      return false;
    } else {
      console.log('❌ ERROR: Unexpected response format');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Network request failed');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function updateEnvFile(token) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if TELEGRAM_BOT_TOKEN already exists
    if (envContent.includes('TELEGRAM_BOT_TOKEN=')) {
      // Replace existing token
      const updatedContent = envContent.replace(
        /TELEGRAM_BOT_TOKEN=.*/,
        `TELEGRAM_BOT_TOKEN=${token}`
      );
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Updated TELEGRAM_BOT_TOKEN in .env file');
    } else {
      // Add new token
      const updatedContent = envContent + `\n# Telegram Bot Configuration\nTELEGRAM_BOT_TOKEN=${token}\n`;
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Added TELEGRAM_BOT_TOKEN to .env file');
    }
    
    return true;
  } catch (error) {
    console.log('❌ ERROR: Could not update .env file');
    console.log(`Error: ${error.message}`);
    console.log('Please manually add this line to your .env file:');
    console.log(`TELEGRAM_BOT_TOKEN=${token}`);
    return false;
  }
}

async function testWebhook(token) {
  console.log('\n🔗 Checking webhook status...');
  
  try {
    const response = await makeRequest(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    
    if (response.statusCode === 200 && response.data.ok) {
      const webhook = response.data.result;
      if (webhook.url) {
        console.log(`✅ Webhook configured: ${webhook.url}`);
        console.log(`📊 Pending updates: ${webhook.pending_update_count}`);
      } else {
        console.log('ℹ️  No webhook configured (using long polling)');
      }
      return true;
    } else {
      console.log('❌ Could not get webhook info');
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Could not check webhook status');
    return false;
  }
}

async function main() {
  console.log('This script will help you verify your Telegram bot token and update your configuration.\n');
  
  // Ask for bot token
  const token = await askQuestion('📱 Enter your bot token (from BotFather): ');
  
  if (!token) {
    console.log('❌ No token provided. Exiting.');
    rl.close();
    return;
  }
  
  // Clean token (remove any whitespace)
  const cleanToken = token.trim();
  
  if (!cleanToken.includes(':')) {
    console.log('❌ Invalid token format. Expected format: 1234567890:ABCdefGhIJKlmNoPQRsTuVwXyZ');
    rl.close();
    return;
  }
  
  // Verify token
  const isValid = await verifyBotToken(cleanToken);
  
  if (isValid) {
    // Ask if user wants to update .env
    const updateEnv = await askQuestion('\n💾 Do you want to update your .env file with this token? (y/N): ');
    
    if (updateEnv.toLowerCase().includes('y')) {
      await updateEnvFile(cleanToken);
    }
    
    // Check webhook status
    await testWebhook(cleanToken);
    
    console.log('\n🎉 Bot token verification complete!');
    console.log('==================================');
    console.log('Next steps:');
    console.log('1. Restart your server: node server.js');
    console.log('2. Find your bot in Telegram');
    console.log('3. Start a conversation: /start');
    console.log('4. Register your account: node quick_register_telegram.js');
    console.log('5. Link your Telegram account in the bot');
    
    console.log('\n📱 To find your bot:');
    console.log('- Search for your bot username in Telegram');
    console.log('- Or visit: https://t.me/YOUR_BOT_USERNAME');
    
  } else {
    console.log('\n❌ Bot token verification failed!');
    console.log('Please check:');
    console.log('1. You copied the token correctly from BotFather');
    console.log('2. The token hasn\'t been revoked');
    console.log('3. You have internet connection');
  }
  
  rl.close();
}

process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});