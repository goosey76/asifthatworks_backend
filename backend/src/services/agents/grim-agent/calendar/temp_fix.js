const ResponseRandomizer = require('../../response-randomizer');
const calendarUtils = require('./calendar-utils');
const { searchLocation } = require('../services/location-service');

// Add ResponseRandomizer to constructor
sed -i '' 's/constructor(googleCalendarClient) {/constructor(googleCalendarClient) {\
    this.responseRandomizer = new ResponseRandomizer();/' event-operations.js

// Replace hardcoded Grim comments with randomized ones
sed -i '' 's/grimComment = '\''Your schedule is clear. Use this time wisely, Sir.'\'';/grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);/' event-operations.js
sed -i '' 's/grimComment = '\''A light day. Perfect for focused work.'\'';/grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);/' event-operations.js
sed -i '' 's/grimComment = '\''A balanced day ahead. Stay organized.'\'';/grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);/' event-operations.js
sed -i '' 's/grimComment = '\''A packed schedule. Efficiency will be your ally.'\'';/grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);/' event-operations.js
sed -i '' 's/grimComment = '\''Time to make the most of an open schedule.'\'';/grimComment = this.responseRandomizer.getContextualGrimComment(allEvents);/' event-operations.js

echo "GRIM agent updated with ResponseRandomizer integration"
