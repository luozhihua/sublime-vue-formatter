'use strict';

// DEV: This is impossible because `with` cannot be used in strict mode
// DEV: and it looks like `let` requires strict mode to be acceptable
// DEV: However, we will prob require braces like `if` so follow its pattern
var obj = {};
with (obj) {
  let block = 'hello';
  var lexical = 'world';
}
