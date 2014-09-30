/**
 * Unknown page view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({

  template : templates.unknownpage,

  render : function () {
    this.$el.html(_.template(this.template, { variable : 'data' }));

    return this;
  },

  remove : function () {
    this.$el.empty();
    this.undelegateEvents();
  }
});
