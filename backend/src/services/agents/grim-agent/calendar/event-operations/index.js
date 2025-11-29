// Event Operations Module - Index file
// Exports all modular classes for calendar event operations

const SingleEventCreator = require('./single-event-creator');
const MultipleEventCreator = require('./multiple-event-creator');
const EventCrud = require('./event-crud');
const LocationUtils = require('./location-utils');

module.exports = {
  SingleEventCreator,
  MultipleEventCreator,
  EventCrud,
  LocationUtils
};