/**
 * Module dependencies.
 */


var express    = require('express'),
    MongoStore = require('connect-mongo')(express),
    passport   = require('passport'),
    routes     = require('./routes'),
    http       = require('http'),
    path       = require('path'),
    config     = require('./config/config.js')['development'],
    mongoose   = require('mongoose');


//create express app
var app = express();

//setup the web server
app.server = http.createServer(app);


var connect = function () {
  mongoose.connect(config.db);
};

connect();

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
});

require(__dirname + '/helpers');
require(__dirname + '/models/dbmodels.js');
require(__dirname + '/config/passport')(passport);


app.configure(function () {
  // settings
  app.disable('x-powered-by');
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // middleware
  app.use(express.compress());
  app.use(express.favicon(__dirname + '/public/design/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret : config.app.name,
    store  : new MongoStore({ url : config.db })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }
});

require(__dirname + '/config/routes')(app, passport);


app.server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
