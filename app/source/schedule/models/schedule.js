/**
 * Schedule model
 *   includes week number, current group/teacher/room
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot : '/api/schedule/',

  initialize : function (data, options) {
    options = options || {};
    this.urlRoot += options.url;
  },

  getDays : function () {
    return this.get('weekdays');
  },

  getTitle : function () {
    return this.get('title');
  }
});
