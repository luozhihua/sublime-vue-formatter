describe('asi', function() {
  var
    esformatter = require('esformatter'),
    asi = require('../'),
    fs = require('fs'),
    expect = require('chai').expect,

    source = function(file) {
      return fs.readFileSync(__dirname + '/fixtures/' + file).toString()
    },

    check = function(name) {
      expect(esformatter.format(source('input/' + name + '.js'))).to.equal(source('output/' + name + '.js'))
    }

  before(function() {
    esformatter.register(asi)
  })

  describe('when asi applies', function() {
    it('should be removed from variable declarations', function() {
      check('variable-declaration')
    })

    it('should be removed from return statements', function() {
      check('return-statement')
    })

    it('should be removed from expression statements', function() {
      check('expression-statement')
    })

    it('should be removed from break statements', function() {
      check('break-statement')
    })

    it('should be removed from continue statements', function() {
      check('continue-statement')
    })

    it('should remove semicolons at the end of a file', function() {
      check('end-of-file')
    })

    it('should remove semicolons from the last statement in a one-line function', function() {
      check('one-line-function')
    })
  })
})