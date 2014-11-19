/**
 * Tasker lib
 *
 * Usage:
 *
 * var tasker = require('tasker');
 *
 * tasker(elements, [handler])
 *   .fail(errCb)
 *   .done(doneCb)
 *   .run()
 *
 * Parameters:
 *   - elements Array which items to process
 *   - handler  Function processes each element
 *     passes three parameters
 *     (element, next, done)
 *
 * Chain methods:
 *   - fail pass function to execute on fail
 *     (err)
 *   - done function to execute on done
 *     (data)
 *
 */

var Task = function (elements, handler) {
  this.elems = elements;
  if(typeof handler === 'function') {
    this._handler = handler;
  } else {
    this._handler = function (el, next, done) { next(null, el); };
  }
  this._fail = function () {};
  this._done = function () {};
};

Task.prototype.fail = function (func) {
  this._fail = func;
  return this;
};

Task.prototype.done = function (func) {
  this._done = func;
  return this;
};

Task.prototype.run = function () {
  var output = [];
  var self = this;

  once();

  // Run handler once on each item
  function once() {
    // Return results when no elements left
    if(!self.elems.length) return self._done(output);

    // Run function over each
    self._handler(
      // Element
      self.elems.shift(),
      // Next callback
      function (err, data) {
        if(err) return self._fail(err);
        if(typeof data !== 'undefined') output.push(data);
        return once();
      },
      // Exit callback
      function (err, data) {
        if(err) return self._fail(err);
        if(typeof data !== 'undefined') output.push(data);
        return self._done(output);
      }
    );
  }

  return this;
};

var tasker = function (elements, handler) {
  return new Task(elements, handler);
};

module.exports = tasker;
