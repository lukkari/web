/*
 * Home page routes
 */

var device = require('../libs/device');

/**
 * GET '/*' Homepage
 */
exports.index = function(req, res) {
  res.render('index', {
    title    : 'Schedule',
    logged   : req.isAuthenticated(),
    mobile   : device.isMobile(req)
  });
};
