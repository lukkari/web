;(function ($) {

  $('.clear a').on('click', function (e) {
    var that = this;
    e.preventDefault();

    if(!confirm("Do you want clear this parse subjects?"))
      return false;

    $.ajax({
      type : "PUT",
      url  : $(that).attr('href'),
      data : "ajax=true",
      error : function () {
        $(that).parents('li').addClass('mistake');
      },
      success : function (data) {
        $(that).parents('li').removeClass('parsed');
      }
    });

  });

  $('.del a').on('click', function (e) {
    var that = this;
    e.preventDefault();

    if(!confirm("Do you want yo delete this parse and it's subjects?"))
      return false;

    $.ajax({
      type : "DELETE",
      url  : $(that).attr('href'),
      data : "ajax=true",
      beforeSend : function () {
        $(that).parents('li').fadeOut('fast');
      },
      error : function () {
        $(that).parents('li').fadeIn('fast', function() {
          alert('Error with deleting');
        });
      },
      success : function (data) {
        $(that).parents('li').remove();
      }
    });

  });

  $('.link a').on('click', function (e) {
    var that = this;
    e.preventDefault();

    $.ajax({
      type : 'GET',
      url  : $(that).attr('href'),
      data : "ajax=true",
      error : function () {
        $(that).parents('li').addClass('mistake');
      },
      success : function () {
        $(that).parents('li').addClass('parsed');
      }
    });

  });

})(jQuery);