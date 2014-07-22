/**
 * Main link parser
 */

module.exports = function (w) {
  var d = w.document;

  console.log(d.body);

  return d.getElementsByTagName('b')[0].innerText;
};
