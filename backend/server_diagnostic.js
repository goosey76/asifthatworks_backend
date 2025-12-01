// server_diagnostic.js
// Diagnostic script to test server startup and identify issues

console.log('=== SERVER STARTUP DIAGNOSTIC ===\n');

// Test 1: Check environment
console.log('1. Checking environment variables...');
try {
  require('dotenv').config({ path: __dirname + '/.env' });
  console.log('   ✓ .env file loaded');
  console.log('   ✓ SUPABASE_URL:', process.env.SUPABASE_URL ? 'present' : 'MISSING');
  console.log('   ✓ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'present' : 'MISSING');
} catch (error) {
  console.log('   ✗ Error loading .env:', error.message);
}

// Test 2: Check required modules
console.log('\n2. Testing required modules...');
const requiredModules = [
  'express',
  './src/services/gateway-service',
  './src/services/jarvi-service',
  './src/services/memory-service',
  './src/services/agent-service',
  './src/services/llm-service',
  '@supabase/supabase-js',
  'googleapis'
];

for (const module of requiredModules) {
  try {
    require(module);
    console.log(`   ✓ ${module}`);
  } catch (error) {
    console.log(`   ✗ ${module}: ${error.message}`);
  }
}

// Test 3: Check jarvi-agent dependencies
console.log('\n3. Testing jarvi-agent dependencies...');
try {
  const agentService = require('./src/services/agent-service');
  console.log('   ✓ agent-service');
} catch (error) {
  console.log('   ✗ agent-service:', error.message);
}

try {
  const memoryService = require('./src/services/memory-service');
  console.log('   ✓ memory-service');
} catch (error) {
  console.log('   ✗ memory-service:', error.message);
}

try {
  const llmService = require('./src/services/llm-service');
  console.log('   ✓ llm-service');
} catch (error) {
  console.log('   ✗ llm-service:', error.message);
}

// Test 4: Check jarvi-agent files
console.log('\n4. Testing jarvi-agent files...');
try {
  const jarviAgent = require('./src/services/agents/jarvi-agent');
  console.log('   ✓ jarvi-agent');
  console.log('   ✓ Methods available:', Object.keys(jarviAgent));
} catch (error) {
  console.log('   ✗ jarvi-agent:', error.message);
  console.log('   Stack:', error.stack);
}

// Test 5: Try to load gateway service
console.log('\n5. Testing gateway service...');
try {
  const gatewayService = require('./src/services/gateway-service');
  console.log('   ✓ gateway-service loaded');
  console.log('   ✓ Gateway methods:', Object.keys(gatewayService));
} catch (error) {
  console.log('   ✗ gateway-service:', error.message);
  console.log('   Stack:', error.stack);
}

// Test 6: Check if port is in use
console.log('\n6. Checking port availability...');
const net = require('net');
const port = 3000;

const server = net.createServer();
server.listen(port, (err) => {
  if (err) {
    console.log(`   ✗ Port ${port} is in use`);
  } else {
    console.log(`   ✓ Port ${port} is available`);
    server.close();
  }
});

server.on('error', (err) => {
  console.log(`   ✗ Port ${port} error:`, err.code);
});

console.log('\n=== DIAGNOSTIC COMPLETE ===');
