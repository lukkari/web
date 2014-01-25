/**
 * DB Models
 */

var mongoose = require('mongoose'),
    crypto   = require('crypto');

var Schema = mongoose.Schema;


/**
 * ##########################################################################
 * Subject (schedule item)
 */

var subjectSchema = new Schema({
  name      : { type: String, default: '' },
  duration  : { type: Number, default: 0 },
  date      : { type: Date,   default: 0 },
  rooms     : [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  groups    : [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  teachers  : [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
  coursenum : { type: String, default: '' },
  parse     : { type: Schema.Types.ObjectId, ref: 'Parse' }
});

subjectSchema.pre('save', function (next, done) {
  var that = this;
  mongoose.models['Subject'].findOne({
      name     : that.name,
      duration : that.duration,
      date     : that.date
    },

    function (err, data) {
      if(err)
        done(err);
      else if(data) {
        done();
      }
      else
        next();
    }
  );

});

mongoose.model('Subject', subjectSchema);


/**
 * ##########################################################################
 * Room
 */

var roomSchema = new Schema({
  name      : { type: String, default: '' },
  building  : { type: String, default: '' },
  capacity  : { type: Number, default: 0 },
  createdAt : { type: Date,   default: Date.now }
});

roomSchema.statics = {

  /**
   * Return all rooms in ascendant order
   */
  getAll: function (cb) {
    this.find({})
      .sort({'name': 1})
      .exec(cb);
  }

};

roomSchema.index({ name: 1 }, { unique: true });

mongoose.model('Room', roomSchema);


/**
 * ##########################################################################
 * Teacher
 */

var teacherSchema = new Schema({
  name      : { type: String, default: '' },
  createdAt : { type: Date,   default: Date.now }
});

teacherSchema.statics = {

  /**
   * Return all teachers in ascendant order
   */
  getAll: function (cb) {
    this.find({})
      .sort({'name': 1})
      .exec(cb);
  }

};

teacherSchema.index({ name: 1 }, { unique: true });

mongoose.model('Teacher', teacherSchema);


/**
 * ##########################################################################
 * Group
 */

var groupSchema = new Schema({
  name      : { type: String, default: '' },
  createdAt : { type: Date,   default: Date.now }
});

groupSchema.statics = {

  /**
   * Return all groups in ascendant order
   */
  getAll: function (cb) {
    this.find({})
      .sort({'name': 1})
      .exec(cb);
  }

};

groupSchema.index({ name: 1 }, { unique: true });

mongoose.model('Group', groupSchema);


/**
 * ##########################################################################
 * Parse
 */

var parseSchema = new Schema({
  link        : { type: String,  default: '' },
  group       : { type: Schema.Types.ObjectId, ref: 'Group' },
  customName  : { type: String,  default: '' },
  startNum    : { type: Number,  default: 0 },
  version     : { type: Number,  default: 0 },
  parsed      : { type: Boolean, default: false },
  description : { type: String,  default: '' },
  building    : { type: String,  default: '' },
  outcome     : {
    weeks    : { type: Number, default: 0 },
    subjects : { type: Number, default: 0 }
  },
  createdAt   : { type: Date,    default: Date.now }
});

parseSchema.pre('save', function (next) {
  var link = this.link,
      groupname;

  link  = link.split('/');

  this.building = link[link.length-3];
  link = link[link.length-1];

  this.startNum = +link.slice(1, 5);
  this.link = this.link.replace(this.startNum, '{s}');

  link = link.split('.');
  link = link[0];

  this.version = +link.slice(-3);
  this.link = this.link.replace(this.version + '.', '{v}.');

  if(this.customName.length > 0) {
    this.link = this.link.replace(this.customName, '{g}');

    next();
  }
  else {
    groupname = link.slice(5, -3);
    this.link = this.link.replace(groupname, '{g}');

    var Group = mongoose.model('Group'),
        that = this;
    Group.findOne({ name: new RegExp(groupname, "i") }, function (err, group) {
      if(err)
        console.log(err);
      else {
        that.group = group._id;
        next();
      }
    });
  }

});

mongoose.model('Parse', parseSchema);


/**
 * ########################################################################3
 * Messages from the main page
 */

var contactSchema = new Schema({
  message   : { type : String, default : '' },
  from      : { type : String, default : '' },
  user      : { type : Schema.Types.ObjectId, ref: 'User' },
  createdAt : { type : Date,   default : Date.now }
});

contactSchema.index({ "createdAt" : 1 }, { expireAfterSeconds : (60*60*24*30) });

mongoose.model('Contact', contactSchema);


/**
 * ########################################################################3
 * Users
 */

var userSchema = new Schema({
  username  : { type : String, default : '', required : true },
  password  : { type : String, default : '', required : true},
  salt      : { type : String, default : '' },
  email     : { type : String, default : '' },
  group     : { type : Schema.Types.ObjectId, ref : 'Group' },
  roles     : {
    admin : { type : Boolean, default : false }
  },
  createdAt : { type : Date,   default : Date.now }
});

userSchema.pre('save', function (next) {
  if(this.isNew) {
    this.salt = this.makeSalt();
    this.password = this.encryptPassword(this.password);
  }
  next();
});


userSchema.methods = {

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.password;
  },

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  encryptPassword: function (password) {
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
}

userSchema.index({ username: 1 }, { unique: true });

mongoose.model('User', userSchema);