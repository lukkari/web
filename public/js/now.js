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

    getDur : function (day) {
      if(!day || !day.length) return '0';
      return day[0].duration;
    },

    getStatus : function (day) {
      if(!day || !day.length) return '';

      var h   = new Date().getHours(),
          d   = new Date(day[0].date).getHours(),
          dur = day[0].duration;

      if(h >= (d + dur)) return 'ended';
      if((h >= d) && (h < (d + dur))) return 'now';

      return '';
    }
  };

  var WeekDay = Backbone.Model.extend({
    url : '/api/schedule/now/',

    initialize : function (options) {
      this.url = this.url + encodeURIComponent(options.url);
    }
  });

  var WeekDayView = Backbone.View.extend({
    el        : $('.schedule'),
    template  : $('#weekdayTemplate').html(),
    errTmpl   : $('#weekNotFound').html(),

    initialize : function (options) {
      this.model = new WeekDay({ url : options.url });

      var that = this;
      this.model.fetch({
        success : function () {
          that.render();
        },
        error   : function () {
          that.showErr();
        }
      });
    },

    render : function () {

      var tmpl = _.template(this.template),
          data = this.model.toJSON();

      var prev     = null,
          subjects = [],
          now      = new Date(),
          status   = 'ended';

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

      _.extend(data, viewHelper);

      this.$el.html(tmpl(data));
      return this;
    },

    showErr : function () {
      this.$el.empty();
      var tmpl = _.template(this.errTmpl);
      this.$el.html(tmpl());
    }
  });

  var url = window.location.pathname;
  url = url.split('/')[1];

  var schedule = new WeekDayView({ url : url });

})(jQuery);
