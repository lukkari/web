/**
 * App view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');


var templates = require('../dist/');

var
  HeaderView = require('./header'),
  FooterView = require('./footer'),
  ScheduleView = require('./schedule');

module.exports = Backbone.View.extend({

  template : templates.app,

  initialize : function (options) {
    options = options || {};

    // Init header view
    this.header = new HeaderView();

    // Init footer view
    this.footer = new FooterView();

    // Init schedule view
    this.schedule = new ScheduleView();
  },

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));

    this.assign(this.header, '#appHeader');
    this.assign(this.footer, '#appFooter');

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
  },

  assign : function (view, selector, options) {
    view.setElement(this.$(selector)).render(options);
  }
});
