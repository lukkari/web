/**
 * Router
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
  Schedule = require('./models/schedule'),

  AppView = require('./views/app'),
  FrontPageView = require('./views/pages/front'),
  SearchView = require('./views/pages/search'),
  ScheduleView = require('./views/pages/schedule'),
  NowScheduleView = require('./views/pages/nowschedule'),
  UnknownPageView = require('./views/pages/unknown');

require('./util');

module.exports = Backbone.Router.extend({
  routes : {
    ''               : 'mainpage',
    //'my(/w:w)(/)'    : 'getMySchedule',
    'search(/:s)(/)' : 'search',
    'w:w/:q(/)'      : 'getScheduleViceVersa',
    ':q(/w:w)(/)'    : 'getSchedule',
    ':q/now(/)'      : 'getNowSchedule',
    '*other'         : 'unknown'
  },

  initialize : function () {
    /**
     * Saves last page view
     */
    this.view = null;
    /**
     * Initalize appview
     */
    this.app = new AppView({
      el : '#app'
    });
    this.app.render();
  },

  /**
   * Show mainpage(front page)
   */
  mainpage : function () {

    if(this.view) this.view.remove();

    document.title = 'Schedule';

    this.view = new FrontPageView();
    this.app.toContent(this.view.render().el);
  },

  /**
   * Show search(navigation) page
   * @param  {String} s filter string
   */
  search : function (s) {

    if(this.view) this.view.remove();

    document.title = 'Search - Schedule';

    this.view = new SearchView({
      filter : s,
      header : this.app.subviews.header
    });
    this.app.toContent(this.view.render().el);
  },

  /**
   * Show schedule page with parameters vice versa
   */
  getScheduleViceVersa : function (w, q) {
    this.getSchedule(q, w);
  },

  /**
   * Show schedule page
   * @param  {String} q query string
   * @param  {String} w week number
   */
  getSchedule : function (q, w) {

    if(this.view) this.view.remove();

    var
      options = {
        query : q,
        q : q,
        week : null
      };

    w = (parseInt(w,10) > 0) ? w : new Date().getStudyWeek();

    options.week = w;
    options.query += '?w=' + w;

    var isMySchedule = (q == 'my');

    options.isMySchedule = isMySchedule;

    var title = isMySchedule ? 'My schedule' : q.fromUrl().toUpperCase() + ' - Schedule';
    document.title = title;

    var schedule = new Schedule([], {
      url : options.query
    });

    schedule.fetch();

    this.view = this.app.subviews.schedule;
    this.view.setModel(schedule);
    this.view.updateStatics(options);
    this.app.assign(this.view, '#content', options);

    /*schedule.fetch({
      success : (function () {
        this.view = this.app.subviews.schedule;
        this.view.setModel(schedule);
        this.app.assign(this.view, '#content', options);
      }).bind(this),

      error : (function () {
        this.unknown();
      }).bind(this)
    });*/
  },

  /**
   * Show now schedule page
   * @param  {String} q query string
   */
  getNowSchedule : function (q) {

    if(this.view) this.view.remove();

    document.title = q.fromUrl().toUpperCase() + ' - Today\'s Schedule';

    var schedule = new Schedule([], {
      url : q + '/now',
      extraClass : 'nowpage'
    });

    schedule.fetch({
      success : (function () {
        this.view = new NowScheduleView({
          model : schedule
        });
        this.app.assign(this.view, '#content');
      }).bind(this),

      error : (function () {
        this.unknown();
      }).bind(this)
    });
  },

  /**
   * Unknown page
   */
  unknown : function () {
    if(this.view) this.view.remove();

    document.title = 'Unknown page';
    this.view = new UnknownPageView();
    this.app.assign(this.view, '#content');
  },

  /**
   * Open needed week
   * @param  {Integer} week Week number
   */
  goToWeek : function (week) {
    var url = window.location.pathname;
    url = url.replace(/\/w\d+/, '') + '/w' + week;

    this.navigate(url, true);
  },

  /**
   * Go back in history or to main page
   */
  goBack : function () {
    // When user came from other resource
    if(document.referer && document.referer.length) {
      this.navigate('/', true);
    }

    window.history.back();
  }
});
