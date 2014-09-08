/**
 * Get current week
 * @return {number}
 */
Date.prototype.getWeek = function () {
  var onejan = new Date(this.getFullYear(), 0, 1),
      time   = this.getMilliseconds() +
               this.getSeconds() * 1000 +
               this.getMinutes() * 60 * 1000 +
               this.getHours() * 60 * 60 * 1000;
  return Math.ceil((((this - onejan - time) / 86400000) + onejan.getDay() + 1) / 7);
};

/**
 * Get current study week (increment if saturday)
 * @return {number}
 */
Date.prototype.getStudyWeek = function () {
  var inc = (this.getDay() == 6) ? 1 : 0;
  return this.getWeek() + inc;
};

/**
 * Find week's first day
 * @param  {number} w week number
 * @param  {number} y year
 * @return {date}
 */
Date.prototype.getDateOfISOWeek = function (w, y) {
  var simple       = new Date(y, 0, 1 + (w - 1) * 7),
      dow          = simple.getDay(),
      ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
};

/**
 * Capitalize string
 * @return {string}
 */
String.prototype.capitalize = function () {
  return this.slice(0, 1).toUpperCase() + this.slice(1);
};

/**
 * Escape special characters for regular expressions
 * @param  {String} text String to be escaped
 * @return {String}      Escaped string
 */
RegExp.escape = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
