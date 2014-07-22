/**
 * Link item view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var templates = require('../../dist/');

module.exports = Backbone.View.extend({
  tagName : 'li',

  template : templates.linkItem,

  initialize : function (options) {
    options = options || {};

    this.model = options.model;
  },

  render : function () {
    this.$el.html(_.template(this.template,
                             this.model.toJSON(),
                             { variable : 'data' }));

    return this;
  }
});
