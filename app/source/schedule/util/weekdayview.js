/**
 * WeekDay view helper
 */

var
  months = require('./months'),
  weekdays = require('./weekdays');

module.exports = {

  /**
   * Get readable timestamp
   * @param  {Date} date Date object
   * @return {String}    readable time
   */
  getTime : function (date) {
    var d = new Date(date);
    return d.getHours() + ':' + d.getMinutes();
  },

  /**
   * Get month from its number
   * @param  {Date} date
   * @return {String}    month
   */
  getMonth : function (date) {
    return months.brief[new Date(date).getMonth()];
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
    var
      now = new Date(),
      d   = new Date(date);
    return (now.getDate() == d.getDate()) && (now.getMonth() == d.getMonth());
  },

  /**
   * Get subject duration
   * @param  {Array} day first element of array is duration
   * @return {String}    duration
   */
  getDur : function (day) {
    if(!day || !day.length) return '0';
    return day[0].duration;
  },

  /**
   * Get day of the month from date
   * @param  {Date} date
   * @return {Integer}    day from 1 to 31
   */
  getDate : function (date) {
    return new Date(date).getDate();
  }
};
