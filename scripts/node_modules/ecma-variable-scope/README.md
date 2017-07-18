# ecma-variable-scope [![Build status](https://travis-ci.org/twolfson/ecma-variable-scope.png?branch=master)](https://travis-ci.org/twolfson/ecma-variable-scope) [![Coverage Status](https://img.shields.io/coveralls/twolfson/ecma-variable-scope.svg)](https://coveralls.io/r/twolfson/ecma-variable-scope?branch=master)

AST utility to collect scope info for variables

Scope detection is hard, especially when `with` exists. This utility extracts all relevant info for making decisions. This project was built as part of [`esformatter-phonetic`][], a [`esformatter`][] plugin that makes obfuscated variable names more comprehensible.

[`esformatter-phonetic`]: https://github.com/twolfson/esformatter-phonetic
[`esformatter`]: https://github.com/millermedeiros/esformatter

**Features:**

- Detect `with` usage
- Does not mark `labels`
- Support for `let` and `const`
- Support for destructured variables (e.g. `var {hello, world} = obj;`)
- Support for arrow expressions (e.g. `(hello) => hello.world`)

## Getting Started
Install the module with: `npm install ecma-variable-scope`

```js
// Gather an AST to analyze
var esprima = require('esprima');
var ecmaVariableScope = require('ecma-variable-scope');
var ast = esprima.parse([
  'function logger(str) {',
    'console.log(str);',
  '}'
].join('\n'));

// Determine the scope of a variable
ecmaVariableScope(ast);
ast.body[0].id;
/*
// `logger` variable
  scope:
   { type: 'lexical',
     node: Program,
     parent: undefined,
     identifiers: { logger: [Circular] },
     children: [ [Object] ] },
  scopeInfo:
   { insideWith: false,
     topLevel: true,
     type: 'lexical',
     usedInAWith: false }
*/

ast.body[0].body.body[0].expression.callee.object;
/*
// `console` variable
  scope: undefined,
  scopeInfo:
   { insideWith: false,
     topLevel: true,
     type: 'undeclared',
     usedInAWith: false }
*/
```

## Documentation
`ecma-variable-scope` exports `ecmaVariableScope` as its `module.exports`.

### `ecmaVariableScope(ast)`
Walk an abstract syntax tree and add `scope` and `scopeInfo` properties to appropriate nodes.

- ast `Object` - Abstract syntax tree to walk over/mutate
    - We have developed against [`esprima`][] which matches the [Spidermonkey API][]

[`esprima`]: http://esprima.org/
[Spidermonkey API]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API

**Returns:**

We return the same `ast` variable but with the addition of `scope` and `scopeInfo` nodes on `Identifiers` that are variables.

```js
// `scope` and `scopeInfo` will be defined for all `hello`, `world`, and `moon` references
function hello(world) {
  var moon;
  hello(world, moon);
}

// `log` is an `Identifier` but will not have `scope` and `scopeInfo`
console.log('hello');
```

#### `scope`
Object containing information about the outermost scope a variable can be accessed from:

- type `String` - Variant of scope that a variable is in
    - This can be `lexical` or `block`. When we traverse `scope.parent`, we can run into `with` but this is not directly found from `node.scope`.
    - For example in `function a() { var b; }`, we have `type: 'lexical'` for `b's scope`.
    - We make these values available via `exports.SCOPE_TYPES.LEXICAL` (`'lexical'`), `exports.SCOPE_TYPES.WITH` (`'with'`), and`exports.SCOPE_TYPES.BLOCK` (`'block'`).
- node `Object<Node>` - AST node that corresponds to the top of scope
    - For example in `function a() { var b; }`, we have `b.scope.node === a`
- parent `Object<Scope>|undefined` - Next scope containing the current `scope`. This can be any other type (e.g. `lexical`, `block`, `with`).
- identifiers `Object` - Map from identifier name to `Identifier` reference of variables declared within this scope
    - For example in `function a() { var b; }`, we have `a.scope.identifiers === {b: b's Identifier}`
    - This will not contain identifiers within child scopes
- children `Scope[]` - Array of child scopes contained by this scope
    - For example in `function a() { }`, `Program's scope` will contain `a.scope`

It is possible for an `Identifier` to have `scopeInfo` but not `scope`. For example, `console` is defined as a global outside of a script context. We cannot determine if it is defined or not and make the decision to leave it as `undefined`.

#### `scopeInfo`
Object containing information about the variable itself:

- insideWith `Boolean` - Indicator of whether a variable has a `with` between its declaration and its containing scope
    - `true` if there was a `with`,`false` if there was not one
    - For example in `function a() { with (window) { document(); } }`, we have `a.insideWith === false` and `document.insideWith === true`.
    - We provide `exports.SCOPE_INFO_INSIDE_WITH.YES` (`true)` and  `exports.SCOPE_INFO_INSIDE_WITH.NO` (`false`).
- toplevel `Boolean` - Indicator of whether a variable was declared in the `Program` scope or not
    - `true` if it was, `false` if it was not
    - For example in `function a() { var b; }`, we have `a.scopeInfo.topLevel === true` and `b.scopeInfo.topLevel === false`.
    - We provide `exports.SCOPE_INFO_TOP_LEVEL.YES` (`true`) and  `exports.SCOPE_INFO_TOP_LEVEL.NO` (`false`).
- type `String` - Reference to the type of scope given to a variable
    - This can vary from the containing scope (e.g. a `let` is scoped to a `function`; `block` to `lexical`)
    - This can be `lexical` (e.g. `function`), `block` (e.g. `for` loop), or `undeclared` (not declared in any containing scope)
    - For example in `function a() { let b; }`, we have `a.scopeInfo.type === 'lexical'` and `b.scopeInfo.type === 'block'`.
    - We provide `exports.SCOPE_INFO_TYPES.LEXICAL` (`'lexical'`), `exports.SCOPE_INFO_TYPES.BLOCK` (`'block'`), and `exports.SCOPE_INFO_TYPES.UNDECLARED` (`'undeclared'`).
- usedInAWith `Boolean` - Indicator of whether a variable has ever been referenced inside a `with` in its entire scope
    - `true` if it has been, `false` if it has not
    - For example in `var hello; var obj = {}; with (obj) { hello; } }`, we have `hello1.usedInAWith === true` and `obj1.usedInAWith === false`.
    - We provide `exports.SCOPE_INFO_USED_IN_A_WITH.YES` (`true)` and  `exports.SCOPE_INFO_USED_IN_A_WITH.NO` (`false`).

> If you would like to determine if a variable can be renamed without causing other problems, use `usedInAWith` (`false`), `topLevel` (`false`), and `type` (`lexical`/`block`).

#### Unstable
There are a few extra properties that are thrown in for preparation of `scope` and `scopeInfo`. They could be replaced with a better algorithm but are there if you need them. If you are using them, please [let us know via an issue][create-issue].

[create-issue]: https://github.com/twolfson/ecma-variable-scope/issues/new

- `_nearestScope` - Present on every node and points to the closest scope of any type up its parents. This is useful for jumping through `block` scopes until reaching a `lexical` one.
- `_scopeType` - Stored on initial declarations of identifiers. This is the same as `scopeInfo.type` but needs to be preserved before `scopeInfo` is generated.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Unlicense
As of Nov 04 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
