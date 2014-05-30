/**
 * Model
 */

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  initialize : function () {
    this.urlRoot = this.url() + '/' + this.attributes._id;
  }
});
