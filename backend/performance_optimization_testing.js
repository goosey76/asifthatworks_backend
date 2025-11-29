// Performance Optimization Testing for Enhanced Cross-Agent Project Analyzer
// Tests system efficiency, response times, and resource usage

const UnifiedIntelligenceSystem = require('./src/services/agents/murphy-agent/intelligence/unified-intelligence-system');
const CrossAgentProjectAnalyzer = require('./src/services/agents/murphy-agent/intelligence/project-analyzer');
const EnhancedIntelligenceEngine = require('./src/services/agents/murphy-agent/intelligence/enhanced-intelligence-engine');
const agentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');

class PerformanceOptimizationTester {
  constructor() {
    this.system = new UnifiedIntelligenceSystem();
    this.testResults = {
      responseTimes: {},
      memoryUsage: {},
      concurrency: {},
      efficiency: {},
      recommendations: []
    };
  }

  /**
   * Run comprehensive performance optimization testing
   */
  async runPerformanceTests() {
    console.log('⚡ PERFORMANCE OPTIMIZATION TESTING');
    console.log('=' .repeat(60));
    console.log('🎯 Goal: Ensure enhanced system works efficiently and responsively');
    console.log('📊 Focus: Response times, memory usage, concurrent handling, intelligence quality\n');

    try {
      // PHASE 1: Response Time Testing
      await this.testResponseTimes();
      
      // PHASE 2: Memory and Resource Usage
      await this.testMemoryUsage();
      
      // PHASE 3: Concurrency and Load Testing
      await this.testConcurrency();
      
      // PHASE 4: Intelligence Engine Performance
      await this.testIntelligenceEngines();
      
      // PHASE 5: System Integration Performance
      await this.testSystemIntegration();
      
      // PHASE 6: Real-world Scenario Performance
      await this.testRealWorldScenarios();
      
      // Generate optimization recommendations
      this.generateOptimizationRecommendations();
      
      console.log('\n🎉 PERFORMANCE TESTING COMPLETED!');
      this.displayPerformanceSummary();
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Test response times for all components
   */
  async testResponseTimes() {
    console.log('\n⏱️  PHASE 1: RESPONSE TIME TESTING');
    console.log('-'.repeat(40));
    
    const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
    const context = { query: 'analyze productivity patterns' };
    
    // Test 1.1: Unified Intelligence System Response Time
    console.log('\n🔍 Test 1.1: Unified Intelligence System');
    try {
      const startTime = Date.now();
      const result = await this.system.processIntelligenceRequest(userId, 'analyze', context);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.testResults.responseTimes.unifiedSystem = {
        time: responseTime,
        status: responseTime < 5000 ? 'GOOD' : 'NEEDS_OPTIMIZATION',
        threshold: '5 seconds',
        result: result.success ? 'SUCCESS' : 'FAILED'
      };
      
      console.log(`✅ Unified System: ${responseTime}ms (${responseTime < 5000 ? 'GOOD' : 'NEEDS_OPTIMIZATION'})`);
      
    } catch (error) {
      this.testResults.responseTimes.unifiedSystem = {
        time: 'ERROR',
        error: error.message,
        status: 'FAILED'
      };
      console.log(`❌ Unified System: ERROR - ${error.message}`);
    }
    
    // Test 1.2: Project Analyzer Response Time
    console.log('\n🔍 Test 1.2: Project Analyzer');
    try {
      const analyzer = new CrossAgentProjectAnalyzer();
      const mockData = this.getMockUserData();
      
      const startTime = Date.now();
      const result = await analyzer.analyzeProjectLandscape(userId, mockData.grim, mockData.murphy);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      this.testResults.responseTimes.projectAnalyzer = {
        time: responseTime,
        status: responseTime < 3000 ? 'GOOD' : 'NEEDS_OPTIMIZATION',
        threshold: '3 seconds',
        result: result.activeProjects ? 'SUCCESS' : 'FAILED'
      };
      
      console.log(`✅ Project Analyzer: ${responseTime}ms (${responseTime < 3000 ? 'GOOD' : 'NEEDS_OPTIMIZATION'})`);
      
    } catch (error) {
      this.testResults.responseTimes.projectAnalyzer = {
        time: 'ERROR',
        error: error.message,
        status: 'FAILED'
      };
      console.log(`❌ Project Analyzer: ERROR - ${error.message}`);
    }
    
    // Test 1.3: Intelligence Engines Response Time
    console.log('\n🔍 Test 1.3: Intelligence Engines');
    try {
      const engine = new EnhancedIntelligenceEngine();
      const engines = engine.getAvailableEngines();
      const engineTimes = {};
      
      for (const engineType of engines) {
        const startTime = Date.now();
        try {
          const result = await engine.processIntelligence(engineType, 'test query', {}, userId);
          const endTime = Date.now();
          const time = endTime - startTime;
          
          engineTimes[engineType] = {
            time: time,
            status: time < 1000 ? 'GOOD' : 'NEEDS_OPTIMIZATION',
            functional: result.functional
          };
          
          console.log(`  ${engineType}: ${time}ms (${time < 1000 ? 'GOOD' : 'NEEDS_OPTIMIZATION'})`);
          
        } catch (engineError) {
          engineTimes[engineType] = {
            time: 'ERROR',
            error: engineError.message,
            status: 'FAILED'
          };
          console.log(`  ${engineType}: ERROR - ${engineError.message}`);
        }
      }
      
      this.testResults.responseTimes.intelligenceEngines = engineTimes;
      
      const avgTime = Object.values(engineTimes)
        .filter(e => typeof e.time === 'number')
        .reduce((sum, e) => sum + e.time, 0) / Object.values(engineTimes).length;
      
      console.log(`✅ Average Engine Response Time: ${Math.round(avgTime)}ms`);
      
    } catch (error) {
      this.testResults.responseTimes.intelligenceEngines = { error: error.message };
      console.log(`❌ Intelligence Engines: ERROR - ${error.message}`);
    }
  }

  /**
   * Test memory usage and resource consumption
   */
  async testMemoryUsage() {
    console.log('\n💾 PHASE 2: MEMORY USAGE TESTING');
    console.log('-'.repeat(40));
    
    try {
      // Get initial memory usage
      const initialMemory = this.getMemoryUsage();
      console.log(`📊 Initial Memory Usage: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`);
      
      // Simulate heavy usage
      const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
      
      // Run multiple operations to test memory retention
      for (let i = 0; i < 10; i++) {
        await this.system.processIntelligenceRequest(userId, 'analyze', { query: `test ${i}` });
      }
      
      // Check memory after operations
      const afterOperationsMemory = this.getMemoryUsage();
      const memoryIncrease = afterOperationsMemory.heapUsed - initialMemory.heapUsed;
      
      this.testResults.memoryUsage = {
        initial: Math.round(initialMemory.heapUsed / 1024 / 1024),
        after: Math.round(afterOperationsMemory.heapUsed / 1024 / 1024),
        increase: Math.round(memoryIncrease / 1024 / 1024),
        status: memoryIncrease < 50 * 1024 * 1024 ? 'GOOD' : 'NEEDS_OPTIMIZATION', // Less than 50MB increase
        threshold: '50MB increase'
      };
      
      console.log(`📊 After Operations: ${Math.round(afterOperationsMemory.heapUsed / 1024 / 1024)}MB`);
      console.log(`📊 Memory Increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB (${this.testResults.memoryUsage.status})`);
      
    } catch (error) {
      this.testResults.memoryUsage = { error: error.message };
      console.log(`❌ Memory Testing: ERROR - ${error.message}`);
    }
  }

  /**
   * Test concurrent user handling
   */
  async testConcurrency() {
    console.log('\n🔄 PHASE 3: CONCURRENCY TESTING');
    console.log('-'.repeat(40));
    
    try {
      const numUsers = 5;
      const requestsPerUser = 3;
      console.log(`Testing ${numUsers} concurrent users with ${requestsPerUser} requests each...`);
      
      const startTime = Date.now();
      const promises = [];
      
      for (let userNum = 0; userNum < numUsers; userNum++) {
        const userId = `test-user-${userNum}`;
        const userPromises = [];
        
        for (let reqNum = 0; reqNum < requestsPerUser; reqNum++) {
          const promise = this.system.processIntelligenceRequest(
            userId, 
            'analyze', 
            { query: `concurrent test ${userNum}-${reqNum}` }
          );
          userPromises.push(promise);
        }
        
        promises.push(...userPromises);
      }
      
      // Execute all requests concurrently
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successfulResults = results.filter(r => r.success).length;
      const totalRequests = numUsers * requestsPerUser;
      
      this.testResults.concurrency = {
        totalRequests: totalRequests,
        successful: successfulResults,
        failed: totalRequests - successfulResults,
        totalTime: totalTime,
        averageTime: totalTime / totalRequests,
        throughput: Math.round((totalRequests / totalTime) * 1000), // requests per second
        status: successfulResults === totalRequests ? 'GOOD' : 'PARTIAL',
        threshold: '100% success rate'
      };
      
      console.log(`✅ Concurrency Results:`);
      console.log(`   Total Requests: ${totalRequests}`);
      console.log(`   Successful: ${successfulResults}`);
      console.log(`   Failed: ${totalRequests - successfulResults}`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Average Time: ${Math.round(totalTime / totalRequests)}ms`);
      console.log(`   Throughput: ${this.testResults.concurrency.throughput} req/sec`);
      
    } catch (error) {
      this.testResults.concurrency = { error: error.message };
      console.log(`❌ Concurrency Testing: ERROR - ${error.message}`);
    }
  }

  /**
   * Test intelligence engine efficiency
   */
  async testIntelligenceEngines() {
    console.log('\n🧠 PHASE 4: INTELLIGENCE ENGINE PERFORMANCE');
    console.log('-'.repeat(40));
    
    try {
      const engine = new EnhancedIntelligenceEngine();
      const engines = engine.getAvailableEngines();
      const engineHealth = engine.getEngineHealth();
      
      let totalFunctional = 0;
      let totalEngines = engines.length;
      
      console.log('📊 Engine Health Status:');
      for (const [engineName, health] of Object.entries(engineHealth)) {
        const status = health.operational ? 'OPERATIONAL' : 'FAILED';
        console.log(`   ${engineName}: ${status}`);
        if (health.operational) totalFunctional++;
      }
      
      this.testResults.efficiency = {
        totalEngines: totalEngines,
        functionalEngines: totalFunctional,
        successRate: Math.round((totalFunctional / totalEngines) * 100),
        status: totalFunctional === totalEngines ? 'EXCELLENT' : totalFunctional > totalEngines * 0.8 ? 'GOOD' : 'NEEDS_WORK',
        health: engineHealth
      };
      
      console.log(`✅ Intelligence Engine Efficiency: ${this.testResults.efficiency.successRate}% (${this.testResults.efficiency.status})`);
      
    } catch (error) {
      this.testResults.efficiency = { error: error.message };
      console.log(`❌ Intelligence Engine Testing: ERROR - ${error.message}`);
    }
  }

  /**
   * Test system integration performance
   */
  async testSystemIntegration() {
    console.log('\n🔗 PHASE 5: SYSTEM INTEGRATION PERFORMANCE');
    console.log('-'.repeat(40));
    
    const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
    
    try {
      // Test integration between all components
      const integrationTests = [
        { type: 'analyze', name: 'Comprehensive Analysis' },
        { type: 'optimize', name: 'Productivity Optimization' },
        { type: 'predict', name: 'Predictive Analysis' },
        { type: 'dashboard', name: 'Dashboard Generation' },
        { type: 'recommend', name: 'Intelligent Recommendations' }
      ];
      
      const integrationResults = {};
      
      for (const test of integrationTests) {
        const startTime = Date.now();
        
        try {
          const result = await this.system.processIntelligenceRequest(userId, test.type, { query: 'integration test' });
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          integrationResults[test.type] = {
            responseTime: responseTime,
            success: result.success,
            hasData: !!(result.projectAnalysis || result.intelligenceEngines || result.optimizations),
            status: responseTime < 4000 && result.success ? 'GOOD' : 'NEEDS_OPTIMIZATION'
          };
          
          console.log(`   ${test.name}: ${responseTime}ms (${integrationResults[test.type].status})`);
          
        } catch (error) {
          integrationResults[test.type] = {
            error: error.message,
            status: 'FAILED'
          };
          console.log(`   ${test.name}: ERROR - ${error.message}`);
        }
      }
      
      this.testResults.integration = integrationResults;
      
      const avgIntegrationTime = Object.values(integrationResults)
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / Object.keys(integrationResults).length;
      
      console.log(`✅ Average Integration Time: ${Math.round(avgIntegrationTime)}ms`);
      
    } catch (error) {
      this.testResults.integration = { error: error.message };
      console.log(`❌ Integration Testing: ERROR - ${error.message}`);
    }
  }

  /**
   * Test real-world scenario performance
   */
  async testRealWorldScenarios() {
    console.log('\n🌍 PHASE 6: REAL-WORLD SCENARIO PERFORMANCE');
    console.log('-'.repeat(40));
    
    const scenarios = [
      {
        name: 'University Student',
        userId: 'student-001',
        context: { major: 'Computer Science', year: '3rd' }
      },
      {
        name: 'Working Professional',
        userId: 'professional-001',
        context: { role: 'Software Engineer', experience: '5 years' }
      },
      {
        name: 'Project Manager',
        userId: 'pm-001',
        context: { role: 'Project Manager', teamSize: '10' }
      }
    ];
    
    const scenarioResults = {};
    
    for (const scenario of scenarios) {
      console.log(`\n🔍 Testing Scenario: ${scenario.name}`);
      
      try {
        const startTime = Date.now();
        
        // Simulate comprehensive user workflow
        const analysis = await this.system.processIntelligenceRequest(scenario.userId, 'analyze', scenario.context);
        const optimization = await this.system.processIntelligenceRequest(scenario.userId, 'optimize', scenario.context);
        const dashboard = await this.system.processIntelligenceRequest(scenario.userId, 'dashboard', scenario.context);
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        scenarioResults[scenario.name] = {
          totalTime: totalTime,
          analysisSuccess: analysis.success,
          optimizationSuccess: optimization.success,
          dashboardSuccess: dashboard.success,
          status: (analysis.success && optimization.success && dashboard.success) ? 'GOOD' : 'PARTIAL',
          recommendations: this.generateScenarioRecommendations(analysis, optimization, dashboard)
        };
        
        console.log(`   Total Time: ${totalTime}ms`);
        console.log(`   Status: ${scenarioResults[scenario.name].status}`);
        
      } catch (error) {
        scenarioResults[scenario.name] = {
          error: error.message,
          status: 'FAILED'
        };
        console.log(`   ERROR: ${error.message}`);
      }
    }
    
    this.testResults.realWorldScenarios = scenarioResults;
  }

  /**
   * Generate optimization recommendations based on test results
   */
  generateOptimizationRecommendations() {
    const recommendations = [];
    
    // Response time recommendations
    if (this.testResults.responseTimes.unifiedSystem?.status === 'NEEDS_OPTIMIZATION') {
      recommendations.push({
        area: 'Response Time',
        priority: 'HIGH',
        recommendation: 'Optimize unified intelligence system response time',
        details: 'Current response time exceeds 5 seconds threshold'
      });
    }
    
    // Memory usage recommendations
    if (this.testResults.memoryUsage?.status === 'NEEDS_OPTIMIZATION') {
      recommendations.push({
        area: 'Memory Usage',
        priority: 'MEDIUM',
        recommendation: 'Implement memory management optimizations',
        details: 'Memory usage increase exceeds 50MB threshold'
      });
    }
    
    // Concurrency recommendations
    if (this.testResults.concurrency?.status === 'PARTIAL') {
      recommendations.push({
        area: 'Concurrency',
        priority: 'HIGH',
        recommendation: 'Fix concurrent user handling issues',
        details: 'Some concurrent requests failed'
      });
    }
    
    // Intelligence engine recommendations
    if (this.testResults.efficiency?.successRate < 100) {
      recommendations.push({
        area: 'Intelligence Engines',
        priority: 'HIGH',
        recommendation: 'Fix non-functional intelligence engines',
        details: `${100 - this.testResults.efficiency.successRate}% of engines need fixes`
      });
    }
    
    // Integration recommendations
    if (this.testResults.integration) {
      const failedIntegrations = Object.values(this.testResults.integration).filter(r => r.status === 'FAILED');
      if (failedIntegrations.length > 0) {
        recommendations.push({
          area: 'System Integration',
          priority: 'HIGH',
          recommendation: 'Fix failed integration points',
          details: `${failedIntegrations.length} integration tests failed`
        });
      }
    }
    
    this.testResults.recommendations = recommendations;
    
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.area} (${rec.priority}): ${rec.recommendation}`);
      console.log(`      Details: ${rec.details}`);
    });
  }

  /**
   * Display comprehensive performance summary
   */
  displayPerformanceSummary() {
    console.log('\n📊 COMPREHENSIVE PERFORMANCE SUMMARY');
    console.log('=' .repeat(50));
    
    // Response Times
    console.log('\n⏱️  Response Times:');
    Object.entries(this.testResults.responseTimes || {}).forEach(([component, data]) => {
      if (data.time && data.status) {
        console.log(`   ${component}: ${data.time}ms (${data.status})`);
      }
    });
    
    // Memory Usage
    if (this.testResults.memoryUsage) {
      console.log('\n💾 Memory Usage:');
      console.log(`   Initial: ${this.testResults.memoryUsage.initial}MB`);
      console.log(`   After: ${this.testResults.memoryUsage.after}MB`);
      console.log(`   Increase: ${this.testResults.memoryUsage.increase}MB (${this.testResults.memoryUsage.status})`);
    }
    
    // Concurrency
    if (this.testResults.concurrency) {
      console.log('\n🔄 Concurrency:');
      console.log(`   Success Rate: ${Math.round((this.testResults.concurrency.successful / this.testResults.concurrency.totalRequests) * 100)}%`);
      console.log(`   Throughput: ${this.testResults.concurrency.throughput} req/sec`);
      console.log(`   Status: ${this.testResults.concurrency.status}`);
    }
    
    // Intelligence Efficiency
    if (this.testResults.efficiency) {
      console.log('\n🧠 Intelligence Efficiency:');
      console.log(`   Engine Success Rate: ${this.testResults.efficiency.successRate}%`);
      console.log(`   Status: ${this.testResults.efficiency.status}`);
      console.log(`   Functional Engines: ${this.testResults.efficiency.functionalEngines}/${this.testResults.efficiency.totalEngines}`);
    }
    
    // Overall Assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    const overallScore = this.calculateOverallScore();
    console.log(`   Performance Score: ${overallScore}/100`);
    console.log(`   Status: ${overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT'}`);
    
    if (this.testResults.recommendations.length > 0) {
      console.log(`\n⚠️  Areas for Improvement: ${this.testResults.recommendations.length}`);
    }
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore() {
    let score = 0;
    let factors = 0;
    
    // Response time score (25%)
    const responseTimeScore = this.calculateResponseTimeScore();
    score += responseTimeScore * 0.25;
    factors++;
    
    // Memory usage score (20%)
    const memoryScore = this.calculateMemoryScore();
    score += memoryScore * 0.20;
    factors++;
    
    // Concurrency score (25%)
    const concurrencyScore = this.calculateConcurrencyScore();
    score += concurrencyScore * 0.25;
    factors++;
    
    // Intelligence efficiency score (30%)
    const efficiencyScore = this.calculateEfficiencyScore();
    score += efficiencyScore * 0.30;
    factors++;
    
    return Math.round(score);
  }

  calculateResponseTimeScore() {
    const unifiedTime = this.testResults.responseTimes?.unifiedSystem?.time;
    if (!unifiedTime || typeof unifiedTime !== 'number') return 50;
    
    if (unifiedTime < 2000) return 100;
    if (unifiedTime < 5000) return 80;
    if (unifiedTime < 10000) return 60;
    return 30;
  }

  calculateMemoryScore() {
    if (!this.testResults.memoryUsage) return 50;
    return this.testResults.memoryUsage.status === 'GOOD' ? 100 : 60;
  }

  calculateConcurrencyScore() {
    if (!this.testResults.concurrency) return 50;
    const successRate = (this.testResults.concurrency.successful / this.testResults.concurrency.totalRequests) * 100;
    return Math.min(100, successRate);
  }

  calculateEfficiencyScore() {
    if (!this.testResults.efficiency) return 50;
    return this.testResults.efficiency.successRate;
  }

  // Helper methods
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external
    };
  }

