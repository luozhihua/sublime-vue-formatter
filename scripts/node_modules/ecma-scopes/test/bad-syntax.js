// Load in dependencies
var assert = require('assert');
var fs = require('fs');
var esprima = require('esprima-fb');
var glob = require('glob');
var ecmaScopes = require('../');
var scriptUtils = require('./utils/script');

// Define our tests
// DEV: For sanity we will parse the scripts with bad syntax
// DEV: This will help us detect if `esprima` starts supporting something unexpected
var dir = __dirname + '/test-files/';
var files = glob.sync('bad-syntax/*', {cwd: dir});
files.forEach(function handleBadSyntaxFile (_filepath) {
  describe('Bad syntax file "' + _filepath + '"', function () {
    // Construct full filepath
    // DEV: We use a `cwd` to make describe names easier to read
    var filepath = dir + _filepath;

    it('cannot be parsed', function () {
      // Attempt to parse the script
      var script = fs.readFileSync(filepath, 'utf8');
      var err;
      try {
        esprima.parse(script);
      // Upon error, save it
      } catch (_err) {
        err = _err;
      }

      // If there was no error, complain
      assert.notEqual(err, undefined, 'Expected `err` to be defined but it was `undefined`');
    });
  });
});
