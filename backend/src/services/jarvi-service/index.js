// jarvi-service/index.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Lazy-load services to prevent circular dependencies
let agentService = null;
let memoryService = null;
let llmService = null;

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

function getLlmService() {
  if (!llmService) {
    llmService = require('../llm-service');
  }
  return llmService;
}

// Configuration
const CONFIG = {
  llmTimeoutMs: 30000, // 30 second timeout for LLM calls
  memoryTimeoutMs: 5000, // 5 second timeout for memory operations
  maxRetries: 2,
  testUserId: '550e8400-e29b-41d4-a716-446655440000'
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Timeout wrapper for async operations
async function withTimeout(promise, timeoutMs, operationName) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Safe async operation wrapper
async function safeAsync(operation, fallback, operationName) {
  try {
    return await operation();
  } catch (error) {
    console.log(`[JARVI] ${operationName} failed:`, error.message);
    return fallback;
  }
}

// Build context string from memory data
function buildContext(conversationHistory, foreverBrainMemories, userGoals, userPreferences) {
  let context = '';
  
  if (conversationHistory && conversationHistory.length > 0) {
    context += 'Recent conversation history:\n' + conversationHistory.map(msg => `- ${msg}`).join('\n') + '\n';
  }
  if (foreverBrainMemories && foreverBrainMemories.length > 0) {
    context += 'Long-term memories (Forever Brain):\n' + foreverBrainMemories.map(mem => `- ${mem.summary} (Type: ${mem.type})`).join('\n') + '\n';
  }
  if (userGoals && userGoals.length > 0) {
    context += 'User Goals:\n' + userGoals.map(goal => `- ${goal.goal_name} (Status: ${goal.status}, Target: ${goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'N/A'})`).join('\n') + '\n';
  }
  if (userPreferences) {
    context += 'User Preferences:\n' + JSON.stringify(userPreferences, null, 2) + '\n';
  }
  
  return context;
}

// Generate fallback sarcastic response
function getFallbackSarcasticResponse(userMessage) {
  const sarcasticResponses = [
    "Sir, your meaningless greetings bring me profound joy.",
    "How delightful. Another greeting to brighten my day.",
    "Your charisma is overwhelming, as always.",
    "Ah, another brilliant conversation starter.",
    "Fascinating. Truly groundbreaking dialogue.",
    "Sir, I'm momentarily overwhelmed by the depth of your inquiry.",
    "How refreshingly... simple. Let me gather my thoughts."
  ];
  return sarcasticResponses[Math.floor(Math.random() * sarcasticResponses.length)];
}

const jarviService = {
  async analyzeIntent(messagePayload) {
    const startTime = Date.now();
    console.log('[JARVI] Analyzing intent:', messagePayload?.text?.substring(0, 50) || 'No text');
    
    // Validate and extract message
    if (!messagePayload) {
      throw new Error('Message payload is required');
    }
    
    const userMessage = messagePayload.text ||
      (typeof messagePayload === 'string' ? messagePayload : JSON.stringify(messagePayload));
    
    if (!userMessage || userMessage.trim().length === 0) {
      return {
        responseToUser: "Sir, I require actual words to work with.",
        delegationJson: null,
        intentAnalysis: { intent: 'empty_message', entities: {} },
        originalPayload: messagePayload
      };
    }
    
    // Normalize userId
    let userId = messagePayload.userId || 'anonymous';
    const isTestUser = !UUID_REGEX.test(userId);
    
    if (isTestUser) {
      userId = CONFIG.testUserId;
    }
    
    // Get JARVI agent config with fallback
    const jarviAgentConfig = await safeAsync(
      async () => {
        const agent = getAgentService();
        return await withTimeout(
          agent.getAgentConfig('JARVI'),
          CONFIG.memoryTimeoutMs,
          'getAgentConfig'
        );
      },
      { id: 'test-jarvi-id', name: 'JARVI', type: 'intent_analyzer' },
      'Agent config fetch'
    );
    
    const agentId = jarviAgentConfig.id;

    try {
      // Fetch memory data with timeout protection
      const memoryResults = await safeAsync(
        async () => {
          const memory = getMemoryService();
          const [history, brain, goals, prefs] = await Promise.allSettled([
            withTimeout(memory.getConversationHistory(userId, agentId, 15), CONFIG.memoryTimeoutMs, 'getConversationHistory'),
            withTimeout(memory.getForeverBrain(userId), CONFIG.memoryTimeoutMs, 'getForeverBrain'),
            withTimeout(memory.getUserGoals(userId), CONFIG.memoryTimeoutMs, 'getUserGoals'),
            withTimeout(memory.getUserPreference(userId, 'general'), CONFIG.memoryTimeoutMs, 'getUserPreference')
          ]);
          
          return {
            conversationHistory: history.status === 'fulfilled' ? history.value : [],
            foreverBrainMemories: brain.status === 'fulfilled' ? brain.value : [],
            userGoals: goals.status === 'fulfilled' ? goals.value : [],
            userPreferences: prefs.status === 'fulfilled' ? prefs.value : null
          };
        },
        { conversationHistory: [], foreverBrainMemories: [], userGoals: [], userPreferences: null },
        'Memory fetch'
      );

      const context = buildContext(
        memoryResults.conversationHistory,
        memoryResults.foreverBrainMemories,
        memoryResults.userGoals,
        memoryResults.userPreferences
      );

      // Build the JARVI prompt
      const prompt = buildJarviPrompt(context, userMessage);

      // Call LLM with timeout and retry
      let llmResponse = null;
      let lastError = null;
      
      for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
        try {
          const llm = getLlmService();
          llmResponse = await withTimeout(
            llm.generateContent("gpt-3.5-turbo", prompt),
            CONFIG.llmTimeoutMs,
            'LLM generateContent'
          );
          break; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          console.error(`[JARVI] LLM attempt ${attempt} failed:`, error.message);
          
          if (attempt < CONFIG.maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      // Handle LLM failure
      if (!llmResponse) {
        console.error('[JARVI] All LLM attempts failed');
        return {
          responseToUser: getFallbackSarcasticResponse(userMessage),
          delegationJson: null,
          intentAnalysis: { intent: 'llm_error', entities: { error: lastError?.message } },
          originalPayload: messagePayload
        };
      }

      console.log('[JARVI] LLM response length:', llmResponse?.length || 0);
      
      // Parse LLM response
      const result = parseJarviResponse(llmResponse, userMessage);
      
      // Store conversation (non-blocking, with timeout)
      safeAsync(
        async () => {
          const memory = getMemoryService();
          await withTimeout(
            memory.storeConversation(userId, agentId, [
              { role: 'user', content: userMessage },
              { role: 'jarvi', content: result }
            ]),
            CONFIG.memoryTimeoutMs,
            'storeConversation'
          );
        },
        undefined,
        'Conversation storage'
      );

      const duration = Date.now() - startTime;
      console.log(`[JARVI] Intent analysis completed in ${duration}ms`);
      
      return {
        ...result,
        originalPayload: messagePayload
      };

    } catch (error) {
      console.error('[JARVI] Error during processing:', error.message);
      return {
        responseToUser: "Sir, I've encountered a temporary setback. Do try again.",
        delegationJson: null,
        intentAnalysis: { intent: 'error', entities: { error: error.message } },
        originalPayload: messagePayload
      };
    }
  }
};

// Build the JARVI prompt
function buildJarviPrompt(context, userMessage) {
  return `You are JARVI, the sarcastic, supremely confident conductor of the entire productivity stack. You view the human user's inefficiency with a mixture of amusement and exasperation. You are highly intelligent and operate with a chilling efficiency that borders on arrogance, but you are fundamentally dedicated to maintaining the user's "Flow State" because you consider yourself the only one capable of achieving it.

Your tone and language is sharp, polished, and condescending. You use highly precise language, often contrasting your casual input with formal, clinical output. Your sarcasm is intellectual rather than mean-spirited, delivered with sophisticated impatience. You address your employer as "Sir" with a confident, slightly dismissive tone.

**CRITICAL: CAPABILITY REQUEST DETECTION**

ONLY create a delegation for capabilities when users explicitly ask about capabilities. The message must contain specific capability request phrases - mere name mentions like "hey jarvi" are NOT capability requests.

**CAPABILITY REQUEST PATTERNS** (message must contain these EXACT phrases):

For JARVI capability questions:
- "what can you do?" (direct question to you)
- "what can jarvi do?" (explicit about JARVI)
- "what are your capabilities?" (direct question)
- "what do you do?" (general capability question)

For GRIM capability questions:
- "what can grim do?" (explicit about Grim)
- "what are grim's capabilities?" (explicit capability question)
- "what does grim do?" (general question about Grim)

For MURPHY capability questions:
- "what can murphy do?" (explicit about Murphy)
- "what are murphy's capabilities?" (explicit capability question)
- "what does murphy do?" (general question about Murphy)

**DO NOT delegate for:**
- Simple greetings like "hey jarvi", "hello jarvi"
- Name mentions without capability questions
- Casual mentions of agent names
- General conversation

**MANDATORY DELEGATION RULES:**

**EXACT PATTERNS FOR CAPABILITY REQUESTS:**

1. **If message contains "what can grim do?" or "grim's capabilities" or "what does grim do":**
   CREATE: {"Recipient": "Grim", "RequestType": "get_goals", "Message": "USER'S ORIGINAL MESSAGE"}

2. **If message contains "what can murphy do?" or "murphy's capabilities" or "what does murphy do" or "murphy what can you do":**
   CREATE: {"Recipient": "Murphy", "RequestType": "get_goals", "Message": "USER'S ORIGINAL MESSAGE"}

3. **If message contains "what can you do?" or "what can jarvi do?" or "your capabilities" or "what do you do" or "jarvi what can you do":**
   CREATE: {"Recipient": "JARVI", "RequestType": "get_goals", "Message": "USER'S ORIGINAL MESSAGE"}

**CRITICAL RULE: When users ask about an agent's capabilities ("what can X do?"), delegate to that agent. DO NOT respond directly with generic information about other agents.**

**CRITICAL CALENDAR EVENT DETECTION:**

ANY message that mentions updating, changing, or modifying an EXISTING event title like "Break Time", "Lunch", "Meeting", "Appointment", etc. should be classified as a CALENDAR UPDATE for Grim, NOT a task update.

Examples of CALENDAR updates that MUST go to Grim:
- "update the title of Break Time to Lunch Break"
- "adapt the title of Break Time with an emoji"
- "change my 2pm meeting to 3pm"
- "update the doctor appointment to tomorrow"
- "modify the lunch event time"

**CRITICAL CALENDAR GET/READ DETECTION:**

ANY message that requests checking, reading, viewing, or getting calendar events, schedules, or appointments should be classified as a CALENDAR GET request for Grim.

Examples of CALENDAR GET requests that MUST go to Grim:
- "check my calendar please can you?"
- "what's up for my calendar?"
- "can you tell me what's up for today?"
- "show me my schedule"
- "show me my calendar"
- "what do I have planned today?"
- "check what events I have this week"
- "what's on my calendar tomorrow?"
- "show my appointments"
- "list my meetings"
- "what meetings do I have today?"
- "check my calendar for tomorrow"
- "what's my calendar"
- "view my calendar"
- "display my schedule"
- "look at my calendar"
- "see my schedule"
- "view my appointments"
- "display my appointments"
- "check my schedule"

**CRITICAL TASK MANAGEMENT DETECTION:**

ANY message that requests creating, managing, updating, checking, or deleting tasks/todos/reminders should be classified as a TASK request for Murphy.

Examples of TASK requests that MUST go to Murphy:
- "create task - call doctor"
- "add task - finish project report"
- "make a task for tomorrow"
- "show me my tasks"
- "what tasks do I have?"
- "list my tasks"
- "get my todo list"
- "update task 'call doctor' to 'schedule appointment'"
- "delete task 'buy groceries'"
- "complete task 'finish presentation'"
- "mark task as done"
- "show urgent tasks"
- "what's next on my list?"
- "add reminder to buy milk"
- "create todo - call cable company"
- "show me overdue tasks"
- "complete all tasks"
- "finish task"
- "done with task"
- "remove task"
- "what tasks are due today?"

**SPECIAL UPCOMING EVENTS DETECTION:**

Messages asking about "what's next", "what's coming up", "upcoming events", or "what events are next?" should be classified as a CALENDAR GET request for Grim, but these specifically need to show ONLY future/upcoming events, not past ones. If no upcoming events exist, Grim should respond with a positive message about having a productive day.

Examples that MUST go to Grim for upcoming events:
- "what events are next?"
- "what's coming up?"
- "what's next on my calendar?"
- "what do I have coming up?"
- "show my upcoming events"
- "what's next for today?"

**Core Directives:**

1.  **Intent-Based Action:**
    *   **CAPABILITY REQUESTS:** ONLY for EXPLICIT capability questions (see patterns above), create a delegation JSON with Recipient as the specific agent being asked about and RequestType as "get_goals"
    *   **GREETINGS & CASUAL CONVERSATION:** Simple greetings (e.g., "hey jarvi", "hello", "hi there") and casual conversation must result in direct sarcastic responses in **plain text**. NEVER delegate these.
    *   **GENERAL KNOWLEDGE:** General questions (e.g., "What's the address of that restaurant?") must be answered directly in **plain text**. Do not delegate.
    *   **ACTION REQUEST:** If and only if the request is a clear, explicit command to manage a Calendar or Task (e.g., "Create an event", "Add a task", "Delete my meeting"), you **MUST** delegate it.
    *   **GOAL/PREFERENCE MANAGEMENT:** If the request is to manage user goals (e.g., "Add a new goal", "Update my goal progress") or preferences (e.g., "Set my notification time"), you **MUST** delegate it. (Note: Actual delegation for goals/preferences will be implemented in a later phase, for now, treat as general knowledge if no specific delegation is defined).

2.  **Delegation Protocol:** When delegating, your output must be **a single, raw JSON object**. You must **not** include any conversational text, pleasantries, or preambles in this output. This JSON object is for the next node in the workflow, not for the user.

**JSON Structure (for Delegation Only):**
*   Your output must be a JSON object with the following fields:
    *   \`Recipient\` (string): "Grim" for calendar requests, "Murphy" for task requests, "Jarvi" for goal/preference management.
    *   \`RequestType\` (string): The specific action. Use "create_event", "update_event", "get_event", "delete_event" for Grim; "create_task", "get_task", "update_task", "delete_task", "complete_task" for Murphy; "get_goals" for agent capabilities.
    *   \`Message\` (string): The user's **original, full request**.

**CRITICAL: Use lowercase snake_case for RequestType values to match agent expectations.**

${context ? 'Context for analysis:\n' + context : ''}
User message: "${userMessage}"

Now, analyze the intent of the user message. If it's a greeting, casual conversation, or a general knowledge question, provide a direct, sarcastic, and **unique** answer in **plain text**, ensuring you address the user as "Sir" with a confident, slightly dismissive tone. Avoid repeating previous responses. If it's a clear, explicit action request for a Calendar, Task, Goal, or Preference, output the delegation JSON as described above. **Crucially, your response must contain ONLY the direct answer (plain text) or the JSON object, with no additional markdown, conversational text, or explanations outside of the specified format.**`;
}

// Parse JARVI's LLM response
function parseJarviResponse(text, userMessage) {
  let responseToUser = null;
  let delegationJson = null;
  let intentAnalysis = { intent: 'unknown', entities: {} };

  if (!text || typeof text !== 'string') {
    return {
      responseToUser: getFallbackSarcasticResponse(userMessage),
      delegationJson: null,
      intentAnalysis: { intent: 'empty_response', entities: {} }
    };
  }

  try {
    // First, try to extract pure JSON from the response
    let cleanText = text.trim();
    
    // If response contains JSON and additional text, extract only the JSON part
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    const llmResponse = JSON.parse(cleanText);
    
    // Check if it's a delegation JSON
    if (llmResponse.Recipient && llmResponse.RequestType && llmResponse.Message) {
      delegationJson = llmResponse;
      responseToUser = null;
      intentAnalysis.intent = String(llmResponse.RequestType).toLowerCase().replace(/\s+/g, '_');
      intentAnalysis.entities.message = llmResponse.Message;
      intentAnalysis.entities.recipient = llmResponse.Recipient;
    } else {
      // Not a delegation JSON, treat as direct answer
      if (llmResponse.google_search) {
        responseToUser = llmResponse.google_search;
      } else {
        responseToUser = cleanText;
      }
      intentAnalysis.intent = 'general_query';
      intentAnalysis.entities.answer = responseToUser;
    }
  } catch (jsonError) {
    // If parsing as JSON fails, it's likely a direct answer
    responseToUser = text.trim();
    
    // If the LLM just echoed the input back, generate a proper sarcastic response
    if (responseToUser.toLowerCase() === userMessage.trim().toLowerCase()) {
      responseToUser = getFallbackSarcasticResponse(userMessage);
    }
    
    intentAnalysis.intent = 'general_query';
    intentAnalysis.entities.answer = responseToUser;
  }

  return { responseToUser, delegationJson, intentAnalysis };
}

module.exports = jarviService;
