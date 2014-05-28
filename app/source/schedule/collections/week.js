/**
 * Week collection
 */

var Backbone = require('backbone');

var WeekDay = require('../models/weekday');

module.exports = Backbone.Collection.extend({
  model : WeekDay
});
