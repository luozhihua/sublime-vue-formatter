// Gather an AST to analyze
var esprima = require('esprima-fb');
var ecmaVariableScope = require('../');
var ast = esprima.parse([
  'function logger(str) {',
    'console.log(str);',
  '}'
].join('\n'));

// Determine the scope of a variable
ecmaVariableScope(ast);
console.log(ast.body[0].id);
console.log(ast.body[0].body.body[0].expression.callee.object);
