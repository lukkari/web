/**
 * Front page view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({
  className : 'mainpage',
  template : templates.frontpage,

  initialize : function () {},

  render : function () {
    this
      .$el
      .html(_.template(this.template, {}, { variable : 'data' }))
      .fadeIn('fast');

    return this;
  }
});
