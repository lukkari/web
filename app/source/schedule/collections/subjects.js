/**
 * Subjects collection
 */

var Backbone = require('backbone');

var Subject = require('../models/subject');

module.exports = Backbone.Collection.extend({
  model : Subject,
  url : '/api/user/subject'
});
