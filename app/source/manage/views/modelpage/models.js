/**
 * Models view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');


module.exports = Backbone.View.extend({

  initialize : function (options) {
    options = options || {};

    this.limit = +window.app.limit || 10;
    this.page = +options.page;
    options.limit = this.limit;
    this.collection = new app.Models([], options);

    var that = this;
    this.collection.fetch({
      data :  {
        page  : this.page,
        limit : this.limit
      },

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
