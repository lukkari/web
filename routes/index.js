
/*
 * GET home page.
 */

var mongoose = require('mongoose'),
    request  = require('request'),
    jsdom    = require('jsdom'),
    iconv    = require('iconv'),
    ic       = new iconv.Iconv('ISO-8859-1', 'utf-8'),
    async    = require('async'),
    fs       = require('fs'),
    config   = require('../config/config')['development'];


var parser   = require('../models/parser.js');
parser.init(request, jsdom, ic);

var calendar = require('../models/calendar.js');

//########################################################################
/**
 * Main page
 */

exports.index = function(req, res) {

  var uri = req.params[0],
      w;

  if(uri)
    w = uri.match(/w[0-9]+/ig);

  if(w && (typeof w === 'object'))
    w = w[0];


  var date    = new Date(),
      dates   = calendar.get(date.getStudyWeek()),
      weeknum = date.getStudyWeek();

  if(w)
    weeknum = +w.substr(1);

  res.render('index', {
                        title    : 'Schedule',
                        calendar : dates,
                        weeknum  : weeknum,
                        logged   : req.isAuthenticated()
                      });
};


//#########################################################################
/**
 * Parse page
 */

exports.parse = function(req, res) {

  var list;

  var error = req.param('error');
  if(error)
    error = error.replace(/_/g, ' ');

  var Group = mongoose.model('Group'),
      Parse = mongoose.model('Parse'),
      list = {
        groups : [],
        parses : []
      }

  async.parallel([
      function (cb) {
        Group.getAll(function (err, groups) {
          if(err)
            console.log(err);
          else {
            list.groups = groups;
            cb(false, null);
          }
        });
      },

      function (cb) {
        Parse.find({})
          .populate('group', 'name')
          .sort({ group : 1 })
          .exec(function (err, parses) {
            if(err)
              console.log(err);
            else {
              list.parses = parses;
              cb(false, null);
            }
          });
      }
    ],

    function (err, result) {
      res.render('parse', {
                            title     : 'Parse',
                            grouplist : list.groups,
                            parselist : list.parses,
                            error     : error
                          });
    }
  );

};

exports.addParse = function (req, res) {

  var Parse = mongoose.model('Parse'),
      parse = new Parse(req.body);

  parse.save(function (err) {
    var addon = '';
    if(err) {
      console.log(err);
      addon = 'error_in_adding';
    }

    if(addon.length > 0)
      addon = '?error=' + addon;

    res.redirect('/parse' + addon);
  });

};

exports.staffParse = function (req, res) {

  var url = req.body.link;

  parser.doStaff(url, function (err, result) {
    var addon = '';
    if(err) {
      console.log(err);
      addon = 'error_in_running';
    }

    if(addon.length > 0)
      addon = '?error=' + addon;

    res.redirect('/parse' + addon);

  });
};

exports.runParse = function (req, res) {

  var Parse = mongoose.model('Parse');

  function returnRes(err) {
    if(req.param('ajax')) {
      if(err)
        res.json(500, { error : err });
      else
        res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      res.redirect('/parse' + addon);
    }
  }

  Parse.findById(req.params.id)
    .populate('group', 'name')
    .exec(function (err, parse) {
    var addon = '';
    if(err) {
      console.log(err);
      returnRes(err);
    }

    var group = parse.group.name;

    if(parse.customName.length > 0)
      group = parse.customName;

    group = group.toLowerCase();

    var origLink = parse.link.replace('{v}', parse.version);
    origLink = origLink.replace('{g}', group);

    function runParse(num, prev) {
      if(!num)
        return false;

      var link = origLink;
      link = link.replace('{s}', num);

      parser.doSchedule(link, parse._id, function (err, result) {
        if(err) {
          console.log(err);

          var counter = (prev.count) ? +prev.count : 0;

          parse.update({
              parsed  : true,
              outcome : {
                weeks    : (num - parse.startNum),
                subjects : counter
              }
            },

            function (err) {
              if(err)
                console.log(err);

              returnRes(null);
            }
          );
        }
        else
          runParse(num + 1, result);
      });
    }

    runParse(parse.startNum, null);
  });

};

