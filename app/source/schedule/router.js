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
  FrontPageView = require('./views/frontpage'),
  SearchView = require('./views/search'),
  ScheduleView = require('./views/schedule'),
  NowScheduleView = require('./views/nowschedule');


module.exports = Backbone.Router.extend({
  routes : {
    ''               : 'mainpage',
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

    this.view = new FrontPageView();
    this.app.toContent(this.view.render().el);
  },

  /**
   * Show search(navigation) page
   * @param  {String} s filter string
   */
  search : function (s) {

    if(this.view) this.view.remove();

    this.view = new SearchView({
      filter : s,
      header : this.app.subviews.header
    });
    this.app.toContent(this.view.render().el);

    this.app.subviews.header.goTheme('dark');
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

    var schedule = new Schedule([], {
      url : options.query
    });

    schedule.fetch({
      success : (function () {
        this.view = this.app.subviews.schedule;
        this.view.model = schedule;
        this.app.assign(this.view, '#content', options);
      }).bind(this)
    });
  },

  /**
   * Show now schedule page
   * @param  {String} q query string
   */
  getNowSchedule : function (q) {

    if(this.view) this.view.remove();

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
      }).bind(this)
    });
  },

  unknown : function () {
    //app.pagesCtrl.toggle('unknown');
  },

  /**
   * Open needed week
   * @param  {Integer} week Week number
   */
  goToWeek : function (week) {

    var url = window.location.pathname;
    url = url.replace(/\/w\d+/, '') + '/w' + week;

    this.navigate(url, true);
  }
});
