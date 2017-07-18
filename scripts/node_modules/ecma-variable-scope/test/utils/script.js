// Load in dependencies
var esprima = require('esprima-fb');
var fnToString = require('function-to-string');
var ecmaVariableScope = require('../../');

// Define test utilities
exports._interpretStrAst = function (script) {
  // Parse the AST and run `ecmaVariableScope`
  var ast = esprima.parse(script);
  ecmaVariableScope(ast);
  return ast;
};

exports.interpretFnAst = function (fn) {
  before(function loadScriptFn () {
    // Load the file and interpret it
    var script = fnToString(fn).body;
    this.ast = exports._interpretStrAst(script);
  });
  after(function cleanup () {
    delete this.ast;
  });
};

exports.interpretStrAst = function (script) {
  before(function loadScriptFn () {
    // Interpret the provided script
    this.ast = exports._interpretStrAst(script);
  });
  after(function cleanup () {
    delete this.ast;
  });
};
