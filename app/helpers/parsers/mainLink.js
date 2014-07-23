/**
 * Main link parser
 */

module.exports = function ($) {

  var links = [];

  $('a').each(function () {
    var
      title = $(this).text().trim(),
      url = $(this).attr('href'),
      week = parseInt(title.slice(0, title.indexOf(':')), 10);

    if(title.length) {
      links.push({
        title : title,
        url   : url,
        week  : week
      });
    }
  });

  return links;
};
