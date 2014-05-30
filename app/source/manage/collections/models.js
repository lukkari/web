/**
 * Models
 */

var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
  model : app.Model,
  url   : '/manage/api/model/',

  initialize : function (data, options) {
    options = options || {};

    this.url += options.name;
  }
});
