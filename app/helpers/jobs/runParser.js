/**
 * Run parser function job
 * Should be done every Saturday night at 4:00 AM
 */

var
  CronJob   = require('cron').CronJob,
  mongoose  = require('mongoose'),
  Parse     = mongoose.model('Parse'),
  runParser = require('../functions/runParser');

function runner(parses, data, cb) {
  if(!Array.isArray(parses)) return cb(new Error('Wrong array: parses @ runner func'));

  if(!parses.length) return cb(null, data);

  var parse = parses.shift();

  runParser(parse, function (err, result) {
    if(err) {
      parses.length = 0;
      return runner(parses, data, cb);
    }

    parse.parsed = new Date();
    parse.save();

    data.push(result);

    runner(parses, data, cb);
  });
}

module.exports = function () {
  Parse.find({}, function (err, parses) {
    if(err) {
      return console.log(err);
    }

    runner(parses, [], function (err, results) {
      if(err) {
        return console.log(err);
      }

      console.log('Parses parsed completely');
      console.log(results);
      console.log('---------------------------');
    });
  });
};
