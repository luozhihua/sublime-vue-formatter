// Load in dependencies
var expect = require('chai').expect;
var ecmaScopes = require('../');
var astUtils = require('./utils/ast');
var scriptUtils = require('./utils/script');

// Define our tests
function testBlockScope(filepath, type) {
  // Load our scope file
  scriptUtils.load(filepath, type);

  // Collect the parents for analysis within the lexical scope
  before(function collectParents () {
    // Find closest identifier to `root`
    var node = this.node = astUtils.findFirst(this.ast, {
      type: 'Identifier',
      name: 'block'
    });
    expect(node).to.not.equal(null);

    // Resolve the node's parents until we hit our scope type (e.g. `IfStatement`)
    this.parents = astUtils.findParentsUntil(node, {
      type: type
    });
  });

  if (scriptUtils.unrunnableScopes.indexOf(type) === -1) {
    it('is a block scope', function () {
      expect(this.vm).to.not.have.ownProperty('block');
    });

    it('is not a lexical scope', function () {
      expect(this.vm).to.have.ownProperty('lexical');
    });
  }

  it('contains `block` inside of a "' + type + '"', function () {
    var container = this.parents[this.parents.length - 1];
    expect(this.parents).to.not.have.length(0);
    expect(container.type).to.equal(type);
  });

  it('does not contain `block` inside of lexical scopes and other block scopes', function () {
    // Collect the lexical and other block scopes
    var lexicalScopes = ecmaScopes.lexical;
    var otherBlockScopes = ecmaScopes.block.slice();
    otherBlockScopes.splice(otherBlockScopes.indexOf(type), 1);

    // Verify each of the nodes is not in there
    this.parents.forEach(function assertNotOtherScopes (parent) {
      expect(parent.type).to.not.equal(undefined);
      expect(lexicalScopes).to.not.contain(parent.type);
      expect(otherBlockScopes).to.not.contain(parent.type);
    });
  });
}

// Define our tests
describe('ecma-scopes\' block scopes:', function () {
  ecmaScopes.block.forEach(function testBlockCase (type) {
    describe('a/an "' + type + '"', function () {
      // Resolve our test file e.g. `test-files/block-IfStatement.js`
      var filepath = __dirname + '/test-files/block-' + type + '.js';

      // Run the test
      testBlockScope(filepath, type);
    });
  });

  // DEV: Prove that including braces means a `BlockStatement` for where scoping is contained
  describe('an "IfStatement" with braces uses "BlockStatement" as its block scope container', function () {
    var filepath = __dirname + '/test-files/BlockStatement-proof/IfStatement-braces.js';
    testBlockScope(filepath, 'BlockStatement');
  });

  // DEV: If we don't have braces, then there is no `BlockStatement`
  // DEV: but `let` needs to live in a `BlockStatement` which is why we have errors
  describe('an "IfStatement" without braces', function () {
    var filepath = __dirname + '/test-files/BlockStatement-proof/IfStatement-braceless-lexical-only.js';
    scriptUtils.load(filepath, 'IfStatement');

    it('does not define a "BlockStatement" due to lack of braces', function () {
      var node = astUtils.findFirst(this.ast, {
        type: 'BlockStatement'
      });
      expect(node).to.equal(null);
    });
  });
});
