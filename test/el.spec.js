/*
 * Copyright (C) 2016 Alasdair Mercer, Skelp
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict'

var expect = require('chai').expect

var EL = require('../src/el')

describe('EL.parse', function() {
  it('should be able to evaluate properties in scope using dot notation', function() {
    var scope = {
      object: { foo: { bar: 'fizz' } },
      array: [
        { fu: { baz: 'buzz' } }
      ]
    }

    expect(EL.parse('object', scope)).to.equal(scope.object)
    expect(EL.parse('object.foo.bar', scope)).to.equal('fizz')
    expect(EL.parse('object.foo.bar.length', scope)).to.equal(4)
    expect(EL.parse('array', scope)).to.equal(scope.array)
    expect(EL.parse('array.length', scope)).to.equal(1)
    expect(EL.parse('array[0]fu.baz', scope)).to.equal('buzz')
    expect(EL.parse('array[0]fu.baz.length', scope)).to.equal(4)
  })

  it('should be able to evaluate properties in scope using bracket notation', function() {
    var scope = {
      property: 'length',
      object: { foo: { bar: 'fizz' } },
      array: [
        { fu: { baz: 'buzz' } }
      ]
    }

    expect(EL.parse('object', scope)).to.equal(scope.object)
    expect(EL.parse('object["foo"].bar', scope)).to.equal('fizz')
    expect(EL.parse('object.foo["bar"][\'length\']', scope)).to.equal(4)
    expect(EL.parse('object.foo.bar.[property]', scope)).to.equal(4)
    expect(EL.parse('array', scope)).to.equal(scope.array)
    expect(EL.parse('array["length"]', scope)).to.equal(1)
    expect(EL.parse('array[0].fu.baz', scope)).to.equal('buzz')
    expect(EL.parse('array[0]["fu"].baz.length', scope)).to.equal(4)
    expect(EL.parse('array[0].fu.baz[property]', scope)).to.equal(4)
  })

  it('should be null-safe', function() {
    var scope = {
      foo: null,
      fu: { baz: null },
      array: [ null ]
    }

    expect(EL.parse('foo', scope)).to.be.null
    expect(EL.parse('foo.bar', scope)).to.be.undefined
    expect(EL.parse('fu.baz', scope)).to.be.null
    expect(EL.parse('fu.baz.quux', scope)).to.be.undefined
    expect(EL.parse('array[0]', scope)).to.be.null
    expect(EL.parse('array[0].foo', scope)).to.be.undefined
  })

  it('should point "this" to scope', function() {
    var scope = { foo: 'bar' }

    expect(EL.parse('this')).not.to.be.empty
    expect(EL.parse('this', scope)).to.eql(scope)
    expect(EL.parse('this.foo', scope)).to.equal('bar')
  })

  it('should be undefined-safe', function() {
    var scope = {
      fu: {},
      fizz: undefined,
      array: []
    }

    expect(EL.parse('foo')).to.be.undefined
    expect(EL.parse('foo', scope)).to.be.undefined
    expect(EL.parse('foo.bar', scope)).to.be.undefined
    expect(EL.parse('fu.baz', scope)).to.be.undefined
    expect(EL.parse('fu.baz.quux', scope)).to.be.undefined
    expect(EL.parse('fizz', scope)).to.be.undefined
    expect(EL.parse('fizz.buzz', scope)).to.be.undefined
    expect(EL.parse('array[0]', scope)).to.be.undefined
    expect(EL.parse('array[0].foo', scope)).to.be.undefined
  })

  it('should be able to evaluate simple data types', function() {
    expect(EL.parse('null')).to.be.null
    expect(EL.parse('undefined')).to.be.undefined

    expect(EL.parse('true')).to.be.true
    expect(EL.parse('false')).to.be.false

    expect(EL.parse('0')).to.equal(0)
    expect(EL.parse('1')).to.equal(1)
    expect(EL.parse('9')).to.equal(9)
    expect(EL.parse('9.9')).to.equal(9.9)
    expect(EL.parse('10')).to.equal(10)
    expect(EL.parse('3.141592653589793')).to.equal(Math.PI)

    expect(EL.parse('""')).to.equal('')
    expect(EL.parse('\'\'')).to.equal('')
    expect(EL.parse('"   "')).to.equal('   ')
    expect(EL.parse('"foo"')).to.equal('foo')
    expect(EL.parse('\' bar \'')).to.equal('bar')
  })

  it('should be able to invoke functions', function() {
    var scope = {
      a1: 'foo',
      a2: 'bar',
      fn: function(arg1, arg2) {
        return arg1 === 'foo' && arg2 === 'bar'
      }
    }

    expect(EL.parse('fn()', scope)).to.be.false
    expect(EL.parse('fn("foo")', scope)).to.be.false
    expect(EL.parse('fn("foo", "bar")', scope)).to.be.true
    expect(EL.parse('fn(a1, a2)', scope)).to.be.true
  })

  it('should be able to handle null function invocations', function() {
    var scope = { fn: null }

    expect(EL.parse('fn()', scope)).to.be.undefined
    expect(EL.parse('fn("foo")', scope)).to.be.undefined
    expect(EL.parse('fn("foo", "bar")', scope)).to.be.undefined
    expect(EL.parse('fn(a1, a2)', scope)).to.be.undefined
  })

  it('should be able to handle undefined function invocations', function() {
    expect(EL.parse('fn()')).to.be.undefined
    expect(EL.parse('fn("foo")')).to.be.undefined
    expect(EL.parse('fn("foo", "bar")')).to.be.undefined
    expect(EL.parse('fn(a1, a2)')).to.be.undefined
  })

  it('should support the + and - operators', function() {
    expect(EL.parse('2 + 1')).to.equal(3)
    expect(EL.parse('-2 + 1')).to.equal(-1)
    expect(EL.parse('2 + -1')).to.equal(1)
    expect(EL.parse('-2 + -1')).to.equal(-3)
    expect(EL.parse('left + right', { left: 2, right: 1 })).to.equal(3)

    expect(EL.parse('2 - 1')).to.equal(1)
    expect(EL.parse('-2 - 1')).to.equal(-3)
    expect(EL.parse('2 - -1')).to.equal(3)
    expect(EL.parse('-2 - -1')).to.equal(-1)
    expect(EL.parse('left - right', { left: 2, right: 1 })).to.equal(1)

    expect(EL.parse('+3')).to.equal(3)
    expect(EL.parse('+num', { num: 3 })).to.equal(3)
    expect(EL.parse('-3')).to.equal(-3)
    expect(EL.parse('-num', { num: 3 })).to.equal(-3)
  })

  it('should support the + operator for concatenation', function() {
    expect(EL.parse('"foo" + "bar"')).to.equal('foobar')
    expect(EL.parse('foo + bar', { foo: 'fu', bar: 'baz' })).to.equal('fubaz')
  })

  it('should support the / operator', function() {
    expect(EL.parse('6 / 6')).to.equal(1)
    expect(EL.parse('6 / 3')).to.equal(2)
    expect(EL.parse('6 / 2')).to.equal(3)
    expect(EL.parse('left / right', { left: 6, right: 2 })).to.equal(3)

    expect(EL.parse('-6 / 3')).to.equal(-2)
    expect(EL.parse('6 / -3')).to.equal(-2)
    expect(EL.parse('-6 / -3')).to.equal(2)

    expect(EL.parse('0 / 6')).to.equal(0)
    expect(EL.parse('6 / 0')).to.equal(Infinity)
  })

  it('should support the % operator', function() {
    expect(EL.parse('6 % 6')).to.equal(0)
    expect(EL.parse('6 % 3')).to.equal(0)
    expect(EL.parse('6 % 2')).to.equal(0)
    expect(EL.parse('6 % 5')).to.equal(1)
    expect(EL.parse('6 % 4')).to.equal(2)
    expect(EL.parse('left % right', { left: 6, right: 4 })).to.equal(2)

    expect(EL.parse('-6 % 4')).to.equal(-2)
    expect(EL.parse('6 % -4')).to.equal(2)
    expect(EL.parse('-6 % -4')).to.equal(-2)

    expect(EL.parse('0 % 6')).to.equal(0)
    expect(EL.parse('6 % 0')).to.be.NaN
  })

  it('should support the * operator', function() {
    expect(EL.parse('2 * 1')).to.equal(2)
    expect(EL.parse('left * right', { left: 3, right: 3 })).to.equal(9)

    expect(EL.parse('-2 * 1')).to.equal(-2)
    expect(EL.parse('2 * -1')).to.equal(-2)
    expect(EL.parse('-2 * -1')).to.equal(2)

    expect(EL.parse('2 * 0')).to.equal(0)
  })

  it('should support the == operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(EL.parse('left == right', { left: object, right: object })).to.be.true
    expect(EL.parse('left == right', { left: object, right: otherObject })).to.be.false

    expect(EL.parse('null == undefined')).to.be.true
    expect(EL.parse('1 == "1"')).to.be.true
    expect(EL.parse('left == right', { left: true, right: 1 })).to.be.true

    expect(EL.parse('true == false')).to.be.false
    expect(EL.parse('1 == "0"')).to.be.false
    expect(EL.parse('left == right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the != operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(EL.parse('left != right', { left: object, right: object })).to.be.false
    expect(EL.parse('left != right', { left: object, right: otherObject })).to.be.true

    expect(EL.parse('true != false')).to.be.true
    expect(EL.parse('1 != "0"')).to.be.true
    expect(EL.parse('left != right', { left: 0, right: 1 })).to.be.true

    expect(EL.parse('null != undefined')).to.be.false
    expect(EL.parse('1 != "1"')).to.be.false
    expect(EL.parse('left != right', { left: true, right: 1 })).to.be.false
  })

  it('should support the === operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(EL.parse('left === right', { left: object, right: object })).to.be.true
    expect(EL.parse('left === right', { left: object, right: otherObject })).to.be.false

    expect(EL.parse('null === null')).to.be.true
    expect(EL.parse('undefined === undefined')).to.be.true
    expect(EL.parse('1 === 1')).to.be.true
    expect(EL.parse('left === right', { left: true, right: true })).to.be.true

    expect(EL.parse('null === undefined')).to.be.false
    expect(EL.parse('1 === "1"')).to.be.false
    expect(EL.parse('left === right', { left: true, right: 1 })).to.be.false
  })

  it('should support the !== operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(EL.parse('left !== right', { left: object, right: object })).to.be.false
    expect(EL.parse('left !== right', { left: object, right: otherObject })).to.be.true

    expect(EL.parse('null !== undefined')).to.be.true
    expect(EL.parse('1 !== "1"')).to.be.true
    expect(EL.parse('left !== right', { left: true, right: 1 })).to.be.true

    expect(EL.parse('null !== null')).to.be.false
    expect(EL.parse('undefined !== undefined')).to.be.false
    expect(EL.parse('1 !== 1')).to.be.false
    expect(EL.parse('left !== right', { left: true, right: true })).to.be.false
  })

  it('should support the > operator', function() {
    expect(EL.parse('2 > 1')).to.be.true
    expect(EL.parse('1 > 1')).to.be.false
    expect(EL.parse('0 > 1')).to.be.false

    expect(EL.parse('left > right', { left: 2, right: 1 })).to.be.true
    expect(EL.parse('left > right', { left: 1, right: 1 })).to.be.false
    expect(EL.parse('left > right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the >= operator', function() {
    expect(EL.parse('2 >= 1')).to.be.true
    expect(EL.parse('1 >= 1')).to.be.true
    expect(EL.parse('0 >= 1')).to.be.false

    expect(EL.parse('left >= right', { left: 2, right: 1 })).to.be.true
    expect(EL.parse('left >= right', { left: 1, right: 1 })).to.be.true
    expect(EL.parse('left >= right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the < operator', function() {
    expect(EL.parse('1 < 2')).to.be.true
    expect(EL.parse('1 < 1')).to.be.false
    expect(EL.parse('1 < 0')).to.be.false

    expect(EL.parse('left < right', { left: 1, right: 2 })).to.be.true
    expect(EL.parse('left < right', { left: 1, right: 1 })).to.be.false
    expect(EL.parse('left < right', { left: 1, right: 0 })).to.be.false
  })

  it('should support the <= operator', function() {
    expect(EL.parse('1 <= 2')).to.be.true
    expect(EL.parse('1 <= 1')).to.be.true
    expect(EL.parse('1 <= 0')).to.be.false

    expect(EL.parse('left <= right', { left: 1, right: 2 })).to.be.true
    expect(EL.parse('left <= right', { left: 1, right: 1 })).to.be.true
    expect(EL.parse('left <= right', { left: 1, right: 0 })).to.be.false
  })

  it('should support the && operator', function() {
    expect(EL.parse('true && true')).to.be.true
    expect(EL.parse('true && false')).to.be.false
    expect(EL.parse('false && true')).to.be.false
    expect(EL.parse('false && false')).to.be.false

    expect(EL.parse('left && right', { left: true, right: true })).to.be.true
    expect(EL.parse('left && right', { left: true, right: false })).to.be.false
    expect(EL.parse('left && right', { left: false, right: true })).to.be.false
    expect(EL.parse('left && right', { left: false, right: false })).to.be.false
  })

  it('should support the || operator', function() {
    expect(EL.parse('true || true')).to.be.true
    expect(EL.parse('true || false')).to.be.true
    expect(EL.parse('false || true')).to.be.true
    expect(EL.parse('false || false')).to.be.false

    expect(EL.parse('left || right', { left: true, right: true })).to.be.true
    expect(EL.parse('left || right', { left: true, right: false })).to.be.true
    expect(EL.parse('left || right', { left: false, right: true })).to.be.true
    expect(EL.parse('left || right', { left: false, right: false })).to.be.false
  })

  it('should support the ! operator', function() {
    expect(EL.parse('!true')).to.be.false
    expect(EL.parse('!false')).to.be.true

    expect(EL.parse('!1')).to.be.false
    expect(EL.parse('!0')).to.be.true

    expect(EL.parse('!null')).to.be.true
    expect(EL.parse('!undefined')).to.be.true

    expect(EL.parse('!name', { name: true })).to.be.false
    expect(EL.parse('!name', { name: false })).to.be.true
  })

  it('should ignore white space', function() {
    expect(EL.parse('  foo  .  bar.  length ')).to.equal(3)
    expect(EL.parse('  this  [   "fu" ] .  length===   3')).to.be.true
  })

  it('should maintain white space within strings', function() {
    expect(EL.parse('  "   "  ')).to.equal('   ')
    expect(EL.parse('  "   foo   "  ')).to.equal('   foo   ')

    expect(EL.parse('  \'   \'  ')).to.equal('   ')
    expect(EL.parse('  \'   foo   \'  ')).to.equal('   foo   ')

    expect(EL.parse('  str  ', { str: '   ' })).to.equal('   ')
    expect(EL.parse('  str  ', { str: '   foo   ' })).to.equal('   foo   ')
  })

  it('should only allow matching quotation marks', function() {
    expect(EL.parse.bind(EL, '"foo\'')).to.throw()
    expect(EL.parse.bind(EL, '\'foo"')).to.throw()
  })
})
