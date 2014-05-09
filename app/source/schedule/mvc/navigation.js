var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone'),
  helpers = require('../helpers/');

Backbone.$ = $;

var app = app || {};

// REMOVE!!
var old = {};

/**
 * Link item model
 */
old.ItemLink = Backbone.Model.extend({});

/**
 * Collection of group links
 */
old.GroupList = Backbone.Collection.extend({
  model : app.ItemLink,
  url   : '/api/groups',

  search : function (letters) {
    if(!letters.length) return this.models;

    var pattern = new RegExp(letters, "gi");
    return this.filter(function(data) {
      return data.get("name").match(pattern);
    });
  }
});

/**
 * Collection of teacher links
 */
old.TeacherList = Backbone.Collection.extend({
  model : app.ItemLink,
  url   : '/api/teachers',

  search : function (letters) {
    if(!letters.length) return this.models;

    var pattern = new RegExp(letters, "gi");
    return this.filter(function(data) {
      return data.get("name").match(pattern);
    });
  }
});

/**
 * Link item view
 */
old.ItemLinkView = Backbone.View.extend({
  tagName   : 'ul',
  template  : $('#itemlinkTemplate').html(),

  render : function () {
    var tmpl = _.template(this.template);

    var data = this.model.toJSON();
    data.tourl = data.name.toLowerCase().replace(/\s/g, "_");
    this.$el.html(tmpl(data));
    return this;
  }
});

old.ListView = Backbone.View.extend({

  template : $('#listTemplate').html(),

  events : {
    'click a'     : 'closeList',
    'keyup .text' : 'searchFilter'
  },

  initialize : function (options) {
    options = options || {};

    switch (options.list) {
      case 'group' :
        this.collection = new app.GroupList();
        break;
      case 'teacher' :
        this.collection = new app.TeacherList();
        break;
      default:
        return;
    }

    this.title = options.list;

    var that = this;
    this.collection.fetch({
      success : function () {
        that.render();
      }
    });
  },

  render : function () {
    var that = this;

    var tmpl = _.template(this.template);
    this.$el.html(tmpl({ title : this.title }));

    _.each(this.collection.models, function (item) {
      that.renderItem(item);
    }, this);

    return this;
  },

  renderList : function (data) {
    data = data || [];

    var that = this;

    this.$el.children('.list').empty();
    _.each(data, function (item) {
      that.renderItem(item);
    }, this);

    app.sideBar.setHeight();

    return this;
  },

  renderItem : function (item) {
    var itemLinkView = new app.ItemLinkView({
      model: item
    });
    this.$el.children('.list').append(itemLinkView.render().el);
  },

  closeList : function (e) {
    app.sideBar.close();
  },

  searchFilter : function (e) {
    var letters = this.$el.find('.text').val();
    this.renderList(this.collection.search(letters));
  }
});

/**
 * Search item model (Link item)
 */
app.SearchItemModel = Backbone.Model.extend({});


/**
 * Search item view (Link item)
 */
app.SearchItemView = Backbone.View.extend({
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

  initialize : function (options) {
    options = options || {};

    /**
     * Add section name to url
     *   Ex: groups, teachers, rooms
     */
    this.url += options.name;
  }
});


/**
 * Search section view
 */
app.SearchSectionView = Backbone.View.extend({
  template : $('#searchSectionTemplate').html(),

  initialize : function (options) {
    options = options || {};

    var that = this;

    this.$parent = options.$parent;
    this.name = options.name;

    this.collection = new app.SearchSection({
      name : options.name
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

  render : function () {
    _.each(this.collection.models, function (item) {
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
  template : $('#searchPageTemplate').html(),
  filter : '',
  $parent : $('.globalouter'),

  initialize : function (options) {
    options = options || {};

    this
      .render()
      .loadChildren();
  },

  show : function (options) {
    this.$el.fadeIn('fast');
    return this;
  },

  hide : function () {
    this.$el.hide();
    return this;
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
      .html(tmpl())
      .fadeIn('fast');
    this.$parent.append(this.el);

    return this;
  }

});

module.exports = app;
