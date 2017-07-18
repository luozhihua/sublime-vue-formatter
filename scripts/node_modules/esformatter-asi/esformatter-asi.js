function isWhitespace(token) {
  return token && ~['WhiteSpace', 'Indent'].indexOf(token.type)
}

function isComment(token) {
  return token && ~['LineComment', 'BlockComment'].indexOf(token.type)
}

function isSemicolon(token) {
  return token && token.type === 'Punctuator' && token.value === ';'
}

exports.nodeAfter = function(node) {
  if (~['ExpressionStatement', 'VariableDeclaration', 'ReturnStatement', 'ContinueStatement', 'BreakStatement'].indexOf(node.type) &&
      isSemicolon(node.endToken)) {
    var tokenItr = node.endToken.next,
        semicolonToken = node.endToken,
        blockCommentHadLineBreak = false

    while (isWhitespace(tokenItr) || isComment(tokenItr)) {
      tokenItr = tokenItr.next
      blockCommentHadLineBreak = blockCommentHadLineBreak || tokenItr.type === 'BlockComment' && tokenItr.value && tokenItr.value.indexOf('\n') >= 0
    }

    if (!tokenItr || tokenItr.type === 'LineBreak' || blockCommentHadLineBreak || (tokenItr.type === 'Punctuator' && tokenItr.value === '}')) {
      var lineBreakToken = tokenItr
      if (node.next && node.next.type === 'ExpressionStatement') {
        tokenItr = node.next.startToken
        while (isWhitespace(tokenItr) || isComment(tokenItr)) {
          tokenItr = tokenItr.next
        }

        if (tokenItr && tokenItr.type === 'Punctuator' && ~['[', '(', '+', '*', '/', '-', ',', '.'].indexOf(tokenItr.value)) {
          // ASI doesn't apply to this line as removing the semicolon would cause the lines to combine to one expression
          return
        }
      }

      if (semicolonToken.prev) semicolonToken.prev.next = semicolonToken.next
      if (semicolonToken.next) semicolonToken.next.prev = semicolonToken.prev
      node.endToken = lineBreakToken
    }
  }
}