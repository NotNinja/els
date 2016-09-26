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

/* eslint "no-constant-condition": "off", "no-shadow": "off", "no-useless-escape": "off" */

'use strict'

var Oopsy = require('oopsy')

var ast = require('./ast')
var Characters = require('./characters')
var InterpolationConfig = require('./interpolation-config')
var Lang = require('./lang')
var StringWrapper = Lang.StringWrapper
var lexer = require('./lexer')

/**
 * @public
 * @class SimpleExpressionChecker
 * @extends {ASTVisitor}
 */
var SimpleExpressionChecker = ast.ASTVisitor.extend(function() {
  /**
   * @public
   * @type {boolean}
   */
  this.simple = true
}, {

  /**
   * @param {Array} asts
   * @return {Array}
   * @public
   */
  visitAll: function(asts) {
    var results = []

    for (var i = 0; i < asts.length; i++) {
      results.push(asts[i].visit(this))
    }

    return results
  },

  /**
   * @override
   * @inheritDoc
   */
  visitBinary: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitChain: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitConditional: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitFunctionCall: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitInterpolation: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedRead: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedWrite: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralArray: function(ast, context) {
    this.visitAll(ast.expressions)
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralMap: function(ast, context) {
    this.visitAll(ast.values)
  },

  /**
   * @override
   * @inheritDoc
   */
  visitMethodCall: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPipe: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPrefixNot: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPropertyWrite: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitQuote: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafeMethodCall: function(ast, context) {
    this.simple = false
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafePropertyRead: function(ast, context) {
    this.simple = false
  }

}, {

  /**
   * @param {AST} ast
   * @return {boolean}
   * @public
   */
  check: function(ast) {
    var checker = new SimpleExpressionChecker()
    ast.visit(checker)

    return checker.simple
  }

})

/**
 * @param {string[]} strings
 * @param {string[]} expressions
 * @public
 * @class SplitInterpolation
 */
var SplitInterpolation = Oopsy.extend(function(strings, expressions) {
  /**
   * @public
   * @type {string[]}
   */
  this.strings = strings
  /**
   * @public
   * @type {string[]}
   */
  this.expressions = expressions
})

/**
 * @param {TemplateBinding[]} templateBindings -
 * @param {string[]} warnings -
 * @param {ParserError[]} errors -
 * @public
 * @class TemplateBindingParseResult
 */
var TemplateBindingParseResult = Oopsy.extend(function(templateBindings, warnings, errors) {
  /**
   * @public
   * @type {TemplateBinding[]}
   */
  this.templateBindings = templateBindings
  /**
   * @public
   * @type {string[]}
   */
  this.warnings = warnings
  /**
   * @public
   * @type {ParserError[]}
   */
  this.errors = errors
})

/**
 * @param {string} input
 * @param {*} location
 * @param {Array} tokens
 * @param {boolean} parseAction
 * @param {ParserError[]} errors
 * @public
 * @class ParserAST
 */
var ParserAST = Oopsy.extend(function(input, location, tokens, parseAction, errors) {
  /**
   * @public
   * @type {string}
   */
  this.input = input
  /**
   * @public
   * @type {*}
   */
  this.location = location
  /**
   * @public
   * @type {Array}
   */
  this.tokens = tokens
  /**
   * @public
   * @type {boolean}
   */
  this.parseAction = parseAction
  /**
   * @private
   * @type {ParserError[]}
   */
  this._errors = errors
  /**
   * @public
   * @type {number}
   */
  this.index = 0
  /**
   * @private
   * @type {number}
   */
  this._rightParenthesisExpected = 0
  /**
   * @private
   * @type {number}
   */
  this._rightBracesExpected = 0
  /**
   * @private
   * @type {number}
   */
  this._rightBracketsExpected = 0
}, {

  // TODO: Complete

  /**
   * @return {void}
   * @public
   */
  advance: function() {
    this.index++
  },

  /**
   * @param {string} message
   * @param {number} [index]
   * @return {void}
   * @public
   */
  error: function(message, index) {
    this._errors.push(new ast.ParserError(message, this.input, this._locationText(index), this.location))

    this._skip()
  },

  /**
   * @param {number} code
   * @return {void}
   * @public
   */
  expectCharacter: function(code) {
    if (this.optionalCharacter(code)) {
      return
    }

    this.error('Missing expected ' + StringWrapper.fromCharCode(code))
  },

  /**
   * @return {string}
   * @public
   */
  expectIdentifierOrKeyword: function() {
    var next = this.next()

    if (!next.isIdentifier() && !next.isKeyword()) {
      this.error('Unexpected token ' + next + ', expected identifier or keyword')

      return ''
    }

    this.advance()

    return next.toString()
  },

  /**
   * @return {string}
   * @public
   */
  expectIdentifierOrKeywordOrString: function() {
    var next = this.next()

    if (!next.isIdentifier() && !next.isKeyword() && !next.isString()) {
      this.error('Unexpected token ' + next + ', expected identifier, keyword, or string')

      return ''
    }

    this.advance()

    return next.toString()
  },

  /**
   * @param {string} operator
   * @return {void}
   * @public
   */
  expectOperator: function(operator) {
    if (this.optionalOperator(operator)) {
      return
    }

    this.error('Missing expected operator ' + operator)
  },

  /**
   * @return {string}
   * @public
   */
  expectTemplateBindingKey: function() {
    var operatorFound = false
    var result = ''

    do {
      result += this.expectIdentifierOrKeywordOrString()
      operatorFound = this.optionalOperator('-')
      if (operatorFound) {
        result += '-'
      }
    } while (operatorFound)

    return result.toString()
  },

  /**
   * @return {number}
   * @public
   */
  inputIndex: function() {
    return this.index < this.tokens.length ? this.next().index : this.input.length
  },

  /**
   * @return {Token}
   * @public
   */
  next: function() {
    return this.peek(0)
  },

  /**
   * @param {number} code
   * @return {boolean}
   * @public
   */
  optionalCharacter: function(code) {
    if (this.next().isCharacter(code)) {
      this.advance()
      return true
    }

    return false
  },

  /**
   * @param {string} operator
   * @return {boolean}
   * @public
   */
  optionalOperator: function(operator) {
    if (this.next().isOperator(operator)) {
      this.advance()
      return true
    }

    return false
  },

  /**
   * @param {AST} receiver
   * @param {boolean} [isSafe=false]
   * @return {AST}
   * @public
   */
  parseAccessMemberOrMethodCall: function(receiver, isSafe) {
    var chars = Characters.chars
    var args
    var span
    var value
    var start = receiver.span.start
    var id = this.expectIdentifierOrKeyword()

    if (this.optionalCharacter(chars.$LPAREN)) {
      this._rightParenthesisExpected++

      args = this.parseCallArguments()

      this.expectCharacter(chars.$RPAREN)

      this._rightParenthesisExpected--

      span = this.span(start)

      return isSafe ? new ast.SafeMethodCall(span, receiver, id, args) : new ast.MethodCall(span, receiver, id, args)
    } else if (isSafe) {
      if (this.optionalOperator('=')) {
        this.error('The \'?.\' operator cannot be used in the assignment')

        return new ast.EmptyExpression(this.span(start))
      } else {
        return new ast.SafePropertyRead(this.span(start), receiver, id)
      }
    } else if (this.optionalOperator('=')) {
      if (!this.parseAction) {
        this.error('Bindings cannot contain assignments')

        return new ast.EmptyExpression(this.span(start))
      }

      value = this.parseConditional()

      return new ast.PropertyWrite(this.span(start), receiver, id, value)
    } else {
      return new ast.PropertyRead(this.span(start), receiver, id)
    }
  },

  /**
   * @return {AST}
   * @public
   */
  parseAdditive: function() {
    var operator
    var right
    var result = this.parseMultiplicative()

    while (this.next().type === lexer.TokenType.Operator) {
      operator = this.next().stringValue

      switch (operator) {
      case '+':
      case '-':
        this.advance()
        right = this.parseMultiplicative()
        result = new ast.Binary(this.span(result.span.start), operator, result, right)
        continue
      }
      break
    }

    return result
  },

  /**
   * @return {BindingPipe[]}
   * @public
   */
  parseCallArguments: function() {
    var chars = Characters.chars

    if (this.next().isCharacter(chars.$RPAREN)) {
      return []
    }

    var positionals = []

    do {
      positionals.push(this.parsePipe())
    } while (this.optionalCharacter(chars.$COMMA))

    return positionals
  },

  /**
   * @return {AST}
   * @public
   */
  parseCallChain: function() {
    var chars = Characters.chars
    var args
    var key
    var value
    var result = this.parsePrimary()

    while (true) {
      if (this.optionalCharacter(chars.$PERIOD)) {
        result = this.parseAccessMemberOrMethodCall(result, false)
      } else if (this.optionalOperator('?.')) {
        result = this.parseAccessMemberOrMethodCall(result, true)
      } else if (this.optionalCharacter(chars.$LBRACKET)) {
        this._rightBracketsExpected++

        key = this.parsePipe()

        this._rightBracketsExpected--

        this.expectCharacter(chars.$RBRACKET)

        if (this.optionalOperator('=')) {
          value = this.parseConditional()
          result = new ast.KeyedWrite(this.span(result.span.start), result, key, value)
        } else {
          result = new ast.KeyedRead(this.span(result.span.start), result, key)
        }
      } else if (this.optionalCharacter(chars.$LPAREN)) {
        this._rightParenthesisExpected++

        args = this.parseCallArguments()

        this._rightParenthesisExpected--

        this.expectCharacter(chars.$RPAREN)

        result = new ast.FunctionCall(this.span(result.span.start), result, args)
      } else {
        return result
      }
    }
  },

  /**
   * @return {AST}
   * @public
   */
  parseChain: function() {
    var chars = Characters.chars
    var expression
    var expressions = []
    var start = this.inputIndex()

    while (this.index < this.tokens.length) {
      expression = this.parsePipe()
      expressions.push(expression)

      if (this.optionalCharacter(chars.$SEMICOLON)) {
        if (!this.parseAction) {
          this.error('Binding expression cannot contain chained expression')
        }

        while (this.optionalCharacter(chars.$SEMICOLON)) {
          // read all semicolons
        }
      } else if (this.index < this.tokens.length) {
        this.error('Unexpected token "' + this.next() + '"')
      }
    }

    if (expressions.length === 0) {
      return new ast.EmptyExpression(this.span(start))
    }
    if (expressions.length === 1) {
      return expressions[0]
    }
    return new ast.Chain(this.span(start), expressions)
  },

  /**
   * @return {AST}
   * @public
   */
  parseConditional: function() {
    var end
    var expression
    var no
    var yes
    var start = this.inputIndex()
    var result = this.parseLogicalOr()

    if (this.optionalOperator('?')) {
      yes = this.parsePipe()

      if (!this.optionalCharacter(Characters.chars.$COLON)) {
        end = this.inputIndex()
        expression = this.input.substring(start, end)

        this.error('Conditional expression ' + expression + ' requires all 3 expressions')

        no = new ast.EmptyExpression(this.span(start))
      } else {
        no = this.parsePipe()
      }

      return new ast.Conditional(this.span(start), result, yes, no)
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parseExpression: function() {
    return this.parseConditional()
  },

  /**
   * @param {number} terminator
   * @return {AST[]}
   * @public
   */
  parseExpressionList: function(terminator) {
    var result = []

    if (!this.next().isCharacter(terminator)) {
      do {
        result.push(this.parsePipe())
      } while (this.optionalCharacter(Characters.chars.$COMMA))
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parseEquality: function() {
    var operator
    var right
    var result = this.parseRelational()

    while (this.next().type === lexer.TokenType.Operator) {
      operator = this.next().stringValue

      switch (operator) {
      case '==':
      case '===':
      case '!=':
      case '!==':
        this.advance()
        right = this.parseRelational()
        result = new ast.Binary(this.span(result.span.start), operator, result, right)
        continue
      }
      break
    }

    return result
  },

  /**
   * @return {LiteralMap}
   * @public
   */
  parseLiteralMap: function() {
    var chars = Characters.chars
    var key
    var keys = []
    var values = []
    var start = this.inputIndex()

    this.expectCharacter(chars.$LBRACE)

    if (!this.optionalCharacter(chars.$RBRACE)) {
      this._rightBracesExpected++

      do {
        key = this.expectIdentifierOrKeywordOrString()
        keys.push(key)

        this.expectCharacter(chars.$COLON)

        values.push(this.parsePipe())
      } while (this.optionalCharacter(chars.$COMMA))
      this._rightBracesExpected--

      this.expectCharacter(chars.$RBRACE)
    }

    return new ast.LiteralMap(this.span(start), keys, values)
  },

  /**
   * @return {AST}
   * @public
   */
  parseLogicalAnd: function() {
    var right
    var result = this.parseEquality()

    while (this.optionalOperator('&&')) {
      right = this.parseEquality()
      result = new ast.Binary(this.span(result.span.start), '&&', result, right)
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parseLogicalOr: function() {
    var right
    var result = this.parseLogicalAnd()

    while (this.optionalOperator('||')) {
      right = this.parseLogicalAnd()
      result = new ast.Binary(this.span(result.span.start), '||', result, right)
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parseMultiplicative: function() {
    var operator
    var right
    var result = this.parsePrefix()

    while (this.next().type === lexer.TokenType.Operator) {
      operator = this.next().stringValue

      switch (operator) {
      case '*':
      case '%':
      case '/':
        this.advance()
        right = this.parsePrefix()
        result = new ast.Binary(this.span(result.span.start), operator, result, right)
        continue
      }
      break
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parsePipe: function() {
    var args
    var name
    var result = this.parseExpression()

    if (this.optionalOperator('|')) {
      if (this.parseAction) {
        this.error('Cannot have a pipe in an action expression')
      }

      do {
        args = []
        name = this.expectIdentifierOrKeyword()

        while (this.optionalCharacter(Characters.chars.$COLON)) {
          args.push(this.parseExpression())
        }

        result = new ast.BindingPipe(this.span(result.span.start), result, name, args)
      } while (this.optionalOperator('|'))
    }

    return result
  },

  /**
   * @return {AST}
   * @public
   */
  parsePrefix: function() {
    var operator
    var result
    var start

    if (this.next().type === lexer.TokenType.Operator) {
      start = this.inputIndex()
      operator = this.next().stringValue

      switch (operator) {
      case '+':
        this.advance()
        return this.parsePrefix()
      case '-':
        this.advance()
        result = this.parsePrefix()
        return new ast.Binary(this.span(start), operator, new ast.LiteralPrimitive(new ast.ParseSpan(start, start), 0),
          result)
      case '!':
        this.advance()
        result = this.parsePrefix()
        return new ast.PrefixNot(this.span(start), result)
      }
    }

    return this.parseCallChain()
  },

  /**
   * @return {AST}
   * @public
   */
  parsePrimary: function() {
    var chars = Characters.chars
    var elements
    var result
    var value
    var start = this.inputIndex()

    if (this.optionalCharacter(chars.$LPAREN)) {
      this._rightParenthesisExpected++

      result = this.parsePipe()

      this._rightParenthesisExpected--

      this.expectCharacter(chars.$RPAREN)

      return result
    } else if (this.next().isKeywordNull()) {
      this.advance()

      return new ast.LiteralPrimitive(this.span(start), null)
    } else if (this.next().isKeywordUndefined()) {
      this.advance()

      return new ast.LiteralPrimitive(this.span(start), undefined)
    } else if (this.next().isKeywordTrue()) {
      this.advance()

      return new ast.LiteralPrimitive(this.span(start), true)
    } else if (this.next().isKeywordFalse()) {
      this.advance()

      return new ast.LiteralPrimitive(this.span(start), false)
    } else if (this.next().isKeywordThis()) {
      this.advance()

      return new ast.ImplicitReceiver(this.span(start))
    } else if (this.optionalCharacter(chars.$LBRACKET)) {
      this._rightBracketsExpected++

      elements = this.parseExpressionList(chars.$RBRACKET)

      this._rightBracketsExpected--

      this.expectCharacter(chars.$RBRACKET)

      return new ast.LiteralArray(this.span(start), elements)
    } else if (this.next().isCharacter(chars.$LBRACE)) {
      return this.parseLiteralMap()
    } else if (this.next().isIdentifier()) {
      return this.parseAccessMemberOrMethodCall(new ast.ImplicitReceiver(this.span(start)), false)
    } else if (this.next().isNumber()) {
      value = this.next().toNumber()

      this.advance()

      return new ast.LiteralPrimitive(this.span(start), value)
    } else if (this.next().isString()) {
      value = this.next().toString()

      this.advance()

      return new ast.LiteralPrimitive(this.span(start), value)
    } else if (this.index >= this.tokens.length) {
      this.error('Unexpected end of expression: ' + this.input)

      return new ast.EmptyExpression(this.span(start))
    } else {
      this.error('Unexpected token ' + this.next())

      return new ast.EmptyExpression(this.span(start))
    }
  },

  /**
   * @return {AST}
   * @public
   */
  parseRelational: function() {
    var operator
    var right
    var result = this.parseAdditive()

    while (this.next().type === lexer.TokenType.Operator) {
      operator = this.next().stringValue

      switch (operator) {
      case '<':
      case '>':
      case '<=':
      case '>=':
        this.advance()
        right = this.parseAdditive()
        result = new ast.Binary(this.span(result.span.start), operator, result, right)
        continue
      }
      break
    }

    return result
  },

  /**
   * @return {TemplateBindingParseResult}
   * @public
   */
  parseTemplateBindings: function() {
    var chars = Characters.chars
    var ast
    var expression
    var key
    var keyIsVar
    var name
    var source
    var start
    var bindings = []
    var prefix = null
    var warnings = []

    while (this.index < this.tokens.length) {
      keyIsVar = this.peekKeywordLet()

      if (keyIsVar) {
        this.advance()
      }

      key = this.expectTemplateBindingKey()

      if (!keyIsVar) {
        if (prefix == null) {
          prefix = key
        } else {
          key = prefix + key[0].toUpperCase() + key.substring(1)
        }
      }

      this.optionalCharacter(chars.$COLON)

      expression = null
      name = null

      if (keyIsVar) {
        if (this.optionalOperator('=')) {
          name = this.expectTemplateBindingKey()
        } else {
          name = '\$implicit'
        }
      } else if (this.next() !== lexer.EOF && !this.peekKeywordLet()) {
        start = this.inputIndex()
        ast = this.parsePipe()
        source = this.input.substring(start, this.inputIndex())
        expression = new ast.ASTWithSource(ast, source, this.location, this._errors)
      }

      bindings.push(new ast.TemplateBinding(key, keyIsVar, name, expression))

      if (!this.optionalCharacter(chars.$SEMICOLON)) {
        this.optionalCharacter(chars.$COMMA)
      }
    }

    return new TemplateBindingParseResult(bindings, warnings, this._errors)
  },

  /**
   * @param {number} offset
   * @return {Token}
   * @public
   */
  peek: function(offset) {
    var index = this.index + offset
    return index < this.tokens.length ? this.tokens[index] : lexer.EOF
  },

  /**
   * @return {boolean}
   * @public
   */
  peekKeywordLet: function() {
    return this.next().isKeywordLet()
  },

  /**
   * @param {number} start
   * @return {ParseSpan}
   * @public
   */
  span: function(start) {
    return new ast.ParseSpan(start, this.inputIndex())
  },

  /**
   * @param {number} [index]
   * @return {string}
   * @private
   */
  _locationText: function(index) {
    if (Lang.isBlank(index)) {
      index = this.index
    }

    return index < this.tokens.length ? 'at column ' + (this.tokens[index].index + 1) + ' in'
      : 'at the end of the expression'
  },

  /**
   * @return {void}
   * @private
   */
  _skip: function() {
    var chars = Characters.chars
    var next = this.next()

    while (this.index < this.tokens.length && !next.isCharacter(chars.$SEMICOLON) &&
    (this._rightParenthesisExpected <= 0 || !next.isCharacter(chars.$RPAREN)) &&
    (this._rightBracesExpected <= 0 || !next.isCharacter(chars.$RBRACE)) &&
    (this._rightBracketsExpected <= 0 || !next.isCharacter(chars.$RBRACKET))) {
      if (this.next().isError()) {
        this._errors.push(new ast.ParserError(this.next().toString(), this.input, this._locationText(), this.location))
      }

      this.advance()

      next = this.next()
    }
  }

})

/**
 * @param {Lexer} lexer
 * @public
 * @class Parser
 */
var Parser = Oopsy.extend(function(lexer) {
  /**
   * @private
   * @type {Lexer}
   */
  this._lexer = lexer
  /**
   * @public
   * @type {ParserError[]}
   */
  this._errors = []
}, {

  /**
   * @param {string} input
   * @param {*} location
   * @param {InterpolationConfig} [interpolationConfig=InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG]
   * @return {ASTWithSource}
   * @public
   */
  parseAction: function(input, location, interpolationConfig) {
    if (interpolationConfig == null) {
      interpolationConfig = InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG
    }

    this._checkNoInterpolation(input, location, interpolationConfig)

    var tokens = this._lexer.tokenize(this._stripComments(input))
    var ast = new ParserAST(input, location, tokens, true, this._errors).parseChain()

    return new ast.ASTWithSource(ast, input, location, this._errors)
  },

  /**
   * @param {string} input
   * @param {*} location
   * @param {InterpolationConfig} [interpolationConfig=InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG]
   * @return {ASTWithSource}
   * @public
   */
  parseBinding: function(input, location, interpolationConfig) {
    if (interpolationConfig == null) {
      interpolationConfig = InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG
    }

    var ast = this._parseBindingAST(input, location, interpolationConfig)

    return new ast.ASTWithSource(ast, input, location, this._errors)
  },

  /**
   * @param {string} input
   * @param {*} location
   * @param {InterpolationConfig} [interpolationConfig=InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG]
   * @return {ASTWithSource}
   * @public
   */
  parseInterpolation: function(input, location, interpolationConfig) {
    var split = this.splitInterpolation(input, location, interpolationConfig)
    if (split == null) {
      return null
    }

    var ast
    var tokens
    var expressions = []

    for (var i = 0; i < split.expressions.length; ++i) {
      tokens = this._lexer.tokenize(this._stripComments(split.expressions[i]))
      ast = new ParserAST(input, location, tokens, false, this._errors).parseChain()

      expressions.push(ast)
    }

    var span = new ast.ParseSpan(0, Lang.isBlank(input) ? 0 : input.length)

    return new ast.ASTWithSource(new ast.Interpolation(span, split.strings, expressions), input, location, this._errors)
  },

  /**
   * @param {string} input
   * @param {string} location
   * @param {InterpolationConfig} [interpolationConfig=InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG]
   * @return {ASTWithSource}
   * @public
   */
  parseSimpleBinding: function(input, location, interpolationConfig) {
    if (interpolationConfig == null) {
      interpolationConfig = InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG
    }

    var ast = this._parseBindingAST(input, location, interpolationConfig)

    if (!SimpleExpressionChecker.check(ast)) {
      this._reportError('Host binding expression can only contain field access and constants', input, location)
    }

    return new ast.ASTWithSource(ast, input, location, this._errors)
  },

  /**
   * @param {string} input
   * @param {*} location
   * @return {TemplateBindingParseResult}
   * @public
   */
  parseTemplateBindings: function(input, location) {
    var tokens = this._lexer.tokenize(input)

    return new ParserAST(input, location, tokens, false, this._errors).parseTemplateBindings()
  },

  /**
   * @param {string} input
   * @param {string} location
   * @param {InterpolationConfig} [interpolationConfig=InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG]
   * @return {SplitInterpolation}
   * @public
   */
  splitInterpolation: function(input, location, interpolationConfig) {
    if (interpolationConfig == null) {
      interpolationConfig = InterpolationConfig.DEFAULT_INTERPOLATION_CONFIG
    }

    var regexp = Parser._createInterpolateRegExp(interpolationConfig)
    var parts = StringWrapper.split(input, regexp)
    if (parts.length <= 1) {
      return null
    }

    var part
    var expressions = []
    var strings = []

    for (var i = 0; i < parts.length; i++) {
      part = parts[i]
      if (i % 2 === 0) {
        strings.push(part)
      } else if (part.trim().length > 0) {
        expressions.push(part)
      } else {
        this._reportError('Blank expressions are not allowed in interpolated strings', input, 'at column ' +
          this._findInterpolationErrorColumn(parts, i, interpolationConfig) + ' in', location)
      }
    }

    return new SplitInterpolation(strings, expressions)
  },

  /**
   * @param {string} input
   * @param {*} location
   * @return {ASTWithSource}
   * @public
   */
  wrapLiteralPrimitive: function(input, location) {
    var span = new ast.ParseSpan(0, Lang.isBlank(input) ? 0 : input.length)

    return new ast.ASTWithSource(new ast.LiteralPrimitive(span, input), input, location, this._errors)
  },

  /**
   * @param {string} input
   * @param {*} location
   * @param {InterpolationConfig} interpolationConfig
   * @return {void}
   * @private
   */
  _checkNoInterpolation: function(input, location, interpolationConfig) {
    var regexp = Parser._createInterpolateRegExp(interpolationConfig)
    var parts = StringWrapper.split(input, regexp)

    if (parts.length > 1) {
      this._reportError('Got interpolation (' + interpolationConfig.start + interpolationConfig.end +
        ') where expression was expected',
        input,
        'at column ' + this._findInterpolationErrorColumn(parts, 1, interpolationConfig) + ' in',
        location)
    }
  },

  /**
   * @param {string} input
   * @return {number}
   * @private
   */
  _commentStart: function(input) {
    var chars = Characters.chars
    var character
    var nextCharacter
    var outerQuote = null

    for (var i = 0; i < input.length - 1; i++) {
      character = StringWrapper.charCodeAt(input, i)
      nextCharacter = StringWrapper.charCodeAt(input, i + 1)

      if (character === chars.$SLASH && nextCharacter === chars.$SLASH && Lang.isBlank(outerQuote)) {
        return i
      }

      if (outerQuote === character) {
        outerQuote = null
      } else if (Lang.isBlank(outerQuote) && lexer.Scanner.isQuote(character)) {
        outerQuote = character
      }
    }

    return null
  },

  /**
   * @param {string[]} parts
   * @param {number} partInErrorIndex
   * @param {InterpolationConfig} interpolationConfig
   * @return {number}
   * @private
   */
  _findInterpolationErrorColumn: function(parts, partInErrorIndex, interpolationConfig) {
    var errorLocation = ''

    for (var i = 0; i < partInErrorIndex; i++) {
      errorLocation += i % 2 === 0 ? parts[i] : interpolationConfig.start + parts[i] + interpolationConfig.end
    }

    return errorLocation.length
  },

  /**
   * @param {string} input
   * @param {string} location
   * @param {InterpolationConfig} interpolationConfig
   * @return {AST}
   * @private
   */
  _parseBindingAST: function(input, location, interpolationConfig) {
    var quote = this._parseQuote(input, location)

    if (Lang.isPresent(quote)) {
      return quote
    }

    this._checkNoInterpolation(input, location, interpolationConfig)

    var tokens = this._lexer.tokenize(this._stripComments(input))

    return new ParserAST(input, location, tokens, false, this._errors).parseChain()
  },

  /**
   * @param {string} input
   * @param {*} location
   * @return {AST}
   * @private
   */
  _parseQuote: function(input, location) {
    if (Lang.isBlank(input)) {
      return null
    }

    var prefixSeparatorIndex = input.indexOf(':')
    if (prefixSeparatorIndex === -1) {
      return null
    }

    var prefix = input.substring(0, prefixSeparatorIndex).trim()
    if (!lexer.Scanner.isIdentifier(prefix)) {
      return null
    }

    var uninterpretedExpression = input.substring(prefixSeparatorIndex + 1)

    return new ast.Quote(new ast.ParseSpan(0, input.length), prefix, uninterpretedExpression, location)
  },

  /**
   * @param {string} message
   * @param {string} input
   * @param {string} errorLocation
   * @param {*} [contextLocation]
   * @return {void}
   * @private
   */
  _reportError: function(message, input, errorLocation, contextLocation) {
    this._errors.push(new ast.ParserError(message, input, errorLocation, contextLocation))
  },

  /**
   * @param {string} input
   * @return {string}
   * @private
   */
  _stripComments: function(input) {
    var index = this._commentStart(input)

    return Lang.isPresent(index) ? input.substring(0, index).trim() : input
  }

}, {

  /**
   * @param {InterpolationConfig} config
   * @return {RegExp}
   * @private
   * @static
   */
  _createInterpolateRegExp: function(config) {
    var pattern = Lang.escapeRegExp(config.start) + '([\\s\\S]*?)' + Lang.escapeRegExp(config.end)

    return new RegExp(pattern, 'g')
  }

})

module.exports = {
  Parser: Parser,
  ParserAST: ParserAST,
  SplitInterpolation: SplitInterpolation,
  TemplateBindingParseResult: TemplateBindingParseResult
}
