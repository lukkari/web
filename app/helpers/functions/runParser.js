/**
 * Run parser function
 */

var
  mongoose = require('mongoose'),
  async    = require('async');

var
  Group   = mongoose.model('Group'),
  Teacher = mongoose.model('Teacher'),
  Room    = mongoose.model('Room');

var
  parser   = require('../parsers'),
  staff    = require('../parsers/staff'),
  schedule = require('../parsers/schedule');

/**
 * Runs parser
 * @param  {Object}   parse  Parse object
 * @param  {Function} finish Pass results or error callback
 */
function run(parse, finish) {

  if(!Array.isArray(parse.children)) return finish(new Error('Nothing to parse'));

  var week = new Date().getWeek();

  // Return objects only after current week
  var links = parse.children.filter(function (el) {
    return el.week > week;
  });

  // Add parse url to links url
  links = links.map(function (el) {
    return parse.url + el.url;
  });

  // Parse staff first from the given array of links
  parser(links, {
    parser : staff,
    done : function (err, result) {
      if(err) {
        return finish(400, err);
      }

      var timetables = [];

      // Transform Array of Arrays of links to just Array
      result.forEach(function (el) {
        timetables = timetables.concat(el);
      });

      console.log('Staff parsed');

      // Fullfill staff object with groups, teachers and rooms
      async.series([
          function (cb) {
            Group.find({}, { name : 1 }, cb);
          },

          function (cb) {
            Teacher.find({}, { name : 1 }, cb);
          },

          function (cb) {
            Room.find({}, { name : 1 }, cb);
          }
        ],
        function (err, results) {
          if(err) console.log(err);

          console.log('Start schedule parsing');

          // Parse timetables from the given array of links
          parser(timetables, {
            info : results,
            parser : schedule,
            done : function (err, result) {
              console.log('Schedule parsed');

              parse.parsed = new Date();
              parse.save();

              if(err) {
                return finish(400, err);
              }
              finish(null, result);
            }
          });
        }
      );
    }
  });
}

module.exports = run;
