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
exports.newVersion = function (_, socket) {

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
exports.addEntry = function (entry, socket) {

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

function saveCategory(category, Model, manage) {
  var cat = new Model(category);

  cat.save(function (err, doc) {
    if(err) console.log(err);

    manage.sockets.emit('category_added', doc);
  });
}

/**
 * Add group
 */
exports.addGroup = function (group, socket, manage) {
  saveCategory(group, Group, manage);
};

/**
* Add teacher
*/
exports.addTeacher = function (teacher) {
  saveCategory(group, Teacher, manage);
};

/**
* Add room
*/
exports.addRoom = function (room) {
  saveCategory(group, Room, manage);
};
