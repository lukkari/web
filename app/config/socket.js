/**
 * Configure web-sockets events
 */

var handlers = {
  manage : require('../routes/socket/manage')
};

module.exports = function (io) {

  var manage = io
    .of('/manage')
    .use(function (socket, next) {
      var handshake = socket.handshake;
      // TO DO: Handle simple authorization
      console.log(handshake.query);
      next();
    })
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

      socket.on('add_group', withParams(handlers.manage.addGroup));
      socket.on('add_teacher', withParams(handlers.manage.addTeacher));
      socket.on('add_room', withParams(handlers.manage.addRoom));
    });

};
