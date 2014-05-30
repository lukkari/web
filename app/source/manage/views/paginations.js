/**
 * Pagination view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Pagination = require('../models/pagination'),
  Paginations = require('../collections/paginations'),
  PaginationItemView = require('./paginationitem');


module.exports = Backbone.View.extend({
  el : $('#pagination'),
  collection : new Paginations(),

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
    for(var i = 1; i <= Math.ceil(this.count/this.limit); i += 1) {
      var paginationItem = new Pagination({
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
    var paginationitemView = new PaginationItemView({
      model : item
    });
    return paginationitemView.render().el;
  }
});
