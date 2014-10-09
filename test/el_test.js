'use strict';

// Load external dependencies.
var expect = require('expect.js');
var fs = require('fs');

// Load internal dependencies.
var el = require('../el.js');

// Run test suite.
describe('el', function() {
  // TODO: Complete (incl. all operators, method invocations, scope sandbox, whitespace)
  it('should be exported as a funtion', function() {
    expect(el).to.be.a(Function);
  });

  it('should be able to evaluate simple data types', function() {
    expect(el('null')).to.be(null);
    expect(el('undefined')).to.be(undefined);

    expect(el('true')).to.be(true);
    expect(el('false')).to.be(false);

    expect(el('0')).to.be(0);
    expect(el('1')).to.be(1);
    expect(el('9')).to.be(9);
    expect(el('9.9')).to.be(9.9);
    expect(el('10')).to.be(10);
    expect(el('3.141592653589793')).to.be(Math.PI);

    expect(el('""')).to.be('');
    expect(el('\'\'')).to.be('');
    expect(el('"   "')).to.be('   ');
    expect(el('"foo"')).to.be('foo');
    expect(el('\' bar \'')).to.be('bar');
  });

  it('should handle escape characters correctly', function() {
    var str = '\\n \\f \\r \\t \\v \\" \\\'';

    expect(el('"' + str + '"')).to.be(str);
  });

  it('should should support the + and - operators', function() {
    expect(el('2 + 1')).to.be(3);
    expect(el('-2 + 1')).to.be(-1);
    expect(el('2 + -1')).to.be(1);
    expect(el('-2 + -1')).to.be(-3);
    expect(el('left + right', { left: 2, right: 1 })).to.be(3);

    expect(el('2 - 1')).to.be(1);
    expect(el('-2 - 1')).to.be(-3);
    expect(el('2 - -1')).to.be(3);
    expect(el('-2 - -1')).to.be(-1);
    expect(el('left - right', { left: 2, right: 1 })).to.be(1);

    expect(el('+3')).to.be(3);
    expect(el('+num', { num: 3 })).to.be(3);
    expect(el('-3')).to.be(-3);
    expect(el('-num', { num: 3 })).to.be(-3);
  });

  it('should should support the + operator for concatenation', function() {
    expect(el('"foo" + "bar"')).to.be('foobar');
    expect(el('foo + bar', { foo: 'fu', bar: 'baz' })).to.be('fubaz');
  });

  it('should should support the / operator', function() {
    expect(el('6 / 6')).to.be(1);
    expect(el('6 / 3')).to.be(2);
    expect(el('6 / 2')).to.be(3);
    expect(el('left / right', { left: 6, right: 2 })).to.be(3);

    expect(el('-6 / 3')).to.be(-2);
    expect(el('6 / -3')).to.be(-2);
    expect(el('-6 / -3')).to.be(2);

    expect(el('0 / 6')).to.be(0);
    expect(el('6 / 0')).to.be(Infinity);
  });

  it('should should support the % operator', function() {
    expect(el('6 % 6')).to.be(0);
    expect(el('6 % 3')).to.be(0);
    expect(el('6 % 2')).to.be(0);
    expect(el('6 % 5')).to.be(1);
    expect(el('6 % 4')).to.be(2);
    expect(el('left % right', { left: 6, right: 4 })).to.be(2);

    expect(el('-6 % 4')).to.be(-2);
    expect(el('6 % -4')).to.be(2);
    expect(el('-6 % -4')).to.be(-2);

    expect(el('0 % 6')).to.be(0);
    expect(el('6 % 0')).to.be(NaN);
  });

  it('should should support the * operator', function() {
    expect(el('2 * 1')).to.be(2);
    expect(el('left * right', { left: 3, right: 3 })).to.be(9);

    expect(el('-2 * 1')).to.be(-2);
    expect(el('2 * -1')).to.be(-2);
    expect(el('-2 * -1')).to.be(2);

    expect(el('2 * 0')).to.be(0);
  });

  it('should be able to evaluate properties in scope using dot notation', function() {
    var scope = {
      object: {
        foo: {
          bar: 'fizz'
        }
      },
      array: [{
        fu: {
          baz: 'buzz'
        }
      }]
    };

    expect(el('object', scope)).to.be(scope.object);
    expect(el('object.foo.bar', scope)).to.be('fizz');
    expect(el('object.foo.bar.length', scope)).to.be(4);
    expect(el('array', scope)).to.be(scope.array);
    expect(el('array.length', scope)).to.be(1);
    expect(el('array[0]fu.baz', scope)).to.be('buzz');
    expect(el('array[0]fu.baz.length', scope)).to.be(4);
  });

  it('should be able to evaluate properties in scope using bracket notation', function() {
    var scope = {
      property: 'length',
      object: {
        foo: {
          bar: 'fizz'
        }
      },
      array: [{
        fu: {
          baz: 'buzz'
        }
      }]
    };

    expect(el('object', scope)).to.be(scope.object);
    expect(el('object["foo"].bar', scope)).to.be('fizz');
    expect(el('object.foo["bar"][\'length\']', scope)).to.be(4);
    expect(el('object.foo.bar.[property]', scope)).to.be(4);
    expect(el('array', scope)).to.be(scope.array);
    expect(el('array["length"]', scope)).to.be(1);
    expect(el('array[0].fu.baz', scope)).to.be('buzz');
    expect(el('array[0]["fu"].baz.length', scope)).to.be(4);
    expect(el('array[0].fu.baz[property]', scope)).to.be(4);
  });

  it('should be null-safe', function() {
    var scope = {
      foo: null,
      fu: {
        baz: null
      },
      array: [ null ]
    };

    expect(el('foo', scope)).to.be(null);
    expect(el('foo.bar', scope)).to.be(null);
    expect(el('fu.baz', scope)).to.be(null);
    expect(el('fu.baz.quux', scope)).to.be(null);
    expect(el('array[0]', scope)).to.be(null);
    expect(el('array[0].foo', scope)).to.be(null);
  });

  it('should be undefined-safe', function() {
    var scope = {
      fu: {},
      fizz: undefined,
      array: []
    };

    expect(el('foo')).to.be(undefined);
    expect(el('foo', scope)).to.be(undefined);
    expect(el('foo.bar', scope)).to.be(undefined);
    expect(el('fu.baz', scope)).to.be(undefined);
    expect(el('fu.baz.quux', scope)).to.be(undefined);
    expect(el('fizz', scope)).to.be(undefined);
    expect(el('fizz.buzz', scope)).to.be(undefined);
    expect(el('array[0]', scope)).to.be(undefined);
    expect(el('array[0].foo', scope)).to.be(undefined);
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