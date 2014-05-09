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

module.exports = {};
