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
  ScheduleView = require('./views/schedule');


module.exports = Backbone.Router.extend({
  routes : {
    ''               : 'mainpage',
    'search(/:s)(/)' : 'search',
    'w:w/:q(/)'      : 'getSchedule2',
    ':q(/w:w)(/)'    : 'getSchedule',
    '*other'         : 'unknown'
  },

  initialize : function () {
    /**
     * Array of objects = {
     *   page : {String}
     *   view : {Object}
     * }
     */
    this.pages = [];
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
      header : this.app.header
    });
    this.app.toContent(this.view.render().el);

    this.app.header.goTheme('dark');
  },

  /**
   * Show schedule page with parameters vice versa
   */
  getSchedule2 : function (w, q) {
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

    this.view = this.app.schedule;
    schedule.fetch({
      success : (function () {
        this.view.model = schedule;
        this.app.assign(this.view, '#content', options);
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
