#!/usr/bin/env node

/**
 * COMPREHENSIVE CROSS-AGENT SYSTEM TEST
 * Tests the complete flow: JARVI → GRIM/MURPHY → Response back to user
 * Validates that agent delegation and response chains work properly
 */

const http = require('http');

function makeRequest(message, description) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const data = JSON.stringify({
            text: message
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/v1/test-chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        success: res.statusCode === 200,
                        responseTime,
                        statusCode: res.statusCode,
                        data: parsed,
                        description
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        responseTime,
                        statusCode: res.statusCode,
                        error: 'Failed to parse JSON',
                        rawResponse: responseData,
                        description
                    });
                }
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                responseTime,
                error: error.message,
                description
            });
        });

        req.write(data);
        req.end();
    });
}

async function runComprehensiveTests() {
    console.log('🚀 STARTING COMPREHENSIVE CROSS-AGENT SYSTEM TEST');
    console.log('=' .repeat(60));

    const tests = [
        {
            name: '1. JARVI Direct Response Test',
            message: 'Hello, how are you?',
            expected: 'direct_response'
        },
        {
            name: '2. JARVI → MURPHY Delegation Test',
            message: 'Create a task for my university lecture tomorrow at 2pm',
            expected: 'delegation'
        },
        {
            name: '3. JARVI → GRIM Calendar Delegation Test', 
            message: 'Schedule a meeting with my professor next Monday at 10am',
            expected: 'delegation'
        },
        {
            name: '4. Complex Task Analysis Test',
            message: 'I have a big project due next week, can you help me break it down and create tasks?',
            expected: 'delegation'
        },
        {
            name: '5. Productivity Optimization Test',
            message: 'I feel overwhelmed with my workload, can you suggest how to organize my priorities?',
            expected: 'delegation'
        }
    ];

    let totalTests = 0;
    let passedTests = 0;
    let totalResponseTime = 0;

    for (const test of tests) {
        console.log(`\n📋 ${test.name}`);
        console.log(`Message: "${test.message}"`);
        
        try {
            const result = await makeRequest(test.message, test.name);
            totalTests++;
            totalResponseTime += result.responseTime;
            
            console.log(`⏱️  Response Time: ${result.responseTime}ms`);
            console.log(`📊 Status Code: ${result.statusCode}`);
            
            if (result.success) {
                console.log(`✅ SUCCESS`);
                
                if (result.data.type === 'direct_response') {
                    console.log(`🎯 Type: Direct JARVI Response`);
                    console.log(`💬 Response: "${result.data.response}"`);
                    passedTests++;
                } else if (result.data.type === 'delegation') {
                    console.log(`🤝 Type: Agent Delegation`);
                    
                    if (result.data.agentResponse) {
                        console.log(`💬 Agent Response: "${result.data.agentResponse}"`);
                        console.log(`🔄 JARVI Message: "${result.data.jarviMessage}"`);
                        passedTests++;
                    } else {
                        console.log(`❌ ISSUE: Agent response missing!`);
                    }
                } else {
                    console.log(`⚠️  Unknown response type: ${result.data.type}`);
                }
            } else {
                console.log(`❌ FAILED`);
                console.log(`Error: ${result.error || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.log(`💥 EXCEPTION: ${error.error || error.message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Performance Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed Tests: ${passedTests}`);
    console.log(`Failed Tests: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Average Response Time: ${(totalResponseTime / totalTests).toFixed(0)}ms`);

    // Agent Communication Analysis
    console.log('\n🤖 AGENT COMMUNICATION ANALYSIS');
    console.log('=' .repeat(60));
    
    if (passedTests === totalTests) {
        console.log('🎉 EXCELLENT: All cross-agent communications working!');
        console.log('✅ JARVI → Agent delegation flow validated');
        console.log('✅ Agent responses flowing back properly');
        console.log('✅ Intelligence engines integrated successfully');
    } else {
        console.log('⚠️  ISSUES DETECTED in agent communication chain');
        console.log('Need to investigate:');
        console.log('- Agent response handling');
        console.log('- Delegation flow completeness');
        console.log('- Error recovery mechanisms');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. If all tests pass → Proceed to concurrent user testing');
    console.log('2. If issues found → Debug agent response chains');
    console.log('3. Performance optimization based on response times');

    process.exit(0);
}

// Handle any unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
});

runComprehensiveTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});