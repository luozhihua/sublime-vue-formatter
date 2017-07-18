// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// DEV: `scopeInfo` is distributed across `with.js` (`insideWith`),
//   `top-level.js` (`topLevel`), `lexical.js`/`block.js` (`type` except for `undeclared`)
describe('ecma-variable-scope', function () {
  describe('marking up an AST for its scopes', function () {
    scriptUtils.interpretFnAst(function () {
      function hello() {
        var world = true;
      }
    });
    before(function grabScope () {
      // {Program} (ast) -> {function} (body[0]) -> {var} (body.body[0])
      //  -> hai (declarations[0].id)
      this.fn = this.ast.body[0];
      this.identifier = this.fn.body.body[0].declarations[0].id;
      this.scope = this.identifier.scope;
    });
    after(function cleanup () {
      delete this.fn;
      delete this.identifier;
      delete this.scope;
    });

    it('gives a `scope` a `type`', function () {
      expect(this.scope).to.have.property('type', 'lexical');
    });

    it('gives a `scope` a `node`', function () {
      expect(this.scope).to.have.property('node', this.fn);
    });

    it('gives a `scope` a `parent`', function () {
      var programScope = this.ast.body[0]._nearestScope;
      expect(programScope).to.not.equal(undefined);
      expect(this.scope).to.have.property('parent', programScope);
    });

    it('saves `identifiers` on a `scope`', function () {
      expect(this.scope).to.have.property('identifiers');
      expect(this.scope.identifiers).to.have.keys(['world']);
      expect(this.scope.identifiers.world).to.equal(this.identifier);
    });

    it('saves child scopes on a `scope`', function () {
      var programScope = this.ast.body[0]._nearestScope;
      expect(programScope).to.not.equal(undefined);
      expect(programScope).to.have.property('children');
      expect(programScope.children).to.have.length(1);
      expect(programScope.children[0]).to.equal(this.scope);
    });
  });

  describe('marking up an AST with a top level scope', function () {
    scriptUtils.interpretFnAst(function () {
      var hello = 'world';
    });

    before(function grabScope () {
      // {Program} (ast) -> {var} (body[0]) -> hello (declarations[0].id)
      this.identifier = this.ast.body[0].declarations[0].id;
      this.scope = this.identifier.scope;
    });
    after(function cleanup () {
      delete this.identifier;
      delete this.scope;
    });

    it('has an undefined parent for its `scope`', function () {
      expect(this.scope).to.not.have.property('parent');
    });
  });

  describe('marking up an AST with an undeclared variable', function () {
    scriptUtils.interpretFnAst(function () {
      console.log('hello');
    });

    before(function grabScope () {
      // {Program} (ast) -> {console.log} (body[0]) -> console {expression.callee.object}
      this.identifier = this.ast.body[0].expression.callee.object;
      this.scopeInfo = this.identifier.scopeInfo;
      this.scope = this.identifier.scope;
    });
    after(function cleanup () {
      delete this.identifier;
      delete this.scopeInfo;
      delete this.scope;
    });

    it('has an `undeclared` as its `scope` type', function () {
      expect(this.scopeInfo).to.have.property('type', 'undeclared');
    });

    it('does not have a `scope`', function () {
      expect(this.identifier).to.not.have.property('scope');
    });
  });
});
