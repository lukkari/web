/**
 * Pagination item view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({
  template : templates.paginationitem,

  render : function () {
    this.$el.html(_.template(this.template, this.model.toJSON(), { variable : 'data' }));
    return this;
  }
});
