/* jshint -W104 */
// DEV: The JSHint directive above ignores `const` usage
// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Basic tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `var`', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });

    it('scopes the variable to the top level', function () {
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });

  describe('marking up an AST with a `const`', function () {
    scriptUtils.interpretFnAst(function () {
      const hello = 'world';
    });

    it('is considered `lexical`', function () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
    });

    it('scopes the variable to the top level', function () {
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });
});

// Intermediate tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a function declaration', function () {
    scriptUtils.interpretFnAst(function () {
      function hello(world) {
        // Code goes here
      }
    });

    it('marks the function name as lexically scoped to the outer scope', function () {
      // {Program} (ast) -> {fn} (body[0]) -> hello (id)
      var identifier = this.ast.body[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(this.ast);
    });

    it('marks the function parameters as lexically scoped to the function', function () {
      // {Program} (ast) -> {fn} (body[0]) -> world (params[0])
      var identifier = this.ast.body[0].params[0];
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(this.ast.body[0]);
    });
  });

  describe('marking up an AST with a function expression', function () {
    scriptUtils.interpretFnAst(function () {
      [].map(function hello (world) {
        // Code goes here
      });
    });

    it('marks the function name as lexically scoped to the outer scope', function () {
      // {Program} (ast) -> {[]} (body[0]) -> {fn} (expression.arguments[0]) -> hello (id)
      var identifier = this.ast.body[0].expression.arguments[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(this.ast);
    });

    it('marks the function parameters as lexically scoped to the function', function () {
      // {Program} (ast) -> {[]} (body[0]) -> {fn} (expression.arguments[0]) -> world (params[0])
      var fn = this.ast.body[0].expression.arguments[0];
      var identifier = fn.params[0];
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(fn);
    });
  });

  describe('marking up an AST with an arrow expression', function () {
    // DEV: JSHint doesn't like ES6 too much =(
    scriptUtils.interpretStrAst([
      '[].map((arrowParam) => 1);'
    ].join('\n'));

    it('marks the function parameters as lexically scoped to the function', function () {
      // {Program} (ast) -> {[]} (body[0]) -> {fn} (expression.arguments[0]) -> world (params[0])
      var fn = this.ast.body[0].expression.arguments[0];
      var identifier = fn.params[0];
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(fn);
    });
  });
});

// Edge cases
describe('ecma-variable-scope', function () {
  describe('marking up an AST with an unnamed function expression', function () {
    scriptUtils.interpretFnAst(function () {
      [].map(function (world) {
        // Code goes here
      });
    });

    it('does not cause errors', function () {
      // Errors would throw in `before`
    });
  });

  // DEV: It looks like our flavor of esprima doesn't yet support rest arguments
  // http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html
  describe.skip('marking up an AST with an function expression with a `rest` parameter', function () {
    scriptUtils.interpretStrAst([
      'function hello(world, ...remainder) {',
        '// Code goes here',
      '});'
    ].join('\n'));

    it('marks the `rest` parameters as lexically scoped to the function', function () {
      // {Program} (ast) -> {[]} (body[0]) -> {fn} (expression.arguments[0]) -> world (params[0])
      var fn = this.ast.body[0].expression.arguments[0];
      var identifier = fn.params[1];
      expect(identifier.scopeInfo).to.have.property('type', 'lexical');
      expect(identifier.scope.node).to.equal(fn);
    });
  });
});
