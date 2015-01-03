/**
 * DB Models
 */

var mongoose = require('mongoose');
var crypto   = require('crypto');
var Schema   = mongoose.Schema;
var uuid = require('node-uuid');


/**
 * Subject
 */

var subjectSchema = new Schema({
  name      : { type : String, default : '' },
  coursenum : { type : String, default : '' },
  user      : { type : Schema.Types.ObjectId, ref : 'User' },
  createdAt : { type : Date, default : Date.now }
});

subjectSchema.methods = {

  addEntry : function (entry, cb) {
    if(typeof entry !== 'object') return cb(new Error('Wrong entry'));

    var Entry = mongoose.model('Entry');

    var subject = this;

    // Check for dublicate entry
    Entry
      .find({
        version : entry.version,
        'date.start' : entry.date.start,
        'date.end' : entry.date.end,
        groups : entry.groups,
        teachers : entry.teachers
      })
      .limit(1)
      .exec(function (err, dublicate) {
        if(err) return cb(err, dublicate);

        if(!dublicate.length) {
          // If no dublicate found add current entry
          entry.subject = subject._id;

          var e = new Entry(entry);
          e.save(cb);
        } else {
          // Otherwise return dublicate (just in case)
          cb(null, dublicate);
        }
      });
  }

};

subjectSchema.index({ name : 'text' });

mongoose.model('Subject', subjectSchema);


/**
 * Daytime entry
 */

var entrySchema = new Schema({
  subject   : { type : Schema.Types.ObjectId, ref : 'Subject' },
  date      : {
    start : { type : Date, default : 0 },
    end   : { type : Date, default : 0 }
  },
  rooms     : [{ type : Schema.Types.ObjectId, ref : 'Room' }],
  groups    : [{ type : Schema.Types.ObjectId, ref : 'Group' }],
  teachers  : [{ type : Schema.Types.ObjectId, ref : 'Teacher' }],
  version   : { type : Number, default : 0 },
  createdAt : { type : Date, default : Date.now }
});

entrySchema.index({ subject : 1 });

mongoose.model('Entry', entrySchema);


/**
 * Room
 */

var roomSchema = new Schema({
  name      : { type : String, default : '' },
  filter    : { type : Schema.Types.ObjectId, ref : 'Filter' },
  capacity  : { type : Number, default : 0 },
  code      : { type : String, default : '' },
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
  code      : { type : String, default : '' },
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
  code      : { type : String, default : '' },
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
 * Messages from the main page
 */

var messageSchema = new Schema({
  message   : { type : String, default : '' },
  screen    : { type : String, default : '' },
  device    : { type : String, default : '' },
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
    return '' + Math.round((new Date().valueOf() * Math.random()));
  },

  encryptPassword : function (password) {
    if (!password) return '';
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  },

  shortForm : function () {
    var user = {
      _id : this._id,
      username : this.username,
      createdAt : this.createdAt
    };

    return user;
  }
};

userSchema.index({ username : 1 }, { unique : true });

mongoose.model('User', userSchema);


/**
 * Users
 */

var UserTableSchema = new Schema({
  user      : [{ type : Schema.Types.ObjectId, ref : 'User' }],
  added     : [{ type : Schema.Types.ObjectId, ref : 'Subject' }],
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


/**
 * Tokens
 */

var TokenSchema = new Schema({
  access    : { type : String, default : '' },
  user      : { type : Schema.Types.ObjectId, ref : 'User' },
  createdAt : { type : Date,   default : Date.now }
});

TokenSchema.pre('save', function (next, done) {
  this.access = uuid.v4();
  next();
});

/*
TokenSchema.index(
  { "access" : 1 },
  { expireAfterSeconds : (60*60*24*30) } // 30 days
);
*/

mongoose.model('Token', TokenSchema);


/**
 * Settings
 */

var SettingSchema = new Schema({
  version : { type : String, default : 0 },
  updatedAt : { type : Date }
});

SettingSchema.pre('save', function (next, done) {
  this.updatedAt = new Date();
  next();
});

mongoose.model('Setting', SettingSchema);
