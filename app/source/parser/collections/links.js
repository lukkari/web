/**
 * Links collection
 */

var Backbone = require('backbone');

var Link = require('../models/link');

module.exports = Backbone.collection.extend({
  model : Link,
  url : '/manage/api/parses'
});
