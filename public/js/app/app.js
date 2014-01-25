(function ($) {

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
      var d = new Date(date);

      return d.getHours() + ':' + d.getMinutes();
    },

    getMonth : function (date) {
      var d = new Date(date);

      return months[d.getMonth()];
    },

    toUrl : function (name) {
      return name.replace(/\s/g, '_').toLowerCase();
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
      console.log('error');
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
      ''       : 'mainpage',
      ':q'     : 'search',
      ':q/'    : 'search',
      ':q/:q2' : 'search'
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
      $('.schedule').hide();
      $('.mainpage').show();
      header.clear();
    },

    search : function (q, q2) {
      $('.mainpage').hide();
      $('.schedule').show();

      var query = q,
          week;

      if(q2)
        if(q.match(/w[0-9]+/ig)) {
          query = q2 + '/' + q;
          week = q;
        }
        else {
          query = q + '/' + q2;
          week = q2;
        }

      weekBar.set(query, week);

      var schedule = new WeekView({ url : query })
    }
  });


  var header = function () {

    var sourse = ['#group', '#teacher'];

    function clear() {
      sourse.forEach(function (el) {
        $(el).text($(el).attr('ref'));
      });
    }

    return {
      clear : function () {
        clear();
      },

      set : function (type, val) {
        clear();
        $('#' + type).text(val);
      }
    }
  }();

  var sideBar = function () {
    var active = false,
        that   = this;

    $('.sidebarwrap .container').height(
      $(document).height() - $('.sidebarwrap .closebtn').outerHeight(true) - 35
    );

    //$('.sidebarwrap .bg').height($(document.height()));

    $('.sidebarwrap .closebtn').click(function (e) {
      e.preventDefault();
      close();
    });

    $('.sidebarwrap .bg').click(function () {
      close();
    });

    function show(id) {
      $('.sidebarwrap .container > div').hide();
      $('#'+id).show();

      if(parseInt($('.sidebarwrap .sidebar').css('left')) > -100)
        $('.sidebarwrap .sidebar').css('left', -$('.sidebarwrap .sidebar').width());

      $('.sidebarwrap').fadeIn('fast');
      $('.sidebarwrap .sidebar').animate({ left : 0 }, 400);
    }

    function close() {
      $('.sidebarwrap').fadeOut('fast');
      $('.sidebarwrap .sidebar').animate(
        { left : '-' + $('.sidebarwrap .sidebar').width() + 'px' },
        400
      );
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

    return {
      set : function (q, w) {

        if(w) {
          $('#weeknum').text(w.substr(1));
          if(q.indexOf('/') !== 0)
            q = '/' + q;
          $('#prevweek').attr('href', q.replace('/' + w, '/w' + (w.substr(1) - 1)));
          $('#nextweek').attr('href', q.replace('/' + w, '/w' + (parseInt(w.substr(1)) + 1)));
        }
        else {
          var url = window.location.pathname,
              w   = parseInt($('#weeknum').text());

          $('#prevweek').attr('href', url + '/w' + (w - 1));
          $('#nextweek').attr('href', url + '/w' + (w + 1));
        }
      }
    }
  }();

  (function () {
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

    $("#calendar tr[link='w" + $('#weeknum').text() + "']").addClass('selected');

    $('.topmenu li a').click(function (e) {
      e.preventDefault();
      sideBar.show($(this).attr('id') + 'List');
    });

    $('.weekcontent').click(function (e) {
      e.preventDefault();

      $('#calendar').slideToggle('fast');
    });

    // Contacts form
    $('#message').focus(function (e) {
      $(this).addClass('big');
      $('#hiddenform').slideDown('fast');
    });

    $('#send').click(function(e) {
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

    $('#calendar tbody tr').click(function () {
      var navto = window.location.pathname,
          week  = $(this).attr('link'),
          match;


      if(match = navto.match(/w[0-9]+/ig))
        navto = navto.replace(match, week);
      else
        navto += "/" + week;

      $('#calendar tr.selected').removeClass('selected');
      $(this).addClass('selected');
      router.navigate(navto, { trigger : true });
    });

  })();

}(jQuery));