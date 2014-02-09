;(function ($) {

  window.app = window.app || {};

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

  $(window).resize(function () {
    app.alignDays();
  });

})(jQuery);
