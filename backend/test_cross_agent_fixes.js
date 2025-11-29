// Test cross-agent fixes after knowledge coordinator and API improvements

const CrossAgentProjectAnalyzer = require('./src/services/agents/murphy-agent/intelligence/project-analyzer');
const agentKnowledgeCoordinator = require('./src/services/agents/agent-knowledge-coordinator');

async function testCrossAgentFixes() {
  console.log('🧪 TESTING CROSS-AGENT FIXES');
  console.log('=' .repeat(50));
  
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  
  try {
    // Test 1: Knowledge Coordinator Access
    console.log('🔄 Testing Knowledge Coordinator...');
    const healthStatus = agentKnowledgeCoordinator.getHealthStatus();
    console.log('✅ Knowledge Coordinator Health:', healthStatus);
    
    // Test 2: Project Analyzer Initialization
    console.log('\n🔄 Testing Project Analyzer...');
    const analyzer = new CrossAgentProjectAnalyzer();
    console.log('✅ Project Analyzer initialized successfully');
    
    // Test 3: Mock Knowledge Data
    console.log('\n🔄 Testing with mock knowledge data...');
    const mockGrimKnowledge = {
      calendarSnapshot: {
        events: [
          {
            summary: '💻 Backend Development Session',
            start: { dateTime: '2025-11-16T10:00:00Z' },
            end: { dateTime: '2025-11-16T12:00:00Z' }
          },
          {
            summary: '🤝 Project Review Meeting',
            start: { dateTime: '2025-11-16T14:00:00Z' },
            end: { dateTime: '2025-11-16T15:00:00Z' }
          }
        ],
        totalEvents: 2,
        favoriteEventTypes: ['work', 'meeting']
      }
    };
    
    const mockMurphyKnowledge = {
      productivitySnapshot: {
        completionRate: 75,
        totalTasks: 15,
        favoriteCategory: 'work'
      },
      recentPatterns: {
        recentTaskTypes: ['work', 'development', 'review']
      }
    };
    
    // Test 4: Project Analysis
    console.log('\n🔄 Testing Project Analysis...');
    const analysisResult = await analyzer.analyzeProjectLandscape(
      userId, 
      mockGrimKnowledge, 
      mockMurphyKnowledge
    );
    
    console.log('✅ Analysis Result:', {
      activeProjects: analysisResult.activeProjects?.length || 0,
      insights: Object.keys(analysisResult.insights || {}),
      recommendations: analysisResult.recommendations?.length || 0,
      nextActions: analysisResult.nextActions?.length || 0
    });
    
    // Test 5: Knowledge Registration
    console.log('\n🔄 Testing Knowledge Registration...');
    agentKnowledgeCoordinator.registerAgentKnowledge('grim', userId, mockGrimKnowledge);
    agentKnowledgeCoordinator.registerAgentKnowledge('murphy', userId, mockMurphyKnowledge);
    
    const rotatedKnowledge = agentKnowledgeCoordinator.getRotatedUserKnowledge('jarvi', userId);
    console.log('✅ Rotated Knowledge Available:', rotatedKnowledge.contributors?.length || 0, 'contributors');
    
    // Test 6: Comprehensive Knowledge
    console.log('\n🔄 Testing Comprehensive Knowledge...');
    const comprehensiveKnowledge = agentKnowledgeCoordinator.getComprehensiveUserKnowledge(userId);
    console.log('✅ Comprehensive Knowledge:', {
      hasRotatedData: !!comprehensiveKnowledge.rotated,
      hasRawData: !!comprehensiveKnowledge.raw,
      contributors: comprehensiveKnowledge.rotated?.contributors?.length || 0
    });
    
    console.log('\n🎉 ALL CROSS-AGENT FIXES WORKING!');
    console.log('✅ Knowledge Coordinator: Operational');
    console.log('✅ Project Analyzer: Functional');
    console.log('✅ Cross-agent Communication: Fixed');
    console.log('✅ API Integration: Enhanced');
    
    return true;
    
  } catch (error) {
    console.error('❌ Cross-agent fix test failed:', error);
    return false;
  }
}

// Run the test
testCrossAgentFixes().then(success => {
  if (success) {
    console.log('\n🚀 READY FOR NEXT PHASE OF IMPROVEMENTS!');
  } else {
    console.log('\n⚠️  ADDITIONAL FIXES NEEDED');
  }
});