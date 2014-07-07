/**
 * Dashboard view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

module.exports = Backbone.View.extend({

  initialize : function (options) {
    options = options || {};

    this.subviews = _.extend({}, options.subviews);
  },

  render : function () {
    //_.invoke(this.subviews, 'render');

    _.each(this.subviews, function (subview) {
      this.$el.append(subview.render().el);
    }, this);

    return this;
  },

  remove : function () {
    _.invoke(this.subviews, 'remove');
    this.subviews = {};

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});
