// Location utility module
const { searchLocation } = require('../../services/location-service');

/**
 * Location utility for event operations
 */
class LocationUtils {
  /**
   * Handles location search using SerpAPI
   * @param {string} locationSearchQuery - The location search query
   * @param {Function} fetch - Fetch function for HTTP requests
   * @returns {Promise<string|null>} The found location or null
   */
  async searchLocation(locationSearchQuery, fetch) {
    return await searchLocation(locationSearchQuery, fetch);
  }
}

module.exports = LocationUtils;