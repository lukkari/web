var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    model = require('./model-mvc');

Backbone.$ = $;

var app = app || {};

var modelHelper = {};


/**
 * Search mvc
 */
app.Search = Backbone.Model.extend({});
app.SearchView = Backbone.View.extend({
  template : $('#searchTemplate').html(),
  el : $('#searchBox'),

  events : {
    'click .button' : 'search'
  },

  initialize : function (options) {
    this.model = new app.Search(options);

    this.render();
  },

  render : function () {
    var tmpl = _.template(this.template);

    var data = this.model.toJSON();
    data.fields = Object.keys(data.schema);

    this.$el.empty();
    this.$el.html(tmpl(data));
    return this;
  },

  search : function () {
    console.log('search');
  }
});


/**
 * Pagination mvc
 */
app.Pagination = Backbone.Model.extend({});

app.PaginationItemView = Backbone.View.extend({
  template : $('#paginationTemplate').html(),

  render : function () {
    var tmpl = _.template(this.template);

    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  }
});

app.Paginations = Backbone.Collection.extend({
  model : app.Pagination
});

app.PaginationView = Backbone.View.extend({
  el : $('#pagination'),
  collection : new app.Paginations(),

  initialize : function (options) {
    options = options || {};

    this.limit = +window.app.limit || 10;

    this.pageNum = options.pageNum;
    this.count = options.count;
    this.url = options.url;

    this.build();
  },

  /**
   * Build array of page elements(links) and add them to collection
   */
  build : function () {
    for(var i = 1; i <= this.count/this.limit; i += 1) {
      var paginationItem = new app.Pagination({
        current : i == this.pageNum,
        number  : i,
        url     : this.url
      });
      this.collection.add([paginationItem]);
    }
    this.render();

    return this;
  },

  /**
   * Edit current field in array of models
   * @param  {Integer} i   array element
   * @param  {Boolean} val value to set
   */
  editCurrentInModel : function (i, val) {
    var arr = this.collection.models,
        el;

    if(i > arr.length - 1) return;
    el = arr[i];
    if(el.attributes) el.attributes.current = val;

    return this;
  },

  /**
   * Change current page
   * @param {Integer} page new page number
   */
  set : function (page) {
    page = +page || 1;

    /**
     * Remove previous current page
     */
    this.editCurrentInModel(this.pageNum - 1, false);
    /**
     * Set new current page
     */
    this.pageNum = page;
    this.editCurrentInModel(this.pageNum - 1, true);

    this.render();
  },

  render : function () {
    var that = this;

    this.$el.empty();
    _.each(this.collection.models, function (item) {
      that.$el.append(that.renderItem(item));
    });
    return this;
  },

  renderItem : function (item) {
    var paginationitemView = new app.PaginationItemView({
      model : item
    });
    return paginationitemView.render().el;
  }
});


/**
 * Page mvc
 */
app.Page = Backbone.Model.extend({
  urlRoot : '',

  initialize : function (name) {
    name = name || '';

    this.urlRoot = '/manage/api/model/' + name + '/config';
  }
});

app.PageView = Backbone.View.extend({
  views : {},
  $modelName : $('#modelName'),

  initialize : function (options) {
    options = options || {};

    var that = this;

    this.modelName = options.name;
    this.$modelName.text(options.name);
    this.pageNum = options.page;

    /**
     * Get current model configurations:
     *   schema, count and name
     */
    this.model = new app.Page(options.name);
    this.model.fetch({
      success : function () {
        that.setup();
      }
    });

    this.views.models = new model.ModelsView(options);
  },

  /**
   * Load new page of the same model
   * @param  {Integer} page new page number
   */
  load : function (page) {
    page = +page || 1;

    this.pageNum = page;

    /**
     * Set new current page in pagination
     */
    this.views.pagination.set(this.pageNum);

    /**
     * Set new page content
     */
    this.views.models = new model.ModelsView({
      name : this.modelName,
      page : this.pageNum
    });
  },

  /**
   * Set up Search view and Pagination view
   */
  setup : function () {
    this.views = {
      search : new app.SearchView({
        schema  : this.model.attributes.schema
      }),
      pagination : new app.PaginationView({
        count   : this.model.attributes.count,
        pageNum : this.pageNum,
        url     : '/manage/model/' + this.modelName
      })
    };

    return this;
  }
});


module.exports = app;
