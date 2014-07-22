/**
 * Parses collection
 */

var Backbone = require('backbone');

var Parse = require('../models/parse');

module.exports = Backbone.Collection.extend({
  model : Parse,
  url : '/manage/api/parse'
});
