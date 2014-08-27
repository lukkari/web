/**
 * Boot schedule page
 */

var
  $ = require('jquery'),
  Backbone = require('backbone');

var Router = require('./router');

// add functions
require('./util');

Backbone.$ = $;

// https://github.com/kendagriff/backbone.analytics
var loadUrl = Backbone.History.prototype.loadUrl;

Backbone.History.prototype.loadUrl = function () {
  var
    matched    = loadUrl.apply(this, arguments),
    gaFragment = this.fragment;

  if(!/^\//.test(gaFragment)) {
    gaFragment = '/' + gaFragment;
  }

  var ga;
  if(window.GoogleAnalyticsObject && window.GoogleAnalyticsObject !== 'ga') {
    ga = window.GoogleAnalyticsObject;
  } else {
    ga = window.ga;
  }

  if (typeof ga !== 'undefined') {
    ga('send', 'pageview', gaFragment);
  }

  return matched;
};

$(document).ready(function () {

  window.app = {};

  window.app.router = new Router();
  Backbone.history.start({ pushState: true });

  /**
   * Bind events to all local links
   */
  $(document).on('click', 'a[data-local]', function (e) {
    var href = $(this).attr('href');
    var protocol = this.protocol + '//';

    if(href.slice(protocol.length) !== protocol) {
      e.preventDefault();
      window.app.router.navigate(href, true);
    }
  });

});
