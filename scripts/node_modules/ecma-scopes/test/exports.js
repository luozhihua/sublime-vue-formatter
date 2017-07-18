// Load our dependencies
var expect = require('chai').expect;
var ecmaScopesCommented = require('../lib/ecma-scopes.comments.js');
var ecmaScopes = require('../');

// Start our tests
describe('Our commented set of scopes and our stringified set of scopes', function () {
  it('do not have any discrepencies', function () {
    // DEV: If this test fails, run `npm run stringify` to generate the latest set
    expect(ecmaScopes).to.deep.equal(ecmaScopesCommented);
  });

  it('does not export undefined values', function () {
    expect(ecmaScopes.lexical).to.not.contain(undefined);
    expect(ecmaScopes.block).to.not.contain(undefined);
  });
});
