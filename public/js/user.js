;(function ($) {
  //#########################################################################

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
      return name.replace(/\s/g, '_').toLowerCase();
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

  var WeekDay = Backbone.Model.extend({
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

  var Week = Backbone.Collection.extend({
    model : WeekDay,
    url   : '/api/schedule/',

    initialize : function (options) {
      options || (options = {});
      this.url += options.url;

      return this.fetch();
    }
  });

  var WeekDayView = Backbone.View.extend({
    tagName   : 'div',
    className : 'bwrap',
    template  : $('#weekdayTemplate').html(),

    render    : function () {

      var tmpl = _.template(this.template),
          data = this.model.toJSON();

      var prev    = null,
          subjects = [];
      data.subjects.forEach(function (e) {
        if(prev) {
          var date  = new Date(e.date),
              pdate = new Date(prev.date),
              dur   = date.getHours() - pdate.getHours() - prev.duration;

          if(dur > 0)
            subjects.push({
              rest     : true,
              duration : dur,
              date     : new Date(date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate(),
                                  pdate.getHours() + prev.duration,
                                  15
                                 )
            });
        }
        subjects.push(e);
        prev = e;
      });

      data.subjects = subjects;

      _.extend(data, viewHelper);

      this.$el.html(tmpl(data));
      return this;
    }
  });

  var WeekView = Backbone.View.extend({
    el           : $('#days'),
    errTmpl      : $('#weekNotFound').html(),

    initialize : function (options) {
      this.collection = new Week({ url : options.url });

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
      this.$el.empty();
      _.each(this.collection.models, function (item) {
        that.renderWeekDay(item);
      }, this);
      alignDays();
    },

    showErr : function () {
      this.$el.empty();
      var tmpl = _.template(this.errTmpl);
      this.$el.html(tmpl());
    },

    renderWeekDay : function (item) {
      var weekDayView = new WeekDayView({
        model: item
      });
      this.$el.append(weekDayView.render().el);
    }

  });

}(jQuery));