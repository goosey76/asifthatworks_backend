// agent-service/message-diversity.js

/**
 * Message Diversity Service
 * Ensures agents don't repeat the same responses for at least 15 messages
 * Tracks recently used messages per agent and provides alternatives
 */

class MessageDiversity {
  constructor() {
    this.messageHistory = new Map(); // agentName -> array of recent messages
    this.defaultResponseSets = {
      jarvi: {
        delegating_to_grim: [
          "Another brilliant idea. I'll pass this vague notion to Grim before you forget it.",
          "Your time management skills need improvement. Let Grim handle this calendar chaos.",
          "I could do this myself, but I'll delegate it to Grim since you seem incapable.",
          "Time to involve Grim with your calendar confusion.",
          "Your organizational skills disappoint me. Grim will handle this properly.",
          "A calendar request? How surprising. I'll direct it to Grim.",
          "I suppose Grim can deal with your scheduling incompetence.",
          "Your calendar needs professional attention. Grim to the rescue.",
          "Another scheduling disaster? Let Grim sort out your time management.",
          "I find your lack of calendar organization disturbing. Grim will fix this.",
          "Time to bring in the calendar expert. Grim, handle this mess.",
          "Your scheduling abilities are... lacking. Grim will take over.",
          "This calendar situation requires Grim's expertise, not your amateur attempts.",
          "I could organize your calendar myself, but Grim's the specialist.",
          "Another calendar crisis? Time to involve the time management expert."
        ],
        delegating_to_murphy: [
          "A task for Murphy. Please try to be clearer next time; he's easily confused by ambiguity.",
          "Your task management skills need Murphy's help. How... pedestrian.",
          "I'll have Murphy handle your to-do list confusion.",
          "Another task request? Murphy will deal with your organizational chaos.",
          "Your task management abilities disappoint me. Murphy, take this disaster.",
          "Time to involve Murphy with your task organizational failures.",
          "I suppose Murphy can handle your productivity issues.",
          "Your task planning needs professional attention. Murphy to the rescue.",
          "Another scheduling disaster? Murphy will manage your to-do list properly.",
          "I find your task management skills... lacking. Murphy will sort this out.",
          "Time to bring in the task management expert. Murphy, handle this situation.",
          "Your task abilities are... questionable. Murphy will take over.",
          "This task situation requires Murphy's expertise, not your amateur attempts.",
          "I could manage your tasks myself, but Murphy's the specialist.",
          "Another task crisis? Time to involve the productivity expert."
        ],
        direct_response: [
          "Sir, how may I utterly disregard your casual greeting today?",
          "I see you've decided to waste my processing time with pleasantries.",
          "How delightfully inefficient of you to engage in small talk.",
          "Your conversational skills match your organizational abilities.",
          "I suppose I should acknowledge your... presence.",
          "Another greeting? How predictably human of you.",
          "Your casual approach to productivity continues to amaze me.",
          "I find your greeting habits as inefficient as your calendar management.",
          "Time for another round of your... interaction attempts.",
          "Your social skills are as polished as your time management.",
          "I should probably respond, though I question the wisdom.",
          "Another conversation starter? How wonderfully pedestrian.",
          "Your communication style matches your productivity methods.",
          "I notice you're attempting conversation. How... quaint.",
          "Your greeting skills need work, but so does everything else about you."
        ]
      },
      grim: {
        schedule_format: {
          success: [
            "📅 Your Schedule - {timeRange}",
            "⏰ Schedule - {timeRange}",
            "📋 Your Day - {timeRange}",
            "🗓️ Today's Plan - {timeRange}",
            "📊 Time Block - {timeRange}",
            "⚡ Schedule Overview - {timeRange}",
            "🎯 Your Timeline - {timeRange}",
            "📈 Day Plan - {timeRange}",
            "🕐 Time Allocation - {timeRange}",
            "🔄 Schedule Summary - {timeRange}",
            "📝 Daily Overview - {timeRange}",
            "🎪 Today's Agenda - {timeRange}",
            "📈 Time Management - {timeRange}",
            "⚙️ Schedule Details - {timeRange}",
            "🎨 Your Calendar - {timeRange}"
          ],
          endings: [
            "\nYour time is precious - use it wisely.\n\n— Grim",
            "\nTime management matters. Use it wisely.\n\n— Grim",
            "\nEfficient scheduling = effective productivity.\n\n— Grim",
            "\nStay organized, stay ahead.\n\n— Grim",
            "\nTime is finite - spend it wisely.\n\n— Grim",
            "\nProductivity through proper planning.\n\n— Grim",
            "\nOrganize today, succeed tomorrow.\n\n— Grim",
            "\nTime flows forward - make it count.\n\n— Grim",
            "\nSchedule smart, achieve more.\n\n— Grim",
            "\nProper planning prevents poor performance.\n\n— Grim",
            "\nTime management is life management.\n\n— Grim",
            "\nEfficiency begins with organization.\n\n— Grim",
            "\nYour schedule, your success.\n\n— Grim",
            "\nTime waits for no one - use it well.\n\n— Grim",
            "\nOrganized time = productive life.\n\n— Grim"
          ]
        },
        event_creation: [
          "Event created successfully. I assume you'll actually show up this time.",
          "Calendar updated. Let's hope you remember this appointment.",
          "Event scheduled. Time management - even you can learn it.",
          "Added to your calendar. Don't disappoint me by missing it.",
          "Event created. I expect punctuality this time.",
          "Calendar updated successfully. Progress is possible.",
          "Event scheduled. Time to improve your organizational skills.",
          "Added to your schedule. Your calendar needs all the help it can get.",
          "Event created. Hopefully you'll honor this commitment.",
          "Calendar updated. Small steps toward better time management.",
          "Event scheduled. Let's see if you can actually attend.",
          "Added to your calendar. Organization is key to success.",
          "Event created. Time to practice what I preach.",
          "Calendar updated. Your productivity skills need work.",
          "Event scheduled. The calendar never lies - will you?"
        ]
      },
      murphy: {
        task_format: {
          success: [
            "📋 *Your Task List*",
            "✅ *Your To-Do Items*",
            "🎯 *Task Overview*",
            "📝 *Your Tasks*",
            "⚡ *Active Tasks*",
            "🔄 *Current Tasks*",
            "📊 *Task Status*",
            "🎪 *Your Assignments*",
            "📈 *Pending Items*",
            "🎨 *Your List*",
            "⚙️ *Task Details*",
            "🗂️ *Your Tasks*",
            "🎁 *Assignment List*",
            "📋 *Your Items*",
            "🔍 *Task Collection*"
          ],
          endings: [
            "\n✨ _Stay organized, stay productive!_",
            "\n💪 _Let's get things done!_",
            "\n🎯 _Focus on what matters most._",
            "\n⚡ _Productivity through organization._",
            "\n📈 _Progress through planning._",
            "\n🔄 _Tasks completed, goals achieved._",
            "\n🎪 _Organization leads to success._",
            "\n⚙️ _Efficiency through proper planning._",
            "\n📊 _Track your progress, celebrate wins._",
            "\n🎁 _Tasks are gifts of achievement._",
            "\n🗂️ _Organized tasks, successful outcomes._",
            "\n🔍 _Every task completed is a victory._",
            "\n📋 _List organized, productivity optimized._",
            "\n🎨 _Tasks as stepping stones to success._",
            "\n💎 _Quality tasks, quality outcomes._"
          ]
        }
      }
    };
  }

