;(function ($) {

  window.app = window.app || {};

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
      schedule : {
        url     : '/',
        id      : 'nowlink',
        label   : 'Today schedule',
        islocal : false
      },
      unknown  : null,
      subject  : null
    },

    curpage  = null,

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

})(jQuery);
