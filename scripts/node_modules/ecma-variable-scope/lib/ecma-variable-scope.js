// Load in our dependencies
var assert = require('assert');
var ecmaScopes = require('ecma-scopes');
var estraverse = require('estraverse');

// Define constants
var SCOPE_INFO_INSIDE_WITH = {
  YES: true,
  NO: false
};
var SCOPE_INFO_USED_IN_A_WITH = {
  YES: true,
  NO: false
};
var SCOPE_INFO_TOP_LEVEL = {
  YES: true,
  NO: false
};
var SCOPE_INFO_TYPES = {
  LEXICAL: 'lexical',
  BLOCK: 'block',
  UNDECLARED: 'undeclared'
};
var SCOPE_TYPES = {
  LEXICAL: 'lexical',
  WITH: 'with',
  BLOCK: 'block'
};

// Define helper to check a new scope
function getScopeType(node) {
  if (node.type === 'Program') {
    // DEV: We mark `program` as `lexical` because it is easier to set/compare against
    return SCOPE_TYPES.LEXICAL;
  } else if (ecmaScopes.lexical.indexOf(node.type) !== -1) {
    return SCOPE_TYPES.LEXICAL;
  } else if (node.type === 'WithStatement') {
    return SCOPE_TYPES.WITH;
  } else if (ecmaScopes.block.indexOf(node.type) !== -1) {
    return SCOPE_TYPES.BLOCK;
  } else {
    return null;
  }
}

// TODO: Move to an object or reduce the parameters. The count is too damn high
// DEV: We specify `baseNode` because it should be where we resolve the nearest scope from which may not be an identifier
function resolveScope(baseNode, identifiers, scopeType) {
  // If we resolved identifiers
  // DEV: This assert is to make it faster for developers to debug
  assert(Array.isArray(identifiers), 'Identifier resolution for baseNode "' + baseNode.type + '" did not result in an array');

  if (identifiers.length) {
    // Walk up the nearest scopes until we find one that matches our type
    // DEV: Use `scopeTypes` since a block scope can hit `Program` which is lexical
    var scope = baseNode._nearestScope;
    var scopeTypes = scopeType === SCOPE_INFO_TYPES.LEXICAL ? [SCOPE_INFO_TYPES.LEXICAL] : [SCOPE_INFO_TYPES.LEXICAL, SCOPE_INFO_TYPES.BLOCK];
    while (scope) {
      // If the scope type matches, stop
      if (scopeTypes.indexOf(scope.type) !== -1) {
        break;
      }

      // Look at the scope's parent
      scope = scope.parent;
    }

    // Expand all identifiers (e.g. object patterns to variables, `var {world}` -> `world`)
    var expandedIdentifiers = [];
    identifiers.forEach(function expandIdentifier (identifier) {
      // If it is an object pattern, expand it and save each key/identifier
      if (identifier.type === 'ObjectPattern') {
        identifier.properties.forEach(function extractObjectIdentifier (property) {
          expandedIdentifiers.push(property.key);
        });
      // Otherwise if it is an array pattern, expand it and save each identifier
      } else if (identifier.type === 'ArrayPattern') {
        identifier.elements.forEach(function extractArrayIdentifier (element) {
          expandedIdentifiers.push(element);
        });
      // Otherwise, save the original identifier
      } else {
        expandedIdentifiers.push(identifier);
      }
    });

    // Save declaration info on the scope and scope type to the identifier
    expandedIdentifiers.forEach(function saveIdentifier (identifier) {
      scope.identifiers[identifier.name] = identifier;
      identifier._scopeType = scopeType;
    });
  }
}

