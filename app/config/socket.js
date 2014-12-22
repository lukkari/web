/**
 * Configure web-sockets events
 */

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
      socket.on('hello', function () {
        console.log('trigger hello');
      });

      socket.emit('news', { test : 'Roman' });
    });

};
