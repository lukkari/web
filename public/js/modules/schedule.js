;(function ($) {

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var viewHelper = {
    getRooms : function (arr) {
      var str ='in ';

      if(!arr || arr.length < 1)
        return '';

      for(var i = 0; i < arr.length; i += 1) {
        str += arr[i].name + ', ' ;
      }

      return str.substr(0, str.length - 2);
    },

    getTime : function (day) {
      if(!day || !day.length) return 'No time';
      var d = new Date(day[0].date);
      return d.getHours() + ':' + d.getMinutes();
    },

    getMonth : function (date) {
      var d = new Date(date);
      return months[d.getMonth()];
    },

    toUrl : function (name) {
      return encodeURIComponent(name.replace(/\s/g, '_').toLowerCase());
    },

    isToday : function (date) {
      var d = new Date();
      return (d.getDate() == date.day) && (d.getMonth() == date.month)
    },

    getDur : function (day) {
      if(!day || !day.length) return '0';
      return day[0].duration;
    }
  };

  /**
   * ##############################################3
   * App
   */

  window.app = window.app || {};

  window.app.WeekDay = Backbone.Model.extend({
    defaults   : {
      week     : '',
      weekday  : '',
      date : {
        day   : '',
        month : ''
      },
      subjects : []
    }
  });

  window.app.Week = Backbone.Collection.extend({
    model : app.WeekDay,
    url   : '/api/schedule/',

    initialize : function (options) {
      options || (options = {});
      this.url += options.url;

      return this.fetch();
    }
  });

  window.app.WeekDayView = Backbone.View.extend({
    tagName   : 'div',
    className : 'bwrap',
    template  : $('#weekdayTemplate').html(),
    editable  : false,

    events : {
      'click .addsubject button' : 'showForm'
    },

    initialize : function (options) {
      this.editable = options.editable;
    },

    render    : function () {

      var tmpl = _.template(this.template),
          data = this.model.toJSON();

      var prev    = null,
          subjects = [];
      data.subjects.forEach(function (e) {
        if(prev) {
          var date  = new Date(e.days[0].date),
              pdate = new Date(prev.date),
              dur   = date.getHours() - pdate.getHours() - prev.duration;

          if(dur > 0)
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

        subjects.push(e);
        prev = e.days[0];
      });

      data.subjects = subjects;
      data.editable = this.editable;

      _.extend(data, viewHelper);

      this.$el.html(tmpl(data));
      return this;
    },

    showForm : function () {
      console.log('test');
    }
  });

  window.app.WeekView = Backbone.View.extend({
    el           : $('#days'),
    errTmpl      : $('#weekNotFound').html(),
    noTmpl       : $('#noDays').html(),
    editable     : false,

    initialize : function (options) {
      options || (options = {});
      this.editable = options.editable || false;
      this.collection = new app.Week(options);

      var that = this;
      this.collection.fetch({
        success : function () {
          that.render();
        },

        error   : function () {
          that.showErr();
        }
      });
    },

    render : function () {
      var that = this;

      if(this.collection.models.length < 2) this.showNoClasses();
      else {
        this.$el.empty();
        _.each(this.collection.models, function (item) {
          that.renderWeekDay(item);
        }, this);
        app.alignDays();
      }

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

})(jQuery);
