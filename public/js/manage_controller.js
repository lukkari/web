(function ($) {

  $('.clear a').click(function (e) {
    var that = this;
    e.preventDefault();

    $.ajax({
      type : "PUT",
      url  : $(that).attr('href'),
      data : "ajax=true",
      success : function (data) {
        $(that).parents('li').removeClass('parsed');
      }
    });

  });

  $('.del a').click(function (e) {
    var that = this;
    e.preventDefault();

    $.ajax({
      type : "DELETE",
      url  : $(that).attr('href'),
      data : "ajax=true",
      beforeSend : function () {
        $("body").css("cursor", "wait");
      },
      complete : function () {
        $("body").css("cursor", "default");
      },
      success : function (data) {
        $(that).parents('li').fadeOut('fast', function () {
          $(this).remove();
        });
      }
    });

  });

  $('.link a').click(function (e) {
    var that = this;
    e.preventDefault();

    $.ajax({
      type : 'GET',
      url  : $(that).attr('href'),
      data : "ajax=true",
      success : function () {
        $(that).parents('li').addClass('parsed');
      }
    });

  });

})(jQuery);