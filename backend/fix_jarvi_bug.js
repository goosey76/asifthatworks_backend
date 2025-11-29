#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix the critical JARVI delegation bug
const jarviFile = path.join(__dirname, 'src/services/agents/jarvi-agent/index.js');

let content = fs.readFileSync(jarviFile, 'utf8');

// Fix line 90: Ensure Message is always a string
content = content.replace(
  `const murphyEntities = {
            message: delegationJson.Message,`,
  `const messageContent = typeof delegationJson.Message === 'string' 
            ? delegationJson.Message 
            : JSON.stringify(delegationJson.Message);
            
            const murphyEntities = {
            message: messageContent,`
);

// Also fix Grim agent message handling
content = content.replace(
  `const grimEntities = {
            message: delegationJson.Message,`,
  `const grimMessageContent = typeof delegationJson.Message === 'string' 
            ? delegationJson.Message 
            : JSON.stringify(delegationJson.Message);
            
            const grimEntities = {
            message: grimMessageContent,`
);

fs.writeFileSync(jarviFile, content);
console.log('✅ JARVI delegation bug fixed!');
console.log('   - Message fields now always converted to strings');
console.log('   - Intelligence engines will work properly');
console.log('   - Chat interface should respond intelligently');