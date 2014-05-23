var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone'),
  helpers = require('../helpers/');

Backbone.$ = $;

var app = app || {};


/**
 * Search item model (Link item)
 */
app.SearchItemModel = Backbone.Model.extend({});


/**
 * Search item view (Link item)
 */
app.SearchItemView = Backbone.View.extend({
  tagName  : 'li',
  template : $('#searchItemTemplate').html(),

  render : function () {
    var tmpl = _.template(this.template);

    var data = this.model.toJSON();
    data.url = data.name.toUrl();

    this
      .$el
      .html(tmpl(data));

    return this;
  }
});


/**
 * Search section collection (Links list)
 */
app.SearchSection = Backbone.Collection.extend({
  model : app.SearchItemModel,
  url : '/api/',

  initialize : function (data, options) {
    options = options || {};

    /**
     * Add section name to url
     *   Ex: groups, teachers, rooms
     */
    this.url += options.url;
  },

  /**
   * Search models in collection by string
   * @param  {String} letters filter string
   * @return {Array}          found models
   */
  search : function (letters) {
    if(!letters.length) return this.models;

    var pattern = new RegExp(letters, "gi");
    return this.filter(function(data) {
      return data.get("name").match(pattern);
    });
  }
});


/**
 * Search section view
 */
app.SearchSectionView = Backbone.View.extend({
  tagName  : 'section',
  template : $('#searchSectionTemplate').html(),

  initialize : function (options) {
    options = options || {};

    var that = this;

    this.$parent = options.$parent;
    this.name = options.name;

    this.collection = new app.SearchSection([], {
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
    var searchItemView = new app.SearchItemView({
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


/**
 * Search filter model
 */
app.SearchFilterModel = Backbone.Model.extend({});


/**
 * Search filter view
 */
app.SearchFilterView = Backbone.View.extend({
  template : $('#searchFilterTemplate').html()
});


/**
 * Search filters collection
 */
app.SearchFilters = Backbone.Collection.extend({
  model : app.SearchFilterModel,
  url : '/api/filters'
});


app.SearchFiltersView = Backbone.View.extend({
  template : $('#searchFilterTemplate').html(),

  initialize : function (options) {
    options = options || {};
    this.$parent = options.$parent;
  }
});

/**
 * Search(navigation) window view
 */
app.SearchView = Backbone.View.extend({
  template     : $('#searchPageTemplate').html(),
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
      filters  : new app.SearchFiltersView(options),
      sections : []
    };

    sections.forEach(function (el) {
      var opt = options;
      opt.name = el;

      this.content.sections.push({
        name : el,
        view : new app.SearchSectionView(opt)
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

module.exports = app;
