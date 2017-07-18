/* jshint -W085 */
// DEV: The above directive ignores `with` errors
// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a var inside referenced through a `with`', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
      var obj = {hello: 'moon'};
      with (obj) {
        console.log(hello);
      }
    });

    it('marks the initialization without a `with`', function () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('insideWith', false);
    });

    it('marks the inner `with` variable as with a `with`', function () {
      // {Program} (ast) -> {with content} (body[2].body.body) -> `hello` ([0].expression['arguments'][0])
      var identifier = this.ast.body[2].body.body[0].expression['arguments'][0];
      expect(identifier.scopeInfo).to.have.property('insideWith', true);
    });

    it('marks the `with` object as not used in a `with`', function () {
      // {Program} (ast) -> {with} (body[2]) -> obj (object)
      var identifier = this.ast.body[2].object;
      expect(identifier.scopeInfo).to.have.property('insideWith', false);
    });

    it('marks the outer variable with a `usedInAWith`', function () {
      var identifier = this.ast.body[0].declarations[0].id;
      expect(identifier.scopeInfo).to.have.property('usedInAWith', true);
    });

    it('marks the inner `with` variable with a `usedInAWith`', function () {
      var identifier = this.ast.body[2].body.body[0].expression['arguments'][0];
      expect(identifier.scopeInfo).to.have.property('usedInAWith', true);
    });

    it('marks the `with` object without a `usedInAWith`', function () {
      var identifier = this.ast.body[2].object;
      expect(identifier.scopeInfo).to.have.property('usedInAWith', false);    });
  });
});
