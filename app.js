/**
 * App.js
 * Server setup
 */

try {
  require('newrelic');
} catch (e) {}

// Get required modules
var
  express      = require('express'),
  passport     = require('passport'),
  path         = require('path'),
  fs           = require('fs'),
  mongoose     = require('mongoose'),
  morgan       = require('morgan'),
  compression  = require('compression'),
  bodyParser   = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session      = require('express-session'),
  MongoStore   = require('connect-mongo')({ session : session });

// Application directory
var appdir = path.join(__dirname, 'app');

// Create express application
var app = express();

// Get app files
var config = require(path.join(appdir, '/config/config'))[app.get('env')];

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
require(path.join(appdir, '/helpers'));
require(path.join(appdir, '/helpers/models/db'));
require(path.join(appdir, '/config/passport'))(passport);

// app settings
app
  .disable('x-powered-by')
  .set('views', path.join(appdir, 'views'))
  .set('view engine', 'jade')
  /*
  .use(function (req, res, next) {
    // !! DOESN'T WORK
    if('production' == app.get('env')) {
      // In production return minified css
      if(/\/stylesheets\//.test(req.path)) {
        // When css is asked add min folder to the request
        req.path = req.path.replace('/stylesheets/', '/stylesheets/min/');
      }
    }

    return next();
  })*/
  .use(compression({
    threshold : 0 // set file size limit to 0
  }))
  .use(express.static(path.join(appdir, 'public'), { maxAge : (config.cache.week * 1000) }))
  .use(bodyParser())
  .use(cookieParser())
  .use(session({
    secret : config.app.name,
    store  : new MongoStore({ mongoose_connection: mongoose.connection })
  }))
  .use(passport.initialize())
  .use(passport.session());


// development only
if('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
require(path.join(appdir, 'config/router'))(app, passport);

//Set up jobs
require(path.join(appdir, 'helpers/jobs'));

module.exports = app;
