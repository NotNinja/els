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

/* eslint "radix": "off" */

'use strict'

var Oopsy = require('oopsy')

// TODO: Remove unused methods

/**
 * @public
 * @class NumberWrapper
 */
var NumberWrapper = Oopsy.extend(null, {

  /**
   * @public
   * @static
   * @type {NaN}
   */
  NaN: NaN,

  /**
   * @param {number} n1
   * @param {number} n2
   * @return {boolean}
   * @public
   * @static
   */
  equals: function(n1, n2) {
    return n1 === n2
  },

  /**
   * @param {*} value
   * @return {boolean}
   * @public
   * @static
   */
  isInteger: function(value) {
    // TODO: Browser support?
    return Number.isInteger(value)
  },

  /**
   * @param {*} value
   * @return {boolean}
   * @public
   * @static
   */
  isNaN: function(value) {
    return isNaN(value)
  },

  /**
   * @param {*} value
   * @return {boolean}
   * @public
   * @static
   */
  isNumeric: function(value) {
    return !isNaN(value - parseFloat(value))
  },

  /**
   * @param {string} text
   * @param {number} radix
   * @return {number}
   * @public
   * @static
   */
  parseInt: function(text, radix) {
    var result

    if (radix === 10) {
      if (/^(\-|\+)?[0-9]+$/.test(text)) {
        return parseInt(text, radix)
      }
    } else if (radix === 16) {
      if (/^(\-|\+)?[0-9ABCDEFabcdef]+$/.test(text)) {
        return parseInt(text, radix)
      }
    } else {
      result = parseInt(text, radix)
      if (!isNaN(result)) {
        return result
      }
    }

    throw new Error('Invalid integer literal when parsing ' + text + ' in base ' + radix)
  },

  /**
   * @param {string} text
   * @return {number}
   * @public
   * @static
   */
  parseIntAutoRadix: function(text) {
    var result = parseInt(text)
    if (isNaN(result)) {
      throw new Error('Invalid integer literal when parsing ' + text)
    }

    return result
  },

  /**
   * @param {number} num
   * @param {number} fractionDigits
   * @return {string}
   * @public
   * @static
   */
  toFixed: function(num, fractionDigits) {
    return num.toFixed(fractionDigits)
  }

})

/**
 * @param {string[]} [parts=[]]
 * @public
 * @class StringJoiner
 */
var StringJoiner = Oopsy.extend(function(parts) {
  /**
   * @public
   * @type {string[]}
   */
  this.parts = parts != null ? parts : []
}, {

  /**
   * @param {string} part
   * @return {void}
   * @public
   */
  add: function(part) {
    this.parts.push(part)
  },

  /**
   * @return {string}
   * @public
   */
  toString: function() {
    return this.parts.join('')
  }

})

/**
 * @public
 * @class StringWrapper
 */
var StringWrapper = Oopsy.extend(null, {

  /**
   * @param {string} str
   * @param {number} index
   * @return {number}
   * @public
   * @static
   */
  charCodeAt: function(str, index) {
    return str.charCodeAt(index)
  },

  /**
   * @param {string} s1
   * @param {string} s2
   * @return {number}
   * @public
   * @static
   */
  compare: function(s1, s2) {
    if (s1 < s2) {
      return -1
    } else if (s1 > s2) {
      return 1
    }

    return 0
  },

  /**
   * @param {string} str
   * @param {string} substr
   * @return {boolean}
   * @public
   * @static
   */
  contains: function(str, substr) {
    return str.indexOf(substr) !== -1
  },

  /**
   * @param {string} s1
   * @param {string} s2
   * @return {boolean}
   * @public
   * @static
   */
  equals: function(s1, s2) {
    return s1 === s2
  },

  /**
   * @param {number} code
   * @return {string}
   * @public
   * @static
   */
  fromCharCode: function(code) {
    return String.fromCharCode(code)
  },

  /**
   * @param {string} str
   * @param {string} from
   * @param {string} replace
   * @return {string}
   * @public
   * @static
   */
  replace: function(str, from, replace) {
    return str.replace(from, replace)
  },

  /**
   * @param {string} str
   * @param {RegExp} from
   * @param {string} replace
   * @return {string}
   * @public
   * @static
   */
  replaceAll: function(str, from, replace) {
    return str.replace(from, replace)
  },

  /**
   * @param {string} str
   * @param {RegExp} from
   * @param {Function} callback
   * @return {string}
   * @public
   * @static
   */
  replaceAllMapped: function(str, from, callback) {
    return str.replace(from, function() {
      var matches = Array.prototype.slice.call(arguments, 0, -2)

      return callback(matches)
    })
  },

  /**
   * @param {string} str
   * @param {number} [from=0]
   * @param {number} [to]
   * @return {string}
   * @public
   * @static
   */
  slice: function(str, from, to) {
    return str.slice(from == null ? 0 : from, to == null ? undefined : to)
  },

  /**
   * @param {string} str
   * @param {RegExp} regExp
   * @return {string[]}
   * @public
   * @static
   */
  split: function(str, regExp) {
    return str.split(regExp)
  },

  /**
   * @param {string} str
   * @param {string} character
   * @return {string}
   * @public
   * @static
   */
  stripLeft: function(str, character) {
    var i
    var position

    if (str && str.length) {
      position = 0

      for (i = 0; i < str.length; i++) {
        if (str[i] !== character) {
          break
        }

        position++
      }

      str = str.substring(position)
    }

    return str
  },

  /**
   * @param {string} str
   * @param {string} character
   * @return {string}
   * @public
   * @static
   */
  stripRight: function(str, character) {
    var i
    var position

    if (str && str.length) {
      position = str.length

      for (i = str.length - 1; i >= 0; i--) {
        if (str[i] !== character) {
          break
        }

        position--
      }

      str = str.substring(0, position)
    }

    return str
  }

})

/**
 * @public
 * @class Lang
 */
var Lang = Oopsy.extend(null, {

  NumberWrapper: NumberWrapper,
  StringJoiner: StringJoiner,
  StringWrapper: StringWrapper,

  /**
   * @param {string} str
   * @return {string}
   * @public
   * @static
   */
  escapeRegExp: function(str) {
    return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
  },

  /**
   * @param {*} obj
   * @return {boolean}
   * @public
   * @static
   */
  isArray: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  },

  /**
   * @param {*} obj
   * @return {boolean}
   * @public
   * @static
   */
  isBlank: function(obj) {
    return typeof obj === 'undefined' || obj === null
  },

  /**
   * @param {*} obj
   * @return {boolean}
   * @public
   * @static
   */
  isPresent: function(obj) {
    return typeof obj !== 'undefined' && obj !== null
  }

})

module.exports = Lang
