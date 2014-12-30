/**
 * Manage web sockets handlers
 */

var mongoose = require('mongoose');

var Queue = require('../../libs/queue');
var queue = new Queue();

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
 *  - Return new number to sync app
 */
exports.newVersion = function () {
  var socket = this;

  Setting
    .findOneAndUpdate({}, { $inc : { version : 1 } })
    .exec(function (err, setting) {
      if(err) console.log(err);
      if(!setting) return;
      socket.emit('start_update', { version : setting.version });
    });
};

/**
 * Process all items in the queue and
 * add them to db
 */
exports.addEntry = function (entry) {
  var socket = this;

  queue.pushAndRun({
    item : entry,
    handler : function (item, next) {
      var subject = item.subject;
      delete item.subject;

      Subject.findOneAndUpdate(
        { name : new RegEx(subject, 'i') },
        { name : subject },
        { upsert : true },
        function (err, doc) {
          if(err) console.log(err);

          item.subject = doc._id;
          var entry = new Entry(item);

          entry.save(function (err) {
            if(err) console.log(err);
            next();
          });
        }
      );
    }
  });
};

function saveCategory(category, Model) {
  var cat = new Model(category);

  cat.save(function (err, doc) {
    if(err) console.log(err);

    res.json(doc);
  });
}

/**
 * Add group
 */
exports.addGroup = function (group) {
  saveCategory(group, Group);
};

/**
* Add teacher
*/
exports.addTeacher = function (teacher) {
  saveCategory(group, Teacher);
};

/**
* Add room
*/
exports.addRoom = function (room) {
  saveCategory(group, Room);
};
