/**
 * Search section collection (Links list)
 */

var Backbone = require('backbone');

var SearchItem = require('../models/searchitem');

module.exports = Backbone.Collection.extend({
  model : SearchItem,
  url : '/api/',

  initialize : function (data, options) {
    options = options || {};

    /**
     * Add section name to url
     *   Ex: groups, teachers, rooms
     */
    this.url += options.url;
  },

  /**
   * Filter collection by filters array and search string
   */
  byFiltersAndSearch : function (filters, search) {
    if(!filters.length) return [];

    var pattern = new RegExp(search, "gi");
    return this.filter(function (model) {
      return (
        filters.indexOf(model.get('filter')) !== -1 &&
        model.get("name").match(pattern)
      );
    });
  }
});
