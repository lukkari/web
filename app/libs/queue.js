/**
 * Queue lib
 */

var Queue = function () {
  this._queue = [];
  this._running = false;
};

/**
 * Add to the queue
 * Params object:
 *   - item : object to pass to processing function
 *   - handler : processing function
 */
Queue.prototype.push = function (params) {
  this._queue.push({
    item : params.item,
    handler : params.handler
  });
};

/**
 * Add to the queue and run
 * Params object: the same as for push method
 */
Queue.prototype.pushAndRun = function (params) {
  this.push(params);
  if(!this._running) this.run();
};

/**
 * Run the queue
 * @return {[type]} [description]
 */
Queue.prototype.run = function () {
  if(this._running) return;
  if(!this._queue.length) return;

  this._running = true;

  var first = this._queue.shift();
  var next = function () {
    this._running = false;
    this.run();
  }.bind(this);

  // Run item handler
  first.handler(first.item, next);
};

module.exports = Queue;
