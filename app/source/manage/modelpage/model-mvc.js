var $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone');

Backbone.$ = $;

var app = app || {};

var modelHelper = {};

app.Model = Backbone.Model.extend({});

app.Models = Backbone.Collection.extend({
  model : app.Model,
  url   : '/manage/api/model/',

  initialize : function (options) {
    options = options || {};

    this.url += options.name;
    this.url += '?page=' + options.page + '&limit=' + options.limit;
  }
});

app.ModelView = Backbone.View.extend({
  tagName   : 'li',
  className : 'row',
  template  : $('#modelTemplate').html(),

  initialize : function (options) {
    options = options || {};

    this.index = +options.index || 1;
  },

  render : function () {
    var tmpl = _.template(this.template),
        data = this.model.toJSON();

    var newdata = {
      model : JSON.stringify(data, null, '  '),
      index : this.index
    };

    this.$el.html(tmpl(newdata));
    return this;
  }
});

app.ModelsView = Backbone.View.extend({
  el : $('#results'),

  initialize : function (options) {
    options = options || {};

    this.limit = +window.app.limit || 10;
    this.page = +options.page;
    options.limit = this.limit;
    this.collection = new app.Models(options);

    var that = this;
    this.collection.fetch({
      success : function () {
        that.render();
      }
    });
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item, i) {
      this.renderItem(item, (this.page - 1) * this.limit + (i+1));
    }.bind(this), this);

    return this;
  },

  renderItem : function (item, i) {
    var modelView = new app.ModelView({
      model : item,
      index : i
    });

    this.$el.append(modelView.render().el);
  }
});


module.exports = app;
