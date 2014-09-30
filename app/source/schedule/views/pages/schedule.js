/**
 * Schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

var
  CalendarView = require('../blocks/calendar'),
  WeekBarView = require('../blocks/weekbar'),
  WeekView = require('../week');


module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  events : {
    'click #edit' : 'startEditing',
    'click #done' : 'doneEditing'
  },

  initialize : function (options) {
    options = options || {};

    this.subviews = {
      calendar : new CalendarView(options),
      weekbar  : new WeekBarView(options)
    };
  },

  render_lazy : function () {
    var tmpl = _.template(this.template, { variable : 'data' });
    // Render template
    this.$el.html(tmpl(this.model.getDefaults()));

    // Render calendar
    this.subviews.calendar.setElement(this.$el.find('#calendar')).render();

    this.subviews.week = new WeekView({
      collection : this.model.getWeek()
    });
    this.subviews.weekbar.setWeek(this.params);
    this.subviews.calendar.setWeek(this.params);

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.subviews.weekbar.render().el);

    if(this.model.isEditable()) {
      this.$el.find('#editBar').show();
    }

    // Render days(week)
    this.$days = this.$el.find('#days');
    this.subviews.week.setElement(this.$days).render();

    this.$buttons = {
      edit : this.$el.find('#edit'),
      done : this.$el.find('#done')
    };

    if(this.model.isEditing) this.startEditing();

    return this;
  },

  render : function () {
    return this;
  },

  setModel : function (model) {
    this.model = model;
    this.model.on('sync', this.render_lazy, this);
  },

  updateStatics : function (options) {
    this.params = options;
  },

  startEditing : function () {
    this.$buttons.edit.hide();
    this.$buttons.done.show();
    this.$days.addClass('editing-mode');
    this.model.isEditing = true;
  },

  doneEditing : function () {
    this.$buttons.done.hide();
    this.$buttons.edit.show();
    this.$days.removeClass('editing-mode');
    this.model.isEditing = false;
  },

  remove : function () {}
});
