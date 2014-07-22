/**
 * Link list view
 */

var
  Backbone = require('backbone'),
  _ = require('underscore');

var LinkItemView = require('./linkItem');

module.exports = Backbone.View.extend({
  tagName : 'ul',
  className : 'link-list',

  initialize : function (options) {
    options = options || {};

    this.collection = options.collection;
  },

  render : function () {
    this.$el.empty();
    _.each(this.collection.models, function (el) {
      this.$el.append(this.renderItem(el).el);
    }, this);

    return this;
  },

  renderItem : function (el) {
    var linkItemView = new LinkItemView({
      model : el
    });

    return linkItemView.render();

  }
});
