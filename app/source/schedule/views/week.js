/**
 * Week view
 */

var
  _ = require('underscore'),
  Backbone = require('backbone');


var
  Week = require('../collections/week'),
  WeekDayView = require('./weekday');

module.exports = Backbone.View.extend({

  editable     : false,
  subjectUrl   : '/api/subject',

  initialize : function (data, options) {
    options = options || {};

    this.collection = new Week(data, options);
  },

  render : function () {
    var that = this;

    this.$el.empty();
    _.each(this.collection.models, function (item) {
      that.renderWeekDay(item);
    }, this);

    return this;
  },

  renderWeekDay : function (item) {
    var weekDayView = new WeekDayView({
      model    : item,
      editable : this.editable
    });
    this.$el.append(weekDayView.render().el);

    return this;
  }

});
