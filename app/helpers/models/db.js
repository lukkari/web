/**
 * DB Models
 *
 */

var mongoose = require('mongoose'),
    crypto   = require('crypto'),
    Schema   = mongoose.Schema;


/**
 * Subject
 */

var subjectSchema = new Schema({
  name      : { type : String, default : '' },
  coursenum : { type : String, default : '' },
  user      : { type : Schema.Types.ObjectId, ref : 'User' },
  parse     : { type : Schema.Types.ObjectId, ref : 'Parse' },
  createdAt : { type : Date, default : Date.now }
});

subjectSchema.methods = {

  addEntry : function (entry, cb) {
    if(typeof entry !== 'object') return cb(new Error('Wrong entry'));

    var Entry = mongoose.model('Entry');

    var subject = this;

    // Check for dublicate entry
    Entry.findOne({
        date      : entry.date,
        duration  : entry.duration,
        groups    : entry.groups
      }, function (err, dublicate) {
        if(err) console.log(err);

        if(!dublicate) {
          // If no dublicate found add current entry
          entry.subject = subject._id;

          var e = new Entry(entry);
          e.save(function (err, entry) {
            cb(err, entry);
          });
        } else {
          // Otherwise return dublicate (just in case)
          cb(err, dublicate);
        }
      }
    );
  },

  /**
   * Transfer entries from dublicate subjects
   * @param  {Array}   dublicates Array of dublicate subjects ids
   * @param  {Function} cb        Callback
   */
  transferFrom : function (dublicates, cb) {
    var
      subject = this,
      Entry   = mongoose.model('Entry'),
      Subject = mongoose.model('Subject');

    if(typeof cb != 'function') {
      cb = function (err) {
        if(err) console.log(err);
      };
    }

    Entry.find({
      subject : {
        $in : dublicates
      }
    }, function (err, entries) {
      if(err) return cb(err);

      if(!entries || !Array.isArray(entries)) return cb();

      console.log('Start changing subject id from entry');
      // Change subject id to Original document for every entry
      entries.forEach(function (entry) {
        entry.subject = subject._id;
        entry.save();
      });

      console.log('Start removing dublicates');
      // Remove dublicate subjects
      Subject.remove({
        $id : {
          $in : dublicates
        }
      });

      return cb();
    });
  }
};

subjectSchema.index({ name : 1 });

mongoose.model('Subject', subjectSchema);


/**
 * Daytime entry
 */

var entrySchema = new Schema({
  subject   : { type : Schema.Types.ObjectId, ref : 'Subject' },
  date      : { type : Date,   default : 0 },
  duration  : { type : Number, default : 0 },
  rooms     : [{ type : Schema.Types.ObjectId, ref : 'Room' }],
  groups    : [{ type : Schema.Types.ObjectId, ref : 'Group' }],
  teachers  : [{ type : Schema.Types.ObjectId, ref : 'Teacher' }],
  parse     : { type : Schema.Types.ObjectId, ref : 'Parse' },
  createdAt : { type : Date, default : Date.now }
});

mongoose.model('Entry', entrySchema);


/**
 * Room
 */

var roomSchema = new Schema({
  name      : { type : String, default : '' },
  filter    : { type : Schema.Types.ObjectId, ref : 'Filter' },
  capacity  : { type : Number, default : 0 },
  createdAt : { type : Date,   default : Date.now }
});

roomSchema.statics = {

  /**
   * Return all rooms in ascendant order
   */
  getAll : function (cb) {
    this
      .find({})
      .sort({ 'name' : 1 })
      .lean()
      .exec(cb);
  }

};

roomSchema.index({ name : 1 }, { unique : true });

mongoose.model('Room', roomSchema);


/**
 * Teacher
 */

var teacherSchema = new Schema({
  name      : { type : String, default : '' },
  filter    : { type : Schema.Types.ObjectId, ref : 'Filter' },
  createdAt : { type : Date,   default : Date.now }
});

teacherSchema.statics = {

  /**
   * Return all teachers in ascendant order
   */
  getAll : function (cb) {
    this
      .find({})
      .sort({ 'name' : 1 })
      .lean()
      .exec(cb);
  }

};

teacherSchema.index({ name : 1 }, { unique : true });

mongoose.model('Teacher', teacherSchema);


/**
 * Group
 */

var groupSchema = new Schema({
  name      : { type : String, default : '' },
  filter    : { type : Schema.Types.ObjectId, ref : 'Filter' },
  createdAt : { type : Date,   default : Date.now }
});

groupSchema.statics = {

  /**
   * Return all groups in ascendant order
   */
  getAll : function (cb) {
    this
      .find({})
      .sort({ 'name' : 1 })
      .lean()
      .exec(cb);
  }

};

groupSchema.index({ name : 1 }, { unique : true });

mongoose.model('Group', groupSchema);


/**
 * Parse
 */

var parseSchema = new Schema({
  url         : { type : String,  default : '' },
  description : { type : String,  default : '' },
  parsed      : { type : Date,    default : 0 },
  children    : [{
    url   : { type : String, default : '' },
    title : { type : String, default : '' },
    week  : { type : Number, default : 0 }
  }],
  filter      : { type : Schema.Types.ObjectId, ref : 'Filter' },
  createdAt   : { type : Date,    default : Date.now }
});

mongoose.model('Parse', parseSchema);


/**
 * Messages from the main page
 */

var messageSchema = new Schema({
  message   : { type : String, default : '' },
  from      : { type : String, default : '' },
  user      : { type : Schema.Types.ObjectId, ref : 'User' },
  createdAt : { type : Date,   default : Date.now }
});

messageSchema.index(
  { "createdAt" : 1 },
  { expireAfterSeconds : (60*60*24*60) } // 60 days
);

mongoose.model('Message', messageSchema);


/**
 * Users
 */

var userSchema = new Schema({
  username  : { type : String, default : '', required : true },
  password  : { type : String, default : '', required : true },
  salt      : { type : String, default : '' },
  email     : { type : String, default : '' },
  group     : { type : Schema.Types.ObjectId, ref : 'Group' },
  roles     : {
    admin : { type : Boolean, default : false }
  },
  createdAt : { type : Date,   default : Date.now }
});

userSchema.pre('save', function (next, done) {
  if(!this.username.match(/^[0-9a-z\-\_]+$/i)) return done(new Error('Only characters, numbers, "_" and "-" in username'));
  if(this.password.length < 4) return done(new Error('Password is too short, use more than 3 characters'));

  this.salt = this.makeSalt();
  this.password = this.encryptPassword(this.password);
  next();
});


userSchema.methods = {

  authenticate : function (plainText) {
    return this.encryptPassword(plainText) === this.password;
  },

  makeSalt : function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  encryptPassword : function (password) {
    if (!password) return '';
    var encrypred;
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
      return encrypred;
    }
    catch (err) {
      return '';
    }
  }
};

userSchema.index({ username : 1 }, { unique : true });

mongoose.model('User', userSchema);


/**
 * Users
 */

var UserTableSchema = new Schema({
  user      : [{ type : Schema.Types.ObjectId, ref: 'User' }],
  subjects  : [{ type : Schema.Types.ObjectId, ref : 'Subject' }],
  removed   : [{ type : Schema.Types.ObjectId, ref : 'Subject' }],
  updatedAt : { type : Date, default : Date.now }
});

mongoose.model('UserTable', UserTableSchema);


/**
 * Filters
 */

var FilterSchema = new Schema({
  name        : { type : String, default : '' },
  description : { type : String, default : '' },
  createdAt   : { type : Date,   default : Date.now }
});

mongoose.model('Filter', FilterSchema);
