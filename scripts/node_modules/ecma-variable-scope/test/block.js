// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Basic tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `let`', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      let hello = 'world';
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {let} (body[1]) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the top level', function () {
      var identifier = this.ast.body[1].declarations[0].id;
      expect(identifier.scope.node).to.equal(this.ast);
    });
  });
});

// Intermediate tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `block` statement', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      if (true) {
        let hello = 'world';
      }
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {if} (body[1]) -> {block} (consequent) -> {let} (body[0])
      //   -> hello (declarations[0].id)
      var identifier = this.ast.body[1].consequent.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `block` statement', function () {
      var block = this.ast.body[1].consequent;
      var identifier = block.body[0].declarations[0].id;
      expect(identifier.scope.node).to.equal(block);
    });
  });

  describe('marking up an AST with a `for` loop', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      for (let hello = 'world'; false; false) {
        // Code goes here
      }
    });

    it('a `block` parameter is considered `block` scoped', function () {
      // {Program} (ast) -> {for} (body[1]) -> {let} (init) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].init.declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `for` statement', function () {
      var forLoop = this.ast.body[1];
      var identifier = forLoop.init.declarations[0].id;
      expect(identifier.scope.node).to.equal(forLoop);
    });
  });

  describe('marking up an AST with a `for in` loop', function () {
    scriptUtils.interpretFnAst(function () {
      'use strict';
      for (let hello in {world: true}) {
        // Code goes here
      }
    });

    it('a `block` parameter is considered `block` scoped', function () {
      // {Program} (ast) -> {for} (body[1]) -> {let} (left) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].left.declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `for in` statement', function () {
      var forInLoop = this.ast.body[1];
      var identifier = forInLoop.left.declarations[0].id;
      expect(identifier.scope.node).to.equal(forInLoop);
    });
  });

  describe('marking up an AST with a `for of` loop', function () {
    scriptUtils.interpretStrAst([
      '\'use strict\';',
      'for (let hello of [\'world\']) {',
        '// Code goes here',
      '}'
    ].join('\n'));

    it('a `block` parameter is considered `block` scoped', function () {
      // {Program} (ast) -> {for} (body[1]) -> {let} (left) -> hello (declarations[0].id)
      var identifier = this.ast.body[1].left.declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `for of` statement', function () {
      var forInLoop = this.ast.body[1];
      var identifier = forInLoop.left.declarations[0].id;
      expect(identifier.scope.node).to.equal(forInLoop);
    });
  });

  describe('marking up an AST with a `catch` clause', function () {
    scriptUtils.interpretFnAst(function () {
      try {
        // Throw an error
      } catch (hello) {
        // Handle error
      }
    });

    it('a parameter is considered `block` scoped', function () {
      // {Program} (ast) -> {try} (body[0]) -> {catch} (handlers[0]) -> hello (param)
      var identifier = this.ast.body[0].handlers[0].param;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `catch` clause', function () {
      var catchClause = this.ast.body[0].handlers[0];
      var identifier = catchClause.param;
      expect(identifier.scope.node).to.equal(catchClause);
    });
  });

  describe('marking up an AST with a comprehension expression', function () {
    scriptUtils.interpretStrAst([
      'var a = [1 for (hello of [\'world\'])];'
    ].join('\n'));

    it('a parameter is considered `block` scoped', function () {
      // {Program} (ast) -> {var} (body[0]) -> `comprehension` (declarations[0].init)
      //  -> {(hello of ...)} (blocks[0]) -> hello (left)
      var identifier = this.ast.body[0].declarations[0].init.blocks[0].left;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the comprehension expression', function () {
      var comprehensionBlock = this.ast.body[0].declarations[0].init;
      var identifier = comprehensionBlock.blocks[0].left;
      expect(identifier.scope.node).to.equal(comprehensionBlock);
    });
  });
});

// Edge cases
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a `let` inside a `function`', function () {
    scriptUtils.interpretFnAst(function () {
      (function myFn () {
        'use strict';
        let hello = 'world';
      }());
    });

    it('is considered `block`', function () {
      // {Program} (ast) -> {fn invocation} (body[0]) -> {fn} (expression.callee)
      //  -> {block} (body) -> {let} (body[1]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].expression.callee.body.body[1].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('type', 'block');
    });

    it('scopes the variable to the `block` statement', function () {
      var blockScope = this.ast.body[0].expression.callee.body;
      var identifier = blockScope.body[1].declarations[0].id;
      expect(identifier.scope.node).to.equal(blockScope);
    });
  });
});
