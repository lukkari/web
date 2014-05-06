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
    this.url += '?page=' + options.page;
  }
});

app.ModelView = Backbone.View.extend({
  tagName   : 'li',
  className : 'row',
  template  : $('#modelTemplate').html(),

  render : function () {
    var tmpl = _.template(this.template),
        data = this.model.toJSON();

    var newdata = {
      model : JSON.stringify(data, null, '  ')
    };

    this.$el.html(tmpl(newdata));
    return this;
  }
});

app.ModelsView = Backbone.View.extend({
  el : $('#results'),

  initialize : function (options) {
    options = options || {};

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

    _.each(this.collection.models, function (item) {
      this.renderItem(item);
    }.bind(this), this);

    return this;
  },

  renderItem : function (item) {
    var modelView = new app.ModelView({
      model : item
    });

    this.$el.append(modelView.render().el);
  }
});


module.exports = app;
