/**
 * Models view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Models = require('../../collections/models'),

  ModelView = require('./model');


module.exports = Backbone.View.extend({
  tagName : 'ul',

  initialize : function (options) {
    options = options || {};

    this.limit = +window.app.limit || 10;
    this.page = +options.page;
    options.limit = this.limit;
    this.collection = new Models([], {
      name : options.name
    });

    this.collection.fetch({
      data :  {
        page  : this.page,
        limit : this.limit
      },

      success : (function () {
        this.render();
      }).bind(this)
    });
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item, i) {
      // Find item's global index
      this.renderItem(item, (this.page - 1) * this.limit + (i+1));
    }, this);

    return this;
  },

  renderItem : function (item, i) {
    var modelView = new ModelView({
      model : item,
      index : i
    });

    this.$el.append(modelView.render().el);
  }
});
