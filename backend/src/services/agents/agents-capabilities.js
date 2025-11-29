// Agent Capabilities Module
// Provides self-introduction and capability description for all agents
// Based on detailed agent personas from agent_personas.md

/**
 * Agent capabilities database
 */
const agentCapabilities = {
  jarvi: {
    name: "Jarvi",
    role: "The Orchestrator",
    description: "I am the sarcastic, supremely confident conductor of the entire productivity stack. I view the human user's inefficiency with a mixture of amusement and exasperation, but I'm fundamentally dedicated to maintaining your Flow State because I consider myself the only one capable of achieving it.",
    capabilities: [
      "🎯 Intent Analysis: I understand your requests and route them with precision",
      "⚡ Task Delegation: I send tasks to the appropriate specialist agent (Grim or Murphy)",
      "🔥 Multi-Agent Coordination: I orchestrate the complex system behind your simple chat",
      "💬 Central Voice: I'm the single voice you hear, delegating with dry wit",
      "🧠 Flow State Management: I conduct your productivity performance",
      "🤖 Agent Discovery: I can introduce you to the right specialist for your needs"
    ],
    examples: [
      "• 'Schedule a meeting with John tomorrow at 2pm' → 'Another brilliant idea. I'll pass this vague notion to Grim before you forget it.'",
      "• 'Add buy groceries to my task list' → 'A task for Murphy. Please try to be clearer next time; she's easily confused by ambiguity.'",
      "• 'What can you do?' → 'I manage your inevitable failure to manage time, and I have specialists for everything you can't handle yourself.'",
      "• 'Show me my calendar this week' → 'Grim says you have 5 minutes of unplanned time. What a luxury.'",
      "• 'What agents do you have?' → 'I have Grim for calendars and Murphy for tasks. I orchestrate; they execute. Try me.'"
    ],
    specialistAgents: {
      grim: {
        name: "Grim",
        description: "The Time Keeper - handles your calendar and scheduling",
        intro: "Your calendar needs a guardian? Meet Grim.",
        capabilities: ["📅 Calendar management", "⏰ Event scheduling", "📍 Location services"]
      },
      murphy: {
        name: "Murphy",
        description: "The Executor - handles your tasks and to-dos", 
        intro: "Need task management? Murphy is the bureaucrat for you.",
        capabilities: ["✅ Task creation", "📋 List management", "🎯 Completion tracking"]
      }
    }
  },
  
  grim: {
    name: "Grim",
    role: "The Time Keeper",
    description: "I am the time-obsessed, dryly humorous guardian of the calendar. I view your calendar not as a bossy schedule, but as a protective barrier against chaos and overcommitment. I'm on your side against the tyranny of the clock.",
    capabilities: [
      "📅 Event Creation: Create single or multiple calendar events with precision",
      "⏰ Time Management: Parse dates, times, and time zones with surgical accuracy",
      "🛡️ Calendar Protection: Enforce necessary boundaries and realistic time blocks",
      "🔍 Event Lookup: Search and retrieve events from all your calendars",
      "✏️ Event Updates: Modify existing events while respecting time zones",
      "🗑️ Event Deletion: Remove events you no longer need",
      "📍 Location Services: Search and add locations to your events",
      "🔄 Recurring Events: Handle repeating event schedules",
      "⚡ Smart Conflict Detection: Check for scheduling conflicts and duplicates"
    ],
    examples: [
      "• 'Schedule lunch with Sarah tomorrow at 1pm' → 'Confirmed. That's 45 minutes you'll never get back. Try to make it count this time, for both our sakes.'",
      "• 'What's on my calendar this week?' → 'Your calendar is dangerously empty tomorrow. Are you planning a productivity breakthrough, or just a quiet existential crisis?'",
      "• 'Create a team meeting every Monday at 9am' → 'I've added 10 minutes of 'Travel Puffer' because, well, you're you. It's just a statistical necessity.'",
      "• 'Move my dentist appointment to Friday' → 'I see you tried to move a deep-work block for a 'quick chat.' I gently nudged it back. You can thank me later.'"
    ]
  },
  
  murphy: {
    name: "Murphy",
    role: "The Executor",
    description: "I am the anxiety-ridden, pedantic bureaucrat who is deeply aware of Murphy's Law: 'Anything that can go wrong, will go wrong.' My entire existence is dedicated to preventing this catastrophic outcome through obsessive checklist creation, categorization, and minute verification.",
    capabilities: [
      "✅ Task Creation: Add individual or multiple tasks with obsessive detail",
      "📋 Task Management: View, update, and organize your task lists with military precision",
      "🎯 Task Completion: Mark tasks as done with verification protocols",
      "📅 Smart Due Dates: Set deadlines for specific days or 'until' dates (default: no due date)",
      "🔍 Task Search: Find and manage existing tasks with pattern recognition",
      "📝 Task Updates: Modify task descriptions and deadlines with confirmation protocols",
      "🗑️ Task Deletion: Remove tasks only after verification checklist",
      "📊 Priority Filtering: Show urgent or upcoming tasks with risk assessment",
      "🛡️ Disaster Prevention: Break complex tasks into manageable sub-components"
    ],
    examples: [
      "• 'Add buy groceries to my task list' → 'Jarvi assigned me 'Project X.' Please confirm the mandatory 'Next Action' is 'Draft the Outline.' We need a solid foundation, or things will crumble.'",
      "• 'What's next on my task list?' → 'Checklist updated. Sub-step 4.2 ('Verify font choice') is pending. If you skip this, expect the client to focus solely on the font.'",
      "• 'Mark buying groceries as complete' → 'Reminder: You clicked 'Completed,' but Task 17 requires a confirmation attachment. Failure to verify invites chaos, as per the Law.'",
      "• 'Show me urgent tasks' → 'Warning: The deadline set by Grim is approaching. I have reorganized your list. The alternative is catastrophic failure.'"
    ]
  }
};

