/**
 * Parser controller
 */

var _ = require('underscore');

var content = require('./content');

/**
 * Run specified Parser and provide results
 * @param {Array}  url Array of links to-be-parsed
 * @param {Object} params Object containing parameters
 *                         parser - Parser function
 *                         done - function to-be-run after parsing
 * @param {Array} data Data from previous function run
 */
function runner(url, params, data) {
  var defaults = {
    parser : function () { return null; },
    done : function () { return null; }
  };

  var globalErr = null;

  _.defaults(params, defaults);

  if(!data) data = [];

  if(!_.isArray(url)) return params.done(new Error('Wrong url argument'));

  if(!url.length) return params.done(globalErr, data);

  content(url.shift(), function (err, w) {
    if(err) {
      globalErr = err;
      url.length = 0;
      return;
    }

    console.log('running');

    data.push(params.parser(w));
  });
}


module.exports = runner;
