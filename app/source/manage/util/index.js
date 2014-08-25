/**
 * Helpers file
 */

var _ = require('underscore');

module.exports = {

  /**
   * Get properties that differ
   * @param  {Object} prev original object
   * @param  {Object} now  new object
   * @return {Object}      different properties
   */
  difference : function (prev, now) {
    var
      dif = {},
      prop;

    for(prop in now) {
      if(prop in prev) {
        if(!_.isEqual(prev[prop], now[prop])) {
          dif[prop] = now[prop];
        }
      } else {
        dif[prop] = now[prop];
      }
    }

    return dif;
  }

};
