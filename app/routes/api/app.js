/**
 * Applications API routes
 */

var mongoose = require('mongoose');

// DB models
var Subject = mongoose.model('Subject');
var Entry = mongoose.model('Entry');

// Helpers
var Queue = require('../../libs/queue');
var queue = new Queue();

/**
 * GET '/api/app/entry' Add entry/entries
 */
exports.addEntry = function (req, res) {
  var data = req.body;

  if(!data || typeof data !== 'object') return res.status(400).send('Wrong request');

  if(Array.isArray(data)) {
    data.forEach(addSingleEntry);
    return res.send('Entries are saving');
  }

  addSingleEntry(data);
  return res.send('Entry is saving');
};

function addSingleEntry(entry) {
 // console.log('Add entry', entry);

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
   }
 });
}
