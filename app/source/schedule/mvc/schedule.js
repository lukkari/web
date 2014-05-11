var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  app = app || {},

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  viewHelper = {

    /**
     * Get rooms string
     * @param  {Array} arr array of rooms
     * @return {String}    readable string of rooms
     */
    getRooms : function (arr) {
      var str ='in ';

      if(!arr || arr.length < 1) return '';

      for(var i = 0; i < arr.length; i += 1) {
        str += arr[i].name + ', ' ;
      }

      return str.substr(0, str.length - 2);
    },

    /**
     * Get readable timestamp
     * @param  {Array} day first item of array is date
     * @return {String}    readable time
     */
    getTime : function (day) {
      if(!day || !day.length) return 'No time';
      var d = new Date(day[0].date);
      return d.getHours() + ':' + d.getMinutes();
    },

    /**
     * Get month from its number
     * @param  {Integer} m month number
     * @return {String}    month
     */
    getMonth : function (m) {
      if(m < 0) return 'Unknown';
      return months[m];
    },

    /**
     * Convert string to url
     * @param  {String} name to-work-on string
     * @return {String}      url-ready string
     */
    toUrl : function (name) {
      return encodeURIComponent(name.replace(/\s/g, '_').toLowerCase());
    },

    /**
     * Checks if day is today
     * @param  {Date}  date date to check
     * @return {Boolean}    if day is today
     */
    isToday : function (date) {
      var d = new Date();
      return (d.getDate() == date.day) && (d.getMonth() == date.month);
    },

    /**
     * Get subject duration
     * @param  {Array} day first element of array is duration
     * @return {String}    duration
     */
    getDur : function (day) {
      if(!day || !day.length) return '0';
      return day[0].duration;
    }
  };


/**
 * Week day model
 */
app.WeekDay = Backbone.Model.extend({});


/**
 * Week collection
 */
app.Week = Backbone.Collection.extend({
  model : app.WeekDay
});


/**
 * Schedule model
 *   includes week number, current group/teacher/room
 */
app.Schedule = Backbone.Model.extend({
  urlRoot : '/api/schedule/',

  initialize : function (options) {
    options = options || {};
    this.urlRoot += options.url;
  }
});


/**
 * Week day view
 */
app.WeekDayView = Backbone.View.extend({
  tagName   : 'div',
  className : 'bwrap',
  template  : $('#weekdayTemplate').html(),

  initialize : function (options) {
    //this.editable = options.editable;
  },

  render : function () {

    var tmpl = _.template(this.template),
        data = this.model.toJSON();

    var prev    = null,
        subjects = [];
    data.subjects.forEach(function (e) {
      if(prev) {
        var date  = new Date(e.days[0].date),
            pdate = new Date(prev.date),
            dur   = date.getHours() - pdate.getHours() - prev.duration;

        if(dur > 0) {
          subjects.push({
            rest     : true,
            days     : [{
              duration : dur,
              date : new Date(date.getFullYear(),
                              date.getMonth(),
                              date.getDate(),
                              pdate.getHours() + prev.duration,
                              15
                             )
            }]
          });
        }
      }

      subjects.push(e);
      prev = e.days[0];
    });

    data.subjects = subjects;
    data.editable = this.editable;

    _.extend(data, viewHelper);

    this.$el.html(tmpl(data));
    return this;
  }
});


/**
 * Week view
 */
app.WeekView = Backbone.View.extend({
  el           : $('#days'),
  errTmpl      : $('#weekNotFound').html(),
  noTmpl       : $('#noDays').html(),
  editable     : false,
  subjectUrl   : '/api/subject',

  initialize : function (data, options) {
    data = data || {};
    options = options || {};
    //this.editable = options.editable || false;
    this.collection = new app.Week(data, options);
  },

  render : function () {
    var that = this;

    this.$el.empty();
    _.each(this.collection.models, function (item) {
      that.renderWeekDay(item);
    }, this);
    app.alignDays();

    return this;
  },

  showErr : function () {
    this.$el.empty();
    var tmpl = _.template(this.errTmpl);
    this.$el.html(tmpl());
  },

  showNoClasses : function () {
    this.$el.empty();
    var tmpl = _.template(this.noTmpl);
    this.$el.html(tmpl());
  },

  renderWeekDay : function (item) {
    var weekDayView = new app.WeekDayView({
      model    : item,
      editable : this.editable
    });
    this.$el.append(weekDayView.render().el);
  }

});


/**
 * Schedule view
 */
app.ScheduleView = Backbone.View.extend({

  week   : null,
  $title : $('#scheduleTitle'),

  initialize : function (options) {
    options = options || {};
    this.model = new app.Schedule(options);

    var that = this;
    this.model.fetch({
      success : function () {
        that.week = new app.WeekView(that.model.attributes.weekdays, options);
        that.render();
      },

      error   : function () {
        that.week = new app.WeekView(null, options);
        that.showErr();
      }
    });
  },

  render : function () {
    this.$title.text(this.model.attributes.title);
    this.week.render();

    return this;
  },

  showErr : function () {
    this.$title.text('');
    this.week.showErr();
  },

  getTitle : function () {
    return this.$title.text();
  }

});

module.exports = app;
