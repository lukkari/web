;(function ($) {

  $('.clear a').on('click', function (e) {
    var $that = $(this);
    e.preventDefault();

    if(!confirm("Do you want clear this parse subjects?"))
      return false;

    $.ajax({
        type : "PUT",
        url  : $that.attr('href'),
        data : ""
      })
      .fail(function () {
        $that.parents('li').addClass('mistake');
      })
      .done(function (data) {
        $that.parents('li').removeClass('parsed');
      });

  });

  $('.del a').on('click', function (e) {
    var $that = $(this);
    e.preventDefault();

    if(!confirm("Do you want yo delete this parse and it's subjects?"))
      return false;

    $.ajax({
        type : "DELETE",
        url  : $that.attr('href'),
        data : "",
        beforeSend : function () {
          $that.parents('li').fadeOut('fast');
        }
      })
      .fail(function () {
        $that.parents('li').fadeIn('fast', function() {
          alert('Error with deleting');
        });
      })
      .done(function (data) {
        $that.parents('li').remove();
      });

  });

  $('.link a').on('click', function (e) {
    var $that = $(this);
    e.preventDefault();

    $.ajax({
        type : 'GET',
        url  : $that.attr('href'),
        data : ""
      })
      .fail(function () {
        $that.parents('li').addClass('mistake');
      })
      .done(function () {
        $that.parents('li').addClass('parsed');
      });

  });

  $('#runstaff').on('submit', function (e) {
    var $that = $(this);
    e.preventDefault();

    $.post($that.attr('action'), $that.serialize())
     .done(function (data) {
       $that.children('.text')
            .addClass('done')
            .delay(2000)
            .queue(function () {
              $(this).removeClass('done');
              $(this).val('');
            });
     })
     .fail(function (data) {
       $('#error').text(data.responseText);
     });
  });

  $('#addparse').on('submit', function (e) {
    var $that = $(this);
    e.preventDefault();

    $.post($that.attr('action'), $that.serialize())
     .done(function (data) {
      $that.children('.long')
           .addClass('done')
           .delay(2000)
           .queue(function () {
            $(this).removeClass('done');
            $(this).val('');
           });
      console.log(data);
     })
     .fail(function (data) {
       $('#error').text(data.responseText);
     });
  });

})(jQuery);