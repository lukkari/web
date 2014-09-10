/**
 * Run parser function
 */

var
  mongoose = require('mongoose'),
  async    = require('async');

var
  Group   = mongoose.model('Group'),
  Teacher = mongoose.model('Teacher'),
  Room    = mongoose.model('Room'),
  Subject = mongoose.model('Subject'),
  Entry   = mongoose.model('Entry');

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

  var
    d    = new Date(),
    week = d.getWeek();

  // If current day is Saturday or Sunday force week to be next
  if((d.getDay() > 4) || (d.getDay() < 1)) week++;
  // Return objects starting from current week
  var links = parse.children.filter(function (el) {
    return el.week >= week;
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

          var helpers = {
            staff : results,
            parse : parse._id,
            saver : new Saver()
          };

          // Parse timetables from the given array of links
          parser(timetables, {
            helpers : helpers,
            parser  : schedule,
            done : function (err, result) {
              console.log('Schedule parsed');

              parse.parsed = new Date();
              parse.save();

              if(err) {
                return finish(400, err);
              }

              finish(null, result);

              // Check for dublicate subjects
              // setTimeout(dublicateCheck, 2000);
            }
          });
        }
      );
    }
  });
}

/**
 * Class of adding subjects and entries to the db
 */
function Saver() {
  this.queue = [];
  this.started = false;

  return this;
}

/**
 * Adds object to the queue
 * @param {Object} obj Object containing subject and entry
 */
Saver.prototype.add = function (obj) {
  obj = obj || {};
  if(obj.subject && obj.entry) {
    this.queue.push(obj);

    // If adding to db hasn't started start
    if(!this.started) this.toDb();
  }

  return this;
};

/**
 * Start adding to database process
 */
Saver.prototype.toDb = function () {
  if(!this.queue.length) {
    this.started = false;
    return this;
  }

  this.started = true;

  var elem = this.queue.shift();

  this.addToDb(elem, (function (err) {
    if(err) console.log(err);

    this.toDb();
  }).bind(this));

  return this;
};

/**
 * Adds object to the database
 * @param {Object}   obj  Object containing subject and entry
 * @param {Function} next Callback
 */
Saver.prototype.addToDb = function (obj, next) {
  obj = obj || {};

  if(!obj.subject || !obj.entry) return next(new Error('Empty object'));

  Subject.findOne({ name : new RegExp(RegExp.escape(obj.subject.name), 'i') }, function (err, subject) {
    if(err) console.log(err);

    // If exists, add Entry to Subject
    if(subject) {
      subject.addEntry(obj.entry, function (err) {
        if(err) console.log(err);

        console.log('Entry added to existing subject');

        return next();
      });

      return;
    }

    // If not, save subject
    subject = new Subject(obj.subject);

    subject.save(function (err, subject) {
      if(err) return console.log(err);

      console.log('Subject added: ' + subject.name);

      // Add Entry to saved subject
      subject.addEntry(obj.entry, function (err) {
        if(err) console.log(err);

        console.log('Entry added to new subject');

        return next();
      });
    });

  });

  return this;
};

function dublicateCheck() {
  console.log('Start dublicate check');
  Subject.aggregate([
    {
      $group : {
        _id: { name : "$name" },
        uniqueIds: { $addToSet: "$_id" },
        count: { $sum: 1 }
      }
    },
    {
      $match : {
        count: { $gt : 1 }
      }
    }
  ], function (err, result) {
    if(err) return console.log(err);

    if(!Array.isArray(result)) return;

    console.log('Found dublicates: ' + result.length);

    result.forEach(function (el) {
      var
        dublicates = el.uniqueIds,
        original;

      if(!Array.isArray(dublicates)) return;

      original = dublicates.shift();

      Subject.findById(original, function (err, subject) {
        if(err) return console.log(err);

        if(subject) {
          console.log('Found original document');
          subject.transferFrom(dublicates);
        }
      });
    });
  });
}

module.exports = run;
