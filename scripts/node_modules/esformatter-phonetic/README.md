# esformatter-phonetic [![Build status](https://travis-ci.org/twolfson/esformatter-phonetic.png?branch=master)](https://travis-ci.org/twolfson/esformatter-phonetic)

[Esformatter][`esformatter`] plugin that renames variables and functions to pronounceable names

This was built to make reading obfuscated scripts easier (e.g. expand a single character variable to a full name, `a` -> `apple`). It was inspired by [`beautify-with-words`][] but we wanted to leverage other [`esformatter`][] plugins.

[`beautify-with-words`]: https://github.com/zertosh/beautify-with-words
[`esformatter`]: https://github.com/millermedeiros/esformatter

## Getting Started
Install the module with: `npm install esformatter-phonetic`

Then, register it as a plugin and format your JS:

```js
// Load and register our plugin
var esformatter = require('esformatter');
var esformatterPhonetic = require('esformatter-phonetic');
esformatter.register(esformatterPhonetic);

// Format our code
esformatter.format([
  'function hello() {',
    'var a = \'hello\';',
    'console.log(a);',
  '}'
].join('\n'));
/*
function hello() {
  var kusoce = 'hello';
  console.log(kusoce);
}
*/
```

Alternatively, load it via `format` or `.esformatter`:

```js
{
  plugins: [
    'esformatter-phonetic'
  ]
}
```

## Documentation
`esformatter-phonetic` exposes `exports.transform` for consumption by `esformatter`.

### Options
We allow for options via a `phonetic` key in your `esformatter` options.

- Any option provided by [`phonetic`][] (e.g. `syllables`, `phoneticSimplicity`)
- baseSeed `String|Number` - Starting point for generating phonetic names.
    - If specified, we will start here and add `1` to the value (i.e. for numbers, it will increment. for strings, it will concatenate).
- renameTopLevel `Boolean` - Flag to rename variables defined at top level or not
    - This is useful because in browser contexts, these variables are written to the `window` object.
    - By default, this is `false` (no rename occurs).
- renamePerScope `Boolean` - Flag to rename variables on a per-scope basis
    - This supports using different names for `lexical` and `block` scoped variables.
    - This is useful for minified scripts that reuse names for variables to save space.
        - The downside is it loses potential shared context if the minifier did not leverage that optimization.
    - By default, this is `false` (common name used between scopes).

[`phonetic`]: https://github.com/TomFrost/node-phonetic

### `esformatterPhonetic.transform(ast)`
Walk the [AST][] and rename `variables` that do not touch a `with` and have been `declared`.

**Warning: This mutates the AST in place**

- ast `AbstractSyntaxTree` - Abstract syntax tree provided by `esformatter`

[AST]: http://en.wikipedia.org/wiki/Abstract_syntax_tree

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Unlicense
As of Nov 03 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