exports.deleteParse = function (req, res) {

  var Parse   = mongoose.model('Parse'),
      Subject = mongoose.model('Subject');

  function returnRes(err) {
    if(req.param('ajax')) {
      if(err)
        res.json(500, { error : err });
      else
        res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      res.redirect('/parse' + addon);
    }
  }

  Subject.find({ parse : req.params.id })
    .remove(function (err) {
      if(err) {
        console.log(err);
        returnRes('Error in removing_subjects');
      }

      Parse.where('_id', req.params.id).findOneAndRemove(function (err, result) {
        var addon = '';
        if(err) {
          console.log(err);
        }

        returnRes(err);
      });
    }
  );

};

exports.clearParse = function (req, res) {

  var Parse   = mongoose.model('Parse');
      Subject = mongoose.model('Subject');

  function returnRes(err) {
    if(req.param('ajax')) {
      if(err)
        res.json(500, { error : err });
      else
        res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      res.redirect('/parse' + addon);
    }
  }

  Subject.find({ parse : req.params.id })
    .remove(function (err) {
      if(err) {
        console.log(err);
        returnRes(err);
      }

      Parse.findByIdAndUpdate(req.params.id, {
          parsed  : false,
          outcome : {
            weeks    : 0,
            subjects : 0
          }
        },

        function (err, parse) {
          if(err)
            console.log(err);

          returnRes(err);
        }
      );

  });

};

//#############################################################################
/**
 * Manage page
 */

exports.manage = function (req, res) {

  var Room    = mongoose.model('Room'),
      Group   = mongoose.model('Group'),
      Teacher = mongoose.model('Teacher'),
      Parse   = mongoose.model('Parse'),
      Subject = mongoose.model('Subject'),
      Contact = mongoose.model('Contact'),
      count = {
        rooms    : 0,
        groups   : 0,
        teachers : 0,
        parses   : 0,
        subjects : 0
      },
      messages;

  async.parallel([
      function (cb) {
        Room.count({}, function (err, num) {
          if(err)
            console.log(err);
          else
            count.rooms = num;

          cb(null, true);
        });
      },

      function (cb) {
        Group.count({}, function (err, num) {
          if(err)
            console.log(err);
          else
            count.groups = num;

          cb(null, true);
        });
      },

      function (cb) {
        Teacher.count({}, function (err, num) {
          if(err)
            console.log(err);
          else
            count.teachers = num;

          cb(null, true);
        });
      },

      function (cb) {
        Parse.count({}, function (err, num) {
          if(err)
            console.log(err);
          else
            count.parses = num;

          cb(null, true);
        });
      },

      function (cb) {
        Subject.count({}, function (err, num) {
          if(err)
            console.log(err);
          else
            count.subjects = num;

          cb(null, true);
        });
      },

      function (cb) {
        Contact.find({})
               .sort({ createdAt : -1 })
               .limit(50)
               .exec(function (err, data) {
                  if(err)
                    console.log(err);
                  else
                    messages = data;

                  cb(null, true);
               })
      }

    ],

    function (err, result) {

      var date = new Date();
      res.render('manage', {
        title : 'Manage',
        date  : date.getDate() + '.' + parseInt(date.getMonth()+1) + '.' + date.getFullYear(),
        week  : date.getStudyWeek(),
        count : count,
        messages : messages
      });
    }
  );

};

exports.showLog = function (req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(fs.readFileSync(__dirname + '/..' + config.log.path));
};

exports.clearModel = function (req, res) {

  function doClear(Model) {
    Model.find({})
      .remove( function (err) {
        if(err)
          console.log(err);

        res.redirect('/manage');
      }
    );
  }

  switch(req.params.model) {

    case 'groups':
      doClear(mongoose.model('Group'));
      break;

    case 'teachers':
      doClear(mongoose.model('Teacher'));
      break;

    case 'rooms':
      doClear(mongoose.model('Room'));
      break;

    case 'parses':
      doClear(mongoose.model('Parse'));
      break;

    case 'subjects':
      doClear(mongoose.model('Subject'));
      break;

    case 'log':
      fs.writeFile(__dirname + '/..' + config.log.path, '', function (err) {
        res.redirect('/manage');
      });
      break;

    default:
      res.redirect('/manage');
  }

};