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

/* eslint "no-constant-condition": "off" */

'use strict';

var Nevis = require('nevis/lite');

var Characters = require('./characters');
var Lang = require('../lang');
var NumberWrapper = Lang.NumberWrapper;
var StringJoiner = Lang.StringJoiner;
var StringWrapper = Lang.StringWrapper;

/**
 * @private
 * @type {string[]}
 */
var KEYWORDS = [
  'var',
  'let',
  'null',
  'undefined',
  'true',
  'false',
  'if',
  'else',
  'this'
];

/**
 * @public
 * @class TokenType
 */
var TokenType = Nevis.extend();
TokenType.Character = new TokenType();
TokenType.Error = new TokenType();
TokenType.Identifier = new TokenType();
TokenType.Keyword = new TokenType();
TokenType.Number = new TokenType();
TokenType.Operator = new TokenType();
TokenType.String = new TokenType();

/**
 * @param {number} index
 * @param {TokenType} type
 * @param {number} numericValue
 * @param {string} stringValue
 * @public
 * @class Token
 */
var Token = Nevis.extend(function(index, type, numericValue, stringValue) {
  /**
   * @public
   * @type {number}
   */
  this.index = index;
  /**
   * @public
   * @type {TokenType}
   */
  this.type = type;
  /**
   * @public
   * @type {number}
   */
  this.numericValue = numericValue;
  /**
   * @public
   * @type {string}
   */
  this.stringValue = stringValue;
}, {

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   */
  isCharacter: function(code) {
    return this.type === TokenType.Character && this.numericValue === code;
  },

  /**
   * @return {boolean}
   * @public
   */
  isError: function() {
    return this.type === TokenType.Error;
  },

  /**
   * @return {boolean}
   * @public
   */
  isIdentifier: function() {
    return this.type === TokenType.Identifier;
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeyword: function() {
    return this.type === TokenType.Keyword;
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordFalse: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'false';
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordLet: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'let';
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordNull: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'null';
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordThis: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'this';
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordTrue: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'true';
  },

  /**
   * @return {boolean}
   * @public
   */
  isKeywordUndefined: function() {
    return this.type === TokenType.Keyword && this.stringValue === 'undefined';
  },

  /**
   * @return {boolean}
   * @public
   */
  isNumber: function() {
    return this.type === TokenType.Number;
  },

  /**
   * @param {string} operator
   * @return {boolean}
   * @public
   */
  isOperator: function(operator) {
    return this.type === TokenType.Operator && this.stringValue === operator;
  },

  /**
   * @return {boolean}
   * @public
   */
  isString: function() {
    return this.type === TokenType.String;
  },

  /**
   * @return {number}
   * @public
   */
  toNumber: function() {
    return this.type === TokenType.Number ? this.numericValue : -1;
  },

  /**
   * @return {string}
   * @public
   */
  toString: function() {
    switch (this.type) {
    case TokenType.Character:
    case TokenType.Identifier:
    case TokenType.Keyword:
    case TokenType.Operator:
    case TokenType.String:
    case TokenType.Error:
      return this.stringValue;
    case TokenType.Number:
      return this.numericValue.toString();
    default:
      return null;
    }
  }

}, {

  /**
   * @param {number} index
   * @param {number} code
   * @return {Token}
   * @public
   * @static
   */
  newCharacterToken: function(index, code) {
    return new Token(index, TokenType.Character, code, StringWrapper.fromCharCode(code));
  },

  /**
   * @param {number} index
   * @param {string} message
   * @return {Token}
   * @public
   * @static
   */
  newErrorToken: function(index, message) {
    return new Token(index, TokenType.Error, 0, message);
  },

  /**
   * @param {number} index
   * @param {string} text
   * @return {Token}
   * @public
   * @static
   */
  newIdentifierToken: function(index, text) {
    return new Token(index, TokenType.Identifier, 0, text);
  },

  /**
   * @param {number} index
   * @param {string} text
   * @return {Token}
   * @public
   * @static
   */
  newKeywordToken: function(index, text) {
    return new Token(index, TokenType.Keyword, 0, text);
  },

  /**
   * @param {number} index
   * @param {number} num
   * @return {Token}
   * @public
   * @static
   */
  newNumberToken: function(index, num) {
    return new Token(index, TokenType.Number, num, '');
  },

  /**
   * @param {number} index
   * @param {string} text
   * @return {Token}
   * @public
   * @static
   */
  newOperatorToken: function(index, text) {
    return new Token(index, TokenType.Operator, 0, text);
  },

  /**
   * @param {number} index
   * @param {string} text
   * @return {Token}
   * @public
   * @static
   */
  newStringToken: function(index, text) {
    return new Token(index, TokenType.String, 0, text);
  }

});

/**
 * @param {string} input
 * @public
 * @class Scanner
 */
var Scanner = Nevis.extend(function(input) {
  /**
   * @public
   * @type {string}
   */
  this.input = input;
  /**
   * @public
   * @type {number}
   */
  this.length = input.length;
  /**
   * @public
   * @type {number}
   */
  this.index = -1;
  /**
   * @public
   * @type {number}
   */
  this.peek = 0;

  this.advance();
}, {

  /**
   * @return {void}
   * @public
   */
  advance: function() {
    this.peek = ++this.index >= this.length ? Characters.chars.$EOF : StringWrapper.charCodeAt(this.input, this.index);
  },

  /**
   * @param {string} message
   * @param {number} offset
   * @return {Token}
   * @public
   */
  error: function(message, offset) {
    var position = this.index + offset;
    message = 'Lexer Error: ' + message + ' at column ' + position + ' in expression [' + this.input + ']';

    return Token.newErrorToken(position, message);
  },

  /**
   * @param {number} start
   * @param {number} code
   * @return {Token}
   * @public
   */
  scanCharacter: function(start, code) {
    this.advance();

    return Token.newCharacterToken(start, code);
  },

  /**
   * @param {number} start
   * @param {string} one
   * @param {number} twoCode
   * @param {string} two
   * @param {number} [threeCode]
   * @param {string} [three]
   * @return {Token}
   * @public
   */
  scanComplexOperator: function(start, one, twoCode, two, threeCode, three) {
    this.advance();

    var str = one;

    if (this.peek === twoCode) {
      this.advance();

      str += two;
    }
    if (Lang.isPresent(threeCode) && this.peek === threeCode) {
      this.advance();

      str += three;
    }

    return Token.newOperatorToken(start, str);
  },

  /**
   * @return {Token}
   * @public
   */
  scanIdentifier: function() {
    var start = this.index;

    this.advance();

    while (Scanner.isIdentifierPart(this.peek)) {
      this.advance();
    }

    var str = this.input.substring(start, this.index);

    return KEYWORDS.indexOf(str) > -1 ? Token.newKeywordToken(start, str) : Token.newIdentifierToken(start, str);
  },

  /**
   * @param {number} start
   * @return {Token}
   * @public
   */
  scanNumber: function(start) {
    var simple = this.index === start;

    this.advance();

    while (true) {
      if (Characters.isDigit(this.peek)) {
        // Do nothing
      } else if (this.peek === Characters.chars.$PERIOD) {
        simple = false;
      } else if (Scanner.isExponentStart(this.peek)) {
        this.advance();

        if (Scanner.isExponentSign(this.peek)) {
          this.advance();
        }
        if (!Characters.isDigit(this.peek)) {
          return this.error('Invalid exponent', -1);
        }

        simple = false;
      } else {
        break;
      }

      this.advance();
    }

    var str = this.input.substring(start, this.index);
    var value = simple ? NumberWrapper.parseIntAutoRadix(str) : parseFloat(str);

    return Token.newNumberToken(start, value);
  },

  /**
   * @param {number} start
   * @param {string} str
   * @return {Token}
   * @public
   */
  scanOperator: function(start, str) {
    this.advance();

    return Token.newOperatorToken(start, str);
  },

  /**
   * @return {Token}
   * @public
   */
  scanString: function() {
    var chars = Characters.chars;
    var start = this.index;
    var quote = this.peek;

    this.advance();

    var buffer;
    var hex;
    var i;
    var unescapedCode;
    var marker = this.index;
    var input = this.input;

    while (this.peek !== quote) {
      if (this.peek === chars.$BACKSLASH) {
        if (buffer == null) {
          buffer = new StringJoiner();
        }

        buffer.add(input.substring(marker, this.index));

        this.advance();

        if (this.peek === chars.$u) {
          hex = input.substring(this.index + 1, this.index + 5);
          try {
            unescapedCode = NumberWrapper.parseInt(hex, 16);
          } catch (e) {
            return this.error('Invalid unicode escape [\\u' + hex + ']', 0);
          }

          for (i = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = Characters.unescape(this.peek);

          this.advance();
        }

        buffer.add(StringWrapper.fromCharCode(unescapedCode));

        marker = this.index;
      } else if (this.peek === chars.$EOF) {
        return this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    var last = input.substring(marker, this.index);

    this.advance();

    var unescaped = last;

    if (buffer != null) {
      buffer.add(last);

      unescaped = buffer.toString();
    }

    return Token.newStringToken(start, unescaped);
  },

  /**
   * @return {Token}
   * @public
   */
  scanToken: function() {
    var chars = Characters.chars;
    var input = this.input;
    var length = this.length;
    var peek = this.peek;
    var index = this.index;

    while (peek <= chars.$SPACE) {
      if (++index >= length) {
        peek = chars.$EOF;
        break;
      } else {
        peek = StringWrapper.charCodeAt(input, index);
      }
    }

    this.peek = peek;
    this.index = index;

    if (index >= length) {
      return null;
    }

    if (Scanner.isIdentifierStart(peek)) {
      return this.scanIdentifier();
    }
    if (Characters.isDigit(peek)) {
      return this.scanNumber(index);
    }

    var start = index;
    switch (peek) {
    case chars.$PERIOD:
      this.advance();
      return Characters.isDigit(this.peek) ? this.scanNumber(start) : Token.newCharacterToken(start, chars.$PERIOD);
    case chars.$LPAREN:
    case chars.$RPAREN:
    case chars.$LBRACE:
    case chars.$RBRACE:
    case chars.$LBRACKET:
    case chars.$RBRACKET:
    case chars.$COMMA:
    case chars.$COLON:
    case chars.$SEMICOLON:
      return this.scanCharacter(start, peek);
    case chars.$SQ:
    case chars.$DQ:
      return this.scanString();
    case chars.$HASH:
    case chars.$PLUS:
    case chars.$MINUS:
    case chars.$STAR:
    case chars.$SLASH:
    case chars.$PERCENT:
    case chars.$CARET:
      return this.scanOperator(start, StringWrapper.fromCharCode(peek));
    case chars.$QUESTION:
      return this.scanComplexOperator(start, '?', chars.$PERIOD, '.');
    case chars.$LT:
    case chars.$GT:
      return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), chars.$EQ, '=');
    case chars.$BANG:
    case chars.$EQ:
      return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), chars.$EQ, '=', chars.$EQ, '=');
    case chars.$AMPERSAND:
      return this.scanComplexOperator(start, '&', chars.$AMPERSAND, '&');
    case chars.$BAR:
      return this.scanComplexOperator(start, '|', chars.$BAR, '|');
    case chars.$NBSP:
      while (Characters.isWhitespace(this.peek)) {
        this.advance();
      }
      return this.scanToken();
    }

    this.advance();

    return this.error('Unexpected character [' + StringWrapper.fromCharCode(peek) + ']', 0);
  }

}, {

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isExponentSign: function(code) {
    var chars = Characters.chars;

    return code === chars.$MINUS || code === chars.$PLUS;
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isExponentStart: function(code) {
    var chars = Characters.chars;

    return code === chars.$e || code === chars.$E;
  },

  /**
   * @param {string} input
   * @return {boolean}
   * @public
   * @static
   */
  isIdentifier: function(input) {
    if (input.length === 0) {
      return false;
    }

    var scanner = new Scanner(input);

    if (!Scanner.isIdentifierStart(scanner.peek)) {
      return false;
    }

    scanner.advance();

    while (scanner.peek !== Characters.chars.$EOF) {
      if (!Scanner.isIdentifierPart(scanner.peek)) {
        return false;
      }

      scanner.advance();
    }

    return true;
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isIdentifierPart: function(code) {
    var chars = Characters.chars;

    return Characters.isAsciiLetter(code) || Characters.isDigit(code) || (code === chars.$_) || (code === chars.$$);
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isIdentifierStart: function(code) {
    var chars = Characters.chars;

    return (chars.$a <= code && code <= chars.$z) || (chars.$A <= code && code <= chars.$Z) || (code === chars.$_) ||
      (code === chars.$$);
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   * @static
   */
  isQuote: function(code) {
    var chars = Characters.chars;

    return code === chars.$SQ || code === chars.$DQ || code === chars.$BT;
  }

});

/**
 * @public
 * @class Lexer
 */
var Lexer = Nevis.extend({

  /**
   * @param {string} text
   * @return {Token[]}
   * @public
   */
  tokenize: function(text) {
    var scanner = new Scanner(text);
    var tokens = [];
    var token = scanner.scanToken();

    while (token != null) {
      tokens.push(token);
      token = scanner.scanToken();
    }

    return tokens;
  }

});

/**
 * @public
 * @type {Token}
 */
var EOF = new Token(-1, TokenType.Character, 0, '');

module.exports = {
  EOF: EOF,
  Lexer: Lexer,
  Scanner: Scanner,
  Token: Token,
  TokenType: TokenType
};
