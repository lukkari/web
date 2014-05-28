/**
 * Router
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var
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
     * Load search page when focusing search field
     */
    $('#searchInput').on('focus', function () {
      if(typeof this.view === 'object' &&
         this.view.el.baseURI.indexOf('search') === -1) this.navigate('/search', { trigger : true });
    }.bind(this));
    /**
     * Initalize appview
     */
    this.app = new AppView({
      el : '#app'
    });
  },

  /**
   * Checks if page was saved
   * @param  {String} page page name
   * @return {Object}      found page view
   */
  has : function (page) {
    page = page || '';

    if(!page.length) return null;

    return _.find(this.pages,
      function (el) {
        return el.page === page;
      }
    );
  },

  /**
   * Adds page object to saved pages
   * @param  {Object} data page data
   * @return {Array}       saved pages array
   */
  add : function (data) {
    if(typeof data === 'object') this.pages.push(data);
    return this.pages;
  },

  /**
   * Hide previous page
   */
  hideView : function () {
    if(this.view &&
      typeof this.view === 'object' &&
      typeof this.view.hide === 'function') this.view.hide();
  },

  /**
   * Load page controller
   * @param  {Object} params parameters for running page
   */
  loadPage : function (params) {
    params = params || {};

    var
      defaults = {
        hideView : true, // hide previous page
        name     : '',   // page name
        options  : null  // pass options to view constructor
      },

      content;

    /**
     * Create error page view
     * @return {Object} returns error page view
     */
    defaults.createView = function () {
      return null;
    };

    _.defaults(params, defaults);

    if(params.hideView) this.hideView();

    content = this.has(params.name);
    if(content) {
      content.view.show(params.options);
      this.view = content.view;
    } else {
      content = params.createView(params.options);
      this.add({
        page : params.name,
        view : content
      });
      this.view = content;
    }
  },

  /**
   * Show mainpage(front page)
   */
  mainpage : function () {
    var
      params = {
        name : 'mainpage'
      };

    params.createView = function (options) {
      return new FrontPageView(options);
    };

    this.loadPage(params);
  },

  /**
   * Show search(navigation) page
   * @param  {String} s filter string
   */
  search : function (s) {
    var
      params = {
        options  : {
          filter : s
        },
        name     : 'search'
      };

    params.createView = function (options) {
      return new SearchView(options);
    };

    this.loadPage(params);
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
    var
      query = q,

      params = {
        options : {
          query : query
        },
        name : 'schedule'
      };

    params.createView = function (options) {
      return new ScheduleView(options);
    };

    w = parseInt(w,10) > 0 ? w : new Date().getStudyWeek();

    query += '?w=' + w;

    params.options.url = query;
    params.options.week = w;

    this.loadPage(params);
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
