**NO PRODUCTION PLUGIN: IT'S STILL UNDER DEVELOPMENT**

# [esformatter](https://github.com/millermedeiros/esformatter)-onevar

> esformatter plugin for enforcing one var statement per function scope

**Esformatter-onevar** is a plugin for [esformatter](https://github.com/millermedeiros/esformatter) meant for onevar enforcement in function scope. Recommended by Douglas Crockford in his [coding style guide](http://javascript.crockford.com/code.html).

Turn this:
```js
var foo = 'foo',
    bar = 'bar';

var hello = true,
    world = false;
    
for (var i = 0, l = 10; i < l; i++) {
	var chain = chain + ' ' + i;
}
```

into:
```js
var foo = 'foo',
    bar = 'bar',
    hello,
    world,
    i,
    l,
    chain;

hello = true;
world = false;
    
for (i = 0, l = 10; i < l; i++) {
	chain = chain + ' ' + i;
}
```

For more information see:
- The [jscs](http://catatron.com/node-jscs/) option - [disallowMultipleVarDecl](http://catatron.com/node-jscs/rules/disallow-multiple-var-decl/)

*For any other formatting (such as onevar placement, spacing and line wrapping) use esformatter or other plugins.*


## Installation

```sh
$ npm install esformatter-onevar --save-dev
```

## Config

Newest esformatter versions autoload plugins from your `node_modules` [See this](https://github.com/millermedeiros/esformatter#plugins)

Add to your esformatter config file:

```json
{
  "plugins": [
    "esformatter-onevar"
  ]
}
```

Or you can manually register your plugin:
```js
// register plugin
esformatter.register(require('esformatter-onevar'));
```

## Usage

```js
var fs = require('fs');
var esformatter = require('esformatter');
//register plugin manually
esformatter.register(require('esformatter-onevar'));

var str = fs.readFileSync('someKewlFile.js').toString();
var output = esformatter.format(str);
//-> output will now contain the formatted string
```

See [esformatter](https://github.com/millermedeiros/esformatter) for more options and further usage.

## License

MIT ©2014 **Evan Vosberg**
