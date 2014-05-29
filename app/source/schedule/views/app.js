/**
 * App view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');


var templates = require('../dist/');

var
  HeaderView = require('./header'),
  FooterView = require('./footer');

module.exports = Backbone.View.extend({

  template : templates.app,

  initialize : function (options) {
    options = options || {};

    // Init header view
    this.header = new HeaderView({
      app : this
    });

    // Init footer view
    this.footer = new FooterView({
      app : this
    });
  },

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));

    this.header.setElement(this.$el.find('#appHeader')).render();
    this.footer.setElement(this.$el.find('#appFooter')).render();

    return this;
  },

  /**
   * Add html to #content
   * @param  {String} html html-code
   * @return {Object}      this view
   */
  toContent : function (html) {
    this.$el.find('#content').html(html);
    return this;
  }
});
