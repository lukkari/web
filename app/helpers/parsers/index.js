/**
 * Parser controller
 */

var _ = require('underscore');

var content = require('./content');

/**
 * Run specified Parser and provide results
 * @param {Array}  url Array of links to-be-parsed
 * @param {Object} params Object containing parameters
 *                         info - data to send to parser
 *                         parser - Parser function
 *                         done - function to-be-run after parsing
 * @param {Array} data Data from previous function run
 */
function runner(url, params, data) {
  var defaults = {
    info : null,
    parser : function () { return null; },
    done : function () { return null; }
  };

  var globalErr = null;

  _.defaults(params, defaults);

  if(!data) data = [];

  if(!_.isArray(url)) return params.done(new Error('Wrong url argument'));

  if(!url.length) return params.done(globalErr, data);

  var link = url.shift();

  content(link, function (err, $) {
    if(err) {
      globalErr = err;
      url.length = 0;
    } else {
      data.push(params.parser($, link, params.info));
    }

    runner(url, params, data);
  });
}


module.exports = runner;
