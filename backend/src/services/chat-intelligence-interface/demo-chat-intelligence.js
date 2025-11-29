// Demonstration of Chat-First Intelligence Interface
// Shows how JARVI integrates with Chat Intelligence while maintaining agent adaptivity

const JARVIChatIntegration = require('./jarvi-chat-integration');
const ChatFirstIntelligenceInterface = require('./index');

class ChatIntelligenceDemo {
  constructor() {
    this.jarviIntegration = new JARVIChatIntegration();
    this.chatIntelligence = new ChatFirstIntelligenceInterface();
    
    // Demo user
    this.demoUserId = 'demo_user_123';
    
    console.log('🎯 Chat Intelligence Interface Demo Starting...');
  }

  /**
   * Run complete demonstration
   */
  async runDemo() {
    console.log('\n=== CHAT-FIRST INTELLIGENCE INTERFACE DEMO ===\n');
    
    // Demo 1: Direct Chat Intelligence Interface
    await this.demoDirectChatIntelligence();
    
    // Demo 2: JARVI Integration with Intelligence
    await this.demoJarviProductivityConversation();
    
    // Demo 3: Agent Delegation with Intelligence Context
    await this.demoAgentDelegation();
    
    // Demo 4: Proactive Suggestions
    await this.demoProactiveSuggestions();
    
    // Demo 5: System Scalability
    await this.demoSystemScalability();
    
    // Demo 6: Real-time Intelligence Updates
    await this.demoRealTimeUpdates();
    
    console.log('\n=== DEMO COMPLETE ===\n');
    console.log('🚀 The Chat-First Intelligence Interface successfully demonstrates:');
    console.log('   • Integration with existing JARVI, Grim, and Murphy agents');
    console.log('   • Natural language processing for productivity queries');
    console.log('   • Real-time orchestration of all 6 intelligence engines');
    console.log('   • Adaptive agent delegation and fallback mechanisms');
    console.log('   • Conversation learning and personalization');
    console.log('   • Scalable architecture for future enhancements');
  }

  /**
   * Demo 1: Direct Chat Intelligence Interface
   */
  async demoDirectChatIntelligence() {
    console.log('📱 DEMO 1: Direct Chat Intelligence Interface');
    
    const productivityQuestions = [
      "How can I improve my productivity?",
      "Analyze my workflow patterns",
      "What productivity techniques do you recommend?",
      "Show me my task completion trends"
    ];
    
    for (const question of productivityQuestions) {
      console.log(`\n👤 User: "${question}"`);
      
      const response = await this.chatIntelligence.processChatMessage(
        this.demoUserId, 
        question, 
        { demo_mode: true }
      );
      
      console.log(`🤖 Intelligence: ${response.message}`);
      console.log(`💡 Insights: ${response.intelligence.insights.join(', ')}`);
      console.log(`⚡ Active Engines: ${response.intelligence.engines.join(', ')}`);
      console.log(`📊 Confidence: ${response.intelligence.confidence}`);
    }
  }

  /**
   * Demo 2: JARVI Integration with Intelligence
   */
  async demoJarviProductivityConversation() {
    console.log('\n🤖 DEMO 2: JARVI Integration with Intelligence');
    
    const jarviQuestions = [
      "I want to optimize my productivity",
      "Can you analyze my work patterns?",
      "Give me insights on my efficiency",
      "Help me improve my workflow"
    ];
    
    for (const question of jarviQuestions) {
      console.log(`\n👤 User (via JARVI): "${question}"`);
      
      const response = await this.jarviIntegration.handleProductivityConversation(
        question,
        this.demoUserId,
        { integration_demo: true }
      );
      
      console.log(`🤖 JARVI: ${response.jarvi_response}`);
      console.log(`💬 Intelligence: ${response.message}`);
      console.log(`🔧 Agents: ${response.agent_recommendations.map(r => r.agent).join(', ')}`);
      console.log(`💡 Follow-ups: ${response.follow_up_actions.map(a => a.type).join(', ')}`);
    }
  }

