#!/usr/bin/env node

/**
 * Quick Registration Script for Telegram Integration
 * This script helps users register and link their Telegram account
 */

const https = require('https');
const readline = require('readline');

const BASE_URL = 'localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AsifThatWorks - Quick Registration for Telegram');
console.log('===============================================\n');

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
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
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function registerUser(email, password) {
  console.log(`\n📝 Registering user: ${email}`);
  
  try {
    const response = await makeRequest('/api/v1/auth/register', 'POST', {
      email,
      password
    });

    if (response.statusCode === 200) {
      console.log('✅ Registration successful!');
      return response.data;
    } else {
      console.log('❌ Registration failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return null;
  }
}

async function getHealth() {
  try {
    const response = await makeRequest('/health');
    if (response.statusCode === 200) {
      console.log('✅ Backend server is healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend server not accessible');
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🎯 This script will help you:\n');
  console.log('1. Register with AsifThatWorks');
  console.log('2. Test the registration');
  console.log('3. Provide next steps for Telegram linking\n');

  // Check server health
  console.log('🔍 Checking backend server...');
  const serverHealthy = await getHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Backend server is not running!');
    console.log('Please start the server first:');
    console.log('  cd backend && node server.js\n');
    process.exit(1);
  }

  // Collect user information
  const email = await askQuestion('📧 Enter your email address: ');
  const password = await askQuestion('🔒 Enter a secure password: ');

  if (!email || !password) {
    console.log('❌ Email and password are required');
    process.exit(1);
  }

  // Register user
  const userData = await registerUser(email, password);

  if (userData && userData.user) {
    console.log('\n🎉 Registration Complete!');
    console.log('======================');
    console.log(`✅ User ID: ${userData.user.id}`);
    console.log(`✅ Email: ${email}`);
    console.log('\n🔗 Next Steps for Telegram Integration:');
    console.log('====================================');
    console.log('1. Find your Telegram bot in the app');
    console.log('2. Send: /link ' + email);
    console.log('3. Grant Google permissions when prompted');
    console.log('4. Start using: "Show my calendar" or "Add a task"');

    console.log('\n🌐 Direct API Links:');
    console.log(`🔐 Google OAuth: http://localhost:3000/api/v1/auth/google?userId=${userData.user.id}`);
    console.log('💬 Test Chat: POST http://localhost:3000/api/v1/test-chat');

    console.log('\n🤖 Telegram Bot Setup:');
    console.log('=====================');
    console.log('1. Open Telegram and search for your bot');
    console.log('2. Start conversation with /start');
    console.log('3. Link account: /link ' + email);
    console.log('4. Authorize Google: Follow the OAuth link');

    console.log('\n📋 Quick Test Commands to Try:');
    console.log('============================');
    console.log('• "Hello JARVI" - Basic greeting');
    console.log('• "Show my calendar" - View schedule');
    console.log('• "Add a task: Call mom" - Create task');
    console.log('• "What can you do?" - Agent capabilities');

    console.log('\n✨ Welcome to AsifThatWorks! Your AI productivity revolution starts now! 🚀');

  } else {
    console.log('\n❌ Registration failed. Please try again.');
  }

  rl.close();
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});