// [ELJS](http://neocotic.com/ELJS) 0.1.0alpha
//
// Copyright (c) 2014 Alasdair Mercer
//
// Freely distributable under the MIT license.
//
// For all details and documentation:
//
// <http://neocotic.com/ELJS>

(function(root, factory) {

  'use strict';

  if (typeof exports === 'object') {
    // Export module for Node.js (or similar) environments.
    module.exports = factory(root);
  } else if (typeof define === 'function' && define.amd) {
    // Register as an anonymous module.
    define(function() {
        return factory(root);
    });
  } else {
    // Fallback on a simple global variable (e.g. browsers).
    factory(root);
  }

}(this, function(root) {

  'use strict';

  // Private variables
  // -----------------

  // Save the previous value of the `el` variable.
  var previousEl = root.el;

  // ELJS
  // ----

  // TODO: Document
  var el = function(expression, scope, options) {
    expression = expression || '';
    scope = scope || {};
    options = options || {};

    // TODO: Complete
  };

  // Constants
  // ---------

  // Current version of `ELJS`.
  el.VERSION = '0.1.0alpha';

  // Utility functions
  // -----------------

  // Run ELJS in *noConflict* mode, returning the `el` variable to its previous owner.
  // Returns a reference to `el`.
  el.noConflict = function() {
    root.el = previousEl;

    return this;
  };

  return el;

}));