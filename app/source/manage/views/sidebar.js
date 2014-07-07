/**
 * Sidebar view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../dist');

module.exports = Backbone.View.extend({

  template : templates.sidebar,

  initialize : function (options) {},

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));
    return this;
  }
});
