var esformatter = require('esformatter');
var esformatterPhonetic = require('../');
esformatter.register(esformatterPhonetic);

console.log(esformatter.format([
  'function hello() {',
    'var a = \'hello\';',
    'console.log(a);',
  '}'
].join('\n')));
