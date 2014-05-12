var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone'),
  helpers = require('../helpers');

var
  // REMOVE!!
  old = {},

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

  initialize : function (data, options) {
    options = options || {};
    this.urlRoot += options.url;
  },

  getDays : function () {
    return this.get('weekdays');
  },

  getTitle : function () {
    return this.get('title');
  }
});

/**
 * Schedules collection
 *   used to save all fetched schedules from the server
 */
app.Schedules = Backbone.Collection.extend({
  model : app.Schedule,

  /**
   * Finds model for a current query
   * @param  {String} query query string
   * @return {Array}       found model or empty array
   */
  getByQuery : function (query) {
    query = query || {};

    return this.filter(function (data) {
      return data.urlRoot === '/api/schedule/' + query;
    });
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

    return this;
  },

  renderWeekDay : function (item) {
    var weekDayView = new app.WeekDayView({
      model    : item,
      editable : this.editable
    });
    this.$el.append(weekDayView.render().el);

    return this;
  }

});


/**
 * Schedule view
 */
app.ScheduleView = Backbone.View.extend({
  $parent   : $('#content'),
  template  : $('#scheduleTemplate').html(),
  className : 'schedule',

  initialize : function (options) {
    options = options || {};

    this.collection = new app.Schedules();
    this.views = {
      calendar : new app.CalendarView(options),
      weekbar  : new app.WeekBarView(options)
    };

    this.preRender(options);
    this.load(options);
  },

  /**
   * Load new schedule page or find fetched page
   * @param  {Object} options object with query string and week number
   */
  load : function (options) {
    options = options || {};

    var that     = this,
        schedule = this.collection.getByQuery(options.url);

    console.log(options);
    this.views.weekbar.setWeek(options);
    if(Array.isArray(schedule) && schedule.length) {
      this.model = schedule[0];
      this.render();
    } else {
      this.model = new app.Schedule([], options);
      this.model.fetch({
        success : function () {
          that.collection.add(that.model);
          that.render();
        },

        error : function () {

        }
      });
    }

    return this;
  },

  show : function (options) {
    this
      .load(options)
      .$el
      .show();
    return this;
  },

  hide : function () {
    this.$el.hide();
    return this;
  },

  preRender : function (options) {
    options = options || {};

    var tmpl = _.template(this.template);

    this.views.weekbar.setWeek(options);

    // Render template
    this
      .$el
      .html(tmpl())
      .show();

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.views.weekbar.render().el);

    // Add element to the page
    this
      .$parent
      .append(this.el);
  },

  render : function () {
    this.views.week = new app.WeekView(this.model.getDays());

    this
      .$el
      .find('#scheduleTitle')
      .text(this.model.getTitle());

    this
      .$el
      .find('#days')
      .html(this.views.week.render().el)
      .fadeIn('fast');

    return this;
  }
});


/**
 * Calendar view
 */
app.CalendarView = Backbone.View.extend({
  template : $('#calendarTemplate').html(),

  initialize : function (options) {
    options = options || {};
    // From query string get selected week
    this.update(options);
  },

  /**
   * Update calendar
   * @param  {Object} options parameters of new schedule page
   */
  update : function (options) {
    return this;
  }
});



/**
 * Weekbar Model
 */
app.WeekBarModel = Backbone.Model.extend({});
/**
 * Weekbar view
 */
app.WeekBarView = Backbone.View.extend({
  className : 'weekselector',
  template  : $('#weekBarTemplate').html(),

  initialize : function () {
    this.model = new app.WeekBarModel();
  },

  render : function () {
    var tmpl = _.template(this.template);

    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

  /**
   * Set week numbers in model
   */
  setWeek : function (options) {
    options = options || {};

    var
      week  = parseInt(options.week, 10),
      query = options.query,

      attributes = {
        prevUrl : query + '/w' + (week - 1),
        weekNum : week,
        nextUrl : query + '/w' + (week + 1)
      };

    this.model.set(attributes);

    return this;
  }
});

module.exports = app;
