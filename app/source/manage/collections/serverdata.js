/**
 * Server data collection
 */

var Backbone = require('backbone');

var ServerDataItem = require('../models/serverdataitem');

module.exports = Backbone.Collection.extend({
  model : ServerDataItem,
  url : '/manage/api/serverdata'
});
