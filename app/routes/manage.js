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
