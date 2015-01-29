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

/**
 * Prepare for getting new schedule:
 *  - Remove old schedule entries by filter
 *  - Execute callback
 */
exports.newVersion = function (filter, cb) {

  Entry.remove({ filter : filter }, function (err) {
    if(err) console.log(err);

    cb();
  });

};

/**
 * Process all items in the queue and
 * add them to db
 */
exports.addEntry = function (entry) {
  addSingleEntry(entry);
};

/**
 * Process multiple entries at once
 */
exports.addEntries = function (entries) {
  entries.forEach(addSingleEntry);
};

function addSingleEntry(entry) {
  console.log('Add entry', entry);

  queue.pushAndRun({
    item : entry,
    handler : function (item, next) {
      var subject = item.subject;
      delete item.subject;

      item.date.start = new Date(item.date.start);
      item.date.end = new Date(item.date.end);

      var search = subject.name;

      Subject
        .find({ name : search })
        .limit(1)
        .exec(function (err, founds) {
          if(err) console.log(err);

          // Append to existing
          if(founds.length) return addEntry(null, founds[0]);

          // Or create new subject
          var newSubject = new Subject(subject);
          newSubject.save(addEntry);

          function addEntry(err, to) {
            if(err) console.log(err);

            to.addEntry(item, function (err) {
              if(err) console.log(err);
              next();
            });
          }
        });

      // DOESN'T WORK (new subjects are added each time)
      //
      // Subject.findOneAndUpdate(
      //   { name : search },
      //   subject,
      //   { upsert : true },
      //   function (err, doc) {
      //     if(err) console.log(err);
      //
      //     doc.addEntry(item, function (err) {
      //       if(err) console.log(err);
      //       next();
      //     });
      //   }
      // );
    }
  });
}

function saveCategory(category, model, manage) {
  var Cats = {
    group : Group,
    teacher : Teacher,
    room : Room
  };

  var entry = new Cats[category](model);

  entry.save(function (err, doc) {
    var action = category + '_added';
    // Ignore dublicate errors
    if(err && err.code != 11000) return console.log(err);

    if(doc) manage.emit(action, doc);
  });
}

/**
 * Add group
 */
exports.addGroup = function (group, socket, manage) {
  saveCategory('group', group, manage);
};

/**
* Add teacher
*/
exports.addTeacher = function (teacher, socket, manage) {
  saveCategory('teacher', teacher, manage);
};

/**
* Add room
*/
exports.addRoom = function (room, socket, manage) {
  saveCategory('room', room, manage);
};