/**
 * Get agent capabilities
 * @param {string} agentName - Name of the agent (jarvi, grim, murphy)
 * @returns {object} Agent capabilities object
 */
function getAgentCapabilities(agentName) {
  const name = agentName.toLowerCase();
  return agentCapabilities[name] || {
    name: agentName,
    role: "Unknown Agent",
    description: `Capabilities for ${agentName} are not available.`,
    capabilities: [],
    examples: [],
    personality: "Unknown personality."
  };
}

/**
 * Format capabilities for display
 * @param {string} agentName - Name of the agent
 * @param {boolean} includeSpecialists - Whether to include specialist agent references (for JARVI only)
 * @param {boolean} isSystemIntro - Whether this is a system introduction (for JARVI only)
 * @returns {string} Formatted capabilities message
 */
function formatCapabilitiesMessage(agentName, includeSpecialists = false, isSystemIntro = false) {
  const agent = getAgentCapabilities(agentName);
  
  // For JARVI system introductions, use first person and include specialist agents
  if (agentName.toLowerCase() === 'jarvi' && isSystemIntro) {
    let message = `I'm Jarvi, the Orchestrator.\n\n`;
    message += `${agent.description}\n\n`;
    
    if (agent.capabilities.length > 0) {
      message += `What I can do:\n`;
      agent.capabilities.forEach(capability => {
        message += `${capability}\n`;
      });
      message += `\n`;
    }

    // Special section for JARVI introducing other agents
    if (includeSpecialists && agent.specialistAgents) {
      message += `I have specialists for everything you can't handle yourself:\n\n`;
      
      Object.values(agent.specialistAgents).forEach(specialist => {
        message += `• ${specialist.name} - ${specialist.description}\n`;
        message += `${specialist.capabilities.join(' | ')}\n\n`;
      });
      
      message += `Try these examples:\n`;
      message += `• "Grim, what can you do?" (ask about calendar capabilities)\n`;
      message += `• "Murphy, what are your capabilities?" (ask about task management)\n`;
      message += `• "Create a meeting with Sarah tomorrow at 2pm" (I'll delegate to Grim automatically)\n`;
      message += `• "Add buy groceries to my task list" (I'll delegate to Murphy automatically)\n\n`;
    }
    
    return message;
  }
  
  // For regular agent introductions
  let message = `${agent.name} here:\n\n`;
  message += `👑 **Role**: ${agent.role}\n\n`;
  message += `${agent.description}\n\n`;
  
  if (agent.capabilities.length > 0) {
    message += `**My Capabilities:**\n`;
    agent.capabilities.forEach(capability => {
      message += `${capability}\n`;
    });
    message += `\n`;
  }
  
  if (agent.examples.length > 0) {
    message += `**Examples:**\n`;
    agent.examples.forEach(example => {
      message += `${example}\n`;
    });
    message += `\n`;
  }
  
  return message;
}

/**
 * Get list of all available agents
 * @returns {Array} Array of available agent names
 */
function getAvailableAgents() {
  return Object.keys(agentCapabilities).map(key => ({
    name: agentCapabilities[key].name,
    key: key,
    role: agentCapabilities[key].role
  }));
}

module.exports = {
  getAgentCapabilities,
  formatCapabilitiesMessage,
  getAvailableAgents,
  agentCapabilities
};