/**
 * Manage API routes
 */

var
  mongoose = require('mongoose'),
  async    = require('async');

// Load parsers
var
  parser    = require('../../helpers/parsers'),
  mainLink  = require('../../helpers/parsers/mainLink'),
  staff     = require('../../helpers/parsers/staff'),
  schedule  = require('../../helpers/parsers/schedule'),
  runParser = require('../../helpers/functions/runParser');


/**
 * Helpers
 */

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

/**
 * GET '/manage/api/model/:model' [description]
 */
exports.model = function (req, res) {

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
          return res.json(400, err);
        }
        res.json(docs);
      });
  } catch(e) {
    return res.json(400, { error : "Model doesn't exist" });
  }
};


/**
 * GET '/manage/api/model/:model/config' [description]
 */
exports.modelConfig = function (req, res) {

  try {
    var model = mongoose.model(req.params.model);

    model.count({}, function (err, count) {
      if(err) {
        console.log(err);
        return res.json(400, err);
      }
      res.json({
        count  : count,
        name   : model.modelName,
        schema : model.schema.paths
      });
    });
  } catch (e) {
    return res.json(400, { error : "Model doesn't exist" });
  }
};


/**
 * PUT '/manage/api/model/:model/:id' [description]
 */
exports.editModel = function (req, res) {

  try {

    var
      model = mongoose.model(req.params.model),
      doc   = req.body;

    delete doc._id;

    model.findByIdAndUpdate(req.params.id, doc, function (err, newdoc) {
      if(err) {
        console.log(err);
        return res.json(500, { error : err });
      }

      res.json(newdoc);
    });

  } catch (err) {
    res.json(400, { error : err });
  }

};


/**
 * DELETE '/manage/api/model/:model/:id' [description]
 */
exports.deleteModel = function (req, res) {

  try {

    var model = mongoose.model(req.params.model);

    model.findByIdAndRemove(req.params.id, function (err) {
      if(err) {
        console.log(err);
        return res.json(400, {error : err });
      }

      res.json({ success : true });
    });

  } catch (err) {
    res.json(400, { error : err });
  }
};


/**
 * GET '/manage/api/model' [description]
 */
exports.getModels = function (req, res) {

  var
    models   = [],
    modelslist = Object.keys(mongoose.connection.base.models),
    l = modelslist.length,
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
      if(i >= l) {
        // When all collections are counted return data
        return res.json(models);
      }
    });
  });

};


/**
 * GET '/manage/api/parse' [description]
 */
exports.getParses = function (req, res) {

  var Parse = mongoose.model('Parse');

  Parse
    .find({})
    .sort({ createdAt : '1' })
    .exec(function (err, parses) {
      if(err) {
        console.log(err);
        return res.json(400, err);
      }

      res.json(parses);
    });
};


/**
 * POST '/manage/api/parse' [description]
 */
exports.addParse = function (req, res) {

  var Parse = mongoose.model('Parse');

  var parse = new Parse(req.body);

  parse.save(function (err, doc) {
    if(err) {
      console.log(err);
      return res.json(400, err);
    }

    // parse current doc and add children
    parser([doc.url], {
      parser : mainLink,
      done : function (err, result) {
        if(err) {
          console.log(err);
          return res.json(400, err);
        }

        if(!Array.isArray(result[0])) return res.json('Nothing to add');

        doc.children = result[0];

        doc.save(function (err, newdoc) {
          if(err) {
            console.log(err);
            res.json(400, err);
          }

          res.json(newdoc);
        });
      }
    });
  });
};


/**
 * GET '/manage/api/parse/:id/run' [description]
 */
exports.runParse = function (req, res) {
  var
    id = req.params.id,
    Parse = mongoose.model('Parse');

  Parse.findById(id, function (err, parse) {
    if(err) {
      console.log(err);
      return res.json(400, err);
    }

    runParser(parse, function (err, result) {
      // Err is not passed, then result is in err
      if(err) {
        console.log(err);
        return res.json(400, err);
      }

      res.json(result);
    });
  });
};


/**
 * GET '/manage/api/parse/test' [description]
 */
exports.testParse = function (req, res) {
  var link = ['http://lukkari.turkuamk.fi/ict/1436/x3010ninfos14313.htm'];

  var
    Group = mongoose.model('Group'),
    Teacher = mongoose.model('Teacher'),
    Room = mongoose.model('Room');

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
      parser(link, {
        info : results,
        parser : schedule,
        done : function (err, result) {
          if(err) {
            console.log(err);
            return res.json(err);
          }
          console.log(result);

          res.json(result);

          // Find dublicates and remove them

        }
      });
    }
  );
};


/**
 * DELETE '/manage/api/parse/:id' [description]
 */
exports.deleteParse = function (req, res) {
  var
    id = req.params.id,
    Parse = mongoose.model('Parse');

  Parse.findByIdAndRemove(id, function (err) {
    if(err) {
      console.log(err);
      return req.json(400, err);
    }

    res.json('Success');
  });
};

/**
 * GET '/manage/api/messages' Returns list of messages
 */
exports.getMessages = function (req, res) {

  var Message = mongoose.model('Message');

  Message
    .find({})
    .sort({ createdAt : -1 })
    .exec(function (err, messages) {
      if(err) {
        console.log(err);
        return res.json(400, err);
      }

      res.json(messages);
    });
};


/**
 * GET '/manage/api/serverdata' Returns server data: server time and server study week
 */
exports.getServerData = function (req, res) {
  var
    date = new Date(),
    week = date.getStudyWeek();

  res.json([
    {
      name  : 'date',
      value : date
    },
    {
      name  : 'week',
      value : week
    }
  ]);
};
