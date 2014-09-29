/**
 * Message view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var template = require('../../dist/');

module.exports = Backbone.View.extend({

  template : template.message,
  tagName : 'li',

  initialize : function (options) {
    options = options || {};

    this.model = options.model;
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  }
});
