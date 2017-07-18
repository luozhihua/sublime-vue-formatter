//jshint node:true, eqnull:true
/*global describe, it, before*/
'use strict';

var esformatter = require('esformatter');
var fs = require('fs');
var equals = require('../');
var expect = require('chai').expect;

describe('compare input/output', function () {
  
  var file;
  before(function () {
    file = getFile('input.js');
    esformatter.register(equals);
  });

  describe('double equals', function () {
    it('should convert double equals to triple equals', function () {
      var output = esformatter.format(file, {
        equals: {
          equalType: 'triple'
        }
      });
      expect(output).to.be.eql(getFile('output.js'));
    });
  });
  
});

function getFile(name) {
  return fs.readFileSync('test/compare/' + name).toString();
}
