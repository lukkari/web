/**
 * Boot
 */

var
  $ = require('jquery'),
  Backbone = require('backbone');

var Router = require('./router');

// add functions
require('./util');

Backbone.$ = $;

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
