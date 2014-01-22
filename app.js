/**
 * Module dependencies.
 */


var express  = require('express'),
    routes   = require('./routes'),
    user     = require('./routes/user'),
    http     = require('http'),
    path     = require('path');

var config   = require('./config/config.js')['development'];
    mongoose = require('mongoose');

var connect = function () {
  mongoose.connect(config.db);
}
connect();

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
})

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
})

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/design/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('learnnode'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/users', user.list);

// Parse page
app.get(   '/parse',       routes.parse);
app.post(  '/parse/add',   routes.addParse);
app.post(  '/parse/staff', routes.staffParse);
app.get(   '/parse/:id',   routes.runParse);
app.delete('/parse/:id',   routes.deleteParse);
app.put(   '/parse/:id',   routes.clearParse);


// Manage page
app.get('/manage', routes.manage);
app.get('/manage/clear/:model', routes.clearModel);


// Login
app.get('/login', routes.login);

// API
app.get( '/api/groups',       routes.getGroups);
app.get( '/api/teachers',     routes.getTeachers);
app.get( '/api/schedule/:id', routes.getSchedule);
app.post('/api/messages',     routes.sendMsg);

// Main page
app.get('/:search', routes.index);
app.get('/',        routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
