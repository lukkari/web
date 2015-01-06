/**
 * Test queue lib
 */

var Queue = require('../app/libs/queue');

var assert = require('assert');

describe('queue lib', function () {

  var queue = new Queue();

  it('should pushAndRun items', function () {
    var count = 0;

    for(var i = 0; i < 5; i += 1) {
      queue.pushAndRun({
        item : 1,
        handler : function (item, next) {
          count += item;
          next();
        }
      });
    }

    assert.equal(5, count);
  });

  it('should push items and run', function () {
    var count = 0;

    for(var i = 0; i < 4; i += 1) {
      queue.push({
        item : 1,
        handler : function (item, next) {
          count += item;
          next();
        }
      });
    }

    queue.run();
    assert.equal(4, count);
  });

});
