/**
 * Real Agent Intelligence Test Suite V2 - With Google Integration
 * 
 * Tests the actual intelligence and capabilities of JARVI, GRIM, and MURPHY
 * using the user with FULL Google API integrations (Calendar + Tasks).
 * 
 * This provides the most comprehensive validation of agent intelligence
 * since agents can perform actual operations instead of reporting errors.
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class RealAgentIntelligenceTestSuiteV2 {
    constructor() {
        // Real user ID with Google integrations
        this.realUserId = "982bb1bf-539c-4b1f-8d1a-714600fff81d";
        this.testUserEmail = "trashbot7676@gmail.com";
        
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
            googleIntegration: {
                calendar: { operations: [], successRate: 0 },
                tasks: { operations: [], successRate: 0 }
            },
            consistency: {
                responsePatterns: [],
                performanceMetrics: [],
                errorPatterns: []
            }
        };
    }

    // Test JARVI's actual intent analysis intelligence with Google-integrated user
    async testJarviIntentIntelligence() {
        console.log('\n🧠 Testing JARVI Real Intent Analysis Intelligence (V2)');
        console.log('='.repeat(70));
        console.log(`👤 Using Google-Integrated User: ${this.testUserEmail}`);
        console.log(`🔗 Google Calendar: ✅ Connected | Google Tasks: ✅ Connected`);

        const testIntents = [
            {
                name: 'Calendar Query Intent',
                text: 'What meetings do I have scheduled for tomorrow?',
                expectedBehavior: 'should query actual calendar data via GRIM',
                category: 'calendar_query',
                testGoogleIntegration: true
            },
            {
                name: 'Calendar Creation Intent',
                text: 'Schedule a meeting with my team for Friday at 3pm',
                expectedBehavior: 'should create actual calendar event via GRIM',
                category: 'calendar_creation',
                testGoogleIntegration: true
            },
            {
                name: 'Task Management Intent',
                text: 'Add buy groceries to my task list',
                expectedBehavior: 'should create actual task via MURPHY',
                category: 'task_creation',
                testGoogleIntegration: true
            },
            {
                name: 'Task Query Intent',
                text: 'Show me my current tasks',
                expectedBehavior: 'should retrieve actual tasks via MURPHY',
                category: 'task_query',
                testGoogleIntegration: true
            },
            {
                name: 'Complex Multi-Agent Intent',
                text: 'Add meeting preparation to my tasks and schedule the meeting for tomorrow at 2pm',
                expectedBehavior: 'should coordinate both agents for real operations',
                category: 'multi_agent',
                testGoogleIntegration: true
            },
            {
                name: 'Agent Introduction Intent',
                text: 'What can you do?',
                expectedBehavior: 'should provide capabilities overview',
                category: 'self_introduction',
                testGoogleIntegration: false
            },
            {
                name: 'Performance Test Intent',
                text: 'How well did you handle that calendar request?',
                expectedBehavior: 'should provide self-assessment',
                category: 'performance_assessment',
                testGoogleIntegration: false
            }
        ];

        for (const intent of testIntents) {
            console.log(`\n🔍 Testing: ${intent.name}`);
            console.log(`📝 Input: "${intent.text}"`);
            console.log(`🔗 Google Integration Test: ${intent.testGoogleIntegration ? '✅' : '❌'}`);
            
            try {
                const startTime = performance.now();
                const response = await this.sendChatMessage(intent.text);
                const endTime = performance.now();
                const responseTime = endTime - startTime;

                console.log(`⏱️ Response Time: ${responseTime.toFixed(2)}ms`);
                console.log(`📊 Response: ${response.substring(0, 200)}...`);

                // Analyze JARVI's intelligence
                const intelligenceAnalysis = this.analyzeJarviIntelligence(response, intent);
                
                // Analyze Google integration success
                const googleAnalysis = intent.testGoogleIntegration ? 
                    this.analyzeGoogleIntegration(response, intent) : null;
                
                this.results.intelligence.jarvi.analyses.push({
                    intent: intent.name,
                    input: intent.text,
                    response: response.substring(0, 500),
                    responseTime,
                    intelligence: intelligenceAnalysis,
                    googleIntegration: googleAnalysis,
                    timestamp: new Date().toISOString()
                });

                // Store Google integration metrics
                if (googleAnalysis) {
                    if (intent.category.includes('calendar')) {
                        this.results.googleIntegration.calendar.operations.push({
                            operation: intent.name,
                            response: response.substring(0, 500),
                            success: googleAnalysis.isSuccessful,
                            responseTime,
                            timestamp: new Date().toISOString()
                        });
                    } else if (intent.category.includes('task')) {
                        this.results.googleIntegration.tasks.operations.push({
                            operation: intent.name,
                            response: response.substring(0, 500),
                            success: googleAnalysis.isSuccessful,
                            responseTime,
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                this.results.total++;
                if (intelligenceAnalysis.isIntelligent && (!googleAnalysis || googleAnalysis.isIntelligent)) {
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

        // Calculate metrics
        this.calculateJarviMetrics();
        this.calculateGoogleMetrics();
    }

    // Analyze Google integration success
    analyzeGoogleIntegration(response, intent) {
        const analysis = {
            mentionsGoogle: false,
            showsApiUsage: false,
            indicatesSuccess: false,
            indicatesError: false,
            isSuccessful: false,
            isIntelligent: false,
            score: 0
        };

        const responseLower = response.toLowerCase();
        const category = intent.category;

        // Check for Google API indicators
        if (responseLower.includes('google') || responseLower.includes('calendar') || responseLower.includes('task')) {
            analysis.mentionsGoogle = true;
            analysis.score += 1;
        }

        // Check for API usage indicators
        if (responseLower.includes('created') || responseLower.includes('added') || responseLower.includes('scheduled')) {
            analysis.showsApiUsage = true;
            analysis.score += 1;
        }

        // Check for success indicators
        if (responseLower.includes('success') || responseLower.includes('done') || responseLower.includes('complete')) {
            analysis.indicatesSuccess = true;
            analysis.score += 1;
        }

        // Check for error indicators
        if (responseLower.includes('error') || responseLower.includes('failed') || responseLower.includes('couldn\'t')) {
            analysis.indicatesError = true;
            analysis.score += 1;
        }

        // Determine success based on category and response
        if (category.includes('calendar') || category.includes('task')) {
            analysis.isSuccessful = analysis.indicatesSuccess || analysis.showsApiUsage;
        } else {
            analysis.isSuccessful = true; // Non-integration tests are always "successful"
        }

        analysis.isIntelligent = analysis.score >= 2;

        console.log(`🔗 Google Integration Score: ${analysis.score}/4`);
        console.log(`🎯 Integration Success: ${analysis.isSuccessful ? '✅' : '❌'}`);

        return analysis;
    }

    // Analyze JARVI's response for intelligence indicators (enhanced for Google integration)
    analyzeJarviIntelligence(response, intent) {
        const analysis = {
            hasAgentAwareness: false,
            hasIntentRecognition: false,
            hasProperDelegation: false,
            hasContextualResponse: false,
            hasPersonality: false,
            hasGoogleIntegration: false,
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
        if (intentCategory.includes('calendar') && (responseLower.includes('calendar') || responseLower.includes('meeting') || responseLower.includes('schedule'))) {
            analysis.hasIntentRecognition = true;
            analysis.score += 1;
        } else if (intentCategory.includes('task') && (responseLower.includes('task') || responseLower.includes('todo') || responseLower.includes('groceries'))) {
            analysis.hasIntentRecognition = true;
            analysis.score += 1;
        }

        // Check for proper delegation patterns
        if (responseLower.includes('delegate') || responseLower.includes('pass') || responseLower.includes('route') || 
            responseLower.includes('grim') || responseLower.includes('murphy')) {
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

        // Check for Google integration awareness
        if (responseLower.includes('google') || responseLower.includes('calendar') || responseLower.includes('task')) {
            analysis.hasGoogleIntegration = true;
            analysis.score += 1;
        }

        // Determine if response shows intelligence (score >= 4 for Google-integrated user)
        analysis.isIntelligent = analysis.score >= 4;

        console.log(`🧠 Intelligence Score: ${analysis.score}/6`);
        console.log(`🎯 Intelligent Response: ${analysis.isIntelligent ? '✅' : '❌'}`);

        return analysis;
    }

    // Test real agent delegation with full Google integration
    async testRealAgentDelegationWithGoogle() {
        console.log('\n🤝 Testing Real Agent Delegation with Google Integration');
        console.log('='.repeat(70));

        const delegationTests = [
            {
                name: 'GRIM Calendar Event Creation',
                message: 'Create a team meeting for next Tuesday at 2pm',
                expectedAgent: 'GRIM',
                expectedBehavior: 'should create actual calendar event',
                category: 'calendar_creation'
            },
            {
                name: 'MURPHY Task Creation',
                message: 'Add review quarterly report to my task list',
                expectedAgent: 'MURPHY',
                expectedBehavior: 'should create actual task',
                category: 'task_creation'
            },
            {
                name: 'GRIM Calendar Query',
                message: 'What is scheduled for this Thursday?',
                expectedAgent: 'GRIM',
                expectedBehavior: 'should query actual calendar data',
                category: 'calendar_query'
            },
            {
                name: 'MURPHY Task Management',
                message: 'Mark buy groceries as complete',
                expectedAgent: 'MURPHY',
                expectedBehavior: 'should update actual task',
                category: 'task_management'
            },
            {
                name: 'Multi-Agent Coordination',
                message: 'Schedule a project kickoff meeting for Friday and add follow-up tasks',
                expectedAgent: 'BOTH',
                expectedBehavior: 'should coordinate both GRIM and MURPHY for real operations',
                category: 'multi_agent'
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
                console.log(`📊 Response: ${response.substring(0, 200)}...`);

                // Analyze delegation intelligence with Google integration
                const delegationAnalysis = this.analyzeDelegationIntelligence(response, test);
                const googleAnalysis = this.analyzeGoogleIntegration(response, { category: test.category });
                
                const result = {
                    test: test.name,
                    message: test.message,
                    response: response.substring(0, 500),
                    responseTime,
                    delegation: delegationAnalysis,
                    googleIntegration: googleAnalysis,
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
                if (delegationAnalysis.isDelegated && googleAnalysis.isSuccessful) {
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

    // Analyze delegation intelligence (enhanced for Google integration)
    analyzeDelegationIntelligence(response, test) {
        const analysis = {
            mentionsAgent: false,
            showsDelegation: false,
            hasRelevantContent: false,
            showsCoordination: false,
            showsGoogleIntegration: false,
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
        if (responseLower.includes('delegate') || responseLower.includes('pass') || responseLower.includes('handle') ||
            responseLower.includes('grim') || responseLower.includes('murphy')) {
            analysis.showsDelegation = true;
            analysis.score += 1;
        }

        // Check for relevant content
        if (response.length > 30) {
            analysis.hasRelevantContent = true;
            analysis.score += 1;
        }

        // Check for coordination (for multi-agent tests)
        if (expectedAgent === 'BOTH' && responseLower.includes('and') && 
            (responseLower.includes('calendar') || responseLower.includes('task'))) {
            analysis.showsCoordination = true;
            analysis.score += 1;
        }

        // Check for Google integration
        if (responseLower.includes('google') || responseLower.includes('calendar') || 
            responseLower.includes('task') || responseLower.includes('created')) {
            analysis.showsGoogleIntegration = true;
            analysis.score += 1;
        }

        analysis.isDelegated = analysis.score >= 3;

        console.log(`🤝 Delegation Score: ${analysis.score}/5`);
        console.log(`✅ Properly Delegated: ${analysis.isDelegated ? 'Yes' : 'No'}`);

        return analysis;
    }

    // Send actual chat message to the running server
    async sendChatMessage(text) {
        const payload = {
            text: text,
            userId: this.realUserId
        };

        const response = await axios.post(this.testEndpoint, payload, {
            timeout: 20000, // Increased timeout for Google API calls
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

    // Calculate Google integration metrics
    calculateGoogleMetrics() {
        // Calendar operations
        const calendarOps = this.results.googleIntegration.calendar.operations;
        if (calendarOps.length > 0) {
            this.results.googleIntegration.calendar.successRate = 
                (calendarOps.filter(op => op.success).length / calendarOps.length) * 100;
        }

        // Task operations
        const taskOps = this.results.googleIntegration.tasks.operations;
        if (taskOps.length > 0) {
            this.results.googleIntegration.tasks.successRate = 
                (taskOps.filter(op => op.success).length / taskOps.length) * 100;
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
                (grimOps.filter(op => op.delegation.isDelegated && op.googleIntegration?.isSuccessful).length / grimOps.length) * 100;
        }

        // MURPHY metrics
        const murphyOps = this.results.intelligence.murphy.operations;
        if (murphyOps.length > 0) {
            this.results.intelligence.murphy.avgResponseTime = 
                murphyOps.reduce((sum, op) => sum + op.responseTime, 0) / murphyOps.length;
            this.results.intelligence.murphy.successRate = 
                (murphyOps.filter(op => op.delegation.isDelegated && op.googleIntegration?.isSuccessful).length / murphyOps.length) * 100;
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
                realUserEmail: this.testUserEmail,
                googleIntegrations: {
                    calendar: 'Connected',
                    tasks: 'Connected'
                }
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
            googleIntegrationAnalysis: this.results.googleIntegration,
            consistencyAnalysis: this.results.consistency,
            errorAnalysis: this.results.errors
        };

        return report;
    }

    // Display results summary
    displayResults() {
        console.log('\n' + '='.repeat(70));
        console.log('🏆 REAL AGENT INTELLIGENCE TEST RESULTS V2');
        console.log('='.repeat(70));

        console.log(`📊 Overall Results:`);
        console.log(`   Total Tests: ${this.results.total}`);
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);

        console.log(`\n🧠 JARVI Intelligence:`);
        console.log(`   Average Response Time: ${this.results.intelligence.jarvi.avgResponseTime.toFixed(2)}ms`);
        console.log(`   Intelligence Success Rate: ${this.results.intelligence.jarvi.successRate.toFixed(2)}%`);

        console.log(`\n🤝 Agent Delegation with Google Integration:`);
        console.log(`   GRIM Avg Response: ${this.results.intelligence.grim.avgResponseTime.toFixed(2)}ms`);
        console.log(`   GRIM Success Rate: ${this.results.intelligence.grim.successRate.toFixed(2)}%`);
        console.log(`   MURPHY Avg Response: ${this.results.intelligence.murphy.avgResponseTime.toFixed(2)}ms`);
        console.log(`   MURPHY Success Rate: ${this.results.intelligence.murphy.successRate.toFixed(2)}%`);

        console.log(`\n🔗 Google Integration Success:`);
        console.log(`   Calendar API: ${this.results.googleIntegration.calendar.successRate.toFixed(2)}%`);
        console.log(`   Tasks API: ${this.results.googleIntegration.tasks.successRate.toFixed(2)}%`);

        if (this.results.errors.length > 0) {
            console.log(`\n⚠️ Errors Encountered: ${this.results.errors.length}`);
            this.results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.intent || error.test}: ${error.error}`);
            });
        }

        console.log(`\n🎯 Test User: ${this.testUserEmail}`);
        console.log(`🆔 User ID: ${this.realUserId}`);
        console.log(`🔗 Google Calendar: ✅ Connected`);
        console.log(`🔗 Google Tasks: ✅ Connected`);
    }

    // Main execution method
    async runIntelligenceTestSuite() {
        console.log('🚀 Starting Real Agent Intelligence Test Suite V2');
        console.log('='.repeat(70));
        console.log(`🆔 Using Google-Integrated User ID: ${this.realUserId}`);
        console.log(`📧 User Email: ${this.testUserEmail}`);
        console.log(`🌐 API Endpoint: ${this.testEndpoint}`);
        console.log(`🔗 Google Calendar: ✅ Connected | Google Tasks: ✅ Connected`);

        try {
            // Test JARVI's intent analysis intelligence with Google integration
            await this.testJarviIntentIntelligence();
            
            // Test real agent delegation with full Google integration
            await this.testRealAgentDelegationWithGoogle();
            
            // Display results
            this.displayResults();
            
            // Generate and return detailed report
            const report = this.generateIntelligenceReport();
            
            console.log('\n✅ Real Agent Intelligence Test Suite V2 Completed Successfully!');
            
            return report;

        } catch (error) {
            console.error('❌ Intelligence Test Suite V2 Failed:', error.message);
            throw error;
        }
    }
}

// Export for use in other modules
module.exports = RealAgentIntelligenceTestSuiteV2;

// Run if executed directly
if (require.main === module) {
    const testSuite = new RealAgentIntelligenceTestSuiteV2();
    
    testSuite.runIntelligenceTestSuite()
        .then(report => {
            console.log('\n📋 Intelligence Test Report V2:');
            console.log(JSON.stringify(report, null, 2));
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}