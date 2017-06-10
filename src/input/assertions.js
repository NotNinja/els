/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
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

'use strict';

var Nevis = require('nevis/lite');

var Lang = require('../lang');

/**
 * @public
 * @class Assertions
 */
var Assertions = Nevis.extend(null, {

  /**
   * @public
   * @static
   * @type {RegExp[]}
   */
  INTERPOLATION_BLACKLIST_REGEXPS: [
    // empty
    /^\s*$/,
    // html tag
    /[<>]/,
    // i18n expansion
    /^[{}]$/,
    // character reference,
    /&(#|[a-z])/i,
    // comment
    /^\/\//
  ],

  /**
   * @param {string} identifier
   * @param {*} value
   * @param {boolean} [checkBlacklist=false]
   * @return {void}
   * @public
   * @static
   */
  assertInterpolationSymbols: function(identifier, value, checkBlacklist) {
    var end;
    var i;
    var regExp;
    var start;

    if (Lang.isPresent(value) && !(Lang.isArray(value) && value.length === 2)) {
      throw new Error('Expected "' + identifier + '" to be an array, [start, end].');
    } else if (checkBlacklist && !Lang.isBlank(value)) {
      start = value[0];
      end = value[1];

      for (i = 0; i < Assertions.INTERPOLATION_BLACKLIST_REGEXPS.length; i++) {
        regExp = Assertions.INTERPOLATION_BLACKLIST_REGEXPS[i];

        if (regExp.test(start) || regExp.test(end)) {
          throw new Error('["' + start + '", "' + end + '"] contains unusable interpolation symbol.');
        }
      }
    }
  }

});

module.exports = Assertions;
