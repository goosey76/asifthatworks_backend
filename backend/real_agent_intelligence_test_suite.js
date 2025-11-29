/**
 * Real Agent Intelligence Test Suite
 * 
 * Tests the actual intelligence and capabilities of JARVI, GRIM, and MURPHY
 * without any mock responses. Uses real user IDs and API endpoints.
 * 
 * This suite validates:
 * - JARVI's actual intent analysis and delegation intelligence
 * - Real-time agent responses and system behavior
 * - End-to-end system coordination and performance
 * - Response quality and consistency metrics
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class RealAgentIntelligenceTestSuite {
    constructor() {
        // Real user ID discovered from database
        this.realUserId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
        this.testUserEmail = "user@example.com";
        
        // API configuration
        this.apiBase = 'http://localhost:3000/api/v1';
        this.testEndpoint = `${this.apiBase}/test-chat`;
        
        // Test results tracking
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: [],
            intelligence: {
                jarvi: { analyses: [], avgResponseTime: 0, successRate: 0 },
                grim: { operations: [], avgResponseTime: 0, successRate: 0 },
                murphy: { operations: [], avgResponseTime: 0, successRate: 0 }
            },
            consistency: {
                responsePatterns: [],
                performanceMetrics: [],
                errorPatterns: []
            }
        };
    }

    // Test JARVI's actual intent analysis intelligence
    async testJarviIntentIntelligence() {
        console.log('\n🧠 Testing JARVI Real Intent Analysis Intelligence');
        console.log('='.repeat(60));

        const testIntents = [
            {
                name: 'Calendar Query Intent',
                text: 'What meetings do I have scheduled for tomorrow?',
                expectedBehavior: 'should delegate to GRIM for calendar query',
                category: 'calendar'
            },
            {
                name: 'Task Management Intent',
                text: 'Add buy groceries to my task list',
                expectedBehavior: 'should delegate to MURPHY for task creation',
                category: 'task'
            },
            {
                name: 'Complex Multi-Agent Intent',
                text: 'Show me my calendar for today and also check my task list',
                expectedBehavior: 'should coordinate multiple agent interactions',
                category: 'coordination'
            },
            {
                name: 'Agent Introduction Intent',
                text: 'What can you do?',
                expectedBehavior: 'should provide capabilities overview',
                category: 'self_introduction'
            },
            {
                name: 'Performance Test Intent',
                text: 'How is your performance today?',
                expectedBehavior: 'should provide self-assessment or delegate appropriately',
                category: 'performance'
            }
        ];

        for (const intent of testIntents) {
            console.log(`\n🔍 Testing: ${intent.name}`);
            console.log(`📝 Input: "${intent.text}"`);
            
            try {
                const startTime = performance.now();
                const response = await this.sendChatMessage(intent.text);
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                console.log(`⏱️ Response Time: ${responseTime.toFixed(2)}ms`);
                console.log(`📊 Response: ${response.substring(0, 150)}...`);

                // Analyze JARVI's intelligence
                const intelligenceAnalysis = this.analyzeJarviIntelligence(response, intent);
                
                this.results.intelligence.jarvi.analyses.push({
                    intent: intent.name,
                    input: intent.text,
                    response: response.substring(0, 500),
                    responseTime,
                    intelligence: intelligenceAnalysis,
                    timestamp: new Date().toISOString()
                });

                this.results.total++;
                if (intelligenceAnalysis.isIntelligent) {
                    this.results.passed++;
                } else {
                    this.results.failed++;
                }

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
                this.results.errors.push({
                    intent: intent.name,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                this.results.failed++;
            }

            // Delay between tests
            await this.delay(2000);
        }

        // Calculate JARVI intelligence metrics
        this.calculateJarviMetrics();
    }

    // Analyze JARVI's response for intelligence indicators
    analyzeJarviIntelligence(response, intent) {
        const analysis = {
            hasAgentAwareness: false,
            hasIntentRecognition: false,
            hasProperDelegation: false,
            hasContextualResponse: false,
            hasPersonality: false,
            isIntelligent: false,
            score: 0
        };

        const responseLower = response.toLowerCase();
        const intentCategory = intent.category;

        // Check for agent awareness
        if (responseLower.includes('grim') || responseLower.includes('murphy') || responseLower.includes('jarvi')) {
            analysis.hasAgentAwareness = true;
            analysis.score += 1;
        }

        // Check for intent recognition
        if (intentCategory === 'calendar' && (responseLower.includes('calendar') || responseLower.includes('meeting') || responseLower.includes('schedule'))) {
            analysis.hasIntentRecognition = true;
            analysis.score += 1;
        } else if (intentCategory === 'task' && (responseLower.includes('task') || responseLower.includes('todo') || responseLower.includes('groceries'))) {
            analysis.hasIntentRecognition = true;
            analysis.score += 1;
        }

        // Check for proper delegation patterns
        if (responseLower.includes('delegate') || responseLower.includes('pass') || responseLower.includes('route')) {
            analysis.hasProperDelegation = true;
            analysis.score += 1;
        }

        // Check for contextual response
        if (response.length > 50 && !responseLower.includes('error')) {
            analysis.hasContextualResponse = true;
            analysis.score += 1;
        }

        // Check for JARVI personality traits
        if (responseLower.includes('jarvi') || responseLower.includes('i am') || responseLower.includes('my')) {
            analysis.hasPersonality = true;
            analysis.score += 1;
        }

        // Determine if response shows intelligence (score >= 3)
        analysis.isIntelligent = analysis.score >= 3;

        console.log(`🧠 Intelligence Score: ${analysis.score}/5`);
        console.log(`🎯 Intelligent Response: ${analysis.isIntelligent ? '✅' : '❌'}`);

        return analysis;
    }

    // Test real GRIM and MURPHY agent responses through JARVI delegation
    async testRealAgentDelegation() {
        console.log('\n🤝 Testing Real Agent Delegation Intelligence');
        console.log('='.repeat(60));

        const delegationTests = [
            {
                name: 'GRIM Calendar Delegation',
                message: 'Schedule a meeting with John tomorrow at 2pm',
                expectedAgent: 'GRIM',
                expectedBehavior: 'should delegate to GRIM for calendar event creation'
            },
            {
                name: 'MURPHY Task Delegation',
                message: 'Create a task to review the quarterly report',
                expectedAgent: 'MURPHY',
                expectedBehavior: 'should delegate to MURPHY for task creation'
            },
            {
                name: 'Complex Multi-Agent Coordination',
                message: 'Add meeting preparation to my tasks and schedule the meeting for Friday',
                expectedAgent: 'BOTH',
                expectedBehavior: 'should coordinate both MURPHY and GRIM'
            }
        ];

        for (const test of delegationTests) {
            console.log(`\n🔄 Testing Delegation: ${test.name}`);
            console.log(`📝 Message: "${test.message}"`);
            
            try {
                const startTime = performance.now();
                const response = await this.sendChatMessage(test.message);
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                console.log(`⏱️ Response Time: ${responseTime.toFixed(2)}ms`);
                console.log(`📊 Response: ${response.substring(0, 150)}...`);

                // Analyze delegation intelligence
                const delegationAnalysis = this.analyzeDelegationIntelligence(response, test);
                
                const result = {
                    test: test.name,
                    message: test.message,
                    response: response.substring(0, 500),
                    responseTime,
                    delegation: delegationAnalysis,
                    timestamp: new Date().toISOString()
                };

                // Store in appropriate agent category
                if (test.expectedAgent === 'GRIM' || test.expectedAgent === 'BOTH') {
                    this.results.intelligence.grim.operations.push(result);
                }
                if (test.expectedAgent === 'MURPHY' || test.expectedAgent === 'BOTH') {
                    this.results.intelligence.murphy.operations.push(result);
                }

                this.results.total++;
                if (delegationAnalysis.isDelegated) {
                    this.results.passed++;
                } else {
                    this.results.failed++;
                }

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
                this.results.errors.push({
                    test: test.name,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                this.results.failed++;
            }

            await this.delay(3000);
        }

        this.calculateAgentMetrics();
    }

    // Analyze delegation intelligence in responses
    analyzeDelegationIntelligence(response, test) {
        const analysis = {
            mentionsAgent: false,
            showsDelegation: false,
            hasRelevantContent: false,
            showsCoordination: false,
            isDelegated: false,
            score: 0
        };

        const responseLower = response.toLowerCase();
        const expectedAgent = test.expectedAgent;

        // Check if response mentions the expected agent
        if (expectedAgent === 'GRIM' && responseLower.includes('grim')) {
            analysis.mentionsAgent = true;
            analysis.score += 1;
        } else if (expectedAgent === 'MURPHY' && responseLower.includes('murphy')) {
            analysis.mentionsAgent = true;
            analysis.score += 1;
        } else if (expectedAgent === 'BOTH' && (responseLower.includes('grim') || responseLower.includes('murphy'))) {
            analysis.mentionsAgent = true;
            analysis.score += 1;
        }

        // Check for delegation indicators
        if (responseLower.includes('delegate') || responseLower.includes('pass') || responseLower.includes('handle')) {
            analysis.showsDelegation = true;
            analysis.score += 1;
        }

        // Check for relevant content
        if (response.length > 30 && !responseLower.includes('error')) {
            analysis.hasRelevantContent = true;
            analysis.score += 1;
        }

        // Check for coordination (for multi-agent tests)
        if (expectedAgent === 'BOTH' && responseLower.includes('and') && (responseLower.includes('calendar') || responseLower.includes('task'))) {
            analysis.showsCoordination = true;
            analysis.score += 1;
        }

        analysis.isDelegated = analysis.score >= 2;

        console.log(`🤝 Delegation Score: ${analysis.score}/4`);
        console.log(`✅ Properly Delegated: ${analysis.isDelegated ? 'Yes' : 'No'}`);

        return analysis;
    }

    // Test system consistency across multiple runs
    async testSystemConsistency() {
        console.log('\n📊 Testing System Consistency & Performance');
        console.log('='.repeat(60));

        const consistencyTests = [
            {
                name: 'Consistency Test 1',
                message: 'Hello JARVI, how are you today?',
                category: 'greeting'
            },
            {
                name: 'Consistency Test 2', 
                message: 'What is your role in this system?',
                category: 'self_awareness'
            },
            {
                name: 'Consistency Test 3',
                message: 'Show me my current tasks',
                category: 'task_query'
            }
        ];

        console.log('🔄 Running multiple iterations for consistency analysis...');

        for (let iteration = 1; iteration <= 3; iteration++) {
            console.log(`\n📈 Consistency Iteration ${iteration}`);
            
            for (const test of consistencyTests) {
                try {
                    const startTime = performance.now();
                    const response = await this.sendChatMessage(test.message);
                    const endTime = performance.now();
                    const responseTime = endTime - startTime;

                    // Store consistency metrics
                    this.results.consistency.responsePatterns.push({
                        iteration,
                        test: test.name,
                        category: test.category,
                        responseLength: response.length,
                        responseTime,
                        timestamp: new Date().toISOString()
                    });

                    this.results.consistency.performanceMetrics.push({
                        iteration,
                        responseTime,
                        timestamp: new Date().toISOString()
                    });

                    console.log(`⏱️ ${test.category}: ${responseTime.toFixed(2)}ms`);

                } catch (error) {
                    this.results.consistency.errorPatterns.push({
                        iteration,
                        test: test.name,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }

                await this.delay(1000);
            }
        }

        this.analyzeConsistency();
    }

    // Send actual chat message to the running server
    async sendChatMessage(text) {
        const payload = {
            text: text,
            userId: this.realUserId
        };

        const response = await axios.post(this.testEndpoint, payload, {
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data.response || response.data.agentResponse || 'No response received';
    }

    // Calculate JARVI intelligence metrics
    calculateJarviMetrics() {
        const analyses = this.results.intelligence.jarvi.analyses;
        
        if (analyses.length > 0) {
            this.results.intelligence.jarvi.avgResponseTime = 
                analyses.reduce((sum, a) => sum + a.responseTime, 0) / analyses.length;
            
            this.results.intelligence.jarvi.successRate = 
                (analyses.filter(a => a.intelligence.isIntelligent).length / analyses.length) * 100;
        }
    }

    // Calculate agent performance metrics
    calculateAgentMetrics() {
        // GRIM metrics
        const grimOps = this.results.intelligence.grim.operations;
        if (grimOps.length > 0) {
            this.results.intelligence.grim.avgResponseTime = 
                grimOps.reduce((sum, op) => sum + op.responseTime, 0) / grimOps.length;
            this.results.intelligence.grim.successRate = 
                (grimOps.filter(op => op.delegation.isDelegated).length / grimOps.length) * 100;
        }

        // MURPHY metrics
        const murphyOps = this.results.intelligence.murphy.operations;
        if (murphyOps.length > 0) {
            this.results.intelligence.murphy.avgResponseTime = 
                murphyOps.reduce((sum, op) => sum + op.responseTime, 0) / murphyOps.length;
            this.results.intelligence.murphy.successRate = 
                (murphyOps.filter(op => op.delegation.isDelegated).length / murphyOps.length) * 100;
        }
    }

    // Analyze system consistency
    analyzeConsistency() {
        const metrics = this.results.consistency.performanceMetrics;
        
        if (metrics.length >= 3) {
            const avgTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
            const variance = metrics.reduce((sum, m) => sum + Math.pow(m.responseTime - avgTime, 2), 0) / metrics.length;
            const stdDev = Math.sqrt(variance);
            
            console.log(`📊 Average Response Time: ${avgTime.toFixed(2)}ms`);
            console.log(`📈 Standard Deviation: ${stdDev.toFixed(2)}ms`);
            console.log(`🎯 Consistency Score: ${stdDev < 1000 ? 'Good' : 'Variable'}`);
        }
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate comprehensive intelligence report
    generateIntelligenceReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: ((this.results.passed / this.results.total) * 100).toFixed(2) + '%',
                realUserId: this.realUserId,
                realUserEmail: this.testUserEmail
            },
            intelligenceAnalysis: {
                jarvi: {
                    analyses: this.results.intelligence.jarvi.analyses,
                    metrics: {
                        avgResponseTime: this.results.intelligence.jarvi.avgResponseTime,
                        successRate: this.results.intelligence.jarvi.successRate
                    }
                },
                grim: {
                    operations: this.results.intelligence.grim.operations,
                    metrics: {
                        avgResponseTime: this.results.intelligence.grim.avgResponseTime,
                        successRate: this.results.intelligence.grim.successRate
                    }
                },
                murphy: {
                    operations: this.results.intelligence.murphy.operations,
                    metrics: {
                        avgResponseTime: this.results.intelligence.murphy.avgResponseTime,
                        successRate: this.results.intelligence.murphy.successRate
                    }
                }
            },
            consistencyAnalysis: this.results.consistency,
            errorAnalysis: this.results.errors
        };

        return report;
    }

    // Display results summary
    displayResults() {
        console.log('\n' + '='.repeat(70));
        console.log('🏆 REAL AGENT INTELLIGENCE TEST RESULTS');
        console.log('='.repeat(70));

        console.log(`📊 Overall Results:`);
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);

        console.log(`\n🧠 JARVI Intelligence:`);
        console.log(`   Average Response Time: ${this.results.intelligence.jarvi.avgResponseTime.toFixed(2)}ms`);
        console.log(`   Intelligence Success Rate: ${this.results.intelligence.jarvi.successRate.toFixed(2)}%`);

        console.log(`\n🤝 Agent Delegation:`);
        console.log(`   GRIM Avg Response: ${this.results.intelligence.grim.avgResponseTime.toFixed(2)}ms`);
        console.log(`   GRIM Success Rate: ${this.results.intelligence.grim.successRate.toFixed(2)}%`);
        console.log(`   MURPHY Avg Response: ${this.results.intelligence.murphy.avgResponseTime.toFixed(2)}ms`);
        console.log(`   MURPHY Success Rate: ${this.results.intelligence.murphy.successRate.toFixed(2)}%`);

        if (this.results.errors.length > 0) {
            console.log(`\n⚠️ Errors Encountered: ${this.results.errors.length}`);
            this.results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.intent || error.test}: ${error.error}`);
            });
        }

        console.log(`\n🎯 Test User: ${this.testUserEmail}`);
        console.log(`🆔 User ID: ${this.realUserId}`);
    }

    // Main execution method
    async runIntelligenceTestSuite() {
        console.log('🚀 Starting Real Agent Intelligence Test Suite');
        console.log('='.repeat(70));
        console.log(`🆔 Using Real User ID: ${this.realUserId}`);
        console.log(`📧 User Email: ${this.testUserEmail}`);
        console.log(`🌐 API Endpoint: ${this.testEndpoint}`);

        try {
            // Test JARVI's intent analysis intelligence
            await this.testJarviIntentIntelligence();
            
            // Test real agent delegation
            await this.testRealAgentDelegation();
            
            // Test system consistency
            await this.testSystemConsistency();
            
            // Display results
            this.displayResults();
            
            // Generate and return detailed report
            const report = this.generateIntelligenceReport();
            
            console.log('\n✅ Real Agent Intelligence Test Suite Completed Successfully!');
            
            return report;

        } catch (error) {
            console.error('❌ Intelligence Test Suite Failed:', error.message);
            throw error;
        }
    }
}

// Export for use in other modules
module.exports = RealAgentIntelligenceTestSuite;

// Run if executed directly
if (require.main === module) {
    const testSuite = new RealAgentIntelligenceTestSuite();
    
    testSuite.runIntelligenceTestSuite()
        .then(report => {
            console.log('\n📋 Intelligence Test Report:');
            console.log(JSON.stringify(report, null, 2));
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}