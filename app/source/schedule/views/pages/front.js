/**
 * Front page view
 */

var
  $ = require('jquery'),
  _ = require('underscore'),
  Backbone = require('backbone');

var templates = require('../../dist');

module.exports = Backbone.View.extend({
  className : 'mainpage',
  template : templates.frontpage,

  initialize : function () {},

  events : {
    'click #sendBtn' : 'sendMessage'
  },

  /**
   * Controller to send message from frontpage
   */
  sendMessage : function () {
    var
      textarea = this.$el.find('#message'),
      sendBtn  = this.$el.find('#sendBtn'),
      successBlock = this.$el.find('#successBlock'),
      message = textarea.val();

    if(!message.length || message.length < 3) return;

    sendBtn.attr('disabled', 'disabled');

    $.ajax({
      url : '/api/message',
      method : 'POST',
      data : {
        message : message,
        screen : $(window).width() + 'x' + $(window).height(),
        device : window.navigator.userAgent
      }
    })
      .done(function () {
        textarea.val('');
        this.animateSwitch();
      }.bind(this))

      .fail(function () {
        this.animateSwitch(true);
      }.bind(this))

      .always(function () {
        sendBtn.removeAttr('disabled');
      });

  },

  /**
   * Adds and removes class name from success and error blocks
   */
  animateSwitch : function (fail) {
    var id = fail ? 'errorBlock' : 'successBlock';
    var $block = this.$el.find('#' + id);

    $block.addClass('down');

    setTimeout(function () {
      $block.removeClass('down');
    }, 3000);
  },

  render : function () {
    this
      .$el
      .html(_.template(this.template, { variable : 'data' }))
      .fadeIn('fast');

    return this;
  }
});
