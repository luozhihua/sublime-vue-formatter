// Load in dependencies
var expect = require('chai').expect;
var scriptUtils = require('./utils/script');

// Run our tests
// Anything with the `Identifier` that isn't a variable reference
// https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a MemberExpression', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
      logger.info('hello');
    });

    it('marks the `logger` variable with a `scope`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> logger (expression.callee.object)
      var identifier = this.ast.body[1].expression.callee.object;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });

    it('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {logger.info} (body[1]) -> info (expression.callee.property)
      var identifier = this.ast.body[1].expression.callee.property;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  describe('marking up an AST with an object Property', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        info: function () {}
      };
    });

    it('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {var} (body[0]) -> {logger} (declarations[0].init) -> info (properties[0].key)
      var identifier = this.ast.body[0].declarations[0].init.properties[0].key;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  describe('marking up an AST with a Label, Break, and Continue', function () {
    scriptUtils.interpretFnAst(function () {
      loop1:
      for (var i = 0; i < 10; i++) {
        if (true) {
          break loop1;
        } else {
          continue loop1;
        }
      }
    });

    it('does not mark the `label` identifier with a `scope`', function () {
      // {Program} (ast) -> {labeled statement} (body[0]) -> loop1 (label)
      var identifier = this.ast.body[0].label;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });

    it('does not mark the `break` identifier with a `scope`', function () {
      // {Program} (ast) -> {labeled statement} (body[0]) -> {for} (body)
      //  -> {if} (body.body[0]) -> {break} (consequent.body[0]) -> loop1 {label}
      var identifier = this.ast.body[0].body.body.body[0].consequent.body[0].label;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });

    it('does not mark the `continue` identifier with a `scope`', function () {
      // {Program} (ast) -> {labeled statement} (body[0]) -> {for} (body)
      //  -> {if} (body.body[0]) -> {continue} (alternate.body[0]) -> loop1 {label}
      var identifier = this.ast.body[0].body.body.body[0].alternate.body[0].label;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });

  describe('marking an ObjectPattern', function () {
    scriptUtils.interpretStrAst([
      'var hello = {world: true};',
      'var {world} = hello;'
    ].join('\n'));

    it('marks the identifier keys as variables', function () {
      // {Program} (ast) -> {var} (body[1]) -> {object pattern} (declarations[0].id)
      //  -> world (properties[0].id)
      var identifier = this.ast.body[1].declarations[0].id.properties[0].key;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });
  });

  describe('marking an ArrayPattern', function () {
    scriptUtils.interpretStrAst([
      'var hello = [\'world\'];',
      'var [world] = hello;'
    ].join('\n'));

    it('marks the identifier keys as variables', function () {
      // {Program} (ast) -> {var} (body[1]) -> {array pattern} (declarations[0].id)
      //  -> world (elements[0])
      var identifier = this.ast.body[1].declarations[0].id.elements[0];
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });
  });
});

// Edge cases
describe('ecma-variable-scope', function () {
  describe('marking up an AST with a variable based property', function () {
    scriptUtils.interpretFnAst(function () {
      var obj = {};
      var hello = 'world';
      obj[hello] = true;
    });

    it('adds a scope to the variable', function () {
      // {Program} (ast) -> {obj[]=} (body[2]) -> {obj[hello]} (expression.left) -> hello (property)
      var identifier = this.ast.body[2].expression.left.property;
      expect(identifier).to.have.property('scope');
      expect(identifier).to.have.property('scopeInfo');
    });
  });

  describe('marking up an AST with an ES5 get/set Property', function () {
    scriptUtils.interpretFnAst(function () {
      var logger = {
        get info() {
          // Code goes here
        }
      };
    });

    it('does not mark the `info` property with a `scope`', function () {
      // {Program} (ast) -> {var} (body[0]) -> {logger} (declarations[0].init) -> info (properties[0].key)
      var identifier = this.ast.body[0].declarations[0].init.properties[0].key;
      expect(identifier).to.not.have.property('scope');
      expect(identifier).to.not.have.property('scopeInfo');
    });
  });
});
