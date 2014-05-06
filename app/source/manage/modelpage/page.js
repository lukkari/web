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

  initialize : function (options) {
    this.model = new app.Search(options);
  },

  render : function () {
    return this;
  }
});


/**
 * Pagination mvc
 */
app.Pagination = Backbone.Model.extend({});

app.PaginationItemView = Backbone.View.extend({
  template : $('#paginationTemplate').html(),

  events : {
    'click a' : 'goToPage'
  },

  render : function () {
    var tmpl = _.template(this.template);

    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

  goToPage : function (e) {
    e.preventDefault();

    console.log(e);
  }


});

app.Paginations = Backbone.Collection.extend({
  model : app.Pagination
});

app.PaginationView = Backbone.View.extend({
  el : $('#pagination'),
  limit : 10,
  collection : new app.Paginations(),

  initialize : function (options) {
    options = options || {};

    this.content = options.content;
    this.pageNum = options.pageNum;
    this.count = options.count;
    this.url = options.url;

    this.build();
  },

  build : function () {
    for(var i = 0; i < this.count/this.limit; i += 1) {
      var paginationItem = new app.Pagination({
        current : (i + 1) == this.pageNum,
        number  : i + 1,
        url     : this.url
      });
      this.collection.add([paginationItem]);
    }
    this.render();

    return this;
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

  initialize : function (options) {
    options = options || {};

    var that = this;
    this.model = new app.Page(options.name);
    this.modelName = options.name;
    this.pageNum = options.page;
    this.model.fetch({
      success : function () {
        that.render();
      }
    });
    this.views.models = new model.ModelsView(options);
  },

  render : function () {
    this.views = {
      search : new app.SearchView({
        schema  : this.model.attributes.schema,
        content : this.views.models
      }),
      pagination : new app.PaginationView({
        count   : this.model.attributes.count,
        pageNum : this.pageNum,
        content : this.views.models,
        url     : '/manage/model/' + this.modelName
      })
    };

    return this;
  }
});


module.exports = app;
