/**
 * WeekDay view helper
 */

var
  months = require('./months'),
  weekdays = require('./weekdays');

require('./');

module.exports = {

  /**
   * Get readable timestamp
   * @param  {Date} date Date object
   * @return {String}    readable time
   */
  getTime : function (date) {
    var d = new Date(date);
    return d.getHours() + ':' + ((d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes());
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
   * @param  {String}  name to-work-on string
   * @param  {Date}    date Current day date
   * @return {String}       url-ready string
   */
  toUrl : function (name, date) {
    var
      url = encodeURIComponent(name.replace(/\s/g, '_').toLowerCase()),
      d   = new Date(date);

    url += '/w' + d.getWeek();
    return url;
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
   * Get day of the month from date
   * @param  {Date} date
   * @return {Integer}    day from 1 to 31
   */
  getDate : function (date) {
    return new Date(date).getDate();
  },

  /**
   * Get status of current class from date
   * @param  {Object} date Date with start and end fields
   * @return {String}
   */
  getStatus : function (date) {
    var now = new Date().getTime();
    var start = new Date(date.start).getTime();
    var end = new Date(date.end).getTime();

    if(now > end) return 'ended';
    if(now > start && now < end) return 'now';

    return '';
  },

  /**
   * Get week day name
   * @param  {Date} date
   * @return {String}
   */
  getWeekDay : function (date) {
    var d = new Date(date);
    return weekdays.full[d.getDay()];
  },

  /**
   * Get entry duration
   * @param {Object} date Date with start and end fields
   * @return {Number}     Hour
   */
  getDuration : function (date) {
    var start = new Date(date.start);
    var end = new Date(date.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000*60*60));
  }
};
