;(function ($) {

  window.app = window.app || {};

  /**
   * ###########################################
   * Navlinks
   */

  window.app.ItemLink = Backbone.Model.extend({
  });

  window.app.GroupList = Backbone.Collection.extend({
    model : app.ItemLink,
    url   : '/api/groups',

    search : function (letters) {
      if(letters == "") return this.models;

      var pattern = new RegExp(letters, "gi");
      return this.filter(function(data) {
        return data.get("name").match(pattern);
      });
    }
  });

  window.app.TeacherList = Backbone.Collection.extend({
    model : app.ItemLink,
    url   : '/api/teachers',

    search : function (letters) {
      if(letters == "") return this.models;

      var pattern = new RegExp(letters, "gi");
      return this.filter(function(data) {
        return data.get("name").match(pattern);
      });
    }
  });

  window.app.ItemLinkView = Backbone.View.extend({
    tagName   : 'ul',
    template  : $('#itemlinkTemplate').html(),

    render : function () {
      var tmpl = _.template(this.template);

      var data = this.model.toJSON();
      data.tourl = data.name.toLowerCase().replace(/\s/g, "_");
      this.$el.html(tmpl(data));
      return this;
    }
  });

  window.app.ListView = Backbone.View.extend({

    template : $('#listTemplate').html(),

    events : {
      'click a'     : 'closeList',
      'keyup .text' : 'searchFilter'
    },

    initialize : function (options) {
      options || (options = {});

      switch (options.list) {
        case 'group' :
          this.collection = new app.GroupList();
          break;
        case 'teacher' :
          this.collection = new app.TeacherList();
          break;
        default:
          return;
      }

      this.title = options.list;

      var that = this;
      this.collection.fetch({
        success : function () {
          that.render();
        }
      });
    },

    render : function () {
      var that = this;

      var tmpl = _.template(this.template);
      this.$el.html(tmpl({ title : this.title }));

      _.each(this.collection.models, function (item) {
        that.renderItem(item);
      }, this);

      return this;
    },

    renderList : function (data) {
      data || (data = []);

      var that = this;

      this.$el.children('.list').empty();
      _.each(data, function (item) {
        that.renderItem(item);
      }, this);

      app.sideBar.setHeight();

      return this;
    },

    renderItem : function (item) {
      var itemLinkView = new app.ItemLinkView({
        model: item
      });
      this.$el.children('.list').append(itemLinkView.render().el);
    },

    closeList : function (e) {
      app.sideBar.close();
    },

    searchFilter : function (e) {
      var letters = this.$el.find('.text').val();
      this.renderList(this.collection.search(letters));
    }
  });


  window.app.AddSubjects = Backbone.Model.extend({
    url : '/api/subject/short/',

    initialize : function (options) {
      options || (options = {});
      this.url += options.url;
    }
  });

  window.app.AddSubjectView = Backbone.View.extend({
    tag       : 'div',
    className : 'form',
    template  : $('#subjectPopupTemplate').html(),
    listTmpl  : $('#subjectPopupListTemplate').html(),
    $popup    : $('.subjectpopup'),
    subjects  : null,

    events : {
      'keyup .text'   : 'search',
      'click li'      : 'select'
    },

    initialize : function () {
      this.subjects = new app.AddSubjects();
      this.$popup.fadeIn('fast');
      this.addEvents();
      this.render();
    },

    render : function () {
      var tmpl = _.template(this.template);
      this.$popup.find('.container').html(this.$el.html(tmpl()));
      this.$el.find('.text').focus();
      return this;
    },

    renderList : function () {
      var tmpl = _.template(this.listTmpl);
      if(this.subjects.attributes && this.subjects.attributes.data)
        this.$el.find('.found').html(tmpl(this.subjects.attributes));
      else
        this.$el.find('.found').html(tmpl({ data : [] }));
      return this;
    },

    addEvents : function () {
      var that = this;
      this.$popup.find('.closebtn, .bg').on('click', function () {
        that.close();
      });
    },

    search : function (e) {
      var that = this;
      this.subjects = new app.AddSubjects({ url : $(e.target).val() });
      this.subjects.fetch({
        success : function () {
          that.renderList();
        }
      });
    },

    select : function (e) {
      this.addSubject($(e.target).attr('data-link'));
      this.close();
    },

    close : function () {
      this.$popup.fadeOut('fast');
    },

    addSubject : function (id) {
      $.ajax({
          type : 'POST',
          url  : '/api/subject/' + id,
          data : 'id=' + encodeURIComponent(id)
        })
        .done(function (data) {
          window.app.router.getMy('edit');
        })
        .fail(function (data) {
          alert('Unable to add subject, try to refresh your page');
        });
    }

  });

  /**
   * ##############################################3
   * Schedule
   */

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

    getMonth : function (m) {
      if(m < 0) return 'Unknown';
      return months[m];
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

  window.app.WeekDay = Backbone.Model.extend({
    defaults : {
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
    model : app.WeekDay
  });

  window.app.Schedule = Backbone.Model.extend({
    defaults : {
      title    : '',
      error    : null,
      weekdays : []
    },
    urlRoot : '/api/schedule/',

    initialize : function (options) {
      options || (options = {});
      this.urlRoot += options.url;
    }
  });

  window.app.WeekDayView = Backbone.View.extend({
    tagName   : 'div',
    className : 'bwrap',
    template  : $('#weekdayTemplate').html(),
    editable  : false,

    events : {
      'click .addsubject button' : 'showForm',
      'click .controlbar button' : 'removeTopic'
    },

    initialize : function (options) {
      this.editable = options.editable;
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
      var form = new app.AddSubjectView();
    },

    removeTopic : function (e) {
      $el = $(e.target);
      $.ajax({
          type : 'DELETE',
          url  : '/api/subject/' + $el.attr('data-link'),
          data : '',
          beforeSend : function () {
            $el.parents('.subject').slideUp('fast');
          }
        })
        .done(function () {
          window.app.router.getMy('edit');
        })
        .fail(function (data) {
          $el.parents('.subject').show();
          alert('Unable to remove, try to refresh your page');
        });
    }
  });

  window.app.WeekView = Backbone.View.extend({
    el           : $('#days'),
    errTmpl      : $('#weekNotFound').html(),
    noTmpl       : $('#noDays').html(),
    editable     : false,
    subjectUrl   : '/api/subject',

    initialize : function (data, options) {
      data    || (data = {});
      options || (options = {});
      this.editable = options.editable || false;
      this.collection = new app.Week(data, options);
    },

    render : function () {
      var that = this;

      this.$el.empty();
      _.each(this.collection.models, function (item) {
        that.renderWeekDay(item);
      }, this);
      app.alignDays();

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

  window.app.ScheduleView = Backbone.View.extend({

    model  : null,
    week   : null,
    $title : $('#scheduleTitle'),

    initialize : function (options) {
      options || (options = {});
      this.model = new app.Schedule(options);

      var that = this;
      this.model.fetch({
        success : function () {
          that.week = new app.WeekView(that.model.attributes.weekdays, options);
          that.render();
        },

        error   : function () {
          that.week = new app.WeekView(null, options);
          that.showErr();
        }
      });
    },

    render : function () {
      this.$title.text(this.model.attributes.title);
      this.week.render();

      return this;
    },

    showErr : function () {
      this.$title.text('');
      this.week.showErr();
    },

    getTitle : function () {
      return this.$title.text();
    }

  });

  /**
   * ##########################################
   * Subject
   */

  var subjectHelper = {
    toUrl : function (name) {
      return encodeURIComponent(name.replace(/\s/g, '_').toLowerCase());
    }
  };

  window.app = window.app || {};

  window.app.Subject = Backbone.Model.extend({
    url : '/api/subject/',

    initialize : function (options) {
      this.url = this.url + encodeURIComponent(options.url);
    }
  });

  window.app.SubjectView = Backbone.View.extend({
    el : $('.subjectpage article'),
    template : $('#subjectTemplate').html(),

    initialize : function (options) {
      this.model = new app.Subject({ url : options.url });

      var that = this;
      this.model.fetch({
        success : function () {
          that.render();
        }
      });
    },

    render : function () {
      var tmpl = _.template(this.template),
          data = this.model.toJSON();

      _.extend(data, subjectHelper);
      this.$el.html(tmpl(data));

      return this;
    }
  });

})(jQuery);
