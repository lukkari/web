/**
 * Manage page routes
 */

var fs = require('fs');

/**
 * GET '/manage/*' [description]
 */
exports.index = function (req, res) {
  res.render('manage/index', {
    title  : 'Manage',
    logged : true
  });
};

exports.showLog = function (req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(fs.readFileSync(__dirname + '/..' + config.log.path));
};
