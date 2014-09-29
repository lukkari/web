/**
 * Now schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var
  WeekDay = require('../../models/weekday'),
  WeekDayView = require('../weekday');

module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  subviews : {},

  initialize : function (options) {
    options = options || {};

    this.subviews.weekday = new WeekDayView({
      model : this.model
    });
  },

  render : function (options) {
    var tmpl = _.template(this.template, { variable : 'data' });
    // Render template
    this.$el.html(tmpl(this.model.getDefaults(true)));
    // Render days(week)
    //this.views.week.setElement(this.$el.find('#days')).render();
    this.$el.find('#days').html(this.subviews.weekday.render().el);

    return this;
  },

  remove : function () {}
});
