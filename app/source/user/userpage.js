/**
 * Boot schedule page
 */

var
  $ = require('jquery'),
  Backbone = require('backbone');

Backbone.$ = $;

var
  UserTable = require('./models/usertable'),
  UserTableView = require('./views/usertable');

$(document).ready(function () {

  $confirm = $('#confirm');

  $('#toconfirm').on('click', function () {
    $confirm.fadeIn('fast');
    $('#oldpassword').focus();
  });

  $('.cancelbtn').on('click', function () {
    $confirm.fadeOut('fast');
  });

  var usertable = new UserTable();
  usertable.fetch();

  var userTableView = new UserTableView({
    el : '#subjects',
    model : usertable
  });

});
