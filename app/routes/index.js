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

  var uri = req.params[0],
      w;

  if(uri) w = uri.match(/w{1}[0-9]{1,2}/ig);

  if(w && (typeof w === 'object')) w = w[0];

  var date    = new Date(),
      dates   = calendar.get(date.getStudyWeek()),
      weeknum = date.getStudyWeek(),
      weeknow = weeknum;

  if(w) weeknum = +w.substr(1);

  res.render('index', {
                        title    : 'Schedule',
                        calendar : dates,
                        weeknum  : weeknum,
                        weeknow  : weeknow,
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