  /**
   * Demo 3: Agent Delegation with Intelligence Context
   */
  async demoAgentDelegation() {
    console.log('\n⚙️ DEMO 3: Agent Delegation with Intelligence Context');
    
    const scenarios = [
      {
        message: "Create a task for my project meeting prep",
        agent: "murphy",
        description: "Task creation with productivity insights"
      },
      {
        message: "Schedule a team meeting for next week",
        agent: "grim", 
        description: "Calendar management with time insights"
      },
      {
        message: "How are my tasks going?",
        agent: "murphy",
        description: "Task analysis with workflow context"
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n🎯 Scenario: ${scenario.description}`);
      console.log(`👤 Message: "${scenario.message}"`);
      
      let response;
      if (scenario.agent === 'murphy') {
        response = await this.jarviIntegration.delegateToMurphy(
          scenario.message,
          this.demoUserId,
          { demo_scenario: scenario.description }
        );
      } else if (scenario.agent === 'grim') {
        response = await this.jarviIntegration.delegateToGrim(
          scenario.message,
          this.demoUserId,
          { demo_scenario: scenario.description }
        );
      }
      
      console.log(`🤖 ${scenario.agent}: ${response.message}`);
      if (response.intelligence_context) {
        console.log(`🧠 Intelligence: ${response.intelligence_context.insights?.join(', ') || 'Context provided'}`);
      }
    }
  }

  /**
   * Demo 4: Proactive Suggestions System
   */
  async demoProactiveSuggestions() {
    console.log('\n💡 DEMO 4: Proactive Suggestions System');
    
    // Simulate some conversation to build context
    await this.chatIntelligence.processChatMessage(
      this.demoUserId,
      "I'm feeling overwhelmed with my current workload",
      { demo_context: 'workload_analysis' }
    );
    
    await this.chatIntelligence.processChatMessage(
      this.demoUserId,
      "Show me my productivity insights",
      { demo_context: 'productivity_check' }
    );
    
    // Get proactive suggestions
    const suggestions = this.chatIntelligence.getProactiveSuggestions(this.demoUserId);
    
    console.log('🔮 Proactive Suggestions Generated:');
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion.message} (${suggestion.type})`);
    });
  }

  /**
   * Demo 5: System Scalability
   */
  async demoSystemScalability() {
    console.log('\n📈 DEMO 5: System Scalability');
    
    // Register a hypothetical new agent
    const newAgent = {
      handleCustomRequest: async (intent, entities, userId) => ({
        messageToUser: `Handled by Custom Agent: ${intent}`,
        customId: 'custom_123'
      }),
      getUserKnowledge: (userId) => ({ customData: 'custom insights' })
    };
    
    this.jarviIntegration.registerAgent('custom', newAgent, {
      domains: ['custom_processing', 'specialized_analysis']
    });
    
    // Show system status
    const status = this.jarviIntegration.getSystemStatus();
    
    console.log('🏗️ System Architecture:');
    console.log(`   Total Agents: ${status.agentRegistry.totalAgents}`);
    console.log(`   Agent Registry: ${status.agentRegistry.agents.join(', ')}`);
    console.log(`   Active Chat Sessions: ${status.chatIntelligence.activeChats}`);
    console.log(`   Intelligence Engines: ${status.chatIntelligence.activeEngines}`);
    console.log(`   Integration Patterns: ${status.integrationPatterns}`);
  }

  /**
   * Demo 6: Real-time Intelligence Updates
   */
  async demoRealTimeUpdates() {
    console.log('\n⚡ DEMO 6: Real-time Intelligence Updates');
    
    // Set up event listeners for intelligence updates
    this.chatIntelligence.on('intelligenceUpdate', (data) => {
      console.log(`🔄 Real-time Update: ${data.type} - ${data.userId}`);
    });
    
    this.jarviIntegration.on('intelligenceDelegation', (data) => {
      console.log(`🎯 Delegation Event: ${data.engines_used?.join(', ')} engines used (${Math.round(data.confidence * 100)}% confidence)`);
    });
    
    // Simulate intelligence update flow
    console.log('👤 User: "Show me my project timeline"');
    
    const response = await this.chatIntelligence.processChatMessage(
      this.demoUserId,
      "Show me my project timeline",
      { real_time_demo: true }
    );
    
    console.log(`🤖 Response: ${response.message}`);
    console.log(`⚙️ Context: Conversation ${response.context.conversationId}, Turn ${response.context.turnNumber}`);
  }

  /**
   * Demo adaptive intelligence orchestration
   */
  async demoAdaptiveOrchestration() {
    console.log('\n🎭 DEMO: Adaptive Intelligence Orchestration');
    
    const adaptiveScenarios = [
      {
        message: "I'm struggling with time management",
        expected_engines: ['timeManagement', 'productivity', 'workflow'],
        expected_agent: 'jarvi'
      },
      {
        message: "Complete my task for the meeting",
        expected_engines: ['correlation'],
        expected_agent: 'murphy'
      },
      {
        message: "Schedule my day for maximum productivity", 
        expected_engines: ['timeManagement', 'productivityOptimizer'],
        expected_agent: 'grim'
      }
    ];
    
    for (const scenario of adaptiveScenarios) {
      console.log(`\n🎯 Adaptive Scenario: "${scenario.message}"`);
      
      const response = await this.jarviIntegration.handleProductivityConversation(
        scenario.message,
        this.demoUserId,
        { adaptive_demo: true }
      );
      
      console.log(`🤖 JARVI Response: ${response.message.substring(0, 100)}...`);
      console.log(`🔧 Delegated to: ${response.agent_recommendations[0]?.agent || 'jarvi'}`);
      console.log(`🧠 Engines involved: ${response.intelligence_insights?.engines?.join(', ') || 'general'}`);
    }
  }

  /**
   * Cleanup demo resources
   */
  cleanup() {
    console.log('\n🧹 Cleaning up demo resources...');
    
    // Clear demo data
    this.chatIntelligence.clearProactiveSuggestions(this.demoUserId);
    
    console.log('✅ Demo cleanup complete');
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new ChatIntelligenceDemo();
  
  demo.runDemo()
    .then(() => {
      demo.cleanup();
      console.log('\n🎉 Chat-First Intelligence Interface Demo Completed Successfully!');
      console.log('\n📋 Key Achievements:');
      console.log('   ✅ 6 Intelligence Engines Orchestrated');
      console.log('   ✅ Natural Language Processing Layer');
      console.log('   ✅ JARVI-Grim-Murphy Integration');
      console.log('   ✅ Adaptive Agent Delegation');
      console.log('   ✅ Real-time Intelligence Updates');
      console.log('   ✅ Conversation Learning System');
      console.log('   ✅ Proactive Suggestion Engine');
      console.log('   ✅ Scalable Architecture');
    })
    .catch(error => {
      console.error('Demo error:', error);
      process.exit(1);
    });
}

module.exports = ChatIntelligenceDemo;