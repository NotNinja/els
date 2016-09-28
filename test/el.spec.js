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

var el = require('../src/el')

describe('el', function() {
  it('should be exported as a function', function() {
    expect(el).to.be.a('function')
  })

  it('should be able to evaluate properties in scope using dot notation', function() {
    var scope = {
      object: { foo: { bar: 'fizz' } },
      array: [
        { fu: { baz: 'buzz' } }
      ]
    }

    expect(el('object', scope)).to.equal(scope.object)
    expect(el('object.foo.bar', scope)).to.equal('fizz')
    expect(el('object.foo.bar.length', scope)).to.equal(4)
    expect(el('array', scope)).to.equal(scope.array)
    expect(el('array.length', scope)).to.equal(1)
    expect(el('array[0]fu.baz', scope)).to.equal('buzz')
    expect(el('array[0]fu.baz.length', scope)).to.equal(4)
  })

  it('should be able to evaluate properties in scope using bracket notation', function() {
    var scope = {
      property: 'length',
      object: { foo: { bar: 'fizz' } },
      array: [
        { fu: { baz: 'buzz' } }
      ]
    }

    expect(el('object', scope)).to.equal(scope.object)
    expect(el('object["foo"].bar', scope)).to.equal('fizz')
    expect(el('object.foo["bar"][\'length\']', scope)).to.equal(4)
    expect(el('object.foo.bar.[property]', scope)).to.equal(4)
    expect(el('array', scope)).to.equal(scope.array)
    expect(el('array["length"]', scope)).to.equal(1)
    expect(el('array[0].fu.baz', scope)).to.equal('buzz')
    expect(el('array[0]["fu"].baz.length', scope)).to.equal(4)
    expect(el('array[0].fu.baz[property]', scope)).to.equal(4)
  })

  it('should be null-safe', function() {
    var scope = {
      foo: null,
      fu: { baz: null },
      array: [ null ]
    }

    expect(el('foo', scope)).to.be.null
    expect(el('foo.bar', scope)).to.be.undefined
    expect(el('fu.baz', scope)).to.be.null
    expect(el('fu.baz.quux', scope)).to.be.undefined
    expect(el('array[0]', scope)).to.be.null
    expect(el('array[0].foo', scope)).to.be.undefined
  })

  it('should point "this" to scope', function() {
    var scope = { foo: 'bar' }

    expect(el('this')).not.to.be.empty
    expect(el('this', scope)).to.eql(scope)
    expect(el('this.foo', scope)).to.equal('bar')
  })

  it('should be undefined-safe', function() {
    var scope = {
      fu: {},
      fizz: undefined,
      array: []
    }

    expect(el('foo')).to.be.undefined
    expect(el('foo', scope)).to.be.undefined
    expect(el('foo.bar', scope)).to.be.undefined
    expect(el('fu.baz', scope)).to.be.undefined
    expect(el('fu.baz.quux', scope)).to.be.undefined
    expect(el('fizz', scope)).to.be.undefined
    expect(el('fizz.buzz', scope)).to.be.undefined
    expect(el('array[0]', scope)).to.be.undefined
    expect(el('array[0].foo', scope)).to.be.undefined
  })

  it('should be able to evaluate simple data types', function() {
    expect(el('null')).to.be.null
    expect(el('undefined')).to.be.undefined

    expect(el('true')).to.be.true
    expect(el('false')).to.be.false

    expect(el('0')).to.equal(0)
    expect(el('1')).to.equal(1)
    expect(el('9')).to.equal(9)
    expect(el('9.9')).to.equal(9.9)
    expect(el('10')).to.equal(10)
    expect(el('3.141592653589793')).to.equal(Math.PI)

    expect(el('""')).to.equal('')
    expect(el('\'\'')).to.equal('')
    expect(el('"   "')).to.equal('   ')
    expect(el('"foo"')).to.equal('foo')
    expect(el('\' bar \'')).to.equal('bar')
  })

  it('should be able to invoke functions', function() {
    var scope = {
      a1: 'foo',
      a2: 'bar',
      fn: function(arg1, arg2) {
        return arg1 === 'foo' && arg2 === 'bar'
      }
    }

    expect(el('fn()', scope)).to.be.false
    expect(el('fn("foo")', scope)).to.be.false
    expect(el('fn("foo", "bar")', scope)).to.be.true
    expect(el('fn(a1, a2)', scope)).to.be.true
  })

  it('should be able to handle null function invocations', function() {
    var scope = { fn: null }

    expect(el('fn()', scope)).to.be.undefined
    expect(el('fn("foo")', scope)).to.be.undefined
    expect(el('fn("foo", "bar")', scope)).to.be.undefined
    expect(el('fn(a1, a2)', scope)).to.be.undefined
  })

  it('should be able to handle undefined function invocations', function() {
    expect(el('fn()')).to.be.undefined
    expect(el('fn("foo")')).to.be.undefined
    expect(el('fn("foo", "bar")')).to.be.undefined
    expect(el('fn(a1, a2)')).to.be.undefined
  })

  it('should support the + and - operators', function() {
    expect(el('2 + 1')).to.equal(3)
    expect(el('-2 + 1')).to.equal(-1)
    expect(el('2 + -1')).to.equal(1)
    expect(el('-2 + -1')).to.equal(-3)
    expect(el('left + right', { left: 2, right: 1 })).to.equal(3)

    expect(el('2 - 1')).to.equal(1)
    expect(el('-2 - 1')).to.equal(-3)
    expect(el('2 - -1')).to.equal(3)
    expect(el('-2 - -1')).to.equal(-1)
    expect(el('left - right', { left: 2, right: 1 })).to.equal(1)

    expect(el('+3')).to.equal(3)
    expect(el('+num', { num: 3 })).to.equal(3)
    expect(el('-3')).to.equal(-3)
    expect(el('-num', { num: 3 })).to.equal(-3)
  })

  it('should support the + operator for concatenation', function() {
    expect(el('"foo" + "bar"')).to.equal('foobar')
    expect(el('foo + bar', { foo: 'fu', bar: 'baz' })).to.equal('fubaz')
  })

  it('should support the / operator', function() {
    expect(el('6 / 6')).to.equal(1)
    expect(el('6 / 3')).to.equal(2)
    expect(el('6 / 2')).to.equal(3)
    expect(el('left / right', { left: 6, right: 2 })).to.equal(3)

    expect(el('-6 / 3')).to.equal(-2)
    expect(el('6 / -3')).to.equal(-2)
    expect(el('-6 / -3')).to.equal(2)

    expect(el('0 / 6')).to.equal(0)
    expect(el('6 / 0')).to.equal(Infinity)
  })

  it('should support the % operator', function() {
    expect(el('6 % 6')).to.equal(0)
    expect(el('6 % 3')).to.equal(0)
    expect(el('6 % 2')).to.equal(0)
    expect(el('6 % 5')).to.equal(1)
    expect(el('6 % 4')).to.equal(2)
    expect(el('left % right', { left: 6, right: 4 })).to.equal(2)

    expect(el('-6 % 4')).to.equal(-2)
    expect(el('6 % -4')).to.equal(2)
    expect(el('-6 % -4')).to.equal(-2)

    expect(el('0 % 6')).to.equal(0)
    expect(el('6 % 0')).to.be.NaN
  })

  it('should support the * operator', function() {
    expect(el('2 * 1')).to.equal(2)
    expect(el('left * right', { left: 3, right: 3 })).to.equal(9)

    expect(el('-2 * 1')).to.equal(-2)
    expect(el('2 * -1')).to.equal(-2)
    expect(el('-2 * -1')).to.equal(2)

    expect(el('2 * 0')).to.equal(0)
  })

  it('should support the == operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(el('left == right', { left: object, right: object })).to.be.true
    expect(el('left == right', { left: object, right: otherObject })).to.be.false

    expect(el('null == undefined')).to.be.true
    expect(el('1 == "1"')).to.be.true
    expect(el('left == right', { left: true, right: 1 })).to.be.true

    expect(el('true == false')).to.be.false
    expect(el('1 == "0"')).to.be.false
    expect(el('left == right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the != operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(el('left != right', { left: object, right: object })).to.be.false
    expect(el('left != right', { left: object, right: otherObject })).to.be.true

    expect(el('true != false')).to.be.true
    expect(el('1 != "0"')).to.be.true
    expect(el('left != right', { left: 0, right: 1 })).to.be.true

    expect(el('null != undefined')).to.be.false
    expect(el('1 != "1"')).to.be.false
    expect(el('left != right', { left: true, right: 1 })).to.be.false
  })

  it('should support the === operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(el('left === right', { left: object, right: object })).to.be.true
    expect(el('left === right', { left: object, right: otherObject })).to.be.false

    expect(el('null === null')).to.be.true
    expect(el('undefined === undefined')).to.be.true
    expect(el('1 === 1')).to.be.true
    expect(el('left === right', { left: true, right: true })).to.be.true

    expect(el('null === undefined')).to.be.false
    expect(el('1 === "1"')).to.be.false
    expect(el('left === right', { left: true, right: 1 })).to.be.false
  })

  it('should support the !== operator', function() {
    var object = { foo: 'bar' }
    var otherObject = { foo: 'bar' }

    expect(el('left !== right', { left: object, right: object })).to.be.false
    expect(el('left !== right', { left: object, right: otherObject })).to.be.true

    expect(el('null !== undefined')).to.be.true
    expect(el('1 !== "1"')).to.be.true
    expect(el('left !== right', { left: true, right: 1 })).to.be.true

    expect(el('null !== null')).to.be.false
    expect(el('undefined !== undefined')).to.be.false
    expect(el('1 !== 1')).to.be.false
    expect(el('left !== right', { left: true, right: true })).to.be.false
  })

  it('should support the > operator', function() {
    expect(el('2 > 1')).to.be.true
    expect(el('1 > 1')).to.be.false
    expect(el('0 > 1')).to.be.false

    expect(el('left > right', { left: 2, right: 1 })).to.be.true
    expect(el('left > right', { left: 1, right: 1 })).to.be.false
    expect(el('left > right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the >= operator', function() {
    expect(el('2 >= 1')).to.be.true
    expect(el('1 >= 1')).to.be.true
    expect(el('0 >= 1')).to.be.false

    expect(el('left >= right', { left: 2, right: 1 })).to.be.true
    expect(el('left >= right', { left: 1, right: 1 })).to.be.true
    expect(el('left >= right', { left: 0, right: 1 })).to.be.false
  })

  it('should support the < operator', function() {
    expect(el('1 < 2')).to.be.true
    expect(el('1 < 1')).to.be.false
    expect(el('1 < 0')).to.be.false

    expect(el('left < right', { left: 1, right: 2 })).to.be.true
    expect(el('left < right', { left: 1, right: 1 })).to.be.false
    expect(el('left < right', { left: 1, right: 0 })).to.be.false
  })

  it('should support the <= operator', function() {
    expect(el('1 <= 2')).to.be.true
    expect(el('1 <= 1')).to.be.true
    expect(el('1 <= 0')).to.be.false

    expect(el('left <= right', { left: 1, right: 2 })).to.be.true
    expect(el('left <= right', { left: 1, right: 1 })).to.be.true
    expect(el('left <= right', { left: 1, right: 0 })).to.be.false
  })

  it('should support the && operator', function() {
    expect(el('true && true')).to.be.true
    expect(el('true && false')).to.be.false
    expect(el('false && true')).to.be.false
    expect(el('false && false')).to.be.false

    expect(el('left && right', { left: true, right: true })).to.be.true
    expect(el('left && right', { left: true, right: false })).to.be.false
    expect(el('left && right', { left: false, right: true })).to.be.false
    expect(el('left && right', { left: false, right: false })).to.be.false
  })

  it('should support the || operator', function() {
    expect(el('true || true')).to.be.true
    expect(el('true || false')).to.be.true
    expect(el('false || true')).to.be.true
    expect(el('false || false')).to.be.false

    expect(el('left || right', { left: true, right: true })).to.be.true
    expect(el('left || right', { left: true, right: false })).to.be.true
    expect(el('left || right', { left: false, right: true })).to.be.true
    expect(el('left || right', { left: false, right: false })).to.be.false
  })

  it('should support the ! operator', function() {
    expect(el('!true')).to.be.false
    expect(el('!false')).to.be.true

    expect(el('!1')).to.be.false
    expect(el('!0')).to.be.true

    expect(el('!null')).to.be.true
    expect(el('!undefined')).to.be.true

    expect(el('!name', { name: true })).to.be.false
    expect(el('!name', { name: false })).to.be.true
  })

  it('should ignore white space', function() {
    expect(el('  foo  .  bar.  length ')).to.equal(3)
    expect(el('  this  [   "fu" ] .  length===   3')).to.be.true
  })

  it('should maintain white space within strings', function() {
    expect(el('  "   "  ')).to.equal('   ')
    expect(el('  "   foo   "  ')).to.equal('   foo   ')

    expect(el('  \'   \'  ')).to.equal('   ')
    expect(el('  \'   foo   \'  ')).to.equal('   foo   ')

    expect(el('  str  ', { str: '   ' })).to.equal('   ')
    expect(el('  str  ', { str: '   foo   ' })).to.equal('   foo   ')
  })

  it('should only allow matching quotation marks', function() {
    expect(el.bind(el, '"foo\'')).to.throw()
    expect(el.bind(el, '\'foo"')).to.throw()
  })
})
