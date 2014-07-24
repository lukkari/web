/**
 * Staff page parser
 */

var mongoose = require('mongoose');

module.exports = function ($) {
  var count = {
    groups   : 0,
    teachers : 0,
    rooms    : 0
  }, tmp, tmp2, i = -1, j;

  var
    Group   = mongoose.model('Group'),
    Teacher = mongoose.model('Teacher'),
    Room    = mongoose.model('Room');

  $('td[bgcolor], td[size], td[valign]').each( function () {
    tmp = $(this).find('b').eq(0).text().trim();

    if(i > 2) return;

    if(tmp.length > 0) i += 1;
    else {
      tmp2 = $(this).find('a').eq(0).text().trim();
      // Put elements to array in chronological order
      switch(i) {
        case 0:
          var group = new Group({
            name     : tmp2
          });
          group.save(function (err, group, num) {
            if(err) console.log(err);

            count.groups += 1;
          });
          break;

        case 1:
          var teacher = new Teacher({
            name     : tmp2
          });
          teacher.save(function (err, teacher, num) {
            if(err) console.log(err);

            count.teachers += 1;
          });
          break;

        case 2:
          var room = new Room({
            name     : tmp2
          });
          room.save(function (err, room, num) {
            if(err) console.log(err);

            count.rooms += 1;
          });
          break;
      }
    }
  });

  return count;
};
