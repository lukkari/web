/**
 * Front page view
 */

var
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

    Backbone.$.ajax({
      url : '/api/message',
      method : 'POST',
      data : {
        message : message
      },
      success : (function () {
        textarea.val('');
        this.animateSwitch();
        sendBtn.removeAttr('disabled');
      }).bind(this),
      error : (function () {
        // Error
        sendBtn.removeAttr('disabled');
      }).bind(this)
    });
  },

  /**
   * Adds and removes class name from successBlock
   */
  animateSwitch : function () {
    var successBlock = this.$el.find('#successBlock');

    successBlock.addClass('down');

    setTimeout(function () {
      successBlock.removeClass('down');
    }, 3000);
  },

  render : function () {
    this
      .$el
      .html(_.template(this.template, {}, { variable : 'data' }))
      .fadeIn('fast');

    return this;
  }
});
