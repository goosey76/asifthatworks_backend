const grimAgent = require('../src/services/agents/grim-agent');
const { google } = require('googleapis'); // Import google to mock OAuth2Client

// Note: The new grim agent structure handles mocking internally
// This test script will work with the new structure

// Mock google.auth.OAuth2 to prevent actual authentication attempts
google.auth.OAuth2 = class MockOAuth2Client {
  constructor(clientId, clientSecret, redirectUri) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.credentials = {};
  }
  setCredentials(credentials) {
    this.credentials = credentials;
  }
  on(eventName, callback) {
    // Mock token refresh if needed for specific tests
  }
};

// Mock google.calendar to prevent actual API calls
google.calendar = ({ version, auth }) => ({
  events: {
    list: async (params) => {
      console.log('Mock Google Calendar: events.list called with:', params);
      // Simulate no existing events for duplicate check
      return { data: { items: [] } };
    },
    insert: async (params) => {
      console.log('Mock Google Calendar: events.insert called with:', params);
      // Simulate successful event creation
      return { data: { id: 'mock_event_id', ...params.resource } };
    },
    patch: async (params) => {
      console.log('Mock Google Calendar: events.patch called with:', params);
      return { data: { id: params.eventId, ...params.resource } };
    },
    delete: async (params) => {
      console.log('Mock Google Calendar: events.delete called with:', params);
      return { data: {} };
    }
  }
});

async function testGrimCrud() {
  console.log('--- Grim Agent CRUD Test Interface ---');
  const userId = 'test-user-id'; // Using a static test user ID for direct testing
  const processArgs = process.argv.slice(2);

  if (processArgs.length < 1) {
    console.log('Usage: node testGrimCrud.js <intent> [message]');
    console.log('Intent: create_event, get_event, update_event, delete_event');
    process.exit(1);
  }

  const intent = processArgs[0];
  const message = processArgs[1] || '';

  let entities;
  switch (intent) {
    case 'create_event':
      entities = { message };
      break;
    case 'get_event':
      entities = { message: message || 'get_today' }; // Default to 'today' if no message is provided
      break;
    case 'update_event':
      entities = { message, event_id: 'mock_event_id' }; // Using a mock event_id
      break;
    case 'delete_event':
      entities = { message, event_id: 'mock_event_id' }; // Using a mock event_id
      break;
    default:
      console.log('Invalid intent. Use create_event, get_event, update_event, or delete_event.');
      process.exit(1);
  }

  try {
    const result = await grimAgent.handleEvent(intent, entities, userId);
    console.log('\nGrim Agent Response:', result);
  } catch (error) {
    console.error('\nError testing Grim Agent:', error);
  }
}

testGrimCrud();
