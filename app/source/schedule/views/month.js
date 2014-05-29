/**
 * Calendar month view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

module.exports = Backbone.View.extend({
  tagName : 'table',
  template : templates.month,

  initialize : function (data, options) {
    options = options || {};

    this.monthNum = options.monthNum;
  },

  events : {
    'click tbody tr' : 'goToWeek'
  },

  /**
   * When needed week is click, go to that week
   * @param  {Object} e Event
   */
  goToWeek : function (e) {
    window.app.router.goToWeek(this.$(e.currentTarget).attr('data-week'));
    return this;
  },

  render : function () {
    var tmpl = _.template(this.template);
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  }
});
