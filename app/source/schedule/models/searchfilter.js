/**
 * Search filter model
 */

var Backbone = require('backbone');

var util = require('../util/');

module.exports = Backbone.Model.extend({

  /**
   * Return key for localStorage
   */
  getKey : function () {
    return 'filter-' + this.get('_id');
  },

  toTemplate : function () {
      var data = this.toJSON();
      var checked = util.localGet(this.getKey());

      if(typeof checked === 'undefined') checked = true;
      else checked = checked == 'true';

      data.checked = checked ? 'checked' : '';
      return data;
  },

  /**
   * Update localStorage filter data
   */
  updateState : function (isChecked) {
    util.localSave(this.getKey(), isChecked);
  }

});
