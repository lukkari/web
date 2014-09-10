/**
 * Search(navigation) window view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  SearchSection = require('../collections/searchsection'),

  SearchFiltersView = require('./searchfilters'),
  SearchSectionView = require('./searchsection');


module.exports = Backbone.View.extend({
  template     : templates.searchpage,
  className    : 'navwindow',
  filters : {},
  sections : {},

  events : {
    'click #backBtn' : 'goBack'
  },

  initialize : function (options) {
    options = options || {};

    this.filterString = options.filter;
    this.loadChildren();
    this.header = options.header;

    this.listenTo(this.header, 'filterSections', this.filterSections);
  },

  render : function () {
    this
      .$el
      .html(_.template(this.template, {}, { variable : 'data' }));

    _.invoke(this.subViews, 'render');

    return this;
  },

  /**
   * Filter sections after user typed
   * @param  {Event} e event
   */
  filterSections : function (e) {
    this.filterView(e.currentTarget.value);
  },

  /**
   * Filter search view
   * @param  {String} s filter string
   */
  filterView : function (s) {
    s = s || '';

    _.each(this.sections, function (el) {
      el.filter(s);
    });
  },

  /**
   * Load children to search window:
   *   filters, 3 sections(groups, teachers, rooms)
   */
  loadChildren : function () {
    var
      sections = ['groups', 'teachers', 'rooms'],
      counter = 0;

    //this.filters = new SearchFiltersView();

    _.each(sections, function (el) {

      var section = new SearchSection([], { url : el });

      section.fetch({
        success : (function () {
          this.sections[el] = new SearchSectionView({
            name : el,
            collection : section
          });
          // Append to view
          this.sections[el].setElement(this.$el.find('#' + el)).render();

          counter += 1;
          // when all sections are loaded call filter function
          if(counter == sections.length) this.filterView(this.header.search());

        }).bind(this)
      });

    }, this);

    return this;
  },

  /**
   * Get to previous page
   */
  goBack : function () {
    window.app.router.goBack();
  },

  /**
   * Rewrite remove function to switch header theme first and remove children
   */
  remove : function () {
    _.invoke(this.filters, "remove");
    _.invoke(this.sections, "remove");

    Backbone.View.prototype.remove.apply(this, arguments);
  }

});
