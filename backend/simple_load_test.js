#!/usr/bin/env node

/**
 * SIMPLE & RELIABLE CONCURRENT TEST
 * Tests basic functionality first, then builds up complexity
 */

const http = require('http');

function makeRequest(message) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const data = JSON.stringify({ text: message });
        
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
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: res.statusCode === 200,
                    responseTime,
                    statusCode: res.statusCode,
                    rawData: responseData,
                    message: message
                });
            });
        });

        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, responseTime, error: error.message });
        });

        req.write(data);
        req.end();
    });
}

async function runSimpleLoadTest(numUsers, requestsPerUser) {
    console.log(`\n🚀 SIMPLE LOAD TEST: ${numUsers} users × ${requestsPerUser} requests`);
    console.log('=' .repeat(60));

    const startTime = Date.now();
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalResponseTime = 0;

    // Test 1: Sequential single-user baseline first
    console.log('\n📋 STEP 1: Single User Baseline (5 requests)');
    const singleUserResults = [];
    for (let i = 0; i < 5; i++) {
        try {
            const result = await makeRequest(`Baseline test ${i + 1}`);
            singleUserResults.push(result);
            totalRequests++;
            totalResponseTime += result.responseTime;
            
            if (result.success) {
                successfulRequests++;
                console.log(`✅ Request ${i + 1}: ${result.responseTime}ms - ${result.statusCode}`);
            } else {
                failedRequests++;
                console.log(`❌ Request ${i + 1}: FAILED`);
            }
        } catch (error) {
            failedRequests++;
            console.log(`💥 Request ${i + 1}: EXCEPTION - ${error.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const singleUserAvg = singleUserResults.length > 0 ? 
        (singleUserResults.reduce((sum, r) => sum + r.responseTime, 0) / singleUserResults.length).toFixed(0) : 0;

    console.log(`\n📊 SINGLE USER RESULTS:`);
    console.log(`Success Rate: ${((successfulRequests / totalRequests) * 100).toFixed(1)}%`);
    console.log(`Average Response Time: ${singleUserAvg}ms`);

    if (successfulRequests < totalRequests * 0.8) {
        console.log(`⚠️  SINGLE USER FAILED - Stopping test`);
        return { failed: true, reason: 'Single user baseline failed' };
    }

    // Test 2: Concurrent users
    if (numUsers > 1) {
        console.log(`\n🔥 STEP 2: ${numUsers} Concurrent Users`);
        const concurrentPromises = [];
        
        for (let user = 1; user <= numUsers; user++) {
            for (let req = 1; req <= requestsPerUser; req++) {
                const message = `User ${user} Request ${req}`;
                concurrentPromises.push(makeRequest(message));
            }
        }

        console.log(`📡 Sending ${concurrentPromises.length} concurrent requests...`);
        
        const concurrentStartTime = Date.now();
        try {
            const results = await Promise.allSettled(concurrentPromises);
            const concurrentEndTime = Date.now();
            
            let concurrentSuccessful = 0;
            let concurrentFailed = 0;
            let concurrentResponseTime = 0;

            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    concurrentSuccessful++;
                    concurrentResponseTime += result.value.responseTime;
                } else {
                    concurrentFailed++;
                }
            });

            totalRequests += concurrentPromises.length;
            successfulRequests += concurrentSuccessful;
            failedRequests += concurrentFailed;
            totalResponseTime += concurrentResponseTime;

            const concurrentAvg = concurrentSuccessful > 0 ? 
                (concurrentResponseTime / concurrentSuccessful).toFixed(0) : 0;

            console.log(`\n📊 CONCURRENT RESULTS:`);
            console.log(`Total Requests: ${concurrentPromises.length}`);
            console.log(`Successful: ${concurrentSuccessful}`);
            console.log(`Failed: ${concurrentFailed}`);
            console.log(`Success Rate: ${((concurrentSuccessful / concurrentPromises.length) * 100).toFixed(1)}%`);
            console.log(`Average Response Time: ${concurrentAvg}ms`);
            console.log(`Total Time: ${concurrentEndTime - concurrentStartTime}ms`);
            console.log(`Requests/Second: ${(concurrentPromises.length / ((concurrentEndTime - concurrentStartTime) / 1000)).toFixed(1)}`);

        } catch (error) {
            console.log(`💥 Concurrent test failed: ${error.message}`);
            return { failed: true, reason: 'Concurrent test exception' };
        }
    }

    // Final Analysis
    const totalTime = Date.now() - startTime;
    const overallSuccessRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = successfulRequests > 0 ? (totalResponseTime / successfulRequests) : 0;

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 FINAL PERFORMANCE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
    console.log(`Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`Total Test Time: ${totalTime}ms`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`Overall Requests/Second: ${(totalRequests / (totalTime / 1000)).toFixed(1)}`);

    // Load Assessment
    console.log('\n⚡ LOAD ASSESSMENT:');
    if (overallSuccessRate >= 95) {
        console.log(`✅ EXCELLENT: System handling ${numUsers} users flawlessly`);
    } else if (overallSuccessRate >= 80) {
        console.log(`✅ GOOD: System stable under ${numUsers} user load`);
    } else if (overallSuccessRate >= 60) {
        console.log(`⚠️  FAIR: System under stress at ${numUsers} users`);
    } else {
        console.log(`❌ POOR: System struggling with ${numUsers} users`);
    }

    return {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: overallSuccessRate,
        avgResponseTime,
        totalTime
    };
}

async function main() {
    console.log('🔧 STARTING RELIABLE LOAD TESTING');
    console.log('Focus: Basic functionality validation under load');

    try {
        // Test 1: Single user baseline
        const baseline = await runSimpleLoadTest(1, 5);
        if (baseline.failed) {
            console.log('❌ ABORTING: Single user baseline failed');
            process.exit(1);
        }

        // Test 2: Light concurrent load
        console.log('\n' + '=' .repeat(80));
        const lightLoad = await runSimpleLoadTest(5, 2);
        
        // Test 3: Medium concurrent load
        console.log('\n' + '=' .repeat(80));
        const mediumLoad = await runSimpleLoadTest(10, 1);

        // Final Recommendations
        console.log('\n' + '=' .repeat(80));
        console.log('📋 SYSTEM CAPACITY RECOMMENDATIONS');
        console.log('=' .repeat(80));
        
        if (lightLoad.successRate >= 90 && mediumLoad.successRate >= 85) {
            console.log('🎉 SYSTEM CAPACITY: EXCELLENT');
            console.log(`✅ Recommended concurrent users: ${10}-${Math.floor(10 * 1.5)}`);
            console.log(`⚠️  Warning threshold: ${Math.floor(10 * 1.5)}-${Math.floor(10 * 2)} users`);
            console.log(`❌ Critical threshold: ${Math.floor(10 * 2)}+ users`);
        } else if (lightLoad.successRate >= 75) {
            console.log('📊 SYSTEM CAPACITY: GOOD');
            console.log(`✅ Recommended concurrent users: ${Math.floor(10 * 0.8)}-${Math.floor(10 * 0.9)}`);
            console.log(`⚠️  Warning threshold: ${Math.floor(10 * 0.9)}-${Math.floor(10 * 1.1)} users`);
        } else {
            console.log('⚠️  SYSTEM CAPACITY: NEEDS OPTIMIZATION');
            console.log(`✅ Recommended concurrent users: ${Math.floor(10 * 0.5)}-${Math.floor(10 * 0.7)}`);
            console.log(`🔧 Consider optimization before increasing load`);
        }

        console.log('\n✅ LOAD TESTING COMPLETE');
        
    } catch (error) {
        console.error('💥 Load testing failed:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error);
    process.exit(1);
});

main();