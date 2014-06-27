/**
 * Footer view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({

  template : templates.footer,

  initialize : function (options) {},

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));
    return this;
  }

});
