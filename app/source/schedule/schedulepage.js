var
  $        = require('jquery'),
  _        = require('underscore'),
  Backbone = require('backbone'),
  navigation = require('./mvc/navigation'),
  schedule = require('./mvc/schedule'),
  frontpage = require('./mvc/frontpage');

Backbone.$ = $;

var app = app || {};


/**
 * Main schedule page handler
 */
app.Router = Backbone.Router.extend({
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
    this.prev = null;
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
  hidePrev : function () {
    if(this.prev &&
      typeof this.prev === 'object' &&
      typeof this.prev.hide === 'function') this.prev.hide();
  },

  /**
   * Load page controller
   * @param  {Object} params parameters for running page
   */
  loadPage : function (params) {
    params = params || {};

    var
      defaults = {
        hidePrev : true, // hide previous page
        name     : '', // page name
        options  : null // pass options to view constructor
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

    if(params.hidePrev) this.hidePrev();

    content = this.has(params.name);
    if(content) {
      content.view.show();
      this.prev = content.view;
    } else {
      content = params.createView(params.options);
      this.add({
        page : params.name,
        view : content
      });
      this.prev = content;
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
      return new frontpage.FrontPageView(options);
    };

    this.loadPage(params);
  },

  /**
   * Show search(navigation) page
   * @param  {String} s filter string
   */
  search : function (s) {
    var
      options = {
        filter : s
      },

      params = {
        options  : options,
        name     : 'search',
        hidePrev : false
      };

    params.createView = function (options) {
      return new navigation.SearchView(options);
    };

    this.loadPage(params);
  },

  getSchedule2 : function (w, q) {
    this.getSchedule(q, w);
  },

  getSchedule : function (q, w) {
    /*app.pagesCtrl.toggle('schedule');

    var query = q;

    app.weekBar.set(q, w);
    query += '?w=' + app.weekBar.getWeekNum();

    $('#nowlink').attr('href', '/' + q + '/now');

    var schedule = this.findIn(this.schedule, query);
    if(schedule) schedule.render();
    else {
      schedule = new app.ScheduleView({ url : query });
      this.schedule.urls.push(query);
      this.schedule.views.push(schedule);
    }*/
  },

  unknown : function () {
    //app.pagesCtrl.toggle('unknown');
  }
});


/**
 * Init and add events
 */

window.app = {};

$(document).ready(function () {

  window.app.router = new app.Router();
  Backbone.history.start({ pushState: true });

  /**
   * Bind events to all local links
   */
  $(document).on('click', 'a[data-local]', function (e) {
    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      window.app.router.navigate(href, true);
    }
  });

  $('.weekcontent').on('click', function (e) {
    e.preventDefault();
    $('#calendar').slideToggle('fast');
  });

  // Contacts form
  /*
  $('#message').on('focus', function (e) {
    $(this).addClass('big');
    $('#hiddenform').slideDown('fast');
  });

  $('#send').on('click', function(e) {
    $.ajax({
        type : "POST",
        url  : "/api/messages",
        data : "msg=" + encodeURIComponent($('#message').val()) + "&from=" + encodeURIComponent($('#replyto').val())
      })
    .done(function (data) {
        $('#sent').slideDown('fast', function() {
          setTimeout(function () {
            $('#sent').fadeOut('slow');
          }, 4000);
        });
      }
    );

    $('#hiddenform').slideUp('fast');
    $('#message').removeClass('big');
    $('#replyto').val('');
    $('#message').val('');
  });
  */

  $(window).resize(function () {
    //app.alignDays();
  });

});
