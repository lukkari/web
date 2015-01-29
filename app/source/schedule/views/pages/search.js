/**
 * Search(navigation) window view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var
  SearchSection = require('../../collections/searchsection'),
  SearchFilters = require('../../collections/searchfilters'),

  SearchFiltersView = require('../searchfilters'),
  SearchSectionView = require('../searchsection');


module.exports = Backbone.View.extend({
  template : templates.searchpage,
  className : 'navwindow',
  filterView : null,
  filters : [], // Filters to show
  sections : {},
  search : '',

  events : {
    'click #backBtn' : 'goBack'
  },

  initialize : function (options) {
    options = options || {};

    this.filterString = options.filter;
    this.loadFilters();
    this.loadChildren();
    this.header = options.header;

    this.header.on('filterBySearch', this.filterBySearch, this);
    this.filterView.on('addFilter', this.addFilter, this);
    this.filterView.on('removeFilter', this.removeFilter, this);
  },

  render : function () {
    this.$el.html(_.template(this.template, { variable : 'data' }));

    this.$el.find('#filters').html(this.filterView.render().el);

    return this;
  },

  /**
   * Filter sections
   */
  filterSections : function (filters, search) {
    _.each(this.sections, function (section) {
      section.filter(filters, search);
    });
  },

  /**
   * Filter search view
   * @param  {String} s filter string
   */
  filterBySearch : function (s) {
    this.search = s || '';
    this.filterSections(this.filters, this.search);
  },

  filterByFilters : function () {
    this.filterSections(this.filters, this.search);
  },

  /**
   * Load filters
   */
  loadFilters : function () {
    var filters = new SearchFilters();
    filters.fetch();
    this.filterView = new SearchFiltersView({ collection : filters });

    return this;
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
          if(counter === sections.length) {
            this.filterSections(this.filters, this.header.search());
          }

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

  addFilter : function (filterId) {
    var index = this.filters.indexOf(filterId);
    if(index > -1) return;
    this.filters.push(filterId);
    this.filterByFilters();
  },

  removeFilter : function (filterId) {
    var index = this.filters.indexOf(filterId);
    if(index === -1) return;
    this.filters.splice(index, 1);
    this.filterByFilters();
  },

  /**
   * Rewrite remove function to switch header theme first and remove children
   */
  remove : function () {
    if(this.filterView) this.filterView.remove();
    _.invoke(this.sections, "remove");

    Backbone.View.prototype.remove.apply(this, arguments);
  }

});
