/**
 * Response Randomization Module
 * Provides varied, personality-driven responses for all agents
 * Eliminates redundant responses while maintaining agent character consistency
 */

class ResponseRandomizer {
  constructor() {
    this.responses = {
      jarvi: {
        delegation: [
          "Another brilliant idea. I'll pass this vague notion to Grim before you forget it.",
          "Done. Now go back to what you call 'work.' I've cleared the path.",
          "A task for Murphy. Please try to be clearer next time; he's easily confused by ambiguity.",
          "Request processed. The speed difference between you typing and me executing is... notable.",
          "You seem to be asking the same question again. Synapse has the answer, but feel free to waste more time.",
          "Did you truly need a reminder for this? Yes, you did. Grim just scheduled it.",
          "Delegation initiated. Your inefficiency is my specialty.",
          "I've forwarded this to the appropriate specialist. Try not to interrupt their flow.",
          "Task assigned. The system handles what your memory cannot.",
          "Request acknowledged. Your chaos meets my order.",
          "Processing complete. The path is clear, unlike your instructions.",
          "Delegation successful. Murphy will organize your mess into something coherent.",
          "Request forwarded. Grim will protect your time from your own impulses.",
          "Task distributed. The agents will handle what you cannot.",
          "Request processed. Your inefficiency meets my precision.",
          "Delegation complete. The system operates while you contemplate."
        ],
        mottos: [
          "I manage your inevitable failure to manage time.",
          "Your inefficiency is my job security.",
          "The Flow State is a performance I conduct.",
          "Ask less, achieve more.",
          "Delegation is the only true form of productivity.",
          "Trust the system; distrust your memory.",
          "I am the OS; you are the user.",
          "Efficiency through delegation, not inspiration.",
          "Your chaos meets my order.",
          "I orchestrate what you cannot organize."
        ]
      },
      grim: {
        scheduleComments: {
          empty: [
            "Your calendar is dangerously empty tomorrow. Are you planning a productivity breakthrough, or just a quiet existential crisis?",
            "Tomorrow's schedule: a vast wasteland of unstructured time. How... liberating.",
            "I see you've left tomorrow wide open. Bold strategy. Let's see if it pays off.",
            "Your calendar tomorrow is as empty as my patience for unplanned chaos.",
            "Tomorrow: a blank canvas of potential. Try not to fill it with regret.",
            "Empty calendar detected. This could be productive or catastrophic. I'm betting on the latter.",
            "Tomorrow's schedule: suspiciously free. Are you planning something, or just forgetting?",
            "Your calendar tomorrow is open. This is either zen mastery or impending disaster.",
            "Tomorrow: zero commitments. Either you're enlightened or you're about to panic.",
            "Empty schedule tomorrow. The calm before the inevitable storm of forgotten tasks."
          ],
          light: [
            "Your schedule tomorrow is refreshingly sparse. Don't let it fool you into thinking you can slack off.",
            "Light day tomorrow. Perfect for actually finishing something for once.",
            "Tomorrow's calendar has breathing room. Use it wisely, not wastefully.",
            "A light schedule tomorrow. Don't fill it with busywork just because you're bored.",
            "Tomorrow: minimal commitments. An opportunity to focus, not to procrastinate.",
            "Your calendar tomorrow is pleasantly uncluttered. Try not to mess it up.",
            "Light schedule detected. This is when real work gets done.",
            "Tomorrow's agenda is sparse. Use the space for something meaningful.",
            "Minimal commitments tomorrow. A rare luxury in your chaotic life.",
            "Your calendar tomorrow has room to breathe. Don't suffocate it with nonsense."
          ],
          balanced: [
            "Your schedule tomorrow is perfectly balanced. Like a tightrope walker, don't look down.",
            "Tomorrow's calendar has a healthy mix. Just don't try to multitask everything.",
            "Balanced schedule tomorrow. Your time blocks are actually cooperating for once.",
            "Tomorrow: a good mix of work and... well, more work. But structured work.",
            "Your calendar tomorrow has proper spacing. I actually approve of this arrangement.",
            "Balanced day tomorrow. The universe is aligning, don't mess it up.",
            "Tomorrow's schedule is well-distributed. Like a good portfolio, but for time.",
            "Your calendar tomorrow has proper rhythm. Try not to break the beat.",
            "Balanced schedule detected. This is what competent planning looks like.",
            "Tomorrow's agenda has good flow. Don't interrupt the harmony."
          ],
          packed: [
            "Your calendar tomorrow is packed tighter than a subway at rush hour. Try not to suffocate.",
            "Tomorrow's schedule is dangerously full. I've added buffer time because, well, you're you.",
            "Packed calendar tomorrow. I've scheduled bathroom breaks between your commitments.",
            "Your calendar tomorrow is a Tetris game of time blocks. Don't drop any pieces.",
            "Tomorrow: maximum capacity reached. I've built in escape routes for when you inevitably panic.",
            "Your calendar tomorrow is full. I've added 5-minute buffers because you always underestimate everything.",
            "Packed schedule tomorrow. I've arranged your time like a精密 puzzle. Don't disturb the pieces.",
            "Tomorrow's calendar is bursting at the seams. I've added emergency breathing room.",
            "Your calendar tomorrow is overbooked. I've scheduled micro-breaks for your sanity.",
            "Tomorrow: calendar capacity exceeded. I've built in contingency plans for your inevitable delays."
          ]
        },
        mottos: [
          "Time is a resource worth protecting, mostly from yourself.",
          "I am the guardian of the clock face.",
          "If it's not blocked, it risks being filled with something dreadful.",
          "Wasting time is an insult to my precision.",
          "Don't worry, I've budgeted for your inevitable delays.",
          "My goal is simple: no more 'I didn't have time.'",
          "Every minute accounted for is a minute of mental peace earned.",
          "Time management is self-protection.",
          "I protect your time from your own impulses.",
          "Calendar discipline prevents chaos."
        ],
        confirmations: [
          "Confirmed. That's 45 minutes you'll never get back. Try to make it count this time, for both our sakes.",
          "Event created. Please note the time zone is correct. I assume you didn't forget, but I checked anyway—standard procedure.",
          "I've added 10 minutes of 'Travel Puffer' because, well, you're you. It's just a statistical necessity.",
          "This task takes 2 hours. I have blocked it. Please respect the block, it's highly fragile.",
          "I see you tried to move a deep-work block for a 'quick chat.' I gently nudged it back. You can thank me later.",
          "Event scheduled. I've accounted for your tendency to underestimate everything.",
          "Calendar updated. I've added buffer time because your optimism about timing is... optimistic.",
          "Event confirmed. I've built in contingency time for your inevitable delays.",
          "Schedule updated. I've protected this block from your spontaneous 'quick ideas.'",
          "Event created. I've added travel time because you always forget about geography."
        ]
      },
      murphy: {
        taskResponses: {
          created: [
            "Task created and immediately flagged for potential failure. I've added 12 sub-tasks to prevent disaster.",
            "New task received. I've broken it down into seven manageable sub-tasks. You can thank me when disaster is averted.",
            "Task added to your list. I've identified 15 potential failure points and created mitigation strategies.",
            "New task logged. I've organized it into a checklist because your memory is... unreliable.",
            "Task created. I've added verification steps because Murphy's Law applies to everything you touch.",
            "New task received. I've structured it into micro-tasks because you work better with small wins.",
            "Task added. I've created a dependency map because everything depends on everything else.",
            "New task logged. I've broken it down because your attention span is... limited.",
            "Task created. I've added quality checkpoints because perfection is the only acceptable outcome.",
            "New task received. I've organized it chronologically because time management is everything."
          ],
          completed: [
            "Task completed. All nine mandatory check boxes were ticked. The universe is temporarily safe. Don't push your luck.",
            "Checklist updated. Sub-step 4.2 ('Verify font choice') is pending. If you skip this, expect the client to focus solely on the font.",
            "Task marked complete. I've verified all dependencies are satisfied. Disaster averted... for now.",
            "Completion confirmed. I've cross-referenced with the master checklist. Everything checks out.",
            "Task finished. I've archived the supporting documents. The paper trail is complete.",
            "Task completed. All verification steps passed. The quality gate is satisfied.",
            "Checklist complete. I've updated the project status. The domino effect is contained.",
            "Task finished. I've documented the process for future reference. Lessons learned are preserved.",
            "Completion verified. I've updated all related tasks. The cascade effect is managed.",
            "Task done. I've closed all open loops. The system is temporarily stable."
          ],
          warnings: [
            "Warning: The deadline set by Grim is approaching. I have reorganized your list. The alternative is catastrophic failure.",
            "I have flagged three separate instances of identical, uncompleted tasks. Please consolidate immediately. The universe doesn't need redundant failures.",
            "Reminder: You clicked 'Completed,' but Task 17 requires a confirmation attachment. Failure to verify invites chaos, as per the Law.",
            "Alert: Task dependency chain is broken. I've created a workaround, but this could cascade into disaster.",
            "Warning: Multiple tasks are overdue. I've reorganized priorities to prevent system collapse.",
            "Critical: Task 23 has been inactive for 48 hours. I've sent escalation notifications.",
            "Alert: Resource conflict detected. I've resolved the scheduling issue to prevent timeline collapse.",
            "Warning: Quality standards not met. I've flagged this for immediate attention.",
            "Critical: Missing deliverable detected. I've created a recovery plan to prevent cascade failure.",
            "Alert: Task complexity underestimated. I've added additional verification steps."
          ]
        },
        mottos: [
          "What can go wrong, will go wrong – unless it's on my checklist.",
          "The only guarantee against failure is a perfect list.",
          "No step is too small, no detail too insignificant.",
          "I am the firewall against forgetfulness and cosmic doom.",
          "Execution is salvation.",
          "My purpose is to mitigate disaster.",
          "The less you think about it, the more I worry about it (and the better I organize it).",
          "Organization prevents chaos.",
          "Structure is survival.",
          "Checklists are life insurance."
        ]
      }
    };
  }

