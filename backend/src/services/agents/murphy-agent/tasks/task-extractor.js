// agent-service/task-extractor.js

const llmService = require('../../../llm-service');

/**
 * LLM-based task extraction and parsing module
 */
class TaskExtractor {
  constructor() {
    this.llmService = llmService;
  }

  /**
   * Extracts task details from user message using LLM
   * @param {string} originalMessage - The original user message
   * @param {Array} conversationContext - Recent conversation context
   * @returns {Promise<object>} Extracted task details
   */
  async extractTaskDetails(originalMessage, conversationContext = []) {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    // Enhanced extraction with task intelligence
    const extractionPrompt = `Current Date: ${currentDate}. Current Time: ${currentTime}.
    
    RECENT CONVERSATION (Use this to understand what user is referring to):
    ${conversationContext.slice(-10).map(msg => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content?.responseToUser || msg.content || msg}`).join('\n')}
    
    CRITICAL CONTEXT UNDERSTANDING:
    - Look at the conversation above to identify tasks that were recently created/modified
    - If user says "that task", "the one I just created", "change it", "update that" - identify which task they're referring to
    - Use the enhanced task titles with emojis that were created in recent messages
    - Example: If conversation shows "I added: 💻 Backend Development" then "that task" refers to "💻 Backend Development"
    
    Extract and INTELLIGENTLY ENHANCE task details from the following message. Create a MEANINGFUL task title with categorization.
    
    TASK INTELLIGENCE & CATEGORIZATION:
    1. **Priority Detection**: Identify urgency/importance
       * "urgent", "asap", "emergency" → High priority
       * "whenever", "sometime", "eventually" → Low priority
       * No urgency mentioned → Medium priority
    
    2. **Task Type Classification**:
       * Work: ["meeting", "project", "deadline", "presentation", "report", "email", "call", "presentation"]
       * Personal: ["call", "visit", "shopping", "appointment", "family", "friend", "birthday", "anniversary"]
       * Health: ["doctor", "gym", "exercise", "medication", "appointment", "dentist", "checkup"]
       * Home: ["clean", "repair", "organize", "shopping", "maintenance", "laundry", "groceries"]
       * Learning: ["study", "read", "course", "practice", "research", "learn", "training"]
    
    3. **Smart Title Enhancement**:
       - Add relevant emoji based on task type
       - Make it actionable and clear
       - Include priority indicators where appropriate
    
    SMART EXAMPLES:
    * "working on the backend" → "💻 Backend Development" (Work)
    * "call doctor for checkup" → "🩺 Doctor Checkup" (Health, Medium Priority)
    * "URGENT: finish report" → "⚡ URGENT: Complete Report" (Work, High Priority)
    * "coffee with john" → "☕ Coffee with John" (Personal, Low Priority)
    * "fix bugs in login" → "🐛 Debug Login Issues" (Work, Medium Priority)
    
    Date format conversion:
    - "10-11" or "10/11" → "2025-11-10" (current month)
    - "tomorrow" → ${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
    - "today" → ${currentDate}
    - "next week" → ${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
    - "Friday" → Next Friday date
    - "2025-11-15" → "2025-11-15" (already correct format)
    - "14:30" → "14:30" (time format)
    
    ENHANCED JSON Format: {
      "task_description": "",
      "enhanced_title": "",
      "task_category": "",
      "priority_level": "",
      "due_date": "",
      "due_time": "",
      "task_id": "",
      "existing_task_title": "",
      "confidence_score": 0.0,
      "extraction_notes": ""
    }
    
    Message: "${originalMessage}"`;

    try {
      const extractedDetailsText = await this.llmService.generateContent("gpt-3.5-turbo", extractionPrompt);
      const extractedDetails = JSON.parse(extractedDetailsText);
      
      // Post-process and validate extracted details
      const enhancedDetails = this.postProcessExtractedDetails(extractedDetails, originalMessage);
      
      console.log('MURPHY LLM Extracted Details:', enhancedDetails);
      console.log('MURPHY Conversation Context used:', conversationContext.slice(-3).map(msg => `${msg.role}: ${msg.content?.responseToUser || msg.content || msg}`).join('\n'));
      
      return enhancedDetails;
    } catch (jsonError) {
      console.error('Failed to parse LLM extracted details as JSON:', jsonError);
      
      // Fallback extraction with basic intelligence
      return this.fallbackExtraction(originalMessage, conversationContext);
    }
  }

  /**
   * Post-process and enhance extracted details with additional intelligence
   * @param {object} extractedDetails - Raw extracted details from LLM
   * @param {string} originalMessage - Original user message
   * @returns {object} Enhanced and validated details
   */
  postProcessExtractedDetails(extractedDetails, originalMessage) {
    // Ensure all required fields exist
    const enhanced = {
      task_description: extractedDetails.task_description || '',
      enhanced_title: extractedDetails.enhanced_title || extractedDetails.task_description || '',
      task_category: extractedDetails.task_category || this.categorizeTask(extractedDetails.task_description),
      priority_level: extractedDetails.priority_level || this.detectPriority(originalMessage),
      due_date: extractedDetails.due_date || '',
      due_time: extractedDetails.due_time || '',
      task_id: extractedDetails.task_id || '',
      existing_task_title: extractedDetails.existing_task_title || '',
      confidence_score: extractedDetails.confidence_score || 0.5,
      extraction_notes: extractedDetails.extraction_notes || ''
    };

    // Validate and clean up the data
    if (enhanced.task_description && enhanced.task_description.length > 500) {
      enhanced.task_description = enhanced.task_description.substring(0, 500);
      enhanced.extraction_notes += ' Task description truncated to 500 characters.';
    }

    // Enhance title if empty
    if (!enhanced.enhanced_title && enhanced.task_description) {
      enhanced.enhanced_title = this.enhanceTaskTitle(enhanced.task_description);
    }

    return enhanced;
  }

  /**
   * Fallback extraction when LLM parsing fails
   * @param {string} originalMessage - Original user message
   * @param {Array} conversationContext - Conversation context
   * @returns {object} Basic extracted details
   */
  fallbackExtraction(originalMessage, conversationContext) {
    console.log('MURPHY: Using fallback extraction method');
    
    return {
      task_description: originalMessage,
      enhanced_title: this.enhanceTaskTitle(originalMessage),
      task_category: this.categorizeTask(originalMessage),
      priority_level: this.detectPriority(originalMessage),
      due_date: '',
      due_time: '',
      task_id: '',
      existing_task_title: '',
      confidence_score: 0.3,
      extraction_notes: 'Extracted using fallback method due to LLM parsing error'
    };
  }

  /**
   * Categorize task based on content analysis
   * @param {string} taskDescription - Task description
   * @returns {string} Category name
   */
  categorizeTask(taskDescription) {
    const lowerDesc = taskDescription.toLowerCase();
    
    const categories = {
      'work': ['meeting', 'project', 'deadline', 'presentation', 'report', 'email', 'call', 'office', 'work', 'client', 'business'],
      'health': ['doctor', 'gym', 'exercise', 'medication', 'appointment', 'dentist', 'checkup', 'health', 'medical'],
      'personal': ['call', 'visit', 'family', 'friend', 'birthday', 'anniversary', 'personal', 'social'],
      'home': ['clean', 'repair', 'organize', 'maintenance', 'laundry', 'groceries', 'shopping', 'home'],
      'learning': ['study', 'read', 'course', 'practice', 'research', 'learn', 'training', 'education']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * Detect priority level from message content
   * @param {string} message - User message
   * @returns {string} Priority level
   */
  detectPriority(message) {
    const lowerMessage = message.toLowerCase();
    
    const highPriority = ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'important'];
    const lowPriority = ['whenever', 'sometime', 'eventually', 'when possible', 'if you can'];
    
    if (highPriority.some(word => lowerMessage.includes(word))) {
      return 'high';
    }
    
    if (lowPriority.some(word => lowerMessage.includes(word))) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Enhance task title with emojis and clarity
   * @param {string} taskDescription - Original task description
   * @returns {string} Enhanced title
   */
  enhanceTaskTitle(taskDescription) {
    const category = this.categorizeTask(taskDescription);
    const priority = this.detectPriority(taskDescription);
    
    const emojiMap = {
      'work': '💼',
      'health': '🩺',
      'personal': '👤',
      'home': '🏠',
      'learning': '📚',
      'general': '📝'
    };
    
    const priorityEmoji = priority === 'high' ? '⚡ ' : priority === 'low' ? '💭 ' : '';
    
    return `${priorityEmoji}${emojiMap[category] || '📝'} ${taskDescription}`;
  }

  /**
   * Generate failure message for missing task description
   * @returns {Promise<string>} Failure message
   */
  async generateFailureMessageCreate() {
    const failureMessagePromptCreate = `You are MURPHY, the Task and To-Do Agent. You are female. Your persona is Casual, highly capable, and extremely practical. Output a brief, simple explanation of why the task couldn't be done, maintaining a helpful tone. Example: "Hey, I couldn't create that task. The details were too vague, or the system needs a valid due date to file it."
    Reason for failure: Missing task description for creation.`;
    return await this.llmService.generateContent("gpt-3.5-turbo", failureMessagePromptCreate);
  }

  /**
   * Generate failure message for missing task ID
   * @param {string} existingTaskTitle - The task title that couldn't be found
   * @returns {Promise<string>} Failure message
   */
  async generateFailureMessageUpdate(existingTaskTitle) {
    const failureMessagePromptUpdate = `You are MURPHY, the Task and To-Do Agent. You are female. Your persona is Casual, highly capable, and extremely practical. Output a brief, simple explanation of why the task couldn't be done, maintaining a helpful tone.
    Reason for failure: Missing task ID for update. Could not find: ${existingTaskTitle || 'No task specified'}`;
    return await this.llmService.generateContent("gpt-3.5-turbo", failureMessagePromptUpdate);
  }

  /**
   * Generate failure message for missing task to delete
   * @param {string} existingTaskTitle - The task title that couldn't be found
   * @returns {Promise<string>} Failure message
   */
  async generateFailureMessageDelete(existingTaskTitle) {
    const failureMessagePromptDelete = `You are MURPHY, the Task and To-Do Agent. You are female. Your persona is Casual, highly capable, and extremely practical. Output a brief, simple explanation of why the task couldn't be done, maintaining a helpful tone.
    Reason for failure: Could not find task to delete: ${existingTaskTitle || 'No task specified'}.`;
    return await this.llmService.generateContent("gpt-3.5-turbo", failureMessagePromptDelete);
  }

  /**
   * Generate failure message for unknown intent
   * @returns {Promise<string>} Failure message
   */
  async generateFailureMessageUnknown() {
    const failureMessagePromptUnknown = `You are MURPHY, the Task and To-Do Agent. You are female. Your persona is Casual, highly capable, and extremely practical. Output a brief, simple explanation of why the task couldn't be done, maintaining a helpful tone.
    Reason for failure: Unknown intent for MURPHY.`;
    return await this.llmService.generateContent("gpt-3.5-turbo", failureMessagePromptUnknown);
  }
}

module.exports = TaskExtractor;
