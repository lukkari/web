;(function ($) {

  // helpmenu
  $('.helpmenutoggle').on('click', function (e) {
    e.preventDefault();
    $('.helpmenu').slideToggle('fast');
  });

  $(document).on('click', function (e) {
    if($(e.target).is('.helpmenutoggle')) return;
    else $('.helpmenu').slideUp('fast');
  });

})(jQuery);
