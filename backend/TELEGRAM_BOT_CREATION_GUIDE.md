# 🤖 Complete Telegram Bot Creation Guide

## 🎯 Step-by-Step Bot Setup

### **What You'll Learn**
1. How to create a bot with BotFather
2. How to get your bot token
3. How to configure the bot with your system
4. How to start using your bot

---

## 🚀 Step 1: Create Your Bot with BotFather

### **1.1 Open Telegram BotFather**
1. Open Telegram app on your phone or web
2. Search for: `@BotFather`
3. Open the BotFather account (official blue checkmark)

### **1.2 Create New Bot**
1. Start a conversation with BotFather
2. Send the command: `/newbot`
3. Follow the prompts:

```
BotFather: Choose a name for your bot.
You: AsifThatWorks Assistant

BotFather: Choose a username for your bot. It must end in `bot`.
You: asifthatworks_prod_bot

BotFather: Done! Congratulations on your new bot. You will find it at the link `t.me/asifthatworks_prod_bot`.

Use this token to access the HTTP API:
1234567890:ABCdefGhIJKlmNoPQRsTuVwXyZ

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

### **1.3 Save Your Bot Token**
- **Important**: Save the token that BotFather gives you
- **Format**: `1234567890:ABCdefGhIJKlmNoPQRsTuVwXyZ`
- **Your bot link**: `https://t.me/asifthatworks_prod_bot`

---

## 🔧 Step 2: Configure Your Bot with the System

### **2.1 Update Environment Variables**
Open your `.env` file and update the Telegram bot token:

```bash
# Find this line and replace with your bot token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmNoPQRsTuVwXyZ
```

### **2.2 Restart Your Server**
```bash
cd backend
# Stop the current server (Ctrl+C)
# Then restart:
node server.js
```

You should see:
```
Telegram bot initialized successfully
```

---

## 🧪 Step 3: Test Your Bot

### **3.1 Find Your Bot**
1. Open Telegram
2. Search for your bot: `@asifthatworks_prod_bot` (or whatever name you chose)
3. Click "Start" or send `/start`

### **3.2 Expected Behavior**
**If your bot is working correctly:**
- You should receive a welcome message about registration
- The system will detect you as an unregistered user
- You'll get instructions to register

**If there's an issue:**
- Check server logs for errors
- Verify the bot token is correct in `.env`
- Make sure the server restarted after token update

---

## 🛠️ Step 4: Customize Your Bot (Optional)

### **4.1 Set Bot Description**
In BotFather chat, send:
```
/setdescription
```
Then select your bot and add a description like:
```
🤖 AI-Powered Calendar & Task Management
Your intelligent productivity assistant with JARVI, GRIM & MURPHY agents
```

### **4.2 Set Bot Picture**
```
/setuserpic
```
Upload a nice bot avatar/logo

### **4.3 Add Commands**
```
/setcommands
```

Add these commands:
```
start - Start using AsifThatWorks
help - Get help and support
link - Link your account
status - Check your account status
```

---

## 🔗 Step 5: Set Up Webhooks (Production)

### **5.1 Why Webhooks?**
- More reliable than long polling
- Better performance
- Required for production use

### **5.2 Set Webhook URL**
```bash
# Replace YOUR_BOT_TOKEN with your actual token
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/v1/messages/webhook"}'
```

**For Local Development:**
Use ngrok or similar to expose your local server:
```bash
# Install ngrok: https://ngrok.com/
ngrok http 3000
```

Then set webhook with the ngrok URL.

---

## 🎯 Step 6: Registration Flow

### **6.1 Register Your Account**
Once your bot is working, register:

```bash
# Using our quick script
node quick_register_telegram.js

# Or manually
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your.email@example.com","password":"securePassword"}'
```

### **6.2 Link Your Telegram Account**
1. Send to your bot: `/start`
2. Get your User ID from the server logs (when you send a message)
3. Link your account: `/link your.email@example.com`

### **6.3 Connect Google Services**
1. Open the Google OAuth link provided
2. Authorize Calendar and Tasks access
3. Start using: "Show my calendar" or "Add a task"

---

## 🔧 Troubleshooting

### **Bot Not Responding?**
1. **Check Token**: Verify it's correct in `.env`
2. **Restart Server**: After changing token
3. **Check Logs**: Look for "Telegram bot initialized successfully"
4. **Test Token**: Use this to verify:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getMe"
```

### **User Not Found?**
1. **Register First**: Users must register via API before using bot
2. **Check Linking**: Make sure Telegram chat ID is linked to account
3. **Server Logs**: Check for user lookup errors

### **Messages Not Sending?**
1. **Check Network**: Ensure bot can reach Telegram servers
2. **Token Validity**: Verify token hasn't been revoked
3. **Rate Limits**: Telegram has message rate limits

---

## 📱 Quick Test Commands

Once registered, try these in your bot:

**Basic:**
- `Hello JARVI`
- `What can you do?`
- `Show my calendar`

**Calendar (GRIM):**
- `Schedule a meeting tomorrow at 2pm`
- `What meetings do I have today?`
- `Update my lunch break`

**Tasks (MURPHY):**
- `Add task: Call the doctor`
- `Show my tasks`
- `Complete the presentation task`

**Agent Info:**
- `What can GRIM do?`
- `What are MURPHY's capabilities?`
- `How does JARVI work?`

---

## 🎉 Success Checklist

**Bot Creation:**
- [ ] Bot created with BotFather
- [ ] Bot token saved and configured
- [ ] Bot responds to `/start`

**System Integration:**
- [ ] Server logs show "Telegram bot initialized successfully"
- [ ] Bot receives and processes messages
- [ ] Server returns appropriate responses

**User Experience:**
- [ ] User registration works
- [ ] Telegram account linking works
- [ ] Google OAuth integration works
- [ ] Agents respond to requests

**Expected Final Result:**
```
🤖 Welcome to AsifThatWorks! Your AI productivity team is ready.

JARVI: Sarcastic genius director
📅 GRIM: Calendar optimization specialist  
✅ MURPHY: Task management master

Try: "Show my calendar" or "Add a task"
```

---

## 🎯 Next Steps After Bot Works

1. **Complete Registration**: Use quick_register_telegram.js
2. **Test All Features**: Try calendar, tasks, and agent interactions
3. **Optimize Performance**: Set up webhooks for production
4. **Add Users**: Share your bot with others
5. **Monitor Usage**: Check logs and performance

**Your bot is now ready to revolutionize productivity!** 🚀🤖

---

## 📞 Need Help?

If you encounter issues:
1. Check the server logs for error messages
2. Verify your bot token is correct
3. Ensure the server restarted after configuration changes
4. Test the bot token directly with Telegram API

**BotFather Commands Reference:**
- `/newbot` - Create new bot
- `/mybots` - List your bots
- `/setdescription` - Set bot description
- `/setuserpic` - Set bot picture
- `/setcommands` - Set bot commands
- `/deletebot` - Delete bot (be careful!)