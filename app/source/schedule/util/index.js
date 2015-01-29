/**
 * Capitalize string
 * @return {String}
 */
String.prototype.capitalize = function () {
  return this.slice(0, 1).toUpperCase() + this.slice(1);
};

/**
 * Make string url suitable
 * @return {String}
 */
String.prototype.toUrl = function () {
  return this.toLowerCase().replace(/\s/g, "_");
};

/**
 * Convert string from url
 * @return {String}
 */
String.prototype.fromUrl = function () {
  return this.replace(/\_/g, " ");
};

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

module.exports = {

  supportsStorage : function () {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  },

  localSave : function (key, val) {
    if(!this.supportsStorage()) return;
    localStorage[key] = val;
  },

  localGet : function (key) {
    if(!this.supportsStorage()) return;
    return localStorage[key];
  }

};
