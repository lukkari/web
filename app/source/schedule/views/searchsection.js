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
  tagName  : 'section',
  template : templates.searchsection,

  initialize : function (options) {
    options = options || {};

    var that = this;

    this.$parent = options.$parent;
    this.name = options.name;

    this.collection = new SearchSection([], {
      url : options.name
    });

    this.collection.fetch({
      success : function () {
        that.render();
      }
    });

    this.preRender();
  },

  /**
   * Show sections before content is loaded
   */
  preRender : function () {
    var tmpl = _.template(this.template);
    this
      .$el
      .html(tmpl({ name : this.name.capitalize() }));

    this.$parent.append(this.$el);

    return this;
  },

  render : function (list) {
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