function walkVariables(ast, params) {
  // Walk entire tree
  estraverse.traverse(ast, {
    // Skip over undesired identifiers (e.g. `log` in `console.log`)
    // https://github.com/Constellation/estraverse/blob/1.7.0/estraverse.js#L222-L288
    keys: {
      BreakStatement: [/*'label'*/], // `loop1` in `break loop1;`
      ContinueStatement: [/*'label'*/], // `loop1` in `continue loop1;`
      LabeledStatement: [/*'label',*/ 'body'], // `loop1` in `loop1: while (true) {}`
      Property: [/*'key',*/ 'value'] // `key` in `{key: 'value'}`
    },

    enter: function (node, parent) {
      // If the node is an identifier, run our `enter` on it
      if (node.type === 'Identifier' && params.enter) {
        // If the node's parent is a `MemberExpression` and we are talking about the property
        if (parent && parent.type === 'MemberExpression' && parent.property === node) {
          // If the property is computer (e.g. `key` in `obj[key]`)
          // DEV: As opposed to `log` in `console.log`
          if (parent.computed === true) {
            params.enter(node);
          }
        // Otherwise, run `enter` on the node
        } else {
          params.enter(node);
        }
      }
    }
  });
  return ast;
}

// TODO: Consider breaking down ecmaVariableScope into 3 functions

