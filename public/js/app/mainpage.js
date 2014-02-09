;(function ($) {

  window.app = window.app || {};

  window.app.Router = Backbone.Router.extend({
    routes : {
      ''               : 'mainpage',
      'my/w:w(/)'      : 'getMyWeek',
      'my(/:edit)'     : 'getMy',
      'back'           : 'goBack',
      'subject/:q'     : 'subject',
      'w:w/:q(/)'      : 'search2',
      ':q(/w:w)(/)'    : 'search',
      '*other'         : 'unknown'
    },

    initialize : function () {
      var groups = new app.ListView({
        el : $('#groupList'),
        list : 'group'
      });

      var teachers = new app.ListView({
        el : $('#teacherList'),
        list: 'teacher'
      });

      this.history = [];
      this.schedule = {
        urls  : [],
        views : []
      };
      this.subjects = {
        urls  : [],
        views : []
      };
      Backbone.history.on('route', function() {
          this.history.push(window.location.pathname.substr(1) + window.location.hash);
        }, this);
    },

    back : function () {
      if(this.history.length > 1) {
        this.navigate(this.history[this.history.length - 2], { trigger : true });
        this.history = this.history.slice(0, this.history.length - 1);
      }
      else
        this.navigate('', { trigger : true, replace : true });
    },

    findIn : function (obj, q) {
      var i = 0;
      if(obj.urls.length && ((i = obj.urls.indexOf(q)) !== -1))
        return obj.views[i];

      return false;
    },

    mainpage : function () {
      app.pagesCtrl.toggle('mainpage');
    },

    goBack : function () {
      this.back();
    },

    getMyWeek : function (w) {
      this.getMy(false, w);
    },

    getMy : function (edit, w) {
      edit = (edit === 'edit');
      app.pagesCtrl.toggle('schedule');
      app.weekBar.set('my', w);
      var q = 'my';
      if(w) q += '?w=' + w;
      var schedule = new app.WeekView({ url : q, editable : edit })
    },

    subject : function (q) {
      app.pagesCtrl.toggle('subject');

      var subject;
      if(subject = this.findIn(this.subjects, q))
        subject.render();
      else {
        subject = new app.SubjectView({ url : q });
        this.subjects.urls.push(q);
        this.subjects.views.push(subject);
      }
    },

    search2 : function (w, q) {
      this.search(q, w);
    },

    search : function (q, w) {
      app.pagesCtrl.toggle('schedule');

      var query = q;

      app.weekBar.set(q, w);
      query += '?w=' + app.weekBar.getWeekNum();

      $('#nowlink').attr('href', '/' + q + '/now');

      var schedule;
      if(schedule = this.findIn(this.schedule, query))
        schedule.render();
      else {
        schedule = new app.ScheduleView({ url : query });
        this.schedule.urls.push(query);
        this.schedule.views.push(schedule);
      }
    },

    unknown : function () {
      app.pagesCtrl.toggle('unknown');
    }
  });

  /**
   * ######################################################
   * Init
   */

  window.app.router = new app.Router();
  Backbone.history.start({ pushState: true });

})(jQuery);
