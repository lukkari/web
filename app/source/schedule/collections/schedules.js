/**
 * Schedules collection
 *   used to save all fetched schedules from the server
 */

var Backbone = require('backbone');

var Schedule = require('../models/schedule');

module.exports = Backbone.Collection.extend({
  model : Schedule,

  /**
   * Finds model for a current query
   * @param  {String} query query string
   * @return {Array}       found model or empty array
   */
  getByQuery : function (query) {
    query = query || {};

    return this.filter(function (data) {
      return data.urlRoot === '/api/schedule/' + query;
    });
  }
});