  getMockUserData() {
    return {
      grim: {
        calendarSnapshot: {
          events: [
            { summary: '💻 Development Session', start: { dateTime: '2025-11-16T10:00:00Z' } },
            { summary: '🤝 Team Meeting', start: { dateTime: '2025-11-16T14:00:00Z' } }
          ],
          totalEvents: 2,
          favoriteEventTypes: ['development', 'meeting']
        }
      },
      murphy: {
        productivitySnapshot: {
          completionRate: 75,
          totalTasks: 12,
          favoriteCategory: 'work'
        },
        recentPatterns: {
          recentTaskTypes: ['development', 'meeting', 'planning']
        }
      }
    };
  }

  generateScenarioRecommendations(analysis, optimization, dashboard) {
    const recommendations = [];
    
    if (!analysis.success) recommendations.push('Fix analysis functionality');
    if (!optimization.success) recommendations.push('Fix optimization functionality');
    if (!dashboard.success) recommendations.push('Fix dashboard functionality');
    
    if (recommendations.length === 0) {
      recommendations.push('System performing well for this scenario');
    }
    
    return recommendations;
  }
}

// Export for use
module.exports = PerformanceOptimizationTester;

// Run if called directly
if (require.main === module) {
  async function main() {
    const tester = new PerformanceOptimizationTester();
    await tester.runPerformanceTests();
    console.log('\n🎯 Performance optimization testing completed!');
  }
  
  main().catch(console.error);
}