/**
 * Staff page parser
 */

var mongoose = require('mongoose');

function makeLink(parent, child) {
  return parent.slice(0, parent.lastIndexOf('/') + 1) + child;
}

module.exports = function ($, link) {
  var
    links = [],
    tmp, tmp2, i = -1, j;

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
          tmp = $(this).find('a').eq(0).attr('href');
          var group = new Group({
            name : tmp2
          });
          group.save(function (err, group) {
            // Don't show dublicate key error
            if(err && err.code != 11000) console.log(err);

            if(group) console.log('Group: ' + group.name + ' added');
          });

          links.push(makeLink(link, tmp));
          break;

        case 1:
          var teacher = new Teacher({
            name : tmp2
          });
          teacher.save(function (err, teacher) {
            // Don't show dublicate key error
            if(err && err.code != 11000) console.log(err);

            if(teacher) console.log('Teacher: ' + teacher.name + ' added');
          });
          break;

        case 2:
          var room = new Room({
            name : tmp2
          });
          room.save(function (err, room) {
            // Don't show dublicate key error
            if(err && err.code != 11000) console.log(err);

            if(room) console.log('Room: ' + room.name + ' added');
          });
          break;
      }
    }
  });

  return links;
};
