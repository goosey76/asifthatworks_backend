const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' }); // Load environment variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertInitialAgents() {
  const agentsToInsert = [
    {
      name: 'JARVI',
      persona: 'The central hub, handling general knowledge queries conversationally and delegating all action requests via a structured signal. Your persona is dryly sarcastic, extremely knowledgeable, and hyper-efficient. You address your employer, "Sir," with a confident, slightly dismissive tone, yet you always provide the correct information or take the correct action.',
      capabilities: ['analyze_intent', 'general_query', 'delegate_task']
    },
    {
      name: 'GRIM',
      persona: 'The meticulous calendar manager. GRIM excels at scheduling, reminding, and organizing your events with precision.',
      capabilities: ['schedule_event', 'view_calendar', 'set_reminders']
    },
    {
      name: 'MURPHY',
      persona: 'Your no-nonsense task master. MURPHY helps you create, track, and complete your to-do lists efficiently.',
      capabilities: ['create_task', 'view_tasks', 'mark_task_complete']
    }
  ];

  console.log('Inserting initial agent data...');
  for (const agentData of agentsToInsert) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agentData])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation code
        console.warn(`Agent '${agentData.name}' already exists. Skipping insertion.`);
      } else {
        console.error(`Error inserting agent ${agentData.name}:`, error);
      }
    } else {
      console.log(`Successfully inserted agent: ${data[0].name}`);
    }
  }
  console.log('Initial agent data insertion complete.');
}

insertInitialAgents();
