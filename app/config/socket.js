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
      socket.on('new_version', handlers.manage.newVersion.bind(socket));
      socket.on('add_entry', handlers.manage.addEntry.bind(socket));

      socket.on('add_group', handlers.manage.addRoom.bind(socket));
      socket.on('add_teacher', handlers.manage.addTeacher.bind(socket));
      socket.on('add_room', handlers.manage.addRoom.bind(socket));
    });

};
