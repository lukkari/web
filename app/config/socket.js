/**
 * Configure web-sockets events
 */

var handlers = {
  manage : require('../routes/socket/manage')
};

var mongoose = require('mongoose');

// DB models
var App = mongoose.model('App');

function authorizeApp(socket, next) {
  var query = socket.handshake.query;
  var token = query.token;

  if(!token) {
    return next(new Error('Specify application token'));
  }

  App
  .findOne({
    token : token
  })
  .exec(function (err, app) {
    if(err) console.log(err);

    // App is found
    if(app) {
      app.lastAccessed = new Date();
      app.save();

      return next();
    }

    return next(new Error('Specify application token'));
  });
}

module.exports = function (io) {

  var manage = io
    .of('/manage')
    .use(authorizeApp)
    .on('connection', function (socket) {
      function withParams(f) {
        return function () {
          var args = [].slice.apply(arguments);
          args.push(socket, manage);
          f.apply(null, args);
        };
      }

      socket.on('new_version', withParams(handlers.manage.newVersion));
      socket.on('add_entry', withParams(handlers.manage.addEntry));
      socket.on('add_entries', withParams(handlers.manage.addEntries));

      socket.on('add_group', withParams(handlers.manage.addGroup));
      socket.on('add_teacher', withParams(handlers.manage.addTeacher));
      socket.on('add_room', withParams(handlers.manage.addRoom));
    });

};
