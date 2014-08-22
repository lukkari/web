/**
 * Schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  CalendarView = require('./calendar'),
  WeekBarView = require('./weekbar'),
  WeekView = require('./week');


module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  initialize : function (options) {
    options = options || {};

    this.subviews = {
      calendar : new CalendarView(options),
      weekbar  : new WeekBarView(options)
    };
  },

  render : function (options) {
    // Render template
    this
      .$el
      .html(_.template(this.template,
                       this.model.getDefaults(),
                       { variable : 'data' }));

    // Render calendar
    this.subviews.calendar.setElement(this.$el.find('#calendar')).render();

    this.subviews.week = new WeekView(this.model.getDays());
    this.subviews.weekbar.setWeek(options);
    this.subviews.calendar.setWeek(options);

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.subviews.weekbar.render().el);

    // Render days(week)
    this.subviews.week.setElement(this.$el.find('#days')).render();

    return this;
  },

  remove : function () {}
});
