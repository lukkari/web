/**
 * Messages collection
 */

var Backbone = require('backbone');

var Message = require('../models/message');

module.exports = Backbone.Collection.extend({
  model : Message,
  url : '/manage/api/message'
});
