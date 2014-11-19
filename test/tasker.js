/**
 * Test tasker lib
 */
var tasker = require('../app/libs/tasker');

var assert = require('assert');

describe('tasker lib', function () {

  it('should return empty array when no elements present', function (done) {
    tasker([])
      .fail(function (err) { console.log(err); })
      .done(function (data) { if(!data.length) done(); })
      .run();
  });

  it('should handle error', function (done) {
    tasker(['one'], function (el, next, done) {
        next(new Error('Correct'));
      })
      .fail(function (err) { if(err) done(); })
      .run();
  });

  it('should go trough all elements', function (done) {
    tasker(['one', 'two'], function (el, next, done) {
        next(null, el + el);
      })
      .done(function (data) {
        assert.deepEqual(['oneone', 'twotwo'], data);
        done();
      })
      .run();
  })

   it('should go trough only one element', function (done) {
    tasker(['one', 'two'], function (el, next, done) {
        done(null, el + el);
      })
      .done(function (data) {
        assert.deepEqual(['oneone'], data);
        done();
      })
      .run();
  })

});
