#!/usr/bin/env node

// test_murphy_parsing.js - Test the enhanced LLM extraction

require('dotenv').config({ path: './.env' });

const llmService = require('./src/services/llm-service');

async function testLLMExtraction() {
  console.log('🧪 Testing Enhanced LLM Extraction for MURPHY\n');

  const testMessages = [
    "yo murphy create a task - working on the backend due date from 10-11",
    "create task - call doctor tomorrow at 3pm",
    "add task - finish report today",
    "make a task - buy groceries on Friday",
    "create todo - meeting at 14:30"
  ];

  for (const message of testMessages) {
    console.log(`--- Testing: "${message}" ---`);
    
    const extractionPrompt = `Current Date: ${new Date().toISOString().split('T')[0]}. Current Time: ${new Date().toTimeString().split(' ')[0].substring(0, 5)}.
    
    Extract task details from the following message. Focus on separating the TASK DESCRIPTION from DATE/TIME information.
    
    CRITICAL TASK EXTRACTION RULES:
    - task_description: Clean, actionable task title (no date/time info)
    - due_date: Date only in YYYY-MM-DD format (if no date provided, use current date)
    - due_time: Time only in HH:MM format (if no time provided, leave empty)
    - task_id: Only if explicitly provided
    - existing_task_title: For updates/deletes (task to find)
    
    Date format conversion examples:
    - "10-11" or "10/11" → "2025-11-10" (current month)
    - "tomorrow" → ${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
    - "today" → ${new Date().toISOString().split('T')[0]}
    - "next week" → ${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}
    - "Friday" → Next Friday date
    - "2025-11-15" → "2025-11-15" (already correct format)
    - "14:30" → "14:30" (time format)
    
    Message parsing examples:
    "working on the backend due date from 10-11" → task_description: "working on the backend", due_date: "2025-11-10"
    "call doctor tomorrow at 3pm" → task_description: "call doctor", due_date: "tomorrow's date", due_time: "15:00"
    "finish report today" → task_description: "finish report", due_date: "today's date"
    
    Respond in JSON format: {"task_description": "", "due_date": "", "due_time": "", "task_id": "", "existing_task_title": ""}.
    Message: "${message}"`;
    
    try {
      const result = await llmService.generateContent("gpt-3.5-turbo", extractionPrompt);
      const extracted = JSON.parse(result);
      
      console.log('✅ Extracted:');
      console.log(`   Task: "${extracted.task_description}"`);
      console.log(`   Date: ${extracted.due_date || 'No date'}`);
      console.log(`   Time: ${extracted.due_time || 'No time'}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
    
    console.log('─'.repeat(50));
  }
}

testLLMExtraction().catch(console.error);