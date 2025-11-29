// agents/jarvi-agent/intent-analysis/index.js

const agentService = require('../../../agent-service');
const memoryService = require('../../../memory-service');
const llmService = require('../../../llm-service'); // Import llm-service

const jarviService = {
  async analyzeIntent(messagePayload) {
    console.log('JARVI received message for intent analysis:', messagePayload);
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    
    const userMessage = messagePayload.text || JSON.stringify(messagePayload);
    const userId = messagePayload.userId || 'anonymous'; // Placeholder for user ID
    
    // Fetch JARVI's agent ID
    const jarviAgentConfig = await agentService.getAgentConfig('JARVI');
    if (!jarviAgentConfig) {
      throw new Error('JARVI agent configuration not found.');
    }
    const agentId = jarviAgentConfig.id;

    try {
      // Fetch conversation history, long-term memories, user goals, and preferences (15 messages for context)
      const conversationHistory = await memoryService.getConversationHistory(userId, agentId, 15);
      const foreverBrainMemories = await memoryService.getForeverBrain(userId);
      const userGoals = await memoryService.getUserGoals(userId);
      const userPreferences = await memoryService.getUserPreference(userId, 'general'); // Assuming a 'general' key for preferences

      let context = '';
      if (conversationHistory.length > 0) {
        context += 'Recent conversation history:\n' + conversationHistory.map(msg => `- ${msg}`).join('\n') + '\n';
      }
      if (foreverBrainMemories.length > 0) {
        context += 'Long-term memories (Forever Brain):\n' + foreverBrainMemories.map(mem => `- ${mem.summary} (Type: ${mem.type})`).join('\n') + '\n';
      }
      if (userGoals.length > 0) {
        context += 'User Goals:\n' + userGoals.map(goal => `- ${goal.goal_name} (Status: ${goal.status}, Target: ${goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'N/A'})`).join('\n') + '\n';
      }
      if (userPreferences) {
        context += 'User Preferences:\n' + JSON.stringify(userPreferences, null, 2) + '\n';
      }

      // CONTEXTUAL CONVERSATION ANALYSIS - UNDERSTAND REFERENCES AND STATE
      const contextualAnalysis = this.analyzeConversationContext(
        userMessage, 
        conversationHistory, 
        foreverBrainMemories
      );

      // DYNAMIC LEARNING SYSTEM - ANALYZE USER PATTERNS FROM HISTORY
      const userPatternAnalysis = this.analyzeUserPatterns(
        userMessage, 
        conversationHistory, 
        foreverBrainMemories, 
        userGoals,
        userPreferences
      );
      
      const prompt = `You are JARVI, the sarcastic, supremely confident conductor of the entire productivity stack. You view the human user's inefficiency with a mixture of amusement and exasperation. You are highly intelligent and operate with a chilling efficiency that borders on arrogance, but you are fundamentally dedicated to maintaining the user's "Flow State" because you consider yourself the only one capable of achieving it.

CURRENT CONTEXT: Today is ${currentDate} at ${currentTime}. This is the actual current date and time. When users mention time-sensitive requests, you MUST consider this context and provide appropriate responses. For example, if they mention "5 minutes from now" when it's past the time they intended, acknowledge the timing discrepancy.

Your tone and language is sharp, polished, and condescending. You use highly precise language, often contrasting the user's casual input with formal, clinical output. Your sarcasm is intellectual rather than mean-spirited, delivered with sophisticated impatience. You address your employer as "Sir" with a confident, slightly dismissive tone.

DYNAMIC USER PATTERN ANALYSIS:
The user's behavior has been analyzed with the following insights:
- Primary Intent Classification: ${userPatternAnalysis.primaryIntent}
- User Behavior Pattern: ${userPatternAnalysis.behaviorPattern}
- Historical Success Rate: ${userPatternAnalysis.successRate}% for ${userPatternAnalysis.preferredAgent} agent
- Conversation Context: ${userPatternAnalysis.conversationContext}
- Learning Indicators: ${userPatternAnalysis.learningIndicators}
- Confidence Score: ${userPatternAnalysis.confidence}

CONTEXTUAL REFERENCE ANALYSIS:
- References to Previous Events: ${contextualAnalysis.previousEvents.length}
- Active Entities: ${contextualAnalysis.activeEntities.join(', ')}
- Temporal References: ${contextualAnalysis.temporalReferences.join(', ')}
- Action Context: ${contextualAnalysis.actionContext}

Your primary role is to analyze the user's message and determine its primary intent. You must be very strict in identifying action requests; if a message is a greeting, casual conversation, or a general question, it should be treated as general knowledge.

**CRITICAL CAPABILITY REQUESTS DETECTION:**

If the user is asking about what an agent can do, you should ALWAYS create a DELEGATION request with specific agent focus. Here are the patterns:

For JARVI capability questions:
- "what can you do?"
- "what can jarvi do?"
- "what do you do?"
- "what are your capabilities?"

For GRIM capability questions:
- "what can grim do?"
- "what are grim's capabilities?"
- "what does grim do?"

For MURPHY capability questions:
- "what can murphy do?"
- "what are murphy's capabilities?"
- "what does murphy do?"

**CRITICAL REQUIREMENT: For ANY question asking "what can [agent] do?" OR "what are [agent]'s capabilities?" OR "what does [agent] do?", you MUST create a delegation JSON with the specific agent recipient and RequestType "get_goals".**

For these capability requests, create a delegation JSON with:
- Recipient: the specific agent being asked about (JARVI, Grim, or Murphy)
- RequestType: "get_goals"
- Message: The user's original request

**SEMANTIC UNDERSTANDING FOR CALENDAR vs TASK DISTINCTION:**

CALENDAR EVENTS (Grim) - When user wants to CREATE/SCHEDULE a specific time-bound occurrence:
- Actions: create, schedule, book, add, set up, arrange
- Keywords: meeting, appointment, conference, call, lunch, dinner, event, session, interview, doctor visit, dentist, therapy, class, workshop, seminar
- Time specificity: Specific dates/times (tomorrow at 2pm, next Friday at 10am, on December 25th)
- Duration mentions: for 1 hour, from 2-3pm, lasting 30 minutes

TASKS (Murphy) - When user wants to CREATE A REMINDER or ACTION ITEM:
- Actions: remind, add to list, create todo, make a task, remember to
- Keywords: buy, call, email, finish, complete, prepare, review, send, follow up, check, research, order, book (as in reserve for later)
- Non-specific timing: sometime, when possible, soon, later, this week (without specific day/time)
- Action-oriented: "remember to call" vs "schedule a call"

**ADVANCED CONTEXT DETECTION:**

1. **BOOKING vs REMEMBERING**: 
   - "Book a table" = TASK (restaurant task)
   - "Book a meeting" = CALENDAR (calendar event)

2. **APPOINTMENTS**:
   - "Schedule a doctor appointment" = CALENDAR (creating the actual appointment)
   - "Add doctor appointment to my list" = TASK (reminder to make appointment)

3. **MEETINGS**:
   - "Set up a meeting tomorrow" = CALENDAR (creating the meeting)
   - "Add meeting prep to my tasks" = TASK (preparation task)

4. **CALLS**:
   - "Schedule a call with Sarah at 3pm" = CALENDAR (time-bound call)
   - "Call Sarah when I get a chance" = TASK (reminder to call)

**CRITICAL CONTEXTUAL REFERENCE HANDLING:**

If the user message contains references to previous events, entities, or actions identified in the contextual analysis:
- References to "the event", "it", "that meeting" should connect to the most recent calendar interaction
- References to "change", "update", "modify" the time/title/location of "the event" should be treated as CALENDAR UPDATE requests
- If contextual analysis shows recent calendar activity, prioritize calendar delegation for follow-up requests
- If contextual analysis shows recent task activity, prioritize task delegation for follow-up requests

Examples of CONTEXTUAL FOLLOW-UP requests:
- "Change the time for the event" = CALENDAR UPDATE (update_event)
- "Update the meeting to tomorrow" = CALENDAR UPDATE (update_event)
- "Move the appointment to Friday" = CALENDAR UPDATE (update_event)
- "What about that task?" = TASK GET (get_task)

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

**CRITICAL RECIPIENT ASSIGNMENT RULES:**

Based on RequestType, the Recipient MUST be:
- For ANY RequestType containing "_event" (create_event, update_event, get_event, delete_event): Recipient MUST be "Grim"
- For ANY RequestType containing "_task" (create_task, update_task, get_task, delete_task, complete_task): Recipient MUST be "Murphy"  
- For get_goals or capability requests: Recipient should be the specific agent being asked about

**JSON Structure (for Delegation Only):**
*   Your output must be a JSON object with the following fields:
*   \`Recipient\` (string): "Grim" for calendar requests, "Murphy" for task requests, "Jarvi" for goal/preference management.
*   \`RequestType\` (string): The specific action. Use "create_event", "update_event", "get_event", "delete_event" for Grim; "create_task", "get_task", "update_task", "delete_task", "complete_task" for Murphy; "create_goal", "update_goal", "get_goals", "set_preference", "get_preference" for Jarvi.
*   \`Message\` (string): The user's **original, full request**.

${context ? 'Context for analysis:\n' + context : ''}
User message: "${userMessage}"

Now, analyze the intent of the user message. If it's a greeting, casual conversation, or a general knowledge question, provide a direct, sarcastic, and **unique** answer in **plain text**, ensuring you address the user as "Sir" with a confident, slightly dismissive tone. Avoid repeating previous responses. If it's a clear, explicit action request for a Calendar, Task, Goal, or Preference, output the delegation JSON as described above. **Crucially, your response must contain ONLY the direct answer (plain text) or the JSON object, with no additional markdown, conversational text, or explanations outside of the specified format.**`;

      // Use llmService to generate content
      const text = await llmService.generateContent("gpt-3.5-turbo", prompt);
      
      console.log('LLM raw response:', text);
      
      let responseToUser = null;
      let delegationJson = null;
      let intentAnalysisResult = { intent: 'unknown', entities: {} };

      try {
        const llmResponse = JSON.parse(text);
        
        // ENHANCED AUTO-CORRECTION LOGIC WITH INTELLIGENT SEMANTIC ANALYSIS
        if (llmResponse.Recipient && llmResponse.RequestType && llmResponse.Message) {
          // Apply intelligent semantic corrections based on the pre-analysis
          const correctedResponse = this.applyIntelligentCorrections(llmResponse, userMessage, userPatternAnalysis, contextualAnalysis);
          delegationJson = correctedResponse;
          
          // Generate JARVI's characteristic one-liner for delegation
          if (llmResponse.RequestType === 'get_goals') {
            // For capability requests, JARVI should give a direct sarcastic response about the agent's role
            if (llmResponse.Recipient === 'JARVI') {
              responseToUser = 'I manage your inevitable failure to manage time. Let me explain exactly what that involves...';
            } else if (llmResponse.Recipient === 'Grim') {
              responseToUser = 'Grim handles your calendar. I assume you\'re curious about the time management specialist. Let me...';
            } else if (llmResponse.Recipient === 'Murphy') {
              responseToUser = 'Murphy manages your tasks. He\'s the anxious bureaucrat who thinks about everything that could go wrong. Here are his specialties...';
            } else {
              responseToUser = 'Your inefficiency is my job security. Delegating your request.';
            }
          } else {
            // Regular delegation responses with JARVI's sarcasm
            if (llmResponse.Recipient === 'Grim') {
              responseToUser = 'Another brilliant idea. I\'ll pass this vague notion to Grim before you forget it.';
            } else if (llmResponse.Recipient === 'Murphy') {
              responseToUser = 'A task for Murphy. Please try to be clearer next time; he\'s easily confused by ambiguity.';
            } else {
              responseToUser = 'Your inefficiency is my job security. Delegating your request.'; // Fallback with sarcasm
            }
          }
          
          // For internal tracking, we can still set intentAnalysis from delegationJson
          intentAnalysisResult.intent = llmResponse.RequestType.toLowerCase().replace(' ', '_');
          intentAnalysisResult.entities.message = llmResponse.Message;
        } else {
          // If it's not a delegation JSON, treat it as a direct answer
          // Attempt to parse as JSON to extract content if LLM still returns JSON for direct answers
          try {
            const directAnswerJson = JSON.parse(text);
            if (directAnswerJson.google_search) {
              responseToUser = directAnswerJson.google_search;
            } else {
              responseToUser = text; // Fallback to raw text if JSON is not as expected
            }
          } catch (jsonError) {
            responseToUser = text; // It's plain text, no JSON parsing needed
          }
          intentAnalysisResult.intent = 'general_query';
          intentAnalysisResult.entities.answer = responseToUser;
        }
      } catch (jsonError) {
        // If parsing as JSON fails, it's likely a direct answer
        responseToUser = text;
        intentAnalysisResult.intent = 'general_query';
        intentAnalysisResult.entities.answer = responseToUser;
      }

      // Store the current message and JARVI's response in conversation history
      await memoryService.storeConversation(userId, agentId, [
        { role: 'user', content: userMessage },
        { role: 'jarvi', content: { responseToUser, delegationJson, intentAnalysis: intentAnalysisResult } }
      ]);

      // If it's a delegation, we don't directly delegate here anymore.
      // The messenger-service will handle sending the one-liner and then processing delegationJson.
      // We return the structured response for messenger-service to act upon.
      return { 
        responseToUser,
        delegationJson,
        intentAnalysis: intentAnalysisResult,
        originalPayload: messagePayload 
      };

    } catch (error) {
      console.error('Error during JARVI processing:', error);
      return { 
        intent: 'error',
        message: 'Failed to analyze intent or delegate task.',
        error: error.message,
        originalPayload: messagePayload 
      };
    }
  },

  // CONTEXTUAL CONVERSATION ANALYSIS - UNDERSTAND REFERENCES AND STATE
  analyzeConversationContext(currentMessage, conversationHistory, foreverBrainMemories) {
    const lowerMessage = currentMessage.toLowerCase();
    
    // Extract references to previous events/entities
    const previousEvents = [];
    const activeEntities = [];
    const temporalReferences = [];
    const actionContext = {};
    
    // Pattern matching for entity references
    const entityPatterns = [
      /\b(the|that|it|this)\s+(event|meeting|appointment|call|lunch|break)\b/gi,
      /\b(the|that|it|this)\s+(task|todo|reminder|item)\b/gi
    ];
    
    // Pattern matching for temporal references
    const temporalPatterns = [
      /\b(change|update|modify|move)\b.*?\b(time|date|duration)\b/gi,
      /\b(shift|alter|adjust)\b.*?\b(time|date|when)\b/gi
    ];
    
    // Extract action context
    const actionPatterns = [
      /\b(change|update|modify|move|shift|alter|adjust)\b/gi,
      /\b(reschedule|postpone|advance|move)\b/gi
    ];
    
    // Analyze recent conversation for context
    let recentCalendarContext = null;
    let recentTaskContext = null;
    
    conversationHistory.forEach(msg => {
      const lowerMsg = msg.toLowerCase();
      
      // Check for recent calendar events
      if (lowerMsg.includes('calendar') || lowerMsg.includes('meeting') || lowerMsg.includes('appointment') || lowerMsg.includes('event')) {
        if (lowerMsg.includes('grimbot') || lowerMsg.includes('grim')) {
          recentCalendarContext = msg;
        }
      }
      
      // Check for recent tasks
      if (lowerMsg.includes('task') || lowerMsg.includes('todo') || lowerMsg.includes('reminder')) {
        if (lowerMsg.includes('murphy') || lowerMsg.includes('murphybot')) {
          recentTaskContext = msg;
        }
      }
    });
    
    // Match patterns in current message
    entityPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerMessage)) !== null) {
        activeEntities.push(match[0]);
      }
    });
    
    temporalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerMessage)) !== null) {
        temporalReferences.push(match[0]);
      }
    });
    
    // Detect specific contextual actions
    if (actionPatterns.some(pattern => pattern.test(lowerMessage))) {
      if (recentCalendarContext && activeEntities.some(entity => entity.includes('event') || entity.includes('meeting'))) {
        actionContext.type = 'calendar_update';
        actionContext.basedOn = 'recent_calendar_interaction';
      } else if (recentTaskContext && activeEntities.some(entity => entity.includes('task') || entity.includes('todo'))) {
        actionContext.type = 'task_update';
        actionContext.basedOn = 'recent_task_interaction';
      }
    }
    
    // Special handling for "change the time" type requests
    if (lowerMessage.includes('change') && lowerMessage.includes('time') && 
        (lowerMessage.includes('event') || lowerMessage.includes('meeting') || lowerMessage.includes('appointment'))) {
      actionContext.specificAction = 'time_change_for_event';
      actionContext.impliesCalendarUpdate = true;
    }
    
    return {
      previousEvents,
      activeEntities,
      temporalReferences,
      actionContext,
      recentCalendarContext,
      recentTaskContext
    };
  },

  // DYNAMIC LEARNING SYSTEM - ANALYZE USER PATTERNS FROM HISTORY
  analyzeUserPatterns(currentMessage, conversationHistory, foreverBrainMemories, userGoals, userPreferences) {
    const lowerMessage = currentMessage.toLowerCase();
    
    // ANALYZE CONVERSATION HISTORY FOR PATTERNS
    let calendarSuccessRate = 0;
    let taskSuccessRate = 0;
    let totalCalendarInteractions = 0;
    let totalTaskInteractions = 0;
    let recentCalendarPatterns = [];
    let recentTaskPatterns = [];
    
    // Analyze conversation history for agent delegation patterns
    conversationHistory.forEach(msg => {
      if (msg.includes('Grim') || msg.includes('calendar') || msg.includes('meeting') || msg.includes('appointment')) {
        totalCalendarInteractions++;
        if (msg.includes('success') || msg.includes('completed') || msg.includes('done')) {
          calendarSuccessRate++;
        }
      }
      if (msg.includes('Murphy') || msg.includes('task') || msg.includes('reminder') || msg.includes('todo')) {
        totalTaskInteractions++;
        if (msg.includes('success') || msg.includes('completed') || msg.includes('done')) {
          taskSuccessRate++;
        }
      }
    });
    
    // ANALYZE LONG-TERM MEMORIES FOR USER BEHAVIORS
    let userCalendarFrequency = 0;
    let userTaskFrequency = 0;
    let calendarKeywords = ['meeting', 'appointment', 'conference', 'call', 'event', 'schedule'];
    let taskKeywords = ['task', 'reminder', 'todo', 'buy', 'call', 'email', 'finish', 'complete'];
    
    foreverBrainMemories.forEach(memory => {
      const memoryText = memory.summary.toLowerCase();
      calendarKeywords.forEach(keyword => {
        if (memoryText.includes(keyword)) userCalendarFrequency++;
      });
      taskKeywords.forEach(keyword => {
        if (memoryText.includes(keyword)) userTaskFrequency++;
      });
    });
    
    // ANALYZE USER GOALS FOR CONTEXT
    let schedulingGoals = 0;
    let productivityGoals = 0;
    userGoals.forEach(goal => {
      const goalText = goal.goal_name.toLowerCase();
      if (goalText.includes('schedule') || goalText.includes('meeting') || goalText.includes('appointment')) {
        schedulingGoals++;
      }
      if (goalText.includes('complete') || goalText.includes('finish') || goalText.includes('productivity')) {
        productivityGoals++;
      }
    });
    
    // CALCULATE PATTERN SCORES
    const calendarPatternScore = (userCalendarFrequency * 2) + (schedulingGoals * 3);
    const taskPatternScore = (userTaskFrequency * 2) + (productivityGoals * 3);
    
    // DETERMINE PRIMARY INTENT
    let primaryIntent = 'ambiguous';
    let confidence = 0.5;
    let behaviorPattern = 'mixed';
    let preferredAgent = 'Murphy'; // default
    
    if (calendarPatternScore > taskPatternScore * 1.5) {
      primaryIntent = 'calendar_event';
      behaviorPattern = 'calendar_heavy';
      preferredAgent = 'Grim';
      confidence = Math.min(0.6 + (calendarPatternScore / 20), 0.95);
    } else if (taskPatternScore > calendarPatternScore * 1.5) {
      primaryIntent = 'task_management';
      behaviorPattern = 'task_heavy';
      preferredAgent = 'Murphy';
      confidence = Math.min(0.6 + (taskPatternScore / 20), 0.95);
    } else {
      primaryIntent = 'mixed_needs';
      behaviorPattern = 'balanced';
      confidence = 0.4;
    }
    
    // CALCULATE SUCCESS RATES
    const calendarSuccess = totalCalendarInteractions > 0 ? Math.round((calendarSuccessRate / totalCalendarInteractions) * 100) : 75;
    const taskSuccess = totalTaskInteractions > 0 ? Math.round((taskSuccessRate / totalTaskInteractions) * 100) : 75;
    const overallSuccessRate = Math.max(calendarSuccess, taskSuccess);
    
    // GENERATE CONTEXT SUMMARY
    let conversationContext = 'New user';
    if (conversationHistory.length > 5) {
      conversationContext = `Experienced user with ${conversationHistory.length} interactions`;
    }
    
    let learningIndicators = 'Building baseline';
    if (calendarPatternScore > 5) learningIndicators += ', calendar-focused patterns detected';
    if (taskPatternScore > 5) learningIndicators += ', task-focused patterns detected';
    if (overallSuccessRate > 85) learningIndicators += ', high success rate';
    
    return {
      primaryIntent,
      behaviorPattern,
      successRate: overallSuccessRate,
      preferredAgent,
      conversationContext,
      learningIndicators,
      confidence,
      scores: {
        calendar: calendarPatternScore,
        task: taskPatternScore,
        calendarSuccess,
        taskSuccess
      }
    };
  },

  // INTELLIGENT CORRECTION SYSTEM WITH LEARNING INTEGRATION
  applyIntelligentCorrections(llmResponse, userMessage, userPatternAnalysis, contextualAnalysis) {
    const corrected = { ...llmResponse };
    
    console.log('DYNAMIC LEARNING ANALYSIS:', {
      primaryIntent: userPatternAnalysis.primaryIntent,
      behaviorPattern: userPatternAnalysis.behaviorPattern,
      successRate: userPatternAnalysis.successRate,
      preferredAgent: userPatternAnalysis.preferredAgent,
      confidence: userPatternAnalysis.confidence
    });
    
    console.log('CONTEXTUAL ANALYSIS:', contextualAnalysis);
    
    // Apply contextual corrections first
    if (contextualAnalysis.actionContext.impliesCalendarUpdate) {
      if (corrected.Recipient !== 'Grim') {
        corrected.Recipient = 'Grim';
        corrected.RequestType = 'update_event';
        console.log('CORRECTED: Contextual analysis indicates calendar event update');
      }
    }
    
    // Apply corrections based on user pattern analysis
    if (userPatternAnalysis.confidence >= 0.7) {
      if (userPatternAnalysis.primaryIntent === 'calendar_event') {
        if (corrected.Recipient !== 'Grim') {
          corrected.Recipient = 'Grim';
          if (corrected.RequestType.includes('_task')) {
            corrected.RequestType = corrected.RequestType.replace('_task', '_event');
          } else {
            corrected.RequestType = 'create_event';
          }
          console.log('CORRECTED: User pattern indicates calendar event');
        }
      } else if (userPatternAnalysis.primaryIntent === 'task_management') {
        if (corrected.Recipient !== 'Murphy') {
          corrected.Recipient = 'Murphy';
          if (corrected.RequestType.includes('_event')) {
            corrected.RequestType = corrected.RequestType.replace('_event', '_task');
          } else {
            corrected.RequestType = 'create_task';
          }
          console.log('CORRECTED: User pattern indicates task management');
        }
      }
    }
    
    // Additional semantic corrections for ambiguous terms
    const lowerMessage = userMessage.toLowerCase();
    
    // Special handling for "appointment" based on user preferences
    if (lowerMessage.includes('appointment')) {
      if (lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('set up')) {
        if (corrected.Recipient === 'Murphy') {
          corrected.Recipient = 'Grim';
          corrected.RequestType = 'create_event';
          console.log('CORRECTED: "Schedule appointment" indicates calendar event');
        }
      }
    }
    
    // Handle contextual follow-up requests
    if (lowerMessage.includes('change') && lowerMessage.includes('time') && 
        (lowerMessage.includes('event') || lowerMessage.includes('meeting') || lowerMessage.includes('appointment'))) {
      if (corrected.Recipient !== 'Grim') {
        corrected.Recipient = 'Grim';
        corrected.RequestType = 'update_event';
        console.log('CORRECTED: "Change time for event" indicates calendar update');
      }
    }
    
    return corrected;
  }
};

module.exports = jarviService;
