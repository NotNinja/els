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

var Oopsy = require('oopsy')

var Assertions = require('./assertions')

/**
 * @param {string} start
 * @param {string} end
 * @public
 * @class InterpolationConfig
 */
var InterpolationConfig = Oopsy.extend(function(start, end) {
  /**
   * @public
   * @type {string}
   */
  this.start = start
  /**
   * @public
   * @type {string}
   */
  this.end = end
}, null, {

  /**
   * @param {string[]} [markers]
   * @return {InterpolationConfig}
   * @public
   * @static
   */
  fromArray: function(markers) {
    if (!markers) {
      return InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG
    }

    Assertions.assertInterpolationSymbols('interpolation', markers)

    return new InterpolationConfig(markers[0], markers[1])
  }

})

/**
 * @public
 * @static
 * @type {InterpolationConfig}
 */
InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG = new InterpolationConfig('{{', '}}')

module.exports = InterpolationConfig
