const grimAgent = require('../src/services/agents/grim-agent');
const readline = require('readline');
const { google } = require('googleapis'); // Import google to mock OAuth2Client

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Mock Supabase client for testing grimAgent directly
const mockSupabase = {
  from: (tableName) => ({
    select: (columns) => ({
      eq: (column, value) => {
        // Return 'this' to allow chaining of multiple .eq() calls
        return {
          eq: (nextColumn, nextValue) => ({
            single: async () => {
              if (tableName === 'integrations' && column === 'user_id' && value === 'test-user-id' && nextColumn === 'provider' && nextValue === 'google_calendar') {
                // Return mock Google Calendar credentials
                return {
                  data: {
                    credentials: {
                      access_token: 'mock_access_token',
                      refresh_token: 'mock_refresh_token',
                      expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
                    }
                  },
                  error: null
                };
              }
              return { data: null, error: { message: 'Mock Supabase: Not found' } };
            }
          })
        };
      }
    })
  })
};

// Override grimAgent's supabase client with the mock
const mockFetch = async (url) => {
  console.log('Mocking fetch for SerpAPI request:', url);
  if (url.includes('serpapi.com')) {
    // Return a mock response that mimics a successful SerpAPI response
    return {
      json: async () => ({
        local_results: [
          {
            title: 'Mock Location from SerpAPI: University Library',
            address: 'Unter den Linden 6, 10117 Berlin, Germany',
          }
        ]
      })
    };
  } else {
    // Fallback for other fetch calls
    return {
      json: async () => ({ error: 'Mock fetch: unknown URL' })
    };
  }
};

// Create the grimAgent instance with the mock clients and fetch
// Note: The new grimAgent structure doesn't need mockSupabase and mockFetch parameters

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

async function testGrimAgent() {
  console.log('--- Grim Agent Direct Test Interface ---');
  console.log('Enter a message to create a Google Calendar event (e.g., "Create an event titled Installing Grim in the bib from 10:50 am to 11:30").');
  console.log('NOTE: Google Calendar and Supabase API calls are MOCKED in this test script. SerpAPI is also mocked.');

  const message = await askQuestion('Your message: ');

  const userId = 'test-user-id'; // Using a static test user ID for direct testing

  const entities = {
    message: message,
    // The grimAgent's LLM extraction will parse the details from the 'message'
  };

  console.log('\nSimulating intent: create_event');
  console.log('Entities (initial, details will be extracted by LLM):', entities);

  try {
    const result = await grimAgent.handleEvent('create_event', entities, userId);
    console.log('\nGrim Agent Response:', result);
  } catch (error) {
    console.error('\nError testing Grim Agent:', error);
  } finally {
    rl.close();
  }
}

testGrimAgent();
