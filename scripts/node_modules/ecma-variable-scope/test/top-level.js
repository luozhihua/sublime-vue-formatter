// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a top level var', function () {
    scriptUtils.interpretFnAst(function () {
      var hello;
      function hai() {
        hello = true;
      }
    });

    it('marks the initialization as top level', function () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('topLevel', true);
    });

    it('marks the top level variable within a funtion as top level', function () {
      // {Program} (ast) -> {fn body} (body[1].body.body) -> hello ([0].expression.left)
      var identifier = this.ast.body[1].body.body[0].expression.left;
      expect(identifier.scopeInfo).to.have.property('topLevel', true);
    });
  });

  describe('marking up an AST without a top level var', function () {
    scriptUtils.interpretFnAst(function () {
      function hai() {
        var hello = true;
      }
    });

    it('marks the lexically scoped variable as not top level', function () {
      // {Program} (ast) -> {fn body} (body[0].body.body) -> {var} [0] -> hello (declarations[0].id)
      var identifier = this.ast.body[0].body.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('topLevel', false);
    });
  });
});
