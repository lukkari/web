/**
 * Search section view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  SearchSection = require('../collections/searchsection'),

  SearchItemView = require('../views/searchitem');


module.exports = Backbone.View.extend({
  template : templates.searchsection,

  initialize : function (options) {
    options = options || {};

    this.name = options.name;
  },

  render : function (list) {
    var tmpl = _.template(this.template, { variable : 'data' });

    this.$el.html(tmpl({ name : this.name.capitalize() }));
    this.$el.find('ul').empty();

    if(!Array.isArray(list)) list = this.collection.models;

    _.each(list, function (item) {
      this.renderItem(item);
    }, this);

    return this;
  },

  renderItem : function (item) {
    var searchItemView = new SearchItemView({
      model: item
    });

    this
      .$el
      .find('ul')
      .append(searchItemView.render().el);

    return this;
  },

  /**
   * Filter section
   */
  filter : function (filters, search) {
    this.render(this.collection.byFiltersAndSearch(filters, search));
    return this;
  }
});
