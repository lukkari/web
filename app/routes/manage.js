/**
 * Manage page
 */

 var mongoose = require('mongoose'),
     async    = require('async'),
     fs       = require('fs'),
     config   = require('../config/config'),
     cache    = require('../helpers/cache')(config.cache),
     parser   = require('../helpers/parsers/parser');

/**
 * Counts documents in any collection by model
 * @param  {string}   name [model name]
 * @param  {Function} cb   [callback with error and number of documents]
 */
function countCollection (name, cb) {
  if(!name || !name.length) return cb(new Error('Wrong model name'));

  try {
    var Model = mongoose.model(name);
    if(!Model) return cb(new Error('Model does not exit'));

    Model.count({}, function (err, num) {
      if(err) return cb(err);

      cb(null, num);
    });
  } catch(e) {
    cb(e);
  }
}

exports.index = function (req, res) {

  var Contact  = mongoose.model('Contact'),
      models   = [],
      messages,
      modelslist = Object.keys(mongoose.connection.base.models);

  async.parallel([
      function (cb) {
        var l = modelslist.length,
            i = 0;

        modelslist.forEach(function (el) {
          countCollection(el, function (err, num) {
            if(err) {
              console.log(err);
              num = 0;
            }
            models.push({
              name  : el.capitalize(),
              count : num
            });
            i += 1;
            if(i >= l) cb(null);
          });
        });
      },

      function (cb) {
        Contact
          .find({})
          .sort({ createdAt : -1 })
          .limit(50)
          .exec(function (err, data) {
            if(err) console.log(err);
            else messages = data;

            cb(null);
          });
      }
    ],

    function (err) {
      var date = new Date();
      res.render('manage/index', {
        title  : 'Manage',
        date   : date,
        week   : date.getStudyWeek(),
        models : models,
        messages : messages,
        logged : true
      });
    }
  );
};

exports.showLog = function (req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(fs.readFileSync(__dirname + '/..' + config.log.path));
};

exports.model = function (req, res) {

  res.render('manage/model', {
    title : 'Model'
  });
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

  var model = req.params.model;
  if(!model || !model.length) return res.redirect('/manage');

  if(model.toLowerCase() == 'log') {
    fs.writeFile(__dirname + '/..' + config.log.path, '');
  } else if(model.toLowerCase() == 'cache') {
    cache.clear();
  } else {
    try {
      var Model = mongoose.model(model.capitalize());
      Model
        .find({})
        .remove( function (err) {
          if(err) console.log(err);
        }
      );
    } catch(e) {
      console.log(e);
    }

  }

  return res.redirect('/manage');
};


//#########################################################################
/**
 * Parse page
 */

exports.parse = function(req, res) {

  var error = req.param('error');
  if(error) error = error.replace(/_/g, ' ');

  var Group    = mongoose.model('Group'),
      Parse    = mongoose.model('Parse'),
      Building = mongoose.model('Building'),
      list     = {
        groups    : [],
        parses    : [],
        buildings : []
      };

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
      },

      function (cb) {
        Building.find({})
          .sort({ name : 1 })
          .exec(function (err, buildings) {
            if(err)
              console.log(err);
            else {
              list.buildings = buildings;
              cb(false, null);
            }
          });
      }
    ],

    function (err, result) {
      res.render('manage/parse', {
                            title     : 'Parse',
                            grouplist : list.groups,
                            parselist : list.parses,
                            buildings : list.buildings,
                            error     : error,
                            logged    : true
                          });
    }
  );

};

exports.addParse = function (req, res) {

  var Parse = mongoose.model('Parse'),
      parse = new Parse(req.body);

  function returnRes(err, parse) {
    if(req.xhr) {
      if(err)
        res.json(500, err);
      else
        res.json({ response : 'success', data : parse });
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      res.redirect('/manage/parse' + addon);
    }
  }

  parse.save(function (err, parse) {
    var addon = '';
    if(err) console.log(err);

    return returnRes(err, parse);
  });

};

exports.staffParse = function (req, res) {

  var url   = req.body.link,
      house = req.body.building;

  function returnRes(err) {
    if(req.xhr) {
      if(err) return res.json(500, err);
      return res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      return res.redirect('/manage/parse' + addon);
    }
  }

  if(!url || !url.length || !house) return returnRes('empty');

  parser.doStaff(url, house, function (err, result) {
    if(err) console.log(err);

    console.log(result);
    return returnRes(err);
  });
};

exports.runParse = function (req, res) {

  var Parse = mongoose.model('Parse');

  function returnRes(err) {
    if(req.xhr) {
      if(err)
        res.json(500, { error : err });
      else
        res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      res.redirect('/manage/parse' + addon);
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

    function runParse(num, pnum) {
      if(!num)
        return false;

      var link = origLink;
      link = link.replace('{s}', num);

      parser.doSchedule(link, parse._id, function (err, number) {
        if(err) {
          console.log(err);

          var counter = (pnum) ? +pnum : 0;

          parse.update({
              parsed  : true,
              outcome : {
                weeks    : (num - parse.startNum),
                subjects : counter
              }
            },

            function (err) {
              if(err) console.log(err);

              returnRes(null);
            }
          );
        }
        else runParse(num + 1, number);
      });
    }

    runParse(parse.startNum, null);
  });

};

exports.deleteParse = function (req, res) {

  var Parse   = mongoose.model('Parse'),
      Subject = mongoose.model('Subject');

  function returnRes(err) {
    if(req.xhr) {
      if(err) return res.json(500, { error : err });
      return res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      return res.redirect('/manage/parse' + addon);
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
        if(err) console.log(err);

        returnRes(err);
      });
    }
  );

};

exports.clearParse = function (req, res) {

  var Parse   = mongoose.model('Parse');
      Subject = mongoose.model('Subject');

  function returnRes(err) {
    if(req.xhr) {
      if(err) return res.json(500, { error : err });
      return res.json('success');
    }
    else {
      var addon = err ? '?error='+err.replace(/\s/g, '_') : '';
      return res.redirect('/manage/parse' + addon);
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
          if(err) console.log(err);

          returnRes(err);
        }
      );

  });

};

exports.addBuilding = function (req, res) {

  var Building = mongoose.model('Building'),
      building = new Building(req.body);

  building.save(function (err) {
    if(err) console.log(err);

    return res.redirect('/manage');
  });
};

/**
 * API
 *
 */

exports.apiModel = function (req, res) {

  try {
    var
      model = mongoose.model(req.params.model),
      page  = +req.param('page'),
      limit = +req.param('limit');

    page = page && (page > 0) ? page : 1;
    limit = limit && (limit < 100) ? limit : 10;

    model
      .find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ 'createdAt' : -1 })
      .exec(
        function (err, docs) {
        if(err) {
          console.log(err);
          return res.json(500, err);
        }
        res.json(docs);
      });
  } catch(e) {
    return res.json(500, { error : "Model doesn't exist" });
  }
};

exports.apiModelConfig = function (req, res) {

  try {
    var model = mongoose.model(req.params.model);

    model.count({}, function (err, count) {
      if(err) {
        console.log(err);
        return res.json(500, err);
      }
      res.json({
        count  : count,
        name   : model.modelName,
        schema : model.schema.paths
      });
    });
  } catch (e) {
    return res.json(500, { error : "Model doesn't exist" });
  }
};