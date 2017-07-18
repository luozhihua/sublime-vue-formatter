// Load in our dependencies
var fs = require('fs');

// Resolve our filepaths
var dest = require.resolve('../');
var src = dest.replace('.json', '.comments.js');

// Load our source file
var inputObj = require(src);

// Write to destination file
var output = JSON.stringify(inputObj, null, 2);
fs.writeFileSync(dest, output, 'utf8');
