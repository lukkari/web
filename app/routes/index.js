/*
 * GET home page.
 */

var mongoose = require('mongoose'),
    calendar = require('../helpers/models/calendar'),
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

exports.getNow = function(req, res) {

  res.render('now', {
                      title  : req.params.q + ' - now',
                      link   : req.params.q,
                      mobile : true,
                      logged : req.isAuthenticated()
                    }
  );

};

exports.editor = function (req, res) {

  res.render('editor', {
                          title  : 'Editor',
                          logged : true
                       }
  );
};
