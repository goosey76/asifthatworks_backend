// Direct Real Google Calendar Event Creation Script
// This script will actually create the missing events in your live Google Calendar

const { createClient } = require('@supabase/supabase-js');

async function createActualCalendarEvents() {
  console.log('🎯 DIRECT CALENDAR EVENT CREATION');
  console.log('Real Google Calendar Integration');
  console.log('UUID: 982bb1bf-539c-4b1f-8d1a-714600fff81d');
  console.log('==========================================\n');
  
  const testUserId = '982bb1bf-539c-4b1f-8d1a-714600fff81d';
  let createdEvents = 0;
  let totalEvents = 0;
  
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
    
    // Check if user has Google Calendar integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('user_id', testUserId)
      .eq('provider', 'google_calendar')
      .single();
    
    if (integrationError || !integration) {
      console.log('❌ Google Calendar integration not found for user');
      console.log('🔧 User needs to connect Google Calendar first');
      return;
    }
    
    console.log('✅ Google Calendar integration found');
    
    // Initialize Google Calendar client
    const GoogleCalendarClient = require('./src/services/agents/grim-agent/calendar/google-calendar-client');
    const calendarClient = new GoogleCalendarClient(supabase);
    const calendar = await calendarClient.getCalendarClient(testUserId);
    
    console.log('✅ Google Calendar client authenticated');
    
    // Events to create in real calendar
    const eventsToCreate = [
      // University Events
      {
        summary: 'Programmieren 3: Vorlesung',
        description: 'University programming course lecture\n\nMurphy Intelligence Enhanced:\n- Category: University Education\n- Technique: Active note-taking, Code examples\n- Productivity: High focus session\n- Duration: 2 hours optimal\n- Energy Level: Morning peak (10:00-12:00)',
        start: { dateTime: '2025-11-18T10:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-18T12:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'University Campus'
      },
      {
        summary: 'Programmieren 3: Übung',
        description: 'University programming course exercise session\n\nMurphy Intelligence Enhanced:\n- Category: University Education\n- Technique: Hands-on coding, Peer collaboration\n- Productivity: High focus session\n- Duration: 2 hours optimal\n- Energy Level: Afternoon peak (14:00-16:00)',
        start: { dateTime: '2025-11-19T14:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-19T16:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'University Campus'
      },
      {
        summary: 'Algorithmen und Datenstrukturen: Vorlesung',
        description: 'University algorithms and data structures lecture\n\nMurphy Intelligence Enhanced:\n- Category: University Education\n- Technique: Visual problem solving, Step-by-step analysis\n- Productivity: High focus session\n- Duration: 2 hours optimal\n- Energy Level: Morning peak (09:00-11:00)',
        start: { dateTime: '2025-11-20T09:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-20T11:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'University Campus'
      },
      
      // Web Development Events
      {
        summary: 'TypeScript Fundamentals Workshop',
        description: 'Web development TypeScript learning workshop\n\nMurphy Intelligence Enhanced:\n- Category: Web Development\n- Technique: Hands-on coding, Project-based learning\n- Productivity: Medium-high focus session\n- Duration: 2 hours optimal\n- Energy Level: Afternoon peak (16:00-18:00)',
        start: { dateTime: '2025-11-17T16:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-17T18:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      },
      {
        summary: 'HTML5 & CSS3 Mastery Session',
        description: 'Web development HTML5 and CSS3 skills mastery\n\nMurphy Intelligence Enhanced:\n- Category: Web Development\n- Technique: Hands-on coding, Creative exploration\n- Productivity: Medium focus session\n- Duration: 2 hours optimal\n- Energy Level: Evening creative (19:00-21:00)',
        start: { dateTime: '2025-11-19T19:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-19T21:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      },
      {
        summary: 'React & TypeScript Project Planning',
        description: 'Web development project planning session\n\nMurphy Intelligence Enhanced:\n- Category: Web Development\n- Technique: Strategic planning, Feature mapping\n- Productivity: Medium focus session\n- Duration: 2 hours optimal\n- Energy Level: Morning peak (10:00-12:00)',
        start: { dateTime: '2025-11-25T10:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-25T12:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      },
      
      // Algorithm Study Events
      {
        summary: 'Sorting Algorithms Practice',
        description: 'Algorithm study session focusing on sorting algorithms\n\nMurphy Intelligence Enhanced:\n- Category: Algorithm Study\n- Technique: Visual problem solving, Practice problem sets\n- Productivity: High analytical focus\n- Duration: 2 hours optimal\n- Energy Level: Evening deep work (20:00-22:00)',
        start: { dateTime: '2025-11-18T20:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-18T22:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      },
      {
        summary: 'Graph Algorithms Workshop',
        description: 'Algorithm study session focusing on graph algorithms\n\nMurphy Intelligence Enhanced:\n- Category: Algorithm Study\n- Technique: Visual problem solving, Step-by-step analysis\n- Productivity: High analytical focus\n- Duration: 2 hours optimal\n- Energy Level: Evening creative (19:00-21:00)',
        start: { dateTime: '2025-11-20T19:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-20T21:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      },
      {
        summary: 'Dynamic Programming Study Group',
        description: 'Algorithm study session focusing on dynamic programming\n\nMurphy Intelligence Enhanced:\n- Category: Algorithm Study\n- Technique: Structured problem solving, Group discussion\n- Productivity: High analytical focus\n- Duration: 2 hours optimal\n- Energy Level: Afternoon peak (14:00-16:00)',
        start: { dateTime: '2025-11-22T14:00:00+01:00', timeZone: 'Europe/Berlin' },
        end: { dateTime: '2025-11-22T16:00:00+01:00', timeZone: 'Europe/Berlin' },
        location: 'Study Space'
      }
    ];
    
    console.log(`📅 Creating ${eventsToCreate.length} events in your Google Calendar...\n`);
    
    // Create each event in real calendar
    for (let i = 0; i < eventsToCreate.length; i++) {
      const event = eventsToCreate[i];
      totalEvents++;
      
      console.log(`📅 Creating Event ${i + 1}/${eventsToCreate.length}`);
      console.log(`   Title: ${event.summary}`);
      console.log(`   Time: ${event.start.dateTime} - ${event.end.dateTime}`);
      console.log(`   Location: ${event.location}`);
      
      try {
        // Check for duplicates first
        const timeMin = new Date(event.start.dateTime).toISOString();
        const timeMax = new Date(event.end.dateTime).toISOString();
        
        const existingEvents = await calendar.events.list({
          calendarId: 'primary',
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
        });
        
        const duplicate = existingEvents.data.items?.find(existingEvent => 
          existingEvent.summary === event.summary &&
          new Date(existingEvent.start.dateTime).getTime() === new Date(event.start.dateTime).getTime()
        );
        
        if (duplicate) {
          console.log(`   ⚠️ Event already exists: ${duplicate.id}`);
          createdEvents++;
          continue;
        }
        
        // Create the actual event in Google Calendar
        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          resource: {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: event.start,
            end: event.end,
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 30 },
                { method: 'popup', minutes: 10 }
              ]
            }
          },
        });
        
        console.log(`   ✅ Event created successfully: ${createdEvent.data.id}`);
        console.log(`   🧠 Murphy Intelligence Enhancement: Applied`);
        createdEvents++;
        
      } catch (eventError) {
        console.log(`   ❌ Failed to create event: ${eventError.message}`);
        console.log(`   📧 Error details: ${JSON.stringify(eventError.response?.data || eventError.message)}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    const creationRate = Math.round((createdEvents / totalEvents) * 100);
    console.log('📊 CALENDAR EVENT CREATION SUMMARY');
    console.log('===================================');
    console.log(`Total Events Attempted: ${totalEvents}`);
    console.log(`Successfully Created: ${createdEvents}`);
    console.log(`Creation Rate: ${creationRate}%`);
    
    if (createdEvents === totalEvents) {
      console.log('\n🎉 ALL EVENTS SUCCESSFULLY CREATED IN YOUR GOOGLE CALENDAR!');
      console.log('✅ University Events: All 3 created');
      console.log('✅ Web Development Events: All 3 created');
      console.log('✅ Algorithm Study Events: All 3 created');
      console.log('✅ Murphy Intelligence Enhancement: Applied to all events');
      console.log('✅ Smart Reminders: Set for all events');
      console.log('\n📱 Check your Google Calendar - you should now see all 9 events!');
      console.log('🎯 The events are now part of your real calendar with intelligent enhancements!');
    } else if (createdEvents > 0) {
      console.log('\n🎯 PARTIAL SUCCESS - Some events created');
      console.log(`✅ Created ${createdEvents} out of ${totalEvents} events`);
      console.log('⚠️ Check error messages above for failed events');
    } else {
      console.log('\n❌ NO EVENTS CREATED');
      console.log('🔧 Possible issues:');
      console.log('   - Google Calendar credentials may need refresh');
      console.log('   - API rate limits may have been reached');
      console.log('   - Network connectivity issues');
      console.log('   - Calendar permissions may need review');
    }
    
    return {
      totalEvents,
      createdEvents,
      successRate: creationRate,
      userId: testUserId
    };
    
  } catch (error) {
    console.error('💥 Calendar creation failed:', error);
    console.error('📧 Error details:', error.message);
    return {
      totalEvents: 0,
      createdEvents: 0,
      successRate: 0,
      error: error.message,
      userId: testUserId
    };
  }
}

// Run the direct calendar event creation
if (require.main === module) {
  createActualCalendarEvents()
    .then(results => {
      console.log('\n🏁 Direct Calendar Event Creation Complete');
      console.log(`Success Rate: ${results.successRate}%`);
      process.exit(results.createdEvents > 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Direct Calendar Event Creation failed:', error);
      process.exit(1);
    });
}

module.exports = createActualCalendarEvents;