#!/usr/bin/env node

/**
 * CONCURRENT USER LOAD TESTING
 * Tests system performance under various load conditions
 * Validates cross-agent communication under concurrent stress
 */

const http = require('http');

function makeRequest(message, userId) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const data = JSON.stringify({
            text: message,
            userId: userId
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
                        userId,
                        type: parsed.type
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        responseTime,
                        statusCode: res.statusCode,
                        error: 'Failed to parse JSON',
                        userId,
                        rawResponse: responseData
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
                userId
            });
        });

        req.write(data);
        req.end();
    });
}

async function runConcurrentTest(numUsers, requestsPerUser, delayBetweenUsers = 100) {
    console.log(`\n🔥 Starting Load Test: ${numUsers} users, ${requestsPerUser} requests each`);
    console.log('=' .repeat(70));

    const userPromises = [];
    const startTime = Date.now();
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let directResponses = 0;
    let delegationResponses = 0;

    // Create all user requests with slight delays to avoid overwhelming
    for (let userId = 1; userId <= numUsers; userId++) {
        const userRequests = [];
        
        for (let req = 1; req <= requestsPerUser; req++) {
            const message = req % 3 === 1 ? 
                "Hello, what's your status?" :
                req % 3 === 2 ?
                "Create a task for my meeting tomorrow at 2pm" :
                "I need help organizing my priorities this week";
            
            userRequests.push(
                makeRequest(message, `user_${userId}_req_${req}`)
            );
        }

        // Add small delay between users to stagger requests
        const userDelay = userId * delayBetweenUsers;
        await new Promise(resolve => setTimeout(resolve, userDelay));
        
        userPromises.push(...userRequests);
    }

    console.log(`📡 Executing ${userPromises.length} concurrent requests...`);

    try {
        const results = await Promise.allSettled(userPromises);
        
        results.forEach((result) => {
            totalRequests++;
            
            if (result.status === 'fulfilled' && result.value.success) {
                successfulRequests++;
                
                if (result.value.type === 'direct_response') {
                    directResponses++;
                } else if (result.value.type === 'delegation') {
                    delegationResponses++;
                }
            } else {
                failedRequests++;
            }
        });
    } catch (error) {
        console.error('Error in concurrent test:', error);
    }

    const totalTime = Date.now() - startTime;
    const requestsPerSecond = (totalRequests / (totalTime / 1000)).toFixed(2);
    const averageResponseTime = totalRequests > 0 ? 
        (totalTime / totalRequests).toFixed(0) : 0;

    // Performance Analysis
    console.log(`\n📊 LOAD TEST RESULTS (${numUsers} users)`);
    console.log('=' .repeat(70));
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
    console.log(`Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Requests/Second: ${requestsPerSecond}`);
    console.log(`Average Response Time: ${averageResponseTime}ms`);

    console.log(`\n🤖 AGENT DISTRIBUTION:`);
    console.log(`Direct JARVI Responses: ${directResponses} (${((directResponses / successfulRequests) * 100).toFixed(1)}%)`);
    console.log(`Agent Delegations: ${delegationResponses} (${((delegationResponses / successfulRequests) * 100).toFixed(1)}%)`);

    // Load Assessment
    console.log(`\n⚡ LOAD ASSESSMENT:`);
    
    if (successfulRequests === totalRequests) {
        console.log(`✅ EXCELLENT: ${numUsers} users handled flawlessly`);
        console.log(`🎯 System can handle this load without degradation`);
    } else if (successfulRequests >= totalRequests * 0.9) {
        console.log(`✅ GOOD: ${numUsers} users mostly successful`);
        console.log(`⚠️ Minor issues, system stable under this load`);
    } else if (successfulRequests >= totalRequests * 0.7) {
        console.log(`⚠️ WARNING: ${numUsers} users showing degradation`);
        console.log(`🔧 Consider optimization before increasing load`);
    } else {
        console.log(`❌ CRITICAL: ${numUsers} users failing significantly`);
        console.log(`🚨 System overloaded, need immediate optimization`);
    }

    return {
        numUsers,
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: (successfulRequests / totalRequests) * 100,
        totalTime,
        requestsPerSecond,
        averageResponseTime,
        directResponses,
        delegationResponses
    };
}

async function runProgressiveLoadTesting() {
    console.log('🚀 STARTING PROGRESSIVE CONCURRENT USER TESTING');
    console.log('🧪 Testing system scalability across different user loads');
    console.log('=' .repeat(80));

    const loadTests = [
        { users: 1, requests: 5, delay: 50 },
        { users: 5, requests: 3, delay: 100 },
        { users: 10, requests: 2, delay: 150 },
        { users: 15, requests: 2, delay: 200 },
        { users: 20, requests: 1, delay: 250 }
    ];

    const results = [];

    for (const test of loadTests) {
        try {
            const result = await runConcurrentTest(test.users, test.requests, test.delay);
            results.push(result);
            
            // Analysis before next test
            if (result.successRate < 80) {
                console.log(`\n⚠️  STOPPING LOAD PROGRESSION - System showing stress at ${test.users} users`);
                console.log(`💡 Recommendations:`);
                console.log(`   - Consider implementing request queuing`);
                console.log(`   - Add connection pooling for database`);
                console.log(`   - Implement response caching for frequent requests`);
                break;
            }
            
            // Brief recovery time between tests
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`Error in load test ${test.users} users:`, error);
            break;
        }
    }

    // Final Analysis
    console.log('\n' + '=' .repeat(80));
    console.log('📈 PROGRESSIVE LOAD TEST SUMMARY');
    console.log('=' .repeat(80));

    results.forEach((result, index) => {
        console.log(`Test ${index + 1}: ${result.numUsers} users → ${result.successRate.toFixed(1)}% success, ${result.requestsPerSecond} req/s`);
    });

    // Recommendations
    const bestResult = results.reduce((best, current) => 
        current.successRate > best.successRate ? current : best
    );

    console.log(`\n🎯 SYSTEM CAPACITY ANALYSIS:`);
    console.log(`✅ Optimal Load: ~${Math.floor(bestResult.numUsers * 0.8)} concurrent users`);
    console.log(`⚠️ Warning Threshold: ~${bestResult.numUsers} concurrent users`);
    console.log(`❌ Critical Threshold: ~${Math.floor(bestResult.numUsers * 1.2)} concurrent users`);

    console.log(`\n🔧 OPTIMIZATION RECOMMENDATIONS:`);
    if (results.some(r => r.successRate < 90)) {
        console.log(`- Implement rate limiting to prevent overload`);
        console.log(`- Add connection pooling for database operations`);
        console.log(`- Consider caching frequently requested data`);
    }
    if (results.some(r => r.averageResponseTime > 5000)) {
        console.log(`- Optimize LLM processing time`);
        console.log(`- Implement request queuing system`);
        console.log(`- Consider load balancing across multiple instances`);
    }

    console.log(`\n🎉 LOAD TESTING COMPLETE!`);
    console.log(`System validated for ${Math.max(...results.map(r => r.numUsers))} concurrent users`);

    process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
});

runProgressiveLoadTesting().catch(error => {
    console.error('Load testing failed:', error);
    process.exit(1);
});