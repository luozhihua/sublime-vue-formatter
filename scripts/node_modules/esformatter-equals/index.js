var tk = require('rocambole-token');

exports.tokenAfter = function (token) {
  if (token && token.type === 'Punctuator') {
    if (token.value === '==') {
      token.value = '===';
    }
    if (token.value === '!=') {
      token.value = '!==';
    }
  }
}
