/**
 * Apps list view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var AppItemView = require('./item.js');

module.exports = Backbone.View.extend({

  className : 'list',
  tagName : 'ul',

  initialize : function (options) {
    options = options || {};

    this.collection.on('sync', this.render, this);
    this.collection.on('add', this.render, this);
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item, index) {
      this.$el.append(this.renderItem(item, index));
    }, this);

    return this;
  },

  renderItem : function (item, index) {
    var itemView = new AppItemView({
      model : item
    });

    itemView.on('removed', function () {
      console.log('removed');
    });

    return itemView.render().el;
  }
});
