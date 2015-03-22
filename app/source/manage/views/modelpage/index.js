/**
 * Model page view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  SearchView = require('./search'),
  PaginationView = require('./pagination'),
  ModelsView = require('./models');

module.exports = Backbone.View.extend({
  subviews : {},
  className : 'modellist',

  initialize : function (options) {
    options = options || {};

    this.modelName = options.name;
    this.pageNum = options.page;
    this.model = options.model;

    this.subviews = {
      search : new SearchView({
        schema  : this.model.get('schema'),
        name    : this.model.get('name'),
        query   : options.query
      }),

      models : new ModelsView(options),

      pagination : new PaginationView({
        count   : this.model.get('count'),
        pageNum : this.pageNum,
        url     : '/model/' + this.modelName
      })
    };
  },

  render : function () {
    this.$el.empty();

    _.each(this.subviews, function (subview) {
      this.$el.append(subview.render().el);
    }, this);

    return this;
  },

  remove : function () {
    _.invoke(this.subviews, 'remove');
    this.subviews = {};

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});
