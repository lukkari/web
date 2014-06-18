/**
 * Manage page view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

var ModelBlocksView = require('./modelblocks');

module.exports = Backbone.View.extend({

  template : templates.managepage,

  subviews : {},

  initialize : function (options) {
    options = options || {};

    this.subviews = _.extend({}, options.subviews);
  },

  render : function () {
    this.$el.html(_.template(this.template,
                             {},
                             { variable : 'data' }));

    _.invoke(this.subviews, 'render');

    return this;
  },

  remove : function () {
    _.invoke(this.subviews, 'remove');
    this.subviews = {};

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});
