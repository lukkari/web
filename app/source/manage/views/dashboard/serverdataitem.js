/**
 * Server data item view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var template = require('../../dist/');

module.exports = Backbone.View.extend({

  template : template.serverdataitem,
  tagName : 'li',

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
