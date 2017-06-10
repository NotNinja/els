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
 * @param {number} start
 * @param {number} end
 * @public
 * @class ParseSpan
 */
var ParseSpan = Nevis.extend(function(start, end) {
  /**
   * @public
   * @type {number}
   */
  this.start = start;
  /**
   * @public
   * @type {number}
   */
  this.end = end;
});

/**
 * @param {string} message
 * @param {string} input
 * @param {string} errorLocation
 * @param {*} [contextLocation]
 * @public
 * @class ParserError
 */
var ParserError = Nevis.extend(function(message, input, errorLocation, contextLocation) {
  /**
   * @public
   * @type {string}
   */
  this.message = 'Parser Error: ' + message + ' ' + errorLocation + ' [' + input + '] in ' + contextLocation;
  /**
   * @public
   * @type {string}
   */
  this.input = input;
  /**
   * @public
   * @type {string}
   */
  this.errorLocation = errorLocation;
  /**
   * @public
   * @type {*}
   */
  this.contextLocation = contextLocation;
});

/**
 * TODO: Document
 *
 * @param {ParseSpan} span
 * @public
 * @class AST
 */
var AST = Nevis.extend(function(span) {
  /**
   * @public
   * @type {ParseSpan}
   */
  this.span = span;
}, {

  /**
   * @param {ASTVisitor} visitor
   * @param {*} [context=null]
   * @return {*}
   * @public
   */
  visit: function(visitor, context) {
    return null;
  },

  /**
   * @return {string}
   * @public
   */
  toString: function() {
    // TODO: Necessary?
    return 'AST';
  }

});

/**
 * @param {AST} ast
 * @param {string} source
 * @param {string} location
 * @param {ParserError[]} errors
 * @public
 * @class ASTWithSource
 * @extends {AST}
 */
