// Load our dependencies
var assert = require('assert');
var fs = require('fs');
var vm = require('vm');
var astw = require('astw');
var esprima = require('esprima-fb');

// Define unrunnable scopes (e.g. arrow functions)
// http://kangax.github.io/compat-table/es6/
exports.unrunnableScopes = [
  'ArrowFunctionExpression',
  'ForOfStatement',
  'ComprehensionExpression'
];

// Define script utilities
exports.loadScript = function (filepath) {
  before(function loadScriptFn () {
    // Load our script and parse its AST
    this.script = fs.readFileSync(filepath, 'utf8');
    this.ast = esprima.parse(this.script);
    this.walker = astw(this.ast);
  });
  after(function cleanup () {
    // Clean up the script and AST
    delete this.script;
    delete this.ast;
    delete this.walker;
  });
};

exports.runVm = function (type) {
  before(function openVmFn () {
    // Attempt to load our file into the VM
    this.vm = {};
    var err;
    try {
      vm.runInNewContext(this.script, this.vm);
    // If an error occurs, save it
    } catch (_err) {
      err = _err;
    }

    // If we were an unrunnable scope, verify there was an error
    // DEV: If we start getting a runnable script, this means `node` has started
    //   supporting this syntax and we should be asserting against it
    if (exports.unrunnableScopes.indexOf(type) !== -1) {
      assert(err, 'Expected `err` to be defined but was `' +  err + '` for "' + type + '"');
      delete this.vm;
    // Otherwise, if there was an error, raise it
    } else if (err) {
      throw err;
    }
  });
  after(function cleanup () {
    // Clean up the vm
    delete this.vm;
  });
};

exports.load = function (filepath, type) {
  exports.loadScript(filepath);
  exports.runVm(type);
};