// Define our variable scope function
// DEV: This function goes in 3 parts
//   1. Generate a scope chain (e.g. `FunctionDeclaration` -> `FunctionDeclaration` -> `Program`)
//   2. Resolve variable declarations to their closest scope
//        (e.g. `function hello(world) {}` maps `world` to the scope of `hello`)
//   3. Match all identifiers to their corresponding scope and save `with` related info
//   4. Add scope info to each identifier
//        (e.g. `function a() { var x; function b() { x(); } }` gives `x` the properties recorded against `a`)
function ecmaVariableScope(ast) {
  // Walk entire tree
  var scopeStack = [];
  var scope;
  estraverse.traverse(ast, {
    // Upon entry of a node
    enter: function (node, parent) {
      // Save the scope to our node
      // e.g. {`FunctionDeclaration._nearestScope === Program`}
      // e.g. {`Program._nearestScope === undefined`}
      node._nearestScope = scope;

      // If it is a a program, lexical scope, with statement, or block scope
      var scopeType = getScopeType(node);
      if (scopeType) {
        // Generate a new scope and push it onto our stack
        var oldScope = scope;
        scope = {
          type: scopeType,
          node: node, // reference to node of AST
          parent: oldScope, // reference to parent in scope tree
          identifiers: { // reference to Identifier nodes in AST under our scope
            // name: Identifier
          },
          children: [] // references to children in scope tree
        };
        scopeStack.push(scope);

        // If there was a parent scope, save a child reference
        if (scope.parent) {
          scope.parent.children.push(scope);
        }
      }
    },
    // Upon exiting a node
    leave: function (node, parent) {
      // If it is a program, lexical scope, with statement, or a block scope
      if (getScopeType(node)) {
        // Pop it from the stack
        scopeStack.pop();

        // Update the scope reference
        scope = scopeStack[scopeStack.length - 1];
      }
    }
  });

  // Walk entire tree
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      // If the item is a variable declaration
      var identifiers;
      var scopeType;
      switch(node.type) {
        // Lexical/block scope
        // If it is a variable declaration (e.g. `var name;`, `let name;`)
        // DEV: This also covers `for/for in/for of` loops since they require a `let`
        case 'VariableDeclaration':
          // Find all of the identifiers via the declarators
          var declarators = node.declarations;
          // TODO: Consider using _.pluck
          identifiers = declarators.map(function getIdentifier (declarator) {
            return declarator.id;
          });
          // DEV: For reference, `const` is lexical
          //   if (true) { const hai = true; } console.log(hai);
          scopeType = node.kind === 'let' ? SCOPE_INFO_TYPES.BLOCK : SCOPE_INFO_TYPES.LEXICAL;
          resolveScope(node, identifiers, scopeType);
          break;

        // Lexical scopes
        // `function name(params) {}`
        case 'FunctionDeclaration':
        // `[].map(function name (params) {})`
        case 'FunctionExpression':
        // `[].map(name => 1);
        case 'ArrowFunctionExpression':
          // DEV: This covers both the function name and its parameters
          // Resolve the scope of the fn name separately from its params (different scopes)
          // DEV: Allow no name (e.g. `[].map(function () {})`
          if (node.id) {
            resolveScope(node, [node.id], SCOPE_INFO_TYPES.LEXICAL);
          }

          // Resolve scope for the fn parameters (will resolve to fn)
          if (node.params[0]) {
            resolveScope(node.params[0], node.params, SCOPE_INFO_TYPES.LEXICAL);
          }
          break;

        // Block scopes
        // `try { /* ... */ } catch (name) { /* ... */ }
        case 'CatchClause':
          resolveScope(node.param, [node.param], SCOPE_INFO_TYPES.BLOCK);
          break;
        // `var a = [1 for (value of ['hello'])];`
        case 'ComprehensionBlock':
          resolveScope(node.left, [node.left], SCOPE_INFO_TYPES.BLOCK);
          break;
      }
    }
  });

  // For each variable node
  walkVariables(ast, {
    enter: function (node, parent) {
      // Walk up the scope chain until we find our containing scope
      var scope = node._nearestScope;
      var insideWith = SCOPE_INFO_INSIDE_WITH.NO;
      var usedInAWith = SCOPE_INFO_USED_IN_A_WITH.NO;
      var declaringIdentifier;
      while (scope) {
        // If we are passing through a `with` and it isn't the `with's` context, save the info
        if (scope.type === SCOPE_TYPES.WITH && scope.node.object !== node) {
          insideWith = SCOPE_INFO_INSIDE_WITH.YES;
          usedInAWith = SCOPE_INFO_USED_IN_A_WITH.YES;
        }

        // If it contains our variable, stop looping
        declaringIdentifier = scope.identifiers[node.name];
        if (declaringIdentifier !== undefined) {
          break;
        }

        // Otherwise, move to the parent scope
        scope = scope.parent;
      }

      // Mark the declaringIdentifier with `usedInAWith` info
      if (declaringIdentifier) {
        declaringIdentifier._usedInAWith = usedInAWith;
      }

      // Save the scope and `insideWith` info to our variable
      node._insideWith = insideWith;
      node.scope = scope;
    }
  });

  // For each variable node
  walkVariables(ast, {
    enter: function (node, parent) {
      // Pick the scope for the node
      var scope = node.scope;

      // Define the default info
      var info = {
        insideWith: node._insideWith,
        topLevel: SCOPE_INFO_TOP_LEVEL.NO,
        type: SCOPE_INFO_TYPES.UNDECLARED,
        usedInAWith: SCOPE_INFO_USED_IN_A_WITH.NO
      };

      // If there is a scope, find its declaring identifier
      var declaringIdentifier;
      if (scope) {
        declaringIdentifier = scope.identifiers[node.name];
      }

      if (scope === undefined || scope.node.type === 'Program') {
        info.topLevel = SCOPE_INFO_TOP_LEVEL.YES;
      }

      // If we hit an identifier, save the type and used in a with info
      if (declaringIdentifier) {
        info.usedInAWith = declaringIdentifier._usedInAWith;
        info.type = declaringIdentifier._scopeType;
      }

      // Save our info to the identifier
      node.scopeInfo = info;
    }
  });

  // Return our marked up AST
  return ast;
}

// Save constants to our export
ecmaVariableScope.SCOPE_INFO_INSIDE_WITH = SCOPE_INFO_INSIDE_WITH;
ecmaVariableScope.SCOPE_INFO_USED_IN_A_WITH = SCOPE_INFO_USED_IN_A_WITH;
ecmaVariableScope.SCOPE_INFO_TOP_LEVEL = SCOPE_INFO_TOP_LEVEL;
ecmaVariableScope.SCOPE_INFO_TYPES = SCOPE_INFO_TYPES;
ecmaVariableScope.SCOPE_TYPES = SCOPE_TYPES;


// Export our funtion
module.exports = ecmaVariableScope;
