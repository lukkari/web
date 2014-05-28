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
   * Search models in collection by string
   * @param  {String} letters filter string
   * @return {Array}          found models
   */
  search : function (letters) {
    if(!letters.length) return this.models;

    var pattern = new RegExp(letters, "gi");
    return this.filter(function(data) {
      return data.get("name").match(pattern);
    });
  }
});
