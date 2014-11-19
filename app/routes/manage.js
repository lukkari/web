/**
 * Manage page routes
 */

/**
 * GET '/manage/*' [description]
 */
exports.index = function (req, res) {
  res.render('manage/index', {
    title  : 'Manage',
    logged : true
  });
};
