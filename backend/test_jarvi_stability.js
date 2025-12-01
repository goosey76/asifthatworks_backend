#!/usr/bin/env node
/**
 * JARVI Stability Test Script
 * Tests the backend's ability to receive messages and get responses from JARVI
 *
 * This script will:
 * 1. Check server health
 * 2. Register a test user (or use existing)
 * 3. Run JARVI message tests with a real user ID
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Use the existing user ID from the database
// This user already exists in the users table
const EXISTING_USER_ID = process.env.TEST_USER_ID || '982bb1bf-539c-4b1f-8d1a-714600fff81d';

// For new user registration tests
const TEST_EMAIL = process.env.TEST_EMAIL || `jarvi_test_${Date.now()}@test.com`;
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPass123!';

// Store user info
let testUser = { id: EXISTING_USER_ID };

// Test messages to send to JARVI
const testMessages = [
  { text: "hello jarvi", description: "Simple greeting" },
  { text: "what can you do?", description: "Capability question" },
  { text: "what's the weather like?", description: "General knowledge" },
  { text: "create an event for tomorrow at 3pm called Team Meeting", description: "Calendar delegation" },
  { text: "add a task to buy groceries", description: "Task delegation" },
  { text: "show me my calendar", description: "Calendar read" },
  { text: "what tasks do I have?", description: "Task read" },
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealth() {
  log('\n📊 Testing Health Endpoint...', 'cyan');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'healthy') {
      log(`✅ Server is healthy (uptime: ${data.uptime?.formatted || 'unknown'})`, 'green');
      return true;
    } else {
      log(`❌ Server status: ${data.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function setupTestUser() {
  log('\n👤 Setting up test user...', 'cyan');
  
  // Option 1: Use existing user from database
  if (EXISTING_USER_ID) {
    log(`   Using existing user ID: ${EXISTING_USER_ID}`, 'dim');
    testUser = { id: EXISTING_USER_ID };
    log(`✅ Test user configured: ${testUser.id}`, 'green');
    return testUser;
  }
  
  // Option 2: Try to register a new user
  log(`   Registering new user: ${TEST_EMAIL}`, 'dim');
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      testUser = data.data?.user || data.data;
      log(`✅ Test user registered: ${testUser?.id || 'unknown ID'}`, 'green');
      return testUser;
    } else if (data.error?.includes('already registered') || data.message?.includes('already')) {
      log('   User already exists, attempting login...', 'dim');
      return await loginTestUser();
    } else {
      if (data.data?.message?.includes('already registered')) {
        return await loginTestUser();
      }
      log(`⚠️  Registration response: ${JSON.stringify(data)}`, 'yellow');
      return await loginTestUser();
    }
  } catch (error) {
    log(`⚠️  Registration error: ${error.message}`, 'yellow');
    return await loginTestUser();
  }
}

async function loginTestUser() {
  log('   Attempting login...', 'dim');
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      testUser = data.data?.user || data.data;
      log(`✅ Test user logged in: ${testUser?.id || 'unknown ID'}`, 'green');
      return testUser;
    } else {
      log(`❌ Login failed: ${JSON.stringify(data)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Login error: ${error.message}`, 'red');
    return null;
  }
}

async function testJarviMessage(message, description, index) {
  const testNum = index + 1;
  log(`\n🧪 Test ${testNum}: ${description}`, 'cyan');
  log(`   Message: "${message}"`, 'dim');
  
  const startTime = Date.now();
  
  // Use registered user ID if available, otherwise fall back to test ID
  const userId = testUser?.id || 'test_stability_user';
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/test-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message, userId: userId }),
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      log(`❌ HTTP Error: ${response.status} ${response.statusText}`, 'red');
      return { success: false, duration, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.success) {
      log(`✅ Response received (${duration}ms)`, 'green');
      log(`   Type: ${data.type}`, 'dim');
      
      // Show response preview (truncated)
      const responseText = data.response || data.agentResponse || 'No response text';
      const preview = responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText;
      log(`   Response: "${preview}"`, 'dim');
      
      if (data.agent) {
        log(`   Agent: ${data.agent}`, 'dim');
      }
      
      return { success: true, duration, type: data.type, agent: data.agent };
    } else {
      log(`❌ JARVI error: ${data.error || 'Unknown error'}`, 'red');
      return { success: false, duration, error: data.error };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ Request failed: ${error.message}`, 'red');
    return { success: false, duration, error: error.message };
  }
}

async function runAllTests() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('        JARVI Stability Test Suite', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`   Base URL: ${BASE_URL}`, 'dim');
  log(`   Time: ${new Date().toISOString()}`, 'dim');
  
  // First check health
  const healthOk = await testHealth();
  
  if (!healthOk) {
    log('\n⚠️  Server is not healthy. Please start the server first:', 'yellow');
    log('   cd backend && node server.js', 'dim');
    process.exit(1);
  }
  
  // Setup test user (uses existing user ID from database)
  const user = await setupTestUser();
  if (user) {
    log(`   Using user ID: ${user.id}`, 'dim');
  } else {
    log('\n⚠️  Could not set up test user. Tests will use fallback ID.', 'yellow');
    log('   Note: Some tests may fail without a real user.', 'dim');
  }
  
  // Run all message tests
  const results = [];
  
  for (let i = 0; i < testMessages.length; i++) {
    const { text, description } = testMessages[i];
    const result = await testJarviMessage(text, description, i);
    results.push({ ...result, description });
    
    // Small delay between tests to avoid overwhelming the server
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('        Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length);
  
  log(`\n   Total Tests: ${results.length}`, 'dim');
  log(`   ✅ Passed: ${passed}`, passed === results.length ? 'green' : 'yellow');
  log(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   ⏱️  Avg Response Time: ${avgDuration}ms`, 'dim');
  
  // Show failed tests
  if (failed > 0) {
    log('\n   Failed Tests:', 'red');
    results
      .filter(r => !r.success)
      .forEach(r => log(`     - ${r.description}: ${r.error}`, 'red'));
  }
  
  // Delegations breakdown
  const delegations = results.filter(r => r.type === 'delegation');
  if (delegations.length > 0) {
    log('\n   Delegation Types:', 'dim');
    const agents = {};
    delegations.forEach(d => {
      agents[d.agent] = (agents[d.agent] || 0) + 1;
    });
    Object.entries(agents).forEach(([agent, count]) => {
      log(`     - ${agent}: ${count}`, 'dim');
    });
  }
  
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  
  // Exit code based on results
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  process.exit(1);
});