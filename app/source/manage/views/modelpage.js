/**
 * Model page view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Page = require('../models/page'),

  SearchView = require('./search'),
  PaginationView = require('./pagination'),
  ModelsView = require('./models');

module.exports = Backbone.View.extend({
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
    this.model = new Page(options.name);
    this.model.fetch({
      success : function () {
        that.setup();
      }
    });

    this.views.models = new ModelsView(options);
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
    this.views.models = new ModelsView({
      name : this.modelName,
      page : this.pageNum
    });
  },

  /**
   * Set up Search view and Pagination view
   */
  setup : function () {
    this.views = {
      search : new SearchView({
        schema  : this.model.attributes.schema
      }),
      pagination : new PaginationView({
        count   : this.model.attributes.count,
        pageNum : this.pageNum,
        url     : '/manage/model/' + this.modelName
      })
    };

    return this;
  }
});
