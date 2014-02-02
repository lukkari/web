(function ($) {

  $confirm = $('#confirm');

  $('#toconfirm').on('click', function () {
    $confirm.fadeIn('fast');
    $('#oldpassword').focus();
  });

  $('.cancelbtn').on('click', function () {
    $confirm.fadeOut('fast');
  })

})(jQuery);