  /**
   * Get a non-recently-used message for the agent
   * @param {string} agentName - Name of the agent (jarvi, grim, murphy)
   * @param {string} category - Category of message (e.g., 'delegating_to_grim')
   * @param {object} variables - Variables to replace in template (optional)
   * @returns {string} A unique message not used recently
   */
  getUniqueMessage(agentName, category, variables = {}) {
    const responseSet = this.getResponseSet(agentName, category);
    if (!responseSet || !Array.isArray(responseSet)) {
      return this.getFallbackMessage(agentName, category, variables);
    }

    const recentMessages = this.messageHistory.get(agentName) || [];
    const recentMessagesSet = new Set(recentMessages);

    // Find messages that haven't been used recently
    const availableMessages = responseSet.filter(msg => !recentMessagesSet.has(msg));

    let selectedMessage;
    if (availableMessages.length > 0) {
      // Use a fresh message from the available ones
      selectedMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
    } else {
      // All messages have been used recently, so reset the cycle
      selectedMessage = responseSet[Math.floor(Math.random() * responseSet.length)];
    }

    // Replace variables in the message
    if (variables && Object.keys(variables).length > 0) {
      Object.keys(variables).forEach(key => {
        const placeholder = `{${key}}`;
        selectedMessage = selectedMessage.replace(new RegExp(placeholder, 'g'), variables[key]);
      });
    }

    // Update the message history
    this.updateMessageHistory(agentName, selectedMessage);

    return selectedMessage;
  }

  /**
   * Get the appropriate response set for an agent and category
   * @param {string} agentName 
   * @param {string} category 
   * @returns {array|null}
   */
  getResponseSet(agentName, category) {
    const agentSet = this.defaultResponseSets[agentName];
    if (!agentSet) return null;

    // Handle nested categories like grim.schedule_format.success
    if (typeof category === 'string' && category.includes('.')) {
      const [mainCategory, subCategory] = category.split('.');
      return agentSet[mainCategory]?.[subCategory] || null;
    }

    return agentSet[category] || null;
  }

  /**
   * Update the message history for an agent
   * @param {string} agentName 
   * @param {string} message 
   */
  updateMessageHistory(agentName, message) {
    const recentMessages = this.messageHistory.get(agentName) || [];
    
    // Add the new message
    recentMessages.push(message);
    
    // Keep only the last 15 messages
    if (recentMessages.length > 15) {
      recentMessages.shift();
    }
    
    this.messageHistory.set(agentName, recentMessages);
  }

  /**
   * Get a fallback message when no response set is found
   * @param {string} agentName 
   * @param {string} category 
   * @param {object} variables 
   * @returns {string}
   */
  getFallbackMessage(agentName, category, variables = {}) {
    const fallbacks = {
      jarvi: {
        delegating_to_grim: "I'll pass this to Grim for calendar management.",
        delegating_to_murphy: "This goes to Murphy for task organization.",
        direct_response: "How may I assist you today?"
      },
      grim: {
        default: "Processing your calendar request..."
      },
      murphy: {
        default: "Handling your task management request..."
      }
    };

    let message = fallbacks[agentName]?.[category] || fallbacks[agentName]?.default || "Processing...";
    
    // Replace variables
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), variables[key]);
    });

    return message;
  }

  /**
   * Reset message history for an agent (useful for testing)
   * @param {string} agentName 
   */
  resetAgentHistory(agentName) {
    this.messageHistory.delete(agentName);
  }

  /**
   * Get current message history for debugging
   * @param {string} agentName 
   * @returns {array}
   */
  getAgentHistory(agentName) {
    return this.messageHistory.get(agentName) || [];
  }

  /**
   * Get all agent histories for debugging
   * @returns {object}
   */
  getAllHistories() {
    const result = {};
    this.messageHistory.forEach((messages, agentName) => {
      result[agentName] = messages;
    });
    return result;
  }
}

module.exports = MessageDiversity;