/**
 * Calendar month view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({

  tagName : 'table',
  template : templates.month,

  events : {
    'click tbody tr' : 'goToWeek'
  },

  /**
   * Navigate to selected week
   * @param  {Object} e Event
   */
  goToWeek : function (e) {
    window.app.router.goToWeek(this.$(e.currentTarget).attr('data-week'));
    return this;
  },

  render : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    this.$el.html(tmpl(this.model.toJSON()));
    return this;
  }
});
