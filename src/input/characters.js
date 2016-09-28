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

/**
 * @public
 * @class Characters
 */
var Characters = Oopsy.extend(null, {

  /**
   * @public
   * @static
   * @type {Object<string, number>}
   */
  chars: {
    $EOF: 0,
    $TAB: 9,
    $LF: 10,
    $VTAB: 11,
    $FF: 12,
    $CR: 13,
    $SPACE: 32,
    $BANG: 33,
    $DQ: 34,
    $HASH: 35,
    $$: 36,
    $PERCENT: 37,
    $AMPERSAND: 38,
    $SQ: 39,
    $LPAREN: 40,
    $RPAREN: 41,
    $STAR: 42,
    $PLUS: 43,
    $COMMA: 44,
    $MINUS: 45,
    $PERIOD: 46,
    $SLASH: 47,
    $COLON: 58,
    $SEMICOLON: 59,
    $LT: 60,
    $EQ: 61,
    $GT: 62,
    $QUESTION: 63,
    $0: 48,
    $9: 57,
    $A: 65,
    $E: 69,
    $F: 70,
    $X: 88,
    $Z: 90,
    $LBRACKET: 91,
    $BACKSLASH: 92,
    $RBRACKET: 93,
    $CARET: 94,
    $_: 95,
    $a: 97,
    $e: 101,
    $f: 102,
    $n: 110,
    $r: 114,
    $t: 116,
    $u: 117,
    $v: 118,
    $x: 120,
    $z: 122,
    $LBRACE: 123,
    $BAR: 124,
    $RBRACE: 125,
    $NBSP: 160,
    $PIPE: 124,
    $TILDA: 126,
    $AT: 64,
    $BT: 96
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isAsciiLetter: function(code) {
    var chars = Characters.chars

    return (code >= chars.$a && code <= chars.$z) || (code >= chars.$A && code <= chars.$Z)
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isDigit: function(code) {
    var chars = Characters.chars

    return chars.$0 <= code && code <= chars.$9
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isWhitespace: function(code) {
    var chars = Characters.chars

    return (code >= chars.$TAB && code <= chars.$SPACE) || (code === chars.$NBSP)
  },

  /**
   * @param {number} code
   * @return {number}
   * @public
   * @static
   */
  unescape: function(code) {
    var chars = Characters.chars

    switch (code) {
    case chars.$n:
      return chars.$LF
    case chars.$f:
      return chars.$FF
    case chars.$r:
      return chars.$CR
    case chars.$t:
      return chars.$TAB
    case chars.$v:
      return chars.$VTAB
    default:
      return code
    }
  }

})

module.exports = Characters
