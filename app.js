/**
 * App.js
 * Server setup
 */

try {
  require('newrelic');
} catch (e) {}

// Get required modules
var express      = require('express');
var passport     = require('passport');
var path         = require('path');
var mongoose     = require('mongoose');
var compression  = require('compression');
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')({ session : session });

// Application directory
var appdir = path.join(__dirname, 'app');

// Create express application
var app = express();

// Get app files
var config = require(path.join(appdir, 'config/config'))[app.get('env')];

// DB connection
var connect = function () {
  mongoose.connect(config.db, { server : { auto_reconnect : true } });
};

connect();

mongoose.connection.on('error', function (err) {
  console.log(err);
});

mongoose.connection.on('disconnected', function (err) {
  connect();
});

// Add helpers files
require(path.join(appdir, 'helpers'));
require(path.join(appdir, 'config/db'));
require(path.join(appdir, 'config/passport'))(passport);

// App settings
app
  .disable('x-powered-by')
  .set('views', path.join(appdir, 'views'))
  .set('view engine', 'jade');

// In production return minified css and js
if('production' === app.get('env')) {
  app.use(function (req, res, next) {
    var file, extname;
    if(/\.css|\.js$/.test(req.url)) {
      extname = path.extname(req.url);
      file = path.basename(req.url, extname);
      req.url = path.dirname(req.url) + '/' + file + '.min' + extname;
    }
    next();
  });
}

app
  .use(compression({
    threshold : 0 // set file size limit to 0
  }))
  .use(express.static(path.join(appdir, 'public'), { maxAge : (config.cache.week * 1000) }))
  .use(bodyParser.json({ limit : '5mb' }))
  .use(bodyParser.urlencoded({ limit : '5mb', extended : true }))
  .use(cookieParser(config.app.name))
  .use(session({
    secret : config.app.name,
    store  : new MongoStore({ mongoose_connection: mongoose.connection })
  }))
  .use(passport.initialize())
  .use(passport.session());

// Register routes
var router = require(path.join(appdir, 'config/router'))(passport);
app.use(router);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers

// Development error handler
if(app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message : err.message,
      error   : err
    });
  });
}

// Production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message : err.message,
    error   : {}
  });
});

//Set up jobs
require(path.join(appdir, 'helpers/jobs'));

module.exports = app;
