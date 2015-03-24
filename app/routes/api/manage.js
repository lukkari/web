/**
 * Manage API routes
 */

var mongoose = require('mongoose');


// DB models
var Message = mongoose.model('Message');
var App = mongoose.model('App');
var Filter = mongoose.model('Filter');

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
 * Make object searchable by name
 * @param {Object} obj query
 */
function searchableByName(obj) {
  if(obj.hasOwnProperty('name')) {
    obj.name = new RegExp(obj.name, "i");
  }

  return obj;
}

/**
 * GET '/manage/api/model/:model' Get all models
 */
exports.model = function (req, res) {

  try {
    var query = {};

    if(typeof req.query.q === 'string' && req.query.q.length) {
      query = searchableByName(JSON.parse(req.query.q));
    }

    var
      model = mongoose.model(req.params.model),
      page  = +req.param('page'),
      limit = +req.param('limit');

    page = page && (page > 0) ? page : 1;
    limit = limit && (limit < 100) ? limit : 10;

    model
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ 'createdAt' : -1 })
      .lean()
      .exec(function (err, docs) {
        if(err) {
          console.log(err);
          return res.json(400, err);
        }
        res.json(docs);
      });
  } catch(e) {
    return res.status(400).send("Model doesn't exist");
  }
};


/**
 * GET '/manage/api/model/:model/config' Get model config data
 */
exports.modelConfig = function (req, res) {

  try {
    var query = {};

    if(typeof req.query.q === 'string' && req.query.q.length) {
      query = searchableByName(JSON.parse(req.query.q));
    }

    var model = mongoose.model(req.params.model);

    model.count(query, function (err, count) {
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
    return res.status(400).send("Model doesn't exist");
  }
};


/**
 * PUT '/manage/api/model/:model/:id' Update model
 */
exports.editModel = function (req, res) {

  try {

    var model = mongoose.model(req.params.model);
    var doc   = req.body;

    delete doc._id;

    model.findByIdAndUpdate(req.params.id, doc, function (err, newdoc) {
      if(err) {
        console.log(err);
        return res.status(500).send(err);
      }

      res.json(newdoc);
    });

  } catch (err) {
    res.status(400).send(err);
  }

};


/**
 * DELETE '/manage/api/model/:model/:id' Delete model
 */
exports.deleteModel = function (req, res) {

  try {

    var model = mongoose.model(req.params.model);

    model.findByIdAndRemove(req.params.id, function (err) {
      if(err) {
        console.log(err);
        return res.status(400).send(err);
      }

      res.status(204).send();
    });

  } catch (err) {
    res.status(400).send(err);
  }
};


/**
 * GET '/manage/api/model' Get list of available models and their count
 */
exports.getModels = function (req, res) {

  var models = [];
  var modelslist = Object.keys(mongoose.connection.base.models);
  var l = modelslist.length;
  var i = 0;

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
 * Use for depreated routes
 */
exports.deprecated = function (req, res) {
  res.send('Deprecated');
};


/**
 * GET '/manage/api/messages' Returns list of messages
 */
exports.getMessages = function (req, res) {

  Message
    .find({})
    .sort({ createdAt : -1 })
    .lean()
    .exec(function (err, messages) {
      if(err) {
        console.log(err);
        return res.status(400).json(err);
      }

      res.json(messages);
    });
};


/**
 * GET '/manage/api/serverdata' Returns server data: server time and server study week
 */
exports.getServerData = function (req, res) {
  var date = new Date();
  var week = date.getStudyWeek();

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

/**
 * POST '/manage/api/app' Create new application
 */
exports.addApp = function (req, res) {
  var app = new App(req.body);

  app.save(function (err, app) {
    if(err) {
      console.log(err);
      return res.status(400).send(err);
    }

    res.json(app);
  });
};

/**
 * GET '/manage/api/app' List all applications
 */
exports.getApps = function (req, res) {
  App
  .find({})
  .sort({ lastAccessed : -1 })
  .lean()
  .exec(function (err, apps) {
    if(err) console.log(err);

    res.json(apps);
  });
};

/**
 * DELETE '/manage/api/app/:id' Remove application
 */
exports.deleteApp = function (req, res) {
  App
  .findByIdAndRemove(req.params.id)
  .exec(function (err) {
    if(err) {
      console.log(err);
      return res.status(400).send(err);
    }

    res.status(204).send();
  });
};

/**
 * POST '/manage/api/filter' Create filter
 */
exports.addFilter = function (req, res) {
  var filter = new Filter(req.body);

  filter.save(function (err, filter) {
    if(err) {
      console.log(err);
      return res.status(400).send(err);
    }

    res.json(filter);
  });
};
