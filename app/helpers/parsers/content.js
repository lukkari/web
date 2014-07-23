/**
 * Request page content
 */

var
  request = require('request'),
  jsdom = require('jsdom'),
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


  /*jsdom.env({
    html : body,
    scripts : ["http://code.jquery.com/jquery-2.1.1.min.js"],
    done : function (errors, window) {
      if(errors) {
        return cb(errors);
      }

      cb(null, window);
    }
  });*/


  /*
  jsdom.env(
    body,
    [jquery],
    { encoding: "binary", method: 'GET' },
    function (errors, window) {
      if(errors) {
        cb(errors);
        return false;
      }
    }
  );
  */
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
