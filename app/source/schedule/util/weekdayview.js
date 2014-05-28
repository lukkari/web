/**
 * WeekDay view helper
 */

var months = require('./months');

module.exports = {

  /**
   * Get rooms string
   * @param  {Array} arr array of rooms
   * @return {String}    readable string of rooms
   */
  getRooms : function (arr) {
    var str ='in ';

    if(!arr || arr.length < 1) return '';

    for(var i = 0; i < arr.length; i += 1) {
      str += arr[i].name + ', ' ;
    }

    return str.substr(0, str.length - 2);
  },

  /**
   * Get readable timestamp
   * @param  {Array} day first item of array is date
   * @return {String}    readable time
   */
  getTime : function (day) {
    if(!day || !day.length) return 'No time';
    var d = new Date(day[0].date);
    return d.getHours() + ':' + d.getMinutes();
  },

  /**
   * Get month from its number
   * @param  {Integer} m month number
   * @return {String}    month
   */
  getMonth : function (m) {
    if(m < 0) return 'Unknown';
    return months.brief[m];
  },

  /**
   * Convert string to url
   * @param  {String} name to-work-on string
   * @return {String}      url-ready string
   */
  toUrl : function (name) {
    return encodeURIComponent(name.replace(/\s/g, '_').toLowerCase());
  },

  /**
   * Checks if day is today
   * @param  {Date}  date date to check
   * @return {Boolean}    if day is today
   */
  isToday : function (date) {
    var d = new Date();
    return (d.getDate() == date.day) && (d.getMonth() == date.month);
  },

  /**
   * Get subject duration
   * @param  {Array} day first element of array is duration
   * @return {String}    duration
   */
  getDur : function (day) {
    if(!day || !day.length) return '0';
    return day[0].duration;
  }
};
