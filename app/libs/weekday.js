/**
 * Module to form day schedule
 */
var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');

exports.getSubjects = function (options) {
  options = options || {};

  var date = new Date(options.date);

  var data = {
    date : date,
    subjects : []
  };

  var start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var end   = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  /**
   * QUERY
   *
   *  $and : [{
   *    date : {
   *      $gte : start,
   *      $lt  : end
   *    }
   *  }, {
   *    subject : { $nin : usertable.removed }
   *  }, {
   *    $or : [{
   *      type : typeid
   *    }, {
   *      subject : { $in : usertable.added }
   *    }]
   *  }]
   *
   */

  var usertable = options.usertable || null;

  var query = {};
  var qtype = {};

  if(!usertable) {
    query['date.start'] = {
      $gte : start,
      $lt  : end
    };

    query[options.type] = options.typeid;

  } else {
    qtype[options.type] = options.typeid;

    query.$and = [{
      'date.start' : {
        $gte : start,
        $lt  : end
      }
    }, {
      subject : { $nin : usertable.removed }
    }];

    query.$and.push({
      $or : [qtype, {
        subject : { $in : usertable.added }
      }]
    });
  }

  Entry
    .find(query)
    .populate('groups', 'name')
    .populate('teachers', 'name')
    .populate('rooms', 'name')
    .populate('subject', 'name')
    .sort({ 'date.start' : 1 })
    .exec(function(err, subjects) {
      data.subjects = subjects;
      if(typeof options.cb === 'function') options.cb(err, data);
    });

};
