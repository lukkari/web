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

    getTime : function (date) {
      if(!date || !date.length) return 'No time';
      var d = new Date(date[0]);
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


  //##########################################################################

  var Router = Backbone.Router.extend({
    routes : {
      ''               : 'mainpage',
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
    },

    mainpage : function () {
      pagesCtrl.toggle('mainpage');
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

      var schedule = new WeekView({ url : query })
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
      unknown  : $('.unknown')
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

        var w = w || parseInt($weeknum.attr('data-week'));
        $weeknum.text(w);

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

    $("#calendar tr[data-link='w" + $('#weeknum').text() + "']").addClass('selected');

    $('#calendar tbody tr').on('click', function () {
      var navto = window.location.pathname,
          week  = $(this).attr('data-link'),
          match;


      if(match = navto.match(/w[0-9]+/ig))
        navto = navto.replace(match, week);
      else
        navto += "/" + week;

      selectWeek(week.substr(1));
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

}(jQuery));