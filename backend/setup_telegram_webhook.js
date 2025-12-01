#!/usr/bin/env node

/**
 * Telegram Webhook Setup Script
 * Sets up the Telegram bot webhook for production deployment
 */

const TelegramAdapter = require('./src/services/messenger-service/adapters/telegram-adapter');
require('dotenv').config({ path: './.env' });

console.log('🔗 Telegram Webhook Setup');
console.log('=========================\n');

async function setupWebhook() {
  try {
    // Initialize adapter
    const adapter = new TelegramAdapter();
    
    if (!adapter.isReady()) {
      const error = adapter.getInitError();
      throw new Error(`Adapter not ready: ${error?.message || 'Unknown error'}`);
    }
    
    console.log('✅ Telegram adapter initialized');
    
    // Get current bot info
    const botInfo = await adapter.getBotInfo();
    console.log(`🤖 Bot: @${botInfo.username} (${botInfo.first_name})`);
    
    // Check current webhook status
    const currentWebhook = await adapter.getWebhookInfo();
    console.log(`📡 Current webhook: ${currentWebhook?.url || 'None (polling mode)'}`);
    console.log(`⏳ Pending updates: ${currentWebhook?.pending_update_count || 0}`);
    
    // Prompt for webhook URL
    console.log('\n🎯 Webhook URL Setup Options:');
    console.log('1. Local development (not recommended for production)');
    console.log('2. Google Cloud Run');
    console.log('3. Vercel');
    console.log('4. Heroku');
    console.log('5. Railway');
    console.log('6. Custom URL');
    
    const args = process.argv.slice(2);
    let webhookUrl = null;
    
    if (args.length > 0) {
      webhookUrl = args[0];
      console.log(`📋 Using provided URL: ${webhookUrl}`);
    } else {
      // Default to local development for testing
      webhookUrl = 'http://localhost:3000/api/v1/webhook';
      console.log(`📋 Using default local URL: ${webhookUrl}`);
      console.log('⚠️  Note: This will only work if your server is publicly accessible');
    }
    
    // Validate webhook URL
    if (!webhookUrl.startsWith('http')) {
      throw new Error('Webhook URL must start with http:// or https://');
    }
    
    console.log(`\n🔧 Setting webhook to: ${webhookUrl}`);
    
    // Set webhook
    await adapter.setWebhook(webhookUrl, {
      maxConnections: 40,
      allowedUpdates: ['message', 'edited_message', 'callback_query'],
      dropPending: true
    });
    
    console.log('✅ Webhook set successfully!');
    
    // Verify webhook was set
    const updatedWebhook = await adapter.getWebhookInfo();
    console.log(`\n📡 Webhook Status:`);
    console.log(`   URL: ${updatedWebhook.url}`);
    console.log(`   Pending: ${updatedWebhook.pending_update_count}`);
    console.log(`   Last Error: ${updatedWebhook.last_error_date || 'None'}`);
    console.log(`   Max Connections: ${updatedWebhook.max_connections}`);
    
    console.log('\n🎉 Webhook setup complete!');
    console.log('\n📱 Next Steps:');
    console.log('1. Start your server: node server.js');
    console.log('2. Test your bot: @' + botInfo.username);
    console.log('3. Send /start command to begin');
    console.log('4. Check logs for any issues');
    
  } catch (error) {
    console.error('\n❌ Webhook setup failed:', error.message);
    
    if (error.message.includes('chat not found')) {
      console.log('\n💡 Troubleshooting:');
      console.log('- Make sure your bot token is valid');
      console.log('- Check that your webhook URL is publicly accessible');
      console.log('- Ensure your server is running and accepting requests');
    } else if (error.message.includes('URL')) {
      console.log('\n💡 Troubleshooting:');
      console.log('- Webhook URL must be HTTPS in production');
      console.log('- URL must be publicly accessible');
      console.log('- Check that your server accepts POST requests');
    }
    
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  setupWebhook().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { setupWebhook };