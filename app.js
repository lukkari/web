/**
 * App.js
 * Server setup
 */

// Application directory
var appdir = __dirname + '/app';

// Get required modules
var express      = require('express'),
    passport     = require('passport'),
    path         = require('path'),
    fs           = require('fs'),
    mongoose     = require('mongoose'),
    morgan       = require('morgan'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session      = require('express-session'),
    MongoStore   = require('connect-mongo')({ session : session });

// Get app files
var config     = require(appdir + '/config/config'),
    logPath    = appdir + config.log.path,
    logfile    = fs.createWriteStream(logPath, {flags: 'a+'}),
    loggingOptions = {
      format : config.log.format,
      stream : logfile
    };

// Specify app's port
var port = process.env.PORT || 3000;

var app = express();

// DB connection
var connect = function () {
  mongoose.connect(config.db);
};

connect();

mongoose.connection.on('error', function (err) {
  console.log(err);
});

mongoose.connection.on('disconnected', function (err) {
  connect();
});

// Add helpers files
require(appdir + '/helpers');
require(appdir + '/helpers/cache')(config.cache).clear();
require(appdir + '/helpers/models/db');
require(appdir + '/config/passport')(passport);

// app settings
app.disable('x-powered-by')
   .set('port', port)
   .set('views', path.join(appdir, 'views'))
   .set('view engine', 'jade')

   .use(express.static(path.join(appdir, 'public')))
   //.use(express.favicon(appdir + '/public/design/favicon.ico'))
   .use(bodyParser())
/**
 * To INCLUDE:
 * compress ?
 */
   .use(morgan(loggingOptions))
   .use(cookieParser())
   .use(session({
      secret : config.app.name,
      store  : new MongoStore({ url : config.db })
    }))
   .use(passport.initialize())
   .use(passport.session());


// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
require(appdir + '/config/router')(app, passport);

// Start the server
app.listen(port);
console.log('Server is running on port ' + port);
