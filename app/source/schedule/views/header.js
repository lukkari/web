/**
 * Header view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist/');

module.exports = Backbone.View.extend({

  template : templates.header,

  theme : '',

  events : {
    'focus #searchInput' : 'searchFocused',
    'keyup #searchInput' : 'searchFilter'
  },

  initialize : function (options) {},

  render : function () {
    this.$el.html(_.template(this.template, {}, { variable : 'data' }));
    return this;
  },

  /**
   * Trigger when search input is focused and go to search page
   * @param  {Event} e event
   */
  searchFocused : function (e) {
    console.log('focused');
  },

  /**
   * Trigger filter sections when user is typing
   * @param  {Event} e event
   */
  searchFilter : function (e) {
    this.trigger('filterSections', e);
  },

  /**
   * Switch header theme/className
   * @param  {String} type theme name
   */
  goTheme : function (type) {
    if(type && type.length) this.$el.addClass(type);
    else if(this.theme.length) this.$el.removeClass(this.theme);

    this.theme = type;

    return this;
  }

});
