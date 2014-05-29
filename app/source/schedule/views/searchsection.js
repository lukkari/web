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
    this
      .$el
      .html(_.template(this.template,
                      { name : this.name.capitalize() },
                      { variable : 'data' }));


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
   * @param  {String} s filter string
   */
  filter : function (s) {
    s = s || '';
    this.render(this.collection.search(s));
    return this;
  }
});
