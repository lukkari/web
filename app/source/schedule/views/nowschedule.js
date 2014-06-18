/**
 * Now schedule view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../dist');

var
  WeekDay = require('../models/weekday'),
  WeekDayView = require('./weekday');


module.exports = Backbone.View.extend({

  template  : templates.schedule,
  className : 'schedule',

  views : {},

  initialize : function (options) {
    options = options || {};

    this.views.weekday = new WeekDayView({
      model : this.model
    });
  },

  render : function (options) {
    // Render template
    this
      .$el
      .html(_.template(this.template,
                       this.model.getDefaults(true),
                       { variable : 'data' }));

    // Render days(week)
    //this.views.week.setElement(this.$el.find('#days')).render();
    this.$el.find('#days').html(this.views.weekday.render().el);

    return this;
  },

  remove : function () {
    _.invoke(this.views, 'remove');
    this.views = {};

    Backbone.View.prototype.remove.apply(this, arguments);
  }
});
