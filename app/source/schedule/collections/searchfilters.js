/**
 * Search filters collection
 */

var Backbone = require('backbone');

var SearchFilter = require('../models/searchfilter');

module.exports = Backbone.Collection.extend({
  model : SearchFilter,
  url : '/api/filters'
});
