/**
 * Apps collection
 */

var Backbone = require('backbone');

var App = require('../models/app');

module.exports = Backbone.Collection.extend({
  model : App,
  url : '/manage/api/app'
});
