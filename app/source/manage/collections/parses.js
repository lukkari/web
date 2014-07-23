/**
 * Parses collection
 */

var Backbone = require('backbone');

var Parse = require('../models/parse');

module.exports = Backbone.Collection.extend({
  model : Parse,
  url : '/manage/api/parse',

  /**
   * Sort collection by time added in descent order
   * @param  {Object}  m Model
   * @return {Integer}   comparator
   */
  comparator : function (m) {
    var d = new Date(m.get('createdAt'));
    return -d.getTime();
  }
});
