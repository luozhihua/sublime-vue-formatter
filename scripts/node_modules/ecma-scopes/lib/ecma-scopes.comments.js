// Load in dependencies
var esprima = require('esprima-fb');

// We used SpiderMonkey documentation and `esprima-fb's` code for references
//   https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
//   https://github.com/facebook/esprima/blob/7001.0001.0000-dev-harmony-fb/esprima.js#L127-L212
module.exports = {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions
  lexical: [
    esprima.Syntax.FunctionDeclaration, // function a() {}
    esprima.Syntax.FunctionExpression, // var a = function () {}
    // DEV: In `esprima-fb`, `ArrowExpression` is `ArrowFunctionExpression`
    esprima.Syntax.ArrowFunctionExpression // (arg) => arg
  ],
  // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements
  block: [
    esprima.Syntax.BlockStatement, // { /* code goes here */ }
    esprima.Syntax.ForStatement, // for (let i = 0; i < 10; i++) ;
    esprima.Syntax.ForInStatement, // for (let key in obj) ;
    esprima.Syntax.ForOfStatement, // for (let val in arr) ;
    esprima.Syntax.CatchClause, // try { /* code */ } catch (err) { }
    // DEV: This is being called `block` scope in the docs with a comparison to `for`/`for each`
    esprima.Syntax.ComprehensionExpression // [val for (val of arr)]
  ]
};

