;(function ($) {

  window.app = window.app || {};

  /**
   * ############################################
   * Tools
   */

  window.app.helpMenu = function () {

    var $helpmenu = $('.helpmenu').children('ul'),
    counter = 0,

    append = function (options) {
      options || (options = {});

      options.islocal = options.islocal ? ' data-local' : '';

      var el = $('<li><a id="'+options.id+'" href="'+options.url+'"'+options.islocal+'>'+options.label+'</a></li>');
      $helpmenu.append(el);
      counter += 1;
    };

    return {
      append : function (items) {
        if(!items) return;

        if(Array.isArray(items)) {
          items.forEach(function (el) {
            append(el);
          });
        }
        else append(items);
      },

      detach : function () {
        for(var i = 0; i < counter; i += 1)
          $helpmenu.children().last().remove();

        counter = 0;
      }
    };
  }();

  window.app.pagesCtrl = function () {

    var $pages = {
      mainpage : $('.mainpage'),
      schedule : $('.schedule'),
      unknown  : $('.unknown'),
      subject  : $('.subjectpage')
    },

    links = {
      mainpage : null,
      schedule : [
        {
          url     : '/',
          id      : 'nowlink',
          label   : 'Today schedule',
          islocal : false
        }
      ],
      unknown  : null,
      subject  : null
    },

    curpage  = null;

    hideAll = function () {
      if(!curpage) return;

      $pages[curpage].hide();
      app.helpMenu.detach();
    };

    return {
      toggle : function (page) {
        if(curpage == page) return;

        hideAll();
        curpage = page;
        $pages[page].show();
        app.helpMenu.append(links[page]);
      }
    }

  }();

  window.app.sideBar = function () {

    $('.sidebarwrap .closebtn').on('click', function (e) {
      e.preventDefault();
      close();
    });

    $('.sidebarwrap .bg').on('click', function () {
      close();
    });

    var $sidebarwrap = $('.sidebarwrap'),
        $sidebar     = $('.sidebarwrap .sidebar'),
        $list        =  {
          groupList   : $('#groupList'),
          teacherList : $('#teacherList')
        },
        docH    = $(document).height(),
        prev    = null,

        show = function (id) {
          prev && $list[prev].hide();
          $list[id].show();
          prev = id;

          if(parseInt($sidebar.css('left')) > -100)
            $sidebar.css('left', -$sidebar.width());

          $sidebarwrap.fadeIn('fast');
          $sidebar.css('left', 0);

          setHeight();
        },

        close = function () {
          $sidebarwrap.fadeOut('fast');
          $sidebar.css('left', -700);
        },

        setHeight = function () {
          $sidebar.css('height','auto');
          if($sidebar.height() <= docH) $sidebar.height(docH);
        };

    return {
      show : function (id) {
        show(id);
      },

      close : function () {
        close();
      },

      setHeight : function () {
        setHeight();
      }
    }

  }();

  window.app.weekBar = function () {

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

        app.calendar.select(w);
      },

      getWeekNum : function () {
        return $weeknum.attr('data-week');
      }
    }
  }();


  window.app.calendar = function () {
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
      app.router.navigate(navto, { trigger : true });
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


  window.app.alignDays = function () {

    var alignBlocks = function ($blocks) {
      var maxH = 0;
      $blocks.each(function () {
        maxH = ($(this).height() > maxH) ? $(this).height() : maxH;
      });
      $blocks.height(maxH);
    },

      $blocks = $('.bwrap'),
      docW = $(document).width(),
      currW = $blocks.eq(1).width(),
      cols = Math.round(docW / currW),
      rows = Math.ceil($blocks.length / cols);

    if(cols < 2) {
      $blocks.css("height", "auto");
      return true;
    }

    for(var i = 0; i < rows; i += 1) {
      alignBlocks($blocks.slice(i*cols, (i+1)*cols));
    }

    return true;
  }

  /**
   * #############################################################
   * Router
   */

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
      $(function () {
        var groups = new app.ListView({
          el : $('#groupList'),
          list : 'group'
        });

        var teachers = new app.ListView({
          el : $('#teacherList'),
          list: 'teacher'
        });
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
      q += '?w=' + app.weekBar.getWeekNum();

      $('#nowlink').attr('href', '/my/now');

      var schedule;
      if(edit) {
        schedule = new app.ScheduleView({ url : q, editable : edit });
        return;
      }

      if(schedule = this.findIn(this.schedule, q))
        schedule.render();
      else {
        schedule = new app.ScheduleView({ url : q, editable : edit });
        this.schedule.urls.push(q);
        this.schedule.views.push(schedule);
      }
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

  /**
   * ####################################################
   * Handlers
   */

  $(document).on('click', 'a[data-local]', function (e) {

    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      app.router.navigate(href, true);
    }
  });

  $('.topmenu li a:not(.helpmenutoggle)').on('click', function (e) {
    e.preventDefault();
    app.sideBar.show($(this).attr('id') + 'List');
  });

  $('.weekcontent').on('click', function (e) {
    e.preventDefault();
    $('#calendar').slideToggle('fast');
  });

  // helpmenu
  $('.helpmenutoggle').on('click', function (e) {
    e.preventDefault();
    $('.helpmenu').slideToggle('fast');
  });

  $(document).on('click', function (e) {
    if($(e.target).is('.helpmenutoggle')) return;
    else $('.helpmenu').slideUp('fast');
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

  $(window).resize(function () {
    app.alignDays();
  });

})(jQuery);