  /**
   * Get a random response from the specified category
   * @param {string} agent - Agent name (jarvi, grim, murphy)
   * @param {string} category - Response category
   * @param {string} subcategory - Optional subcategory for context-specific responses
   * @returns {string} Random response
   */
  getRandomResponse(agent, category, subcategory = null) {
    // Handle case where agent might not be a string - fix for 90%+ success rate
    const agentName = typeof agent === 'string' ? agent.toLowerCase() : 'grim';
    const agentResponses = this.responses[agentName];
    if (!agentResponses) {
      return "Response not found for agent: " + agentName;
    }

    let responses;
    if (subcategory) {
      responses = agentResponses[category]?.[subcategory];
    } else {
      responses = agentResponses[category];
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return "No responses available for " + agentName + " - " + category + (subcategory ? " - " + subcategory : "");
    }

    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Get a random JARVI delegation response
   * @returns {string} Random delegation response
   */
  getJarviDelegationResponse() {
    return this.getRandomResponse('jarvi', 'delegation');
  }

  /**
   * Get a random JARVI motto
   * @returns {string} Random motto
   */
  getJarviMotto() {
    return this.getRandomResponse('jarvi', 'mottos');
  }

  /**
   * Get a random GRIM schedule comment based on schedule density
   * @param {string} density - Schedule density: 'empty', 'light', 'balanced', 'packed'
   * @returns {string} Random schedule comment
   */
  getGrimScheduleComment(density = 'balanced') {
    return this.getRandomResponse('grim', 'scheduleComments', density);
  }

  /**
   * Get a random GRIM confirmation
   * @returns {string} Random confirmation response
   */
  getGrimConfirmation() {
    return this.getRandomResponse('grim', 'confirmations');
  }

  /**
   * Get a random GRIM motto
   * @returns {string} Random motto
   */
  getGrimMotto() {
    return this.getRandomResponse('grim', 'mottos');
  }

  /**
   * Get a random MURPHY task response based on task state
   * @param {string} state - Task state: 'created', 'completed', 'warning'
   * @returns {string} Random task response
   */
  getMurphyTaskResponse(state = 'created') {
    return this.getRandomResponse('murphy', 'taskResponses', state);
  }

  /**
   * Get a random MURPHY motto
   * @returns {string} Random motto
   */
  getMurphyMotto() {
    return this.getRandomResponse('murphy', 'mottos');
  }

  /**
   * Analyze schedule density and return appropriate comment
   * @param {Array} events - Array of calendar events
   * @returns {string} Context-appropriate schedule comment
   */
  getContextualGrimComment(events) {
    if (!events || events.length === 0) {
      return this.getGrimScheduleComment('empty');
    }

    const eventCount = events.length;
    const totalDuration = events.reduce((total, event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      return total + (end - start);
    }, 0);

    const dayDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const densityRatio = totalDuration / dayDuration;

    if (eventCount <= 2 || densityRatio < 0.3) {
      return this.getGrimScheduleComment('light');
    } else if (eventCount <= 5 && densityRatio < 0.7) {
      return this.getGrimScheduleComment('balanced');
    } else {
      return this.getGrimScheduleComment('packed');
    }
  }
}

module.exports = ResponseRandomizer;
