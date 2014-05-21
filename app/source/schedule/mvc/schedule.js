var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone'),
  helpers = require('../helpers');

var
  app = app || {},

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  fullmonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

    this.views.weekbar.setWeek(options);
    if(Array.isArray(schedule) && schedule.length) {
      this.model = schedule[0];
      this.render(options);
    } else {
      this.model = new app.Schedule([], options);
      this.model.fetch({
        success : function () {
          that.collection.add(that.model);
          that.render(options);
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

  /**
   * Render only once
   */
  preRender : function (options) {
    options = options || {};

    var tmpl = _.template(this.template);

    // Render template
    this
      .$el
      .html(tmpl())
      .show();

    // Add element to the page
    this
      .$parent
      .append(this.el);
  },

  render : function (options) {
    this.views.week = new app.WeekView(this.model.getDays());

    // Render title
    this
      .$el
      .find('#scheduleTitle')
      .text(this.model.getTitle());

    // Render weekbar
    this
      .$el
      .find('#weekBar')
      .html(this.views.weekbar.render().el);

    // Render calendar
    this
      .$el
      .find('#calendar')
      .html(this.views.calendar.render(options).el);

    // Render days(week)
    this
      .$el
      .find('#days')
      .html(this.views.week.render().el)
      .fadeIn('fast');

    return this;
  }
});


/**
 * Calendar month model
 */
app.Month = Backbone.Model.extend({
  initialize : function (data, options) {
    options = options || {};
    this.date = options.date;

    var d = new Date(this.date);

    this.set({
      month : fullmonths[d.getMonth()]
    });

    this.buildMonth();
  },

  /**
   * Build current month
   */
  buildMonth : function () {
    var
      today = new Date(),
      d = new Date(this.date),
      fd = new Date(d.getFullYear(), d.getMonth(), 1), // first day of the month
      ls = new Date(d.getFullYear(), d.getMonth() + 1, 0), // last day of the month
      oneday = 24*60*60*1000, // one day in milliseconds
      weeks = [],
      i, j, dur, week;

    d.setDate(1); // set day to first (if wasn't set)
    d.setDate(-d.getDay()); // go back to the first day of week

    ls.setDate(ls.getDate() + 6 - ls.getDay()); // get last day of the last week

    dur = Math.round((ls.getTime() - d.getTime()) / oneday) + 1; // get difference in days

    for(i = 0; i < dur; i += 1) {
      if(d.getDay() === 0) {
        if(typeof week !== 'undefined') weeks.push(week);

        week = {
          week : d.getWeek(),
          isCurrent : (d.getWeek() === today.getWeek()),
          days : []
        };

      } else if(d.getDay() !== 6) {
        week.days.push({
          // if current month is not equal to building month
          isOld : (d.getMonth() !== fd.getMonth()),
          day : d.getDate()
        });
      }
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);

    this.set({
      weeks : weeks
    });

    return this;
  },
});


/**
 * Calendar month view
 */
app.MonthView = Backbone.View.extend({
  tagName : 'table',
  template : $('#monthTemplate').html(),

  events : {
    'click tbody tr' : 'goToWeek'
  },

  initialize : function (data, options) {
    options = options || {};

    this.monthNum = options.monthNum;
  },

  /**
   * When needed week is click, go to that week
   * @param  {Object} e Event
   */
  goToWeek : function (e) {
    console.log('run');
    window.app.router.goToWeek($(e.currentTarget).attr('data-week'));
    return this;
  },

  render : function () {
    var tmpl = _.template(this.template);
    this.$el.html(tmpl(this.model.toJSON()));

    /**
     * NOT WORKING!!!
     */
    this.delegateEvents();

    return this;
  }
});


/**
 * Calendar months collection
 */
app.Months = Backbone.Collection.extend({
  model : app.Month
});


/**
 * Calendar view
 */
app.CalendarView = Backbone.View.extend({

  initialize : function (options) {
    options = options || {};

    this.collection = new app.Months();

    this.buildCalendar();
    // From query string get selected week
    //this.update(options);
  },

  /**
   * Build calendar
   *   When month is
   *                 8     -> show 8..10
   *                 9..11 -> show 9..12 ??
   *                 12    -> show 11..1
   *                 1..4  -> show 1..5
   *                 5..7  -> show 4..7
   *   OR
   *     show current month, one preceding and two following (implemented)
   */
  buildCalendar : function () {
    var
      d = new Date(),   // current date
      m = d.getMonth(), // current month
      prec = 1,         // number of preceding months to show
      follow = 2,       // number of following months to show
      model, i, j;

    for(i = -prec; i <= follow; i += 1) {
      j = m + i; // month to show
      j = (j < 0) ? (12 + j) : j;  // handle if month < 0
      j = (j > 11) ? (j - 12) : j; // handle if month > 11

      this
        .collection
        .add(new app.Month([], {
            date : new Date(d.getFullYear(), j, 1)
          }));
    }

  },

  /**
   * Update calendar
   * @param  {Object} options parameters of new schedule page
   */
  update : function (options) {
    return this;
  },

  render : function () {
    this.$el.empty();

    _.each(this.collection.models, function (item) {
      this
        .$el
        .append(this.renderItem(item).el);
    }.bind(this));

    return this;
  },

  renderItem : function (item) {
    var monthView = new app.MonthView({
      model : item
    });

    return monthView.render();
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
      // previous year
      pd = new Date(new Date().getFullYear() - 1, 11, 31), // get last day
      pw = pd.getWeek(), // get last week
      //current year
      ld = new Date(new Date().getFullYear(), 11, 31), // get last day
      lw = ld.getWeek(), // get last week

      attributes = {
        // if current week <= 1 -> show last week of the previous year
        prevUrl : query + '/w' + ((week <= 1) ? pw : (week - 1)),
        // current week
        weekUrl : query + '/w' + week,
        weekNum : week,
        // if current week >= last week of the current year -> show first week
        nextUrl : query + '/w' + ((week >= lw) ? 1 : (week + 1))
      };

    this.model.set(attributes);
    return this;
  }
});

module.exports = app;
