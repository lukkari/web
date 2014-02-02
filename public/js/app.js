;(function ($) {

  var ItemLink = Backbone.Model.extend({
    defaults : {
      name  : ''
    }
  });

  var GroupList = Backbone.Collection.extend({
    model : ItemLink,
    url   : '/api/groups'
  });

  var TeacherList = Backbone.Collection.extend({
    model : ItemLink,
    url   : '/api/teachers'
  });

  var ItemLinkView = Backbone.View.extend({
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

  var ListView = Backbone.View.extend({

    el : $('.sidebar'),

    properties : {
      type : ''
    },

    events : {
      'click a' : 'closeList',
      'keyup #groupFilter' : 'searchFilter'
    },

    initialize : function (options) {
      options || (options = {});

      switch (options.list) {
        case 'group' :
          this.collection = new GroupList();
          break;
        case 'teacher' :
          this.collection = new TeacherList();
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
      _.each(this.collection.models, function (item) {
        that.renderItem(item);
      }, this);

      return this;
    },

    renderItem : function (item) {
      var itemLinkView = new ItemLinkView({
        model: item
      });
      this.$el.append(itemLinkView.render().el);
    },

    closeList : function (e) {
      header.set(this.title, e.target.text);
      sideBar.close();
    },

    searchFilter : function (e) {
      console.log('test');
      console.log(e);
    }
  });

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


  var Subject = Backbone.Model.extend({
    url : '/api/subject/',

    initialize : function (options) {
      this.url = this.url + encodeURIComponent(options.url);
    }
  });

  var SubjectView = Backbone.View.extend({
    el : $('.subjectpage article'),
    template : $('#subjectTemplate').html(),

    initialize : function (options) {
      this.model = new Subject({ url : options.url });

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

      _.extend(data, viewHelper);
      this.$el.html(tmpl(data));

      return this;
    }
  });


  //##########################################################################

  var Router = Backbone.Router.extend({
    routes : {
      ''               : 'mainpage',
      'back'           : 'goBack',
      'subject/:q'     : 'subject',
      'w:w/:q(/)'      : 'search2',
      ':q(/)(w:w)(/)'  : 'search',
      '*other'         : 'unknown'
    },

    initialize : function () {
      var groups = new ListView({
        el : $('#groupList .list'),
        list : 'group'
      });

      var teachers = new ListView({
        el : $('#teacherList .list'),
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
      Backbone.history.on('route', function() { this.history.push(window.location.pathname.substr(1)); }, this);
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
      pagesCtrl.toggle('mainpage');
    },

    goBack : function () {
      this.back();
    },

    subject : function (q) {
      pagesCtrl.toggle('subject');

      var subject;
      if(subject = this.findIn(this.subjects, q))
        subject.render();
      else {
        subject = new SubjectView({ url : q });
        this.subjects.urls.push(q);
        this.subjects.views.push(subject);
      }
    },

    search2 : function (w, q) {
      this.search(q, w);
    },

    search : function (q, w) {
      pagesCtrl.toggle('schedule');

      var query = q;

      if(w)
        query += '?w=' + w;

      weekBar.set(q, w);

      var schedule;
      if(schedule = this.findIn(this.schedule, query))
        schedule.render();
      else {
        schedule = new WeekView({ url : query });
        this.schedule.urls.push(query);
        this.schedule.views.push(schedule);
      }
    },

    unknown : function () {
      pagesCtrl.toggle('unknown');
    }
  });


  var header = function () {

    var sourse = {
      group : {
        $el  : $('#group'),
        data : $('#group').text()
      },
      teacher : {
        $el  : $('#teacher'),
        data : $('#teacher').text()
      }
    };

    function clear(type) {
      for(el in sourse) {
        if((!type) && (el != type)) {
          console.log(type);
          sourse[el].$el.text(sourse[el].data);
        }
      }
    }

    return {
      clear : function () {
        //clear();
      },

      set : function (type, val) {
        /*clear(type);
        sourse[type].$el.text(val);*/
      }
    }
  }();

  var pagesCtrl = function () {

    var $pages = {
      mainpage : $('.mainpage'),
      schedule : $('.schedule'),
      unknown  : $('.unknown'),
      subject  : $('.subjectpage')
    };

    function hideAll() {
      header.clear();
      for(page in $pages)
        $pages[page].hide();
    }

    return {
      toggle : function (page) {
        hideAll();
        $pages[page].show();
      }
    }

  }();

  var sideBar = function () {

    $('.sidebarwrap .closebtn').on('click', function (e) {
      e.preventDefault();
      close();
    });

    $('.sidebarwrap .bg').on('click', function () {
      close();
    });

    var $container   = $('.sidebar .container'),
        $sidebarwrap = $('.sidebarwrap'),
        $sidebar     = $('.sidebarwrap .sidebar');


    function show(id) {
      $container.children('div').hide();
      $('#'+id).show();

      if(parseInt($sidebar.css('left')) > -100)
        $sidebar.css('left', -$sidebar.width());

      $sidebarwrap.fadeIn('fast');
      $sidebar.css('left', 0);
    }

    function close() {
      $sidebarwrap.fadeOut('fast');
      $sidebar.css('left', -700);
    }

    return {
      show : function (id) {
        show(id);
      },

      close : function () {
        close();
      }
    }

  }();

  var weekBar = function () {

    var $weeknum  = $('#weeknum'),
        $getWNum  = $('#ca')
        $prevweek = $('#prevweek'),
        $nextweek = $('#nextweek');

    return {
      set : function (q, w) {
        q = '/' + q;

        var w = w || parseInt($weeknum.attr('data-weeknow'));
        $weeknum.text(w);
        $weeknum.attr('data-week', w);

        if(w > 1)
          $prevweek.attr('href', q + '/w' + (+w - 1));
        else
          $prevweek.attr('href', q + '/w' + w);

        $nextweek.attr('href', q + '/w' + (+w + 1));

        calendar.select(w);
      }
    }
  }();


  var calendar = function () {
    var prevw;

    $("#calendar tr[data-link='w" + $('#weeknum').attr('data-week') + "']").addClass('selected');

    $('#calendar tbody tr').on('click', function () {
      var navto = window.location.pathname + location.hash,
          week  = $(this).attr('data-link'),
          match;

      if(match = navto.match(/w[0-9]+/ig)) {
        navto = navto.replace(match, week);
      }
      else
        navto += "/" + week;

      selectWeek(week.substr(1));
      navto = navto.replace('#', '');
      router.navigate(navto, { trigger : true });
    });

    function selectWeek (w) {
      if(w !== prevw) {
        prevw = w;
        $('#calendar tr.selected').removeClass('selected');
        $("#calendar tr[data-link='w"+ w +"']").addClass('selected');
      }
    }

    return {
      select : function (w) {
        if(w)
          selectWeek(w);
      }
    }

  }();

  /**
   * ######################################################
   * Init
   */

  var router = new Router();
  Backbone.history.start({ pushState: true });

  $(document).on('click', 'a[data-local]', function (e) {

    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      router.navigate(href, true);
    }
  });

  $('.topmenu li a').on('click', function (e) {
    e.preventDefault();
    sideBar.show($(this).attr('id') + 'List');
  });

  $('.weekcontent').on('click', function (e) {
    e.preventDefault();
    $('#calendar').slideToggle('fast');
  });

  // Contacts form
  $('#message').on('focus', function (e) {
    $(this).addClass('big');
    $('#hiddenform').slideDown('fast');
  });

  $('#send').on('click', function(e) {
    $.ajax({
      type : "POST",
      url  : "/api/messages",
      data : "msg=" + encodeURIComponent($('#message').val()) + "&from=" + encodeURIComponent($('#replyto').val()),
      success : function (data) {
        $('#sent').slideDown('fast', function() {
          setTimeout(function () {
            $('#sent').fadeOut('slow');
          }, 4000);
        });
      }
    });

    $('#hiddenform').slideUp('fast');
    $('#message').removeClass('big');
    $('#replyto').val('');
    $('#message').val('');
  });


  function alignDays() {
    var blocks = $('.bwrap');

    var docW = $(document).width();
    var currW = blocks.eq(1).width();
    var ratio = docW / currW;
    var cols = Math.round(docW / currW);
    //cols = ratio > 5 ? 6 : cols;
    var rows = Math.ceil(blocks.length / cols);

    if(cols < 2) {
      blocks.css("height", "auto");
      return true;
    }

    for(var i = 0; i < rows; i += 1)
      blocks.slice(i*cols, (i+1)*cols).equalHeights();

    return true;
  }

  $(window).resize(function () {
    alignDays();
  });

}(jQuery));