var ASTWithSource = AST.extend(function(ast, source, location, errors) {
  ASTWithSource.super_.call(this, new ParseSpan(0, Lang.isBlank(source) ? 0 : source.length));

  /**
   * @public
   * @type {AST}
   */
  this.ast = ast;
  /**
   * @public
   * @type {string}
   */
  this.source = source;
  /**
   * @public
   * @type {string}
   */
  this.location = location;
  /**
   * @public
   * @type {ParserError[]}
   */
  this.errors = errors;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    return this.ast.visit(visitor, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  toString: function() {
    // TODO: Necessary?
    return this.source + ' in ' + this.location;
  }

});

/**
 * @param {ParseSpan} span
 * @param {string} operation
 * @param {AST} left
 * @param {AST} right
 * @public
 * @class Binary
 * @extends {AST}
 */
var Binary = AST.extend(function(span, operation, left, right) {
  Binary.super_.call(this, span);

  /**
   * @public
   * @type {string}
   */
  this.operation = operation;
  /**
   * @public
   * @type {AST}
   */
  this.left = left;
  /**
   * @public
   * @type {AST}
   */
  this.right = right;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitBinary(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} expression
 * @param {string} name
 * @param {Array} args
 * @public
 * @class BindingPipe
 * @extends {AST}
 */
var BindingPipe = AST.extend(function(span, expression, name, args) {
  BindingPipe.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.expression = expression;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
  /**
   * @public
   * @type {Array}
   */
  this.args = args;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitPipe(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {Array} expressions
 * @public
 * @class Chain
 * @extends {AST}
 */
var Chain = AST.extend(function(span, expressions) {
  Chain.super_.call(this, span);

  /**
   * @public
   * @type {Array}
   */
  this.expressions = expressions;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitChain(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} condition
 * @param {AST} trueExpression
 * @param {AST} falseExpression
 * @public
 * @class Conditional
 * @extends {AST}
 */
var Conditional = AST.extend(function(span, condition, trueExpression, falseExpression) {
  Conditional.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.condition = condition;
  /**
   * @public
   * @type {AST}
   */
  this.trueExpression = trueExpression;
  /**
   * @public
   * @type {AST}
   */
  this.falseExpression = falseExpression;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitConditional(this, context);
  }

});

/**
 * @public
 * @class EmptyExpression
 * @extends {AST}
 */
var EmptyExpression = AST.extend({

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {}

});

/**
 * @param {ParseSpan} span
 * @param {AST} target
 * @param {Array} args
 * @public
 * @class FunctionCall
 * @extends {AST}
 */
var FunctionCall = AST.extend(function(span, target, args) {
  FunctionCall.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.target = target;
  /**
   * @public
   * @type {Array}
   */
  this.args = args;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitFunctionCall(this, context);
  }

});

/**
 * @public
 * @class ImplicitReceiver
 * @extends {AST}
 */
var ImplicitReceiver = AST.extend({

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitImplicitReceiver(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {Array} strings
 * @param {Array} expressions
 * @public
 * @class Interpolation
 * @extends {AST}
 */
var Interpolation = AST.extend(function(span, strings, expressions) {
  Interpolation.super_.call(this, span);

  /**
   * @public
   * @type {Array}
   */
  this.strings = strings;
  /**
   * @public
   * @type {Array}
   */
  this.expressions = expressions;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitInterpolation(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} obj
 * @param {AST} key
 * @public
 * @class KeyedRead
 * @extends {AST}
 */
var KeyedRead = AST.extend(function(span, obj, key) {
  KeyedRead.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.obj = obj;
  /**
   * @public
   * @type {AST}
   */
  this.key = key;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitKeyedRead(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} obj
 * @param {AST} key
 * @param {AST} value
 * @public
 * @class KeyedWrite
 * @extends {AST}
 */
var KeyedWrite = AST.extend(function(span, obj, key, value) {
  KeyedWrite.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.obj = obj;
  /**
   * @public
   * @type {AST}
   */
  this.key = key;
  /**
   * @public
   * @type {AST}
   */
  this.value = value;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitKeyedWrite(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {Array} expressions
 * @public
 * @class LiteralArray
 * @extends {AST}
 */
var LiteralArray = AST.extend(function(span, expressions) {
  LiteralArray.super_.call(this, span);

  /**
   * @public
   * @type {Array}
   */
  this.expressions = expressions;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitLiteralArray(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {Array} keys
 * @param {Array} values
 * @public
 * @class LiteralMap
 * @extends {AST}
 */
var LiteralMap = AST.extend(function(span, keys, values) {
  LiteralMap.super_.call(this, span);

  /**
   * @public
   * @type {Array}
   */
  this.keys = keys;
  /**
   * @public
   * @type {Array}
   */
  this.values = values;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitLiteralMap(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {*} value
 * @public
 * @class LiteralPrimitive
 * @extends {AST}
 */
var LiteralPrimitive = AST.extend(function(span, value) {
  LiteralPrimitive.super_.call(this, span);

  /**
   * @public
   * @type {*}
   */
  this.value = value;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitLiteralPrimitive(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} receiver
 * @param {string} name
 * @param {Array} args
 * @public
 * @class MethodCall
 * @extends {AST}
 */
var MethodCall = AST.extend(function(span, receiver, name, args) {
  MethodCall.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.receiver = receiver;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
  /**
   * @public
   * @type {Array}
   */
  this.args = args;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitMethodCall(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} expression
 * @public
 * @class PrefixNot
 * @extends {AST}
 */
var PrefixNot = AST.extend(function(span, expression) {
  PrefixNot.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.expression = expression;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitPrefixNot(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} receiver
 * @param {string} name
 * @public
 * @class PropertyRead
 * @extends {AST}
 */
var PropertyRead = AST.extend(function(span, receiver, name) {
  PropertyRead.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.receiver = receiver;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitPropertyRead(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} receiver
 * @param {string} name
 * @param {AST} value
 * @public
 * @class PropertyWrite
 * @extends {AST}
 */
var PropertyWrite = AST.extend(function(span, receiver, name, value) {
  PropertyWrite.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.receiver = receiver;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
  /**
   * @public
   * @type {AST}
   */
  this.value = value;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitPropertyWrite(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {string} prefix
 * @param {string} uninterpretedExpression
 * @param {*} location
 * @public
 * @class Quote
 * @extends {AST}
 */
var Quote = AST.extend(function(span, prefix, uninterpretedExpression, location) {
  Quote.super_.call(this, span);

  /**
   * @public
   * @type {string}
   */
  this.prefix = prefix;
  /**
   * @public
   * @type {string}
   */
  this.uninterpretedExpression = uninterpretedExpression;
  /**
   * @public
   * @type {*}
   */
  this.location = location;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitQuote(this, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  toString: function() {
    // TODO: Necessary?
    return 'Quote';
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} receiver
 * @param {string} name
 * @param {Array} args
 * @public
 * @class SafeMethodCall
 * @extends {AST}
 */
var SafeMethodCall = AST.extend(function(span, receiver, name, args) {
  SafeMethodCall.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.receiver = receiver;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
  /**
   * @public
   * @type {Array}
   */
  this.args = args;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitSafeMethodCall(this, context);
  }

});

/**
 * @param {ParseSpan} span
 * @param {AST} receiver
 * @param {string} name
 * @public
 * @class SafePropertyRead
 * @extends {AST}
 */
var SafePropertyRead = AST.extend(function(span, receiver, name) {
  SafePropertyRead.super_.call(this, span);

  /**
   * @public
   * @type {AST}
   */
  this.receiver = receiver;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
}, {

  /**
   * @override
   * @inheritDoc
   */
  visit: function(visitor, context) {
    if (typeof context === 'undefined') {
      context = null;
    }

    return visitor.visitSafePropertyRead(this, context);
  }

});

/**
 * @public
 * @class ASTVisitor
 */
var ASTVisitor = Nevis.extend({

  /**
   * @param {Binary} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitBinary: function(ast, context) {},

  /**
   * @param {Chain} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitChain: function(ast, context) {},

  /**
   * @param {Conditional} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitConditional: function(ast, context) {},

  /**
   * @param {FunctionCall} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitFunctionCall: function(ast, context) {},

  /**
   * @param {ImplicitReceiver} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitImplicitReceiver: function(ast, context) {},

  /**
   * @param {Interpolation} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitInterpolation: function(ast, context) {},

  /**
   * @param {KeyedRead} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitKeyedRead: function(ast, context) {},

  /**
   * @param {KeyedWrite} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitKeyedWrite: function(ast, context) {},

  /**
   * @param {LiteralArray} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitLiteralArray: function(ast, context) {},

  /**
   * @param {LiteralMap} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitLiteralMap: function(ast, context) {},

  /**
   * @param {LiteralPrimitive} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitLiteralPrimitive: function(ast, context) {},

  /**
   * @param {MethodCall} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitMethodCall: function(ast, context) {},

  /**
   * @param {BindingPipe} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitPipe: function(ast, context) {},

  /**
   * @param {PrefixNot} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitPrefixNot: function(ast, context) {},

  /**
   * @param {PropertyRead} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitPropertyRead: function(ast, context) {},

  /**
   * @param {PropertyWrite} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitPropertyWrite: function(ast, context) {},

  /**
   * @param {Quote} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitQuote: function(ast, context) {},

  /**
   * @param {SafeMethodCall} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitSafeMethodCall: function(ast, context) {},

  /**
   * @param {SafePropertyRead} ast
   * @param {*} context
   * @return {*}
   * @public
   * @abstract
   */
  visitSafePropertyRead: function(ast, context) {}

});

/**
 * @public
 * @class ASTTransformer
 * @extends {ASTVisitor}
 */
var ASTTransformer = ASTVisitor.extend({

  /**
   * @param {Array} asts
   * @return {Array}
   * @public
   */
  visitAll: function(asts) {
    var results = new Array(asts.length);
    for (var i = 0; i < asts.length; i++) {
      results[i] = asts[i].visit(this);
    }

    return results;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitBinary: function(ast, context) {
    return new Binary(ast.span, ast.operation, ast.left.visit(this), ast.right.visit(this));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitChain: function(ast, context) {
    return new Chain(ast.span, this.visitAll(ast.expressions));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitConditional: function(ast, context) {
    return new Conditional(ast.span, ast.condition.visit(this), ast.trueExpression.visit(this),
      ast.falseExpression.visit(this));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitFunctionCall: function(ast, context) {
    return new FunctionCall(ast.span, ast.target.visit(this), this.visitAll(ast.args));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitImplicitReceiver: function(ast, context) {
    return ast;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitInterpolation: function(ast, context) {
    return new Interpolation(ast.span, ast.strings, this.visitAll(ast.expressions));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedRead: function(ast, context) {
    return new KeyedRead(ast.span, ast.obj.visit(this), ast.key.visit(this));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedWrite: function(ast, context) {
    return new KeyedWrite(ast.span, ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralArray: function(ast, context) {
    return new LiteralArray(ast.span, this.visitAll(ast.expressions));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralMap: function(ast, context) {
    return new LiteralMap(ast.span, ast.keys, this.visitAll(ast.values));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralPrimitive: function(ast, context) {
    return new LiteralPrimitive(ast.span, ast.value);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitMethodCall: function(ast, context) {
    return new MethodCall(ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPipe: function(ast, context) {
    return new BindingPipe(ast.span, ast.expression.visit(this), ast.name, this.visitAll(ast.args));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPrefixNot: function(ast, context) {
    return new PrefixNot(ast.span, ast.expression.visit(this));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPropertyRead: function(ast, context) {
    return new PropertyRead(ast.span, ast.receiver.visit(this), ast.name);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPropertyWrite: function(ast, context) {
    return new PropertyWrite(ast.span, ast.receiver.visit(this), ast.name, ast.value);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitQuote: function(ast, context) {
    return new Quote(ast.span, ast.prefix, ast.uninterpretedExpression, ast.location);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafeMethodCall: function(ast, context) {
    return new SafeMethodCall(ast.span, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafePropertyRead: function(ast, context) {
    return new SafePropertyRead(ast.span, ast.receiver.visit(this), ast.name);
  }

});

/**
 * @public
 * @class ASTVisitor
 * @extends {ASTVisitor}
 */
var RecursiveASTVisitor = ASTVisitor.extend({

  /**
   * @param {AST[]} asts
   * @param {*} context
   * @return {*}
   * @public
   */
  visitAll: function(asts, context) {
    for (var i = 0; i < asts.length; i++) {
      asts[i].visit(this, context);
    }

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitBinary: function(ast, context) {
    ast.left.visit(this);
    ast.right.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitChain: function(ast, context) {
    return this.visitAll(ast.expressions, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitConditional: function(ast, context) {
    ast.condition.visit(this);
    ast.trueExpression.visit(this);
    ast.falseExpression.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitFunctionCall: function(ast, context) {
    ast.target.visit(this);

    this.visitAll(ast.args, context);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitImplicitReceiver: function(ast, context) {
    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitInterpolation: function(ast, context) {
    return this.visitAll(ast.expressions, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedRead: function(ast, context) {
    ast.obj.visit(this);
    ast.key.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitKeyedWrite: function(ast, context) {
    ast.obj.visit(this);
    ast.key.visit(this);
    ast.value.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralArray: function(ast, context) {
    return this.visitAll(ast.expressions, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralMap: function(ast, context) {
    return this.visitAll(ast.values, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitLiteralPrimitive: function(ast, context) {
    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitMethodCall: function(ast, context) {
    ast.receiver.visit(this);

    return this.visitAll(ast.args, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPipe: function(ast, context) {
    ast.expression.visit(this);

    this.visitAll(ast.args, context);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPrefixNot: function(ast, context) {
    ast.expression.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPropertyRead: function(ast, context) {
    ast.receiver.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitPropertyWrite: function(ast, context) {
    ast.receiver.visit(this);
    ast.value.visit(this);

    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitQuote: function(ast, context) {
    return null;
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafeMethodCall: function(ast, context) {
    ast.receiver.visit(this);

    return this.visitAll(ast.args, context);
  },

  /**
   * @override
   * @inheritDoc
   */
  visitSafePropertyRead: function(ast, context) {
    ast.receiver.visit(this);

    return null;
  }

});

/**
 * @param {string} key
 * @param {boolean} keyIsVar
 * @param {string} name
 * @param {ASTWithSource} expression
 * @public
 * @class TemplateBinding
 */
var TemplateBinding = Nevis.extend(function(key, keyIsVar, name, expression) {
  /**
   * @public
   * @type {string}
   */
  this.key = key;
  /**
   * @public
   * @type {boolean}
   */
  this.keyIsVar = keyIsVar;
  /**
   * @public
   * @type {string}
   */
  this.name = name;
  /**
   * @public
   * @type {ASTWithSource}
   */
  this.expression = expression;
});

module.exports = {
  AST: AST,
  ASTTransformer: ASTTransformer,
  ASTVisitor: ASTVisitor,
  ASTWithSource: ASTWithSource,
  Binary: Binary,
  BindingPipe: BindingPipe,
  Chain: Chain,
  Conditional: Conditional,
  EmptyExpression: EmptyExpression,
  FunctionCall: FunctionCall,
  ImplicitReceiver: ImplicitReceiver,
  Interpolation: Interpolation,
  KeyedRead: KeyedRead,
  KeyedWrite: KeyedWrite,
  LiteralArray: LiteralArray,
  LiteralMap: LiteralMap,
  LiteralPrimitive: LiteralPrimitive,
  MethodCall: MethodCall,
  ParseSpan: ParseSpan,
  ParserError: ParserError,
  PrefixNot: PrefixNot,
  PropertyRead: PropertyRead,
  PropertyWrite: PropertyWrite,
  Quote: Quote,
  RecursiveASTVisitor: RecursiveASTVisitor,
  SafeMethodCall: SafeMethodCall,
  SafePropertyRead: SafePropertyRead,
  TemplateBinding: TemplateBinding
};
