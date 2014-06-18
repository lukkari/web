/**
 * Model blocks view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var template = require('../dist/');

module.exports = Backbone.View.extend({
  template : template.modelblocks
});
