# Telegram Integration Testing Guide

## Overview
This guide will help you test the Telegram bot integration before deploying to production with WhatsApp. The current implementation supports both Telegram and WhatsApp, allowing you to test functionality without affecting live WhatsApp conversations.

## Current Implementation Status

### ✅ Completed Components
- **Telegram Bot API**: Installed `node-telegram-bot-api` package
- **Telegram Adapter**: Created `telegram-adapter.js` with message handling
- **Enhanced Messenger Service**: Updated to support both platforms
- **Platform Detection**: Automatic detection of Telegram vs WhatsApp messages
- **Environment Configuration**: Added `TELEGRAM_BOT_TOKEN` to `.env`

### 🔧 Current Architecture
```
Backend Server (Port 3000)
├── Gateway Service (/api/v1)
│   ├── test-chat (Direct testing)
│   ├── auth/google (OAuth)
│   └── /messages (Messenger Service)
└── Messenger Service (/api/v1/messages)
    ├── /webhook (Universal - detects platform)
    ├── /telegram/webhook (Telegram-specific)
    └── /health (Status check)
```

## Testing Steps

### 1. Environment Verification

**Check your `.env` file contains:**
```bash
# Existing WhatsApp credentials (keep for reference)
WHATSAPP_PHONE_NUMBER_ID=863804186807831
WHATSAPP_BUSINESS_ACCOUNT_ID=1242566411245238
META_ACCESS_TOKEN=EAASLcSkYBZBsBP1ntAToVKtIU1yVZCWsvHB6cb45CPtKiUpPXOBxEwaqLS7W5dvvHwzE825gcgSOeFmpOXj8zZAnr4PR8ZBzaRBRIAJkkHibw9SCw1Kit5q2PN5m52RDlAk5rGyfDUfI4ja2qQd9ZA6CfrwmyzOpoQTOmMRxbMl1pCkZBx4ZBZCOGf6lxwYte8Oz6wZDZD
WHATSAPP_VERIFY_TOKEN=super-secret-token-123the

# New Telegram credentials
TELEGRAM_BOT_TOKEN=8341416532:AAH9cWWKZwkH34hbQNBGWLkYMgArJhf8rU4
```

### 2. Server Testing

**Start the server:**
```bash
cd backend
node server.js
```

**Expected output:**
```
🚀 Starting AsifThatWorks Backend...
📋 Loading services...
✅ Gateway service loaded successfully
🎯 Server running on port 3000
🌍 Health check: http://localhost:3000/health
💬 Test endpoint: POST http://localhost:3000/api/v1/test-chat
🔐 OAuth: GET http://localhost:3000/api/v1/auth/google
Telegram bot initialized successfully
```

### 3. Health Check Testing

**Test overall health:**
```bash
curl http://localhost:3000/health
```

**Test messenger service health:**
```bash
curl http://localhost:3000/api/v1/messages/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "whatsapp": "configured",
  "telegram": "configured",
  "timestamp": "2025-11-29T11:08:37.000Z"
}
```

### 4. Bot Information Testing

The Telegram bot should be automatically polling for messages. To test if it's working:

1. **Open Telegram**
2. **Search for your bot:** `@YourBotName` (or use the bot token to identify it)
3. **Start a conversation:** Send `/start` or any message

**Expected behavior:**
- Bot should receive the message
- Server logs should show message reception
- Bot should respond (after user registration)

### 5. Integration Testing

**Test the full JARVI workflow via API:**
```bash
curl -X POST http://localhost:3000/api/v1/test-chat \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, can you help me with my calendar?",
    "userId": "test_user"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "type": "direct_response",
  "response": "Hello! I'm here to help you with calendar and task management..."
}
```

### 6. User Registration Testing

Since Telegram uses chat IDs instead of phone numbers, you need to update the user service to handle Telegram users.

**Current limitation:** The `userService.findUserByPhoneNumber()` function expects phone numbers, but Telegram uses chat IDs.

**Solution needed:** Update user service to handle both phone numbers and chat IDs.

## Testing Checklist

- [ ] Server starts without errors
- [ ] Telegram bot initializes successfully
- [ ] Health endpoints respond correctly
- [ ] Bot can be found in Telegram
- [ ] Bot receives messages from Telegram
- [ ] JARVI intent analysis works
- [ ] Direct responses are sent back
- [ ] Delegation to agents works
- [ ] Calendar integration functions
- [ ] Task management functions

## Known Issues & Solutions

### Issue 1: User Registration for Telegram
**Problem:** `userService.findUserByPhoneNumber()` only works with phone numbers
**Solution:** Modify user service to accept both phone numbers and Telegram chat IDs

### Issue 2: Webhook Setup
**Problem:** Telegram typically uses long polling, but webhooks are more reliable
**Solution:** Consider setting up Telegram webhook for production use

### Issue 3: Message Formatting
**Problem:** Telegram and WhatsApp have different message formatting capabilities
**Solution:** The adapter already handles message truncation and formatting

## Next Steps After Testing

1. **Fix user registration** to handle Telegram chat IDs
2. **Test end-to-end conversations** with actual calendar requests
3. **Verify delegation** works correctly with Telegram
4. **Performance testing** with multiple concurrent users
5. **Production webhook setup** for Telegram
6. **Final integration** back to WhatsApp if needed

## Telegram Bot Commands to Test

Once you find your bot in Telegram, test these interactions:

1. **Basic greeting:** "Hello" or "Hi"
2. **Calendar requests:** "Show my calendar" or "What meetings do I have?"
3. **Task management:** "Show my tasks" or "Add a task"
4. **Complex requests:** "Schedule a meeting for tomorrow at 2pm"

## Monitoring & Debugging

**Server logs to watch for:**
- "Telegram bot initialized successfully"
- "Received message from [username] ([userId]) in chat [chatId]"
- "Detected platform: telegram"
- "JARVI direct response" or "JARVI delegation detected"

**Common error patterns:**
- "Telegram bot token is not configured"
- "User with Telegram chat ID [chatId] not found"
- "Error sending Telegram message"

## Success Criteria

The Telegram integration is successful when:
1. ✅ Bot responds to messages within 2 seconds
2. ✅ JARVI intent analysis works correctly
3. ✅ Agent delegation functions properly
4. ✅ Calendar API calls succeed
5. ✅ No errors in server logs
6. ✅ User registration works for Telegram users

Once these criteria are met, you can confidently proceed with WhatsApp integration or choose to use Telegram as the primary messaging platform.