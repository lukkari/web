/**
 * Parser controller
 */

var _ = require('underscore');

var content = require('./content');

/**
 * Run specified Parser and provide results
 * @param  {Object} params Object containing parameters
 *                         url - link to-be-parsed page
 *                         parser - Parser function
 *                         done - function to-be-run after parsing
 */
module.exports = function (params) {
  var defaults = {
    url : '',
    parser : function () { return null; }
  };

  _.defaults(params, defaults);

  content(params.url, function (err, w) {
    if(err) {
      return params.done(err);
    }

    return params.done(null, params.parser(w));
  });
};
