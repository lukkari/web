/**
 * Search filter view
 */

var _ = require('underscore');
var Backbone = require('backbone');

var templates = require('../dist');

var SearchFilterView = require('./searchfilter');

module.exports = Backbone.View.extend({
  tagName : 'ul',
  className : 'filters-list clearfix',

  initialize : function (options) {
    options = options || {};

    this.collection.on('sync', this.render, this);
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item) {
      this.$el.append(this.renderItem(item).el);
    }, this);

    return this;
  },

  renderItem : function (item) {
    var filterView = new SearchFilterView({
      model : item
    });

    filterView.on('selectedFilter', this.selectFilter, this);
    filterView.on('hiddenFilter', this.hideFilter, this);

    return filterView.render();
  },

  selectFilter : function (filterId) {
    this.trigger('addFilter', filterId);
  },

  hideFilter : function (filterId) {
    this.trigger('removeFilter', filterId);
  }
});
