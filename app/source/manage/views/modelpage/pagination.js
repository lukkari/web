/**
 * Pagination view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Pagination = require('../../models/pagination'),
  Paginations = require('../../collections/paginations'),
  PaginationItemView = require('./paginationitem');


module.exports = Backbone.View.extend({
  className : 'pagination',
  tagName : 'ul',

  initialize : function (options) {
    options = options || {};

    options.limit = +window.app.limit || 10;

    this.collection = new Paginations(this.buildModels(options));
  },

  /**
   * Makes an array of Pagination models
   * @return {Array} models
   */
  buildModels : function (params) {
    var
      defaults = {
        count : 0,
        limit : 1,
        pageNum : 0,
        url : '#'
      },
      models = [];

    _.defaults(params, defaults);

    for(var i = 1; i <= Math.ceil(params.count/params.limit); i += 1) {
      models.push(new Pagination({
        current : i == params.pageNum,
        number  : i,
        url     : params.url
      }));
    }

    return models;
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item) {
      this.$el.append(this.renderItem(item));
    }, this);

    return this;
  },

  renderItem : function (item) {
    var paginationitemView = new PaginationItemView({
      model : item
    });
    return paginationitemView.render().el;
  }
});
