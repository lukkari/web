/**
 * Parser of schedule by link
 * Parser of staff (get all groups, teachers and rooms)
 */

var mongoose = require('mongoose'),
    request  = require('request'),
    jsdom    = require('jsdom'),
    iconv    = require('iconv'),
    ic       = new iconv.Iconv('ISO-8859-1', 'utf-8');

var parser = function () {

  var staff = {
    "groups"   : [],
    "teachers" : [],
    "rooms"    : []
  };

  function renewStaff() {

    var Group = mongoose.model('Group');
    Group.getAll(function (err, groups) {
      if(err) {
        console.log(err);
        return false;
      }
      staff.groups = groups;
    });

    var Teacher = mongoose.model('Teacher');
    Teacher.getAll(function (err, teachers) {
      if(err) {
        console.log(err);
        return false;
      }
      staff.teachers = teachers;
    });

    var Room = mongoose.model('Room');
    Room.getAll(function (err, rooms) {
      if(err) {
        console.log(err);
        return false;
      }
      staff.rooms = rooms;
    });

  }

  function doParse(url, callback) {
    renewStaff();

    request({
      uri: url,
      marhod: 'GET',
      encoding: 'binary',
      timeout: 2000,
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // Convert finnish symbols to utf-8 properly
          body = new Buffer(body, 'binary');
          body = ic.convert(body).toString();

          callback(false, body);
        }
        else if(error) callback(error);
        else callback('Parse stopped [page not found]');
      });
  }

  // Arr is an object with fields from dbmodels.js
  function inStrInArr(str, arr) {
    var tmp = [];
    arr.forEach( function (value) {
      if(str.indexOf(value.name) > 0)
        tmp.push(value);
    });

    return tmp;
  }

  function remInStrFromArr(str, arr) {
    arr.forEach( function (value) {
      str = str.replace(value.name, '');
    });
    return str;
  }

  var stack = function () {
    var stack   = [],
        running = false;

    function run() {
      if(!stack.length) return;

      running = true;
      var obj = stack.shift();

      obj.f(obj.data, function () {
        running = false;
        run();
      });
    }

    return {
      exec : function (func, data) {
        stack.push({ f: func, data : data });

        if(!running) run();

        return;
      }
    };

  }();

  return {

    doStaff: function (url, house, callback) {
      if(url.length < 2) return callback('Url is too short');

      doParse(url, function (error, result) {
        if(error) {
          callback(error);
          return false;
        }

        jsdom.env(
          result,
          ['http://code.jquery.com/jquery-latest.min.js'],
          { encoding: "binary", method: 'GET' },
          function (errors, window) {
            if(errors) {
              callback(errors);
              return false;
            }

            var count = {
              groups   : 0,
              teachers : 0,
              rooms    : 0
            }, tmp, tmp2, i = -1, j;

            window.$('td[bgcolor], td[size], td[valign]').each( function () {
              tmp = window.$(this).find('b').eq(0).text().trim();

              if(i > 2) return;

              var Group   = mongoose.model('Group'),
                  Teacher = mongoose.model('Teacher'),
                  Room    = mongoose.model('Room');

              if(tmp.length > 0) i += 1;
              else {
                tmp2 = window.$(this).find('a').eq(0).text().trim();
                // Put elements to array in chronological order
                switch(i) {
                  case 0:
                    var group = new Group({
                      name     : tmp2,
                      building : house
                    });
                    group.save(function (err, group, num) {
                      if(err) console.log(err);

                      count.groups += 1;
                    });
                    break;

                  case 1:
                    var teacher = new Teacher({
                      name     : tmp2,
                      building : house
                    });
                    teacher.save(function (err, teacher, num) {
                      if(err) console.log(err);

                      count.teachers += 1;
                    });
                    break;

                  case 2:
                    var room = new Room({
                      name     : tmp2,
                      building : house
                    });
                    room.save(function (err, room, num) {
                      if(err) console.log(err);

                      count.rooms += 1;
                    });
                    break;
                }
                console.log(i + '-' +tmp2);
              }
            });

            return callback(false, count);
          }
        );
      });
    },

    doSchedule: function (url, parseId, callback) {
      if(url.length < 2) return callback('Url is too short');

      if(g_err) return callback('Init error');

      doParse(url, function (error, result) {
        if(error) {
          callback(error);
          return false;
        }

        jsdom.env(
          result,
          ['http://code.jquery.com/jquery-latest.min.js'],
          { encoding: "binary", method: 'GET' },
          function (errors, window) {
            if(errors) {
              callback(errors);
              return false;
            }

            var Subject = mongoose.model('Subject'),
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

            window.$("table[bgcolor] tr").each( function (index) {

              if(index === 0) {
                // Parse date
                tmp = window.$(this).find('b').text();
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
                window.$(this).find('td').each( function (index) {
                  // Get content, return when only text or in tag <b> (some course titles)
                  tmp = window.$(this).children('font').contents().filter( function() {
                    return (this.nodeType == 3) || (this.nodeName == 'B');
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
                  }
                  else {
                    // Find duration
                    j = parseInt(window.$(this).attr('rowspan'));
                    if(!j || j < 1) j = 1;

                    // Check if col is busy
                    while(lastBusyRow[col] > row) {
                      col += 1;
                    }
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
                      obj.groups = inStrInArr(tmp2, staff.groups);
                      tmp2 = remInStrFromArr(tmp2, obj.groups);

                      obj.teachers = inStrInArr(tmp2, staff.teachers);
                      tmp2 = remInStrFromArr(tmp2, obj.teachers);

                      obj.rooms = inStrInArr(tmp2, staff.rooms);
                      tmp2 = remInStrFromArr(tmp2, obj.rooms);

                      obj.coursenum = /^\d{6,8}[A-Z]?/g.exec(tmp2);
                      if(obj.coursenum !== null) {
                        obj.coursenum = obj.coursenum[0];
                        tmp2 = tmp2.replace(obj.coursenum, '');
                      }
                      else obj.coursenum = 0;

                      tmp2 = tmp2.trim();

                      // Check if subject exists
                      var data = {
                        name      : tmp2,
                        days      : [{
                          date     : date,
                          duration : j
                        }],
                        rooms     : obj.rooms,
                        groups    : obj.groups,
                        teachers  : obj.teachers,
                        coursenum : obj.coursenum,
                        parse     : parseId,
                        createdAt : new Date()
                      };


                      stack.exec(function (data, next) {
                        Subject
                          .findOne({
                              name : data.name
                            })
                          .sort({ createdAt : 1 })
                          .exec(function (err, subject) {
                              if(err) console.log(err);

                              if(subject) {
                                subject.addDay(data.days[0], function (err) {
                                  if(err) console.log(err);

                                  next();
                                });
                              }
                              else {
                                // If not found Save subject to the db
                                subject = new Subject(data);
                                subject.save(function (err) {
                                  if(err) console.log(err);

                                  next();
                                });
                              }
                            }
                          );
                        },
                        data
                      );

                      count += 1;
                    }

                    col += 1;
                  }
                });
              }
            });

            callback(false, count);
            return true;
          }
        );
      });
    }
  };

}();

module.exports = parser;
