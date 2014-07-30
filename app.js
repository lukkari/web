/**
 * App.js
 * Server setup
 */

// Get required modules
var
  express      = require('express'),
  passport     = require('passport'),
  path         = require('path'),
  fs           = require('fs'),
  mongoose     = require('mongoose'),
  morgan       = require('morgan'),
  bodyParser   = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session      = require('express-session'),
  MongoStore   = require('connect-mongo')({ session : session });

// Application directory
var appdir = path.join(__dirname, 'app');

// Create express application
var app = express();

// Get app files
var
  config     = require(path.join(appdir, '/config/config'))[app.get('env')],
  logPath    = path.join(appdir, config.log.path),
  logfile    = fs.createWriteStream(logPath, { flags: 'a+' }),
  loggingOptions = {
    format : config.log.format,
    stream : logfile
  };

// Specify app's port
var port = process.env.PORT || 3000;

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
//require(path.join(appdir, '/helpers/cache'))(config.cache).clear();
require(path.join(appdir, '/helpers/models/db'));
require(path.join(appdir, '/config/passport'))(passport);

// app settings
app
  .disable('x-powered-by')
  .set('port', port)
  .set('views', path.join(appdir, 'views'))
  .set('view engine', 'jade')

  .use(express.static(path.join(appdir, 'public')))
  .use(bodyParser())
  //.use(morgan(loggingOptions)) don't use logs for a while
  .use(cookieParser())
  .use(session({
    secret : config.app.name,
    store  : new MongoStore({ url : config.db })
  }))
  .use(passport.initialize())
  .use(passport.session());


// development only
if('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

// Register routes
require(path.join(appdir, '/config/router'))(app, passport);

// Start the server
app.listen(port);
console.log('Server is running on port ' + port);
