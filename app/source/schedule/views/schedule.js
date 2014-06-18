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

    this.views = {
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
    this.views.calendar.setElement(this.$el.find('#calendar')).render();

    this.views.week = new WeekView(this.model.getDays());
    this.views.weekbar.setWeek(options);
    this.views.calendar.setWeek(options);

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.views.weekbar.render().el);

    // Render days(week)
    this.views.week.setElement(this.$el.find('#days')).render();

    return this;
  },

  remove : function () {}
});
