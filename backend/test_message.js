// Simple test script to send messages to your running server
const http = require('http');

async function testMessage(message) {
  console.log(`\n📤 Sending message: "${message}"\n`);
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: message,
      userId: '982bb1bf-539c-4b1f-8d1a-714600fff81d' // Your real user ID from .env
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/test-chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('📥 Response received:');
          console.log(JSON.stringify(jsonData, null, 2));
          console.log('\n' + '='.repeat(60) + '\n');
          resolve(jsonData);
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting message tests...\n');
  
  // Test 1: Simple greeting
  await testMessage('Hello!');
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Calendar request
  await testMessage('Show me my calendar for today');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Task request
  await testMessage('Create a task to finish the report');
  
  console.log('✅ All tests complete!');
}

// Run the tests
runTests();
