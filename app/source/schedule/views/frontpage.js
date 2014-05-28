/**
 * Front page view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var FrontPage = require('../models/frontpage');

module.exports = Backbone.View.extend({
  className : 'mainpage',
  errTmpl  : $('#errorTemplate').html(),
  $parent  : $('#content'),

  initialize : function () {
    var that = this;

    this.model = new FrontPage();
    this.model.fetch({
      success : function () {
        that.render();
      },

      error : function () {
        that.handleError();
      }
    });
  },

  hide : function () {
    this.$el.hide();
    return this;
  },

  show : function () {
    this.$el.fadeIn('fast');
    return this;
  },

  render : function () {
    this
      .$el
      .html(this.model.attributes.data)
      .fadeIn('fast');
    this.$parent.append(this.el);
    return this;
  },

  /**
   * Handle error page (show error template)
   */
  handleError : function () {
    var tmpl = _.template(this.errTmpl),
        msg  = {
          error : 'Cannot load resource, try reloading page'
        };

    this
      .$el
      .html(tmpl(msg))
      .fadeIn('fast');
    this.$parent.append(this.el);

    return this;
  }
});
