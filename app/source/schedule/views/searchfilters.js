/**
 * Search filter view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

module.exports = Backbone.View.extend({
  template : templates.searchfilter,

  initialize : function (options) {
    options = options || {};
  }
});
