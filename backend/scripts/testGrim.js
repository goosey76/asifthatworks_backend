const agentService = require('../src/services/agent-service');

async function runGrimTests() {
  const userId = '982bb1bf-539c-4b1f-8d1a-714600fff81d'; // Replace with a valid user ID that has Google Calendar integrated
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  let eventId = null;

  // Test Create Event
  console.log('\n--- Testing Create Event ---');
  try {
    const createEntities = {
      message: `can you create an event, - on ${formattedDate} on the go to the bib, from 9:45 to 10:30 at unter den linden?`
    };
    const createResponse = await agentService.delegateTask('create_event', createEntities, userId);
    console.log('GRIM Agent Create Response:', createResponse);

    // Extract eventId from the response
    const eventIdMatch = createResponse.match(/Event ID: (.*?)\./);
    if (eventIdMatch && eventIdMatch[1]) {
      eventId = eventIdMatch[1];
      console.log(`Extracted Event ID: ${eventId}`);
    } else {
      console.warn('Could not extract Event ID from create response.');
    }

  } catch (error) {
    console.error('Error during GRIM Agent Create test:', error);
  }

  // Test Get Event
  console.log('\n--- Testing Get Event ---');
  try {
    const getEntities = {
      message: `What's up for today, ${formattedDate}?`
    };
    const getResponse = await agentService.delegateTask('get_event', getEntities, userId);
    console.log('GRIM Agent Get Response:', getResponse);
  } catch (error) {
    console.error('Error during GRIM Agent Get test:', error);
  }

  // Test Update Event
  console.log('\n--- Testing Update Event ---');
  if (eventId) {
    try {
      // Calculate new times: 15 min earlier for start and end
      const originalStartTime = new Date(`${formattedDate}T09:45:00`);
      const originalEndTime = new Date(`${formattedDate}T10:30:00`);

      originalStartTime.setMinutes(originalStartTime.getMinutes() - 15);
      originalEndTime.setMinutes(originalEndTime.getMinutes() - 15);

      const newStartTime = `${String(originalStartTime.getHours()).padStart(2, '0')}:${String(originalStartTime.getMinutes()).padStart(2, '0')}`;
      const newEndTime = `${String(originalEndTime.getHours()).padStart(2, '0')}:${String(originalEndTime.getMinutes()).padStart(2, '0')}`;

      const updateEntities = {
        message: `can you change the event 'on the go to the bib' to start at ${newStartTime} and finish at ${newEndTime} on ${formattedDate}?`,
        event_id: eventId // Explicitly pass event_id for LLM extraction
      };
      const updateResponse = await agentService.delegateTask('update_event', updateEntities, userId);
      console.log('GRIM Agent Update Response:', updateResponse);
    } catch (error) {
      console.error('Error during GRIM Agent Update test:', error);
    }
  } else {
    console.warn('Skipping Update Event test: No Event ID available.');
  }

  // Test Delete Event
  console.log('\n--- Testing Delete Event ---');
  if (eventId) {
    try {
      const deleteEntities = {
        message: `Can you remove the event 'on the go to the bib'?`,
        event_id: eventId // Explicitly pass event_id for LLM extraction
      };
      const deleteResponse = await agentService.delegateTask('delete_event', deleteEntities, userId);
      console.log('GRIM Agent Delete Response:', deleteResponse);
    } catch (error) {
      console.error('Error during GRIM Agent Delete test:', error);
    }
  } else {
    console.warn('Skipping Delete Event test: No Event ID available.');
  }
}

runGrimTests();
