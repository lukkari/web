/**
 * Section view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({
  template : templates.section,

  initialize : function (options) {
    options = options || {};

    this.params = this.options;

    console.log(this);
  },

  render : function () {
    this.$el.html(_.template(this.template,
                            {
                              title : this.params.title,
                              className : this.params.className
                            },
                            { variable : 'data' }));

    _.each(this.collection, function (item) {
      this.renderItem(item);
    }, this);

    return this;
  },

  renderItem : function (item) {

    return this;
  }
});
