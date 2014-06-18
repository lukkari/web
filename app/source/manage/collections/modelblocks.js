/**
 * Model blocks collection
 */

var Backbone = require('backbone');

var ModelBlock = require('../models/modelblock');

module.exports = Backbone.Collection.extend({
  model : ModelBlock,
  url : '/manage/api/model'
});
