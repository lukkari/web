/**
 * Schedule parser
 */

var mongoose = require('mongoose');

/**
 * Fetch name which is in the Array and in the String
 * @param  {String} str String to search into
 * @param  {Array} arr  Array of groups/teachers/rooms
 * @return {Array}      Array of found words
 */
function inStrInArr(str, arr) {
  var tmp = [];
  arr.forEach(function (value) {
    if(str.indexOf(value.name) > 0) tmp.push(value);
  });

  return tmp;
}

/**
 * Remove all words in the Array from the String
 * @param  {String} str String from where words will be removed
 * @param  {Array} arr  Array of words
 * @return {String}     Edited String
 */
function remInStrFromArr(str, arr) {
  arr.forEach(function (value) {
    str = str.replace(value.name, '');
  });

  return str;
}

module.exports = function ($, link, staff) {

  var
    Subject = mongoose.model('Subject'),
    obj = {
      groups    : [],
      teachers  : [],
      rooms     : [],
      subject   : null,
      coursenum : null
    }, tmp, tmp2, i, j, date,
    row = -1, col = 0,
    time,
    count = 0,
    lastBusyRow = [],
    dates = [];

  for(i = 0; i < 5; i += 1) {
    lastBusyRow[i] = 0;
  }

  i = 0;

  $("table[bgcolor] tr").each(function (index) {

    if(index === 0) {
      // Parse date
      tmp = $(this).find('b').text();
      i = tmp.indexOf(':');
      j = tmp.indexOf('...');

      tmp2 = tmp.substr(i+1, j-i-1).trim().split('.');
      date = new Date(parseInt(tmp2[2]), parseInt(tmp2[1])-1, parseInt(tmp2[0]));

      //Prepare dates for each column
      for(i = 0; i < 5; i += 1) {
        dates[i] = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i).getTime();
      }
    }

    if(index > 1) {
      // Parse subject + times
      $(this).find('td').each(function (index) {
        // Get content, return when only text or in tag <b> (some course titles)
        tmp = $(this).children('font').contents().filter(function() {
         return (this.type == 'text') || (this.name == 'b');
        });
        tmp = tmp.text();

       // Try to parse time
        tmp2 = /\d{2}:\d{2}-\d{2}:\d{2}/g.exec(tmp);

        if(tmp2 !== null) {
          // When time found
          row += 1;
          col = 0;
          time = tmp2[0];
          time = time.substr(0, time.indexOf('-')).trim().split(':');
        } else {
          // Find duration
          j = parseInt($(this).attr('rowspan'));
          if(!j || j < 1) j = 1;

          // Check if col is busy
          while(lastBusyRow[col] > row) col += 1;

          lastBusyRow[col] = row + j;

          if(col > 4) return;

          // Push to result
          tmp2 = tmp.replace(/(\r\n|\n|\r)/gm, "").trim();

          // Sometimes we need to remove double slashes
          tmp2 = tmp2.replace(/\/\//gm, "");

          if(tmp2.length > 0) {
            date = new Date().setTime(dates[col] +
                                      parseInt(time[0]) * 60 * 60 * 1000 +
                                      parseInt(time[1]) * 60 * 1000);

            // Find group, teacher, room and subject and remove from the string
            obj.groups = inStrInArr(tmp2, staff[0]);
            tmp2 = remInStrFromArr(tmp2, obj.groups);

            obj.teachers = inStrInArr(tmp2, staff[1]);
            tmp2 = remInStrFromArr(tmp2, obj.teachers);

            obj.rooms = inStrInArr(tmp2, staff[2]);
            tmp2 = remInStrFromArr(tmp2, obj.rooms);

            obj.coursenum = /^\d{6,8}[A-Z]?/g.exec(tmp2);

            if(obj.coursenum !== null) {
              obj.coursenum = obj.coursenum[0];
              tmp2 = tmp2.replace(obj.coursenum, '');
            } else obj.coursenum = 0;

            tmp2 = tmp2.trim();

            var subjectName = tmp2;

            var entry = {
              date     : date,
              duration : j,
              rooms    : obj.rooms,
              groups   : obj.groups,
              teachers : obj.teachers
            };

            // Find subject
            Subject.findOne({ name : new RegExp(subjectName, 'i') }, function (err, subject) {
              if(err) console.log(err);

              // If exists, add Entry to Subject
              if(subject) {
                subject.addEntry(entry, function (err) {
                  if(err) console.log(err);

                  console.log('Entry added');
                });

                return true;
              }

              // If not, save subject
              subject = new Subject({
                name : subjectName,
                courseNum : obj.coursenum
              });

              subject.save(function (err, subject) {
                if(err) return console.log(err);

                // Add Entry to saved subject
                subject.addEntry(entry, function (err) {
                  if(err) console.log(err);

                  console.log('Subject added: ' + subjectName);
                });
              });


            });

            count += 1;
          }

          col += 1;
        }
      });
    }
  });

  return count;
};
