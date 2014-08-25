/*
 * GET home page.
 */

var mongoose = require('mongoose'),
    device   = require('../helpers/device');

//########################################################################
/**
 * Main page
 */

exports.index = function(req, res) {

  res.render('index', {
                        title    : 'Schedule',
                        logged   : req.isAuthenticated(),
                        mobile   : device.isMobile(req)
                      }
  );
};
