/**
 * Request page content
 */

var
  request = require('request'),
  cheerio = require('cheerio'),
  iconv = require('iconv'),
  ic = new iconv.Iconv('ISO-8859-1', 'utf-8');

function getContent(url, cb) {
  request({
      uri: url,
      method: 'GET',
      encoding: 'binary',
      timeout: 2000,
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Convert Finnish symbols to utf-8 properly
        body = new Buffer(body, 'binary');
        body = ic.convert(body).toString();

        cb(false, body);
      }
      else if(error) cb(error);
      else cb('Page not found');
    });
}

function getHTML(body, cb) {
  cb(null, cheerio.load(body, {
    normalizeWhitespace : true
  }));
}

module.exports = function (url, cb) {
  if(url.length < 5) return cb(new Error('URL is too short'));

  getContent(url, function (err, body) {
    if(err) {
      return cb(err);
    }

    getHTML(body, cb);
  });
};
