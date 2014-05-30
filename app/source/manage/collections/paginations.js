/**
 * Paginations collection
 */

var Backbone = require('backbone');

var Pagination = require('../models/pagination');

module.exports = Backbone.Collection.extend({
  model : Pagination
});
