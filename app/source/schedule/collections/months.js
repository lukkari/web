/**
 * Calendar months collection
 */

var Backbone = require('backbone');

var Month = require('../models/month');

module.exports = Backbone.Collection.extend({
  model : Month
});
