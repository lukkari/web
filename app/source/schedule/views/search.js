/**
 * Search(navigation) window view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  SearchFiltersView = require('./searchfilters'),
  SearchSectionView = require('./searchsection');

module.exports = Backbone.View.extend({
  template     : templates.searchpage,
  className    : 'navwindow',
  $parent      : $('#content'),
  $searchInput : $('#searchInput'),

  initialize : function (options) {
    options = options || {};

    this
      .render()
      .loadChildren()
      .addEvents();
  },

  show : function () {
    this.$el.fadeIn('fast');
    this.$searchInput.addClass('dark');
    return this;
  },

  hide : function () {
    this.$el.hide();
    this.$searchInput.removeClass('dark');
    return this;
  },

  /**
   * Add events:
   *   - filter window with typing
   */
  addEvents : function () {
    var that = this;
    this.$searchInput.on('keyup', function (e) {
      that.filterView(e.currentTarget.value);
    });

    return this;
  },

  /**
   * Filter search view
   * @param  {String} s filter string
   */
  filterView : function (s) {
    s = s || '';

    this.content.sections.forEach(function (el) {
      el.view.filter(s);
    });
  },

  /**
   * Load children to search window:
   *   filters, 3 sections(groups, teachers, rooms)
   */
  loadChildren : function () {
    var
      options = {
        $parent : this.$el.find('.container')
      },

      sections = ['groups', 'teachers', 'rooms'],

      i;

    this.content = {
      filters  : new SearchFiltersView(options),
      sections : []
    };

    sections.forEach(function (el) {
      var opt = options;
      opt.name = el;

      this.content.sections.push({
        name : el,
        view : new SearchSectionView(opt)
      });

    }.bind(this));

    return this;
  },

  render : function () {
    var tmpl = _.template(this.template);

    this
      .$el
      .html(tmpl());

    this
      .show()
      .$parent
      .append(this.el);

    return this;
  }

});
