/**
 * Subjects collection
 */

var Backbone = require('backbone');

var Subject = require('../models/subject');

module.exports = Backbone.Collection.extend({
  model : Subject,
  url : '/api/user/subject',

  getSubjects : function (text) {
    this.fetch({
      data : {
        key : text
      }
    });
  },

  findById : function (id) {
    return this.find(function (item) {
      return item.get('_id') === id;
    });
  }
});
