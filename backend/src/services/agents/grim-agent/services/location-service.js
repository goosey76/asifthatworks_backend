// agent-service/location-service.js

/**
 * Location service for searching places using SerpAPI
 */

/**
 * Uses SerpAPI to search for a given location query
 * @param {string} query - The location search query
 * @param {Function} fetch - The fetch function to use for HTTP requests
 * @returns {Promise<string|null>} The best match for the location, or null if no match is found
 */
async function searchLocation(query, fetch) {
  if (!query) {
    console.log('No location search query provided. Skipping SerpAPI search.');
    return null;
  }

  console.log(`Searching for location: "${query}" using SerpAPI...`);
  const serpApiKey = process.env.SERPAPI_KEY;
  if (!serpApiKey) {
    console.error('SERPAPI_KEY is not set in the environment variables.');
    return null;
  }

  const serpApiUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;
  try {
    const response = await fetch(serpApiUrl);
    const data = await response.json();
    if (data.error) {
      console.error('SerpAPI error:', data.error);
      return null;
    }
    const results = data.local_results;
    if (results && results.length > 0) {
      const bestMatch = results[0]; // Use the first (best) result
      console.log('SerpAPI result:', bestMatch);
      return bestMatch.title; // Return the title of the best match
    } else {
      console.log('No results found from SerpAPI.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching from SerpAPI:', error);
    return null;
  }
}

module.exports = {
  searchLocation
};