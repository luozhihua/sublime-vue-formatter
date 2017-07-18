// Load in dependencies
var expect = require('chai').expect;
var ecmaScopes = require('../');
var astUtils = require('./utils/ast');
var scriptUtils = require('./utils/script');

// Define function for running arbitrary tests
function testLexicalScope(filepath, type) {
  // Load our script
  scriptUtils.load(filepath, type);

  // Collect the parents for analysis within the lexical scope
  before(function collectParents () {
    // Find closest identifier to `root`
    var node = this.node = astUtils.findFirst(this.ast, {
      type: 'Identifier',
      name: 'lexical'
    });
    expect(node).to.not.equal(null);

    // Resolve the node's parents until we hit our scope type (e.g. `FunctionDeclaration`)
    this.parents = astUtils.findParentsUntil(node, {
      type: type
    });
  });

  if (scriptUtils.unrunnableScopes.indexOf(type) === -1) {
    it('is a lexical scope', function () {
      expect(this.vm).to.not.have.ownProperty('lexical');
    });
  }

  it('contains `lexical` inside of a "' + type + '"', function () {
    var container = this.parents[this.parents.length - 1];
    expect(this.parents).to.not.have.length(0);
    expect(container.type).to.equal(type);
  });

  it('does not contain `lexical` inside of other lexical scopes', function () {
    // Collect the other lexical scopes
    var otherLexicalScopes = ecmaScopes.lexical.slice();
    otherLexicalScopes.splice(otherLexicalScopes.indexOf(type), 1);

    // Verify each of the nodes is not in there
    this.parents.forEach(function assertNotOtherLexical (parent) {
      expect(parent.type).to.not.equal(undefined);
      expect(otherLexicalScopes).to.not.contain(parent.type);
    });
  });
}

// Define our tests
describe('ecma-scopes\' lexical scopes:', function () {
  ecmaScopes.lexical.forEach(function testLexicalCase (type) {
    describe('a/an "' + type + '"', function () {
      // Resolve our scope file and test it
      // e.g. `test-files/lexical-FunctionDeclaration.js`
      var filepath = __dirname + '/test-files/lexical-' + type + '.js';
      testLexicalScope(filepath, type);
    });
  });
});
