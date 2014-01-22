(function ($) {

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

}(jQuery));