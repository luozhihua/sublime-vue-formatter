# ecma-scopes [![Build status](https://travis-ci.org/twolfson/ecma-scopes.png?branch=master)](https://travis-ci.org/twolfson/ecma-scopes)

Listing of block and lexical scope names for [ECMAScript AST][]

We are using the tokens output by [`esprima-fb`][], a fork of [`esprima`][] with ES6 support.

This was created to make detecting scope boundaries easier and well tested. It is a part of the [`esformatter-phonetic`][] project, an [`esformatter`][] plugin that helps with renaming obfuscated variabes to more recognizable ones.

[ECMAScript AST]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
[`esprima-fb`]: https://github.com/facebook/esprima
[`esprima`]: http://esprima.org/
[`esformatter-phonetic`]: https://github.com/twolfson/esformatter-phonetic
[`esformatter`]: https://github.com/millermedeiros/esformatter

## Getting Started
Install the module with: `npm install ecma-scopes`

```js
var ecmaScopes = require('ecma-scopes');
ecmaScopes.lexical;
// ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]
ecmaScopes.block;
// ["BlockStatement", "ForStatement", "ForInStatement", "ForOfStatement", "CatchClause", "ComprehensionExpression"]
```

Explanations of [lexical][] and [block][] scopes/tokens are available in the [Documentation section](#documentation).

[lexical]: #exportslexical
[block]: #exportsblock

## Documentation
This library is very lightweight. The annoying part is going through the spec, picking out what works, and testing rigorously. We have done all of that for you.

We provide `exports.lexical` and `exports.block`, lexical and block scopes respectively.

We do not include [`Program`][] in either because depending on your usage, you may want or not want it. Since it is easier to add onto an array, we have chosen to leave it out.

```js
var lexicalWithProgram = ecmaScopes.lexical.slice();
lexicalWithProgram.push('Program');
```

[`Program`]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Programs

### `exports.lexical`
Lexical scoping is JavaScript's default way for handling variable scope. This comes into effect when `var` is used, function `arguments`, function name's, catch `arguments`, and probably some more (sorry for an incomplete list).

Functions reference: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions

With our research, we found the following tokens to manage lexical scope:

- `FunctionDeclaration`, function declared as a statement
    - Example: `function main() { var item; }`
        - `main` is the function and `hello` is a lexically scoped variable inside of `main`
- `FunctionExpression`, function set to a variable
    - Example: `var main = function () { var item; }`
        - `main` is the function and `hello` is a lexically scoped variable inside of `main`
- `ArrowFunctionExpression`
    - **Warning:** Inside of the SpiderMonkey API documenttion, this is `ArrowExpression`. However `esprima-fb` implements it as `ArrowFunctionExpression`
    - Example: `(item) => item;`
        - `item` is defined as an input parameter and remains scoped within the function

### `exports.block`
Block scoping is a new form of scoping performed with a `let` keyword. Instead of variables being scoped to functions, they are now scoped to block statements (e.g. any time we are between braces `{ ... }`. For example, an `if` statement using `let` does not expose the variable to the rest of the program.

```js
if (true) {
  let item;
}
// item is not declared nor defined
```

In its simplest form, the following is valid and block scoped:

```js
{ let item; }
```

In addition to braces, loops that allow variable declarations scope `let` to their corresponding `BlockStatement` (section between braces):

```js
for (let item = 'hello', i = 0; i < 10; i++) {
  item; // 'hello'
}
// item is not declared nor defined
```

Statement reference: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements

With our research, we found the following tokens to manage block scope:

- `BlockStatement`, section of braces
    - Example: `{ let item; }`
        - `item` is scoped to the braces and not exposed outside of them
- `ForStatement`, `for` loop
    - Example: `for (let item; false; false) { /* Code goes here */ }`
        - `item` is accessible within the loop and between the parentheses but not outside of the loop
- `ForInStatement`, `for in` loop (iterates over each of the keys of an object)
    - Example: `var obj = {hello: 'world'}; for (let key in obj) { /* Code goes here */ }`
        - `key` is accessible within the loop and between the parentheses but not outside of the loop
- `ForOfStatement`, `for of` loop (iterates over each of the values of an array)
    - Example: `var arr = ['hello', 'world']; for (let val of arr) { /* Code goes here */ }`
        - `val` is accessible within the loop and between the parentheses but not outside of the loop
- `CatchClause`, `catch` handler of a `try/catch/finally`
    - Example: `try { /* ... */ } catch (err) { /* ... */ }`
        - `err` is accessible within the `catch's BlockStatement` but not outside of it
- `ComprehensionExpression`, array comprehension (generate an array from another array)
    - Example: `var arr1 = [1], arr2 = [val + 1 for (val of arr1)];`
        - `val` is accessible within the comprehension (between the brackets `[ ... ]`) but not outside of it

### Filesystem
If you would like to discover more by reading the source code, here are their corresponding purposes/information:

- [`lib/ecma-scopes.comments.js`][] - Commented form of scopes we export with links to references
- [`test/block-scopes.js`][] - Tests against block scope tokens
    - Has additional tests to verify that [`BlockStatement`][Statements] covers [`IfStatement`][Statements], [`SwitchStatement`][Statements], and anything that can be braceless
- [`test/lexical-scopes.js`][] - Tests against lexical scope tokens (e.g. [`FunctionDeclaration`][Functions])
- [`test/test-files/block-*.js`][] - Example usage of a block token (e.g. [`block-BlockStatement.js`][] for [`BlockStatement`][Statements])
- [`test/test-files/lexical-*.js`][] - Example usage of a lexical token (e.g. [`lexical-ForStatement.js`][] for [`ForStatement`][Statements])

[`lib/`]: lib/
[`test/`]: test/
[`lib/ecma-scopes.comments.js`]: lib/ecma-scopes.comments.js
[`test/block-scopes.js`]: test/block-scopes.js
[`test/lexical-scopes.js`]: test/lexical-scopes.js
[`test/test-files/block-*.js`]: test/test-files/
[`block-BlockStatement.js`]: test/test-files/block-BlockStatement.js
[`test/test-files/lexical-*.js`]: test/test-files/
[`lexical-ForStatement.js`]: test/test-files/lexical-ForStatement.js
[Functions]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Functions
[Statements]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements

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
