/**
 * Manage web sockets handlers
 */

var mongoose = require('mongoose');

// DB Models
var Group = mongoose.model('Group');
var Teacher = mongoose.model('Teacher');
var Room = mongoose.model('Room');
var Subject = mongoose.model('Subject');
var Entry = mongoose.model('Entry');
var Setting = mongoose.model('Setting');

/**
 * Prepare for getting new schedule:
 *  - Update current schedule version number
 */
exports.newVersion = function () {
  // Update version number
  // TO DO

  var socket = this;

  Setting
    .findOneAndUpdate({}, { $inc : { version : 1 } })
    .exec(function (err, setting) {
      if(err) console.log(err);

      console.log(setting);
      socket.emit('start_update', { version : setting.version });
    });
};

exports.addEntry = function (entry) {
  console.log(entry);
};
