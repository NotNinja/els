'use strict';

// Load external dependencies.
var expect = require('expect.js');
var fs = require('fs');

// Load internal dependencies.
var el = require('../el.js');

// Run test suite.
describe('el', function() {
  // TODO: complete
  it('should be exported as a funtion', function() {
    expect(el).to.be.a(Function);
  });

  describe('.noConflict', function() {
    it('should return a reference to itself', function() {
      expect(el.noConflict()).to.be(el);
    });
  });

  describe('.VERSION', function() {
    it('should match version in bower.json', function(done) {
      fs.readFile('bower.json', { encoding: 'utf8' }, function(error, data) {
        if (error) {
          throw error;
        } else {
          expect(el.VERSION).to.be(JSON.parse(data).version);

          done();
        }
      });
    });

    it('should match version in package.json', function(done) {
      fs.readFile('package.json', { encoding: 'utf8' }, function(error, data) {
        if (error) {
          throw error;
        } else {
          expect(el.VERSION).to.be(JSON.parse(data).version);

          done();
        }
      });
    });
  });
});