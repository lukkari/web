/**
 * Models collection
 */

var Backbone = require('backbone');

var Model = require('../models/model');

module.exports = Backbone.Collection.extend({
  model : Model,
  url   : '/manage/api/model/',

  initialize : function (data, options) {
    options = options || {};

    this.url += options.name;
  }
});
