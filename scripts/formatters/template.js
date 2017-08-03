'use strict'

const _ = require('lodash')
const Parser = require('htmlparser2').Parser
const indent = '  '
const space = 32
const lineBreak = '<!-- LINE BREAK -->'

const selfClosing = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]

let level = 0

function breakLine (line, indentation) {
  let output = ''
  let pos = 0

  for (let i = 0, len = line.length; i < len; i++, pos++) {
    const char = line[i]
    const code = char.charCodeAt()
    const shouldBreak = pos >= 60

    if (shouldBreak && code === space) {
      output += lineBreak
      pos = 0
    } else {
      output += char
    }
  }

  return output
    .split(lineBreak)
    .map((line, i) => (
      (i > 0)
        ? indentation + line.trim()
        : line.trim()
    ))
    .join('\n')
}

function writeAttrs (attrs, indentLevel) {
  const len = Object.keys(attrs).length
  const indentation = indent.repeat(indentLevel + 1)
  const vueAttrsRegExp = /^(\@|\:|v\-|ref|key|slot|is)/

  const styleIndent = len > 1
    ? indentation + indent
    : indentation

  let output = ''

  for (const key in attrs) {
    let value = attrs[key]

    if (key === 'style') {
      value = '\n' +
        value
          .trim()
          .split(';')
          .map((line) => (
            styleIndent + line.trim()
          ))
          .join(';\n')
    }

    if (key.match(vueAttrsRegExp)) {
      if (value) {
        output += `${'\n'}${indentation}${key}="${value}"`
      } else {
        output += `${'\n'}${indentation}${key}`
      }
    } else if (len > 1) {
      if (value) {
        output += `${'\n'}${indentation}${key}="${value}"`
      } else {
        output += `${'\n'}${indentation}${key}`
      }
    } else {
      if (value) {
        output += ` ${key}="${value}"`
      } else {
        output += (' ' + key)
      }
    }
  }

  return output
}

module.exports = (input, options) => {
  const output = []
  const selfClosingTags = _.union([].concat(options.selfClosingTags).concat(selfClosing))

  const pretty = new Parser({

    onprocessinginstruction: (name, value) => {
      output.push(`<${value}>` + '\n')
    },

    onopentag: (name, attrs) => {
      let isSelfClosing = false

      if (selfClosingTags.indexOf(name) > -1) {
        isSelfClosing = true
      }

      output.push((indent.repeat(level)) + '<' + name)
      output.push(writeAttrs(attrs, level) + (isSelfClosing ? ' />' : '>') + '\n')
      level++
    },

    ontext: (text) => {
      const len = text.trim().length
      const indentation = indent.repeat(level + 1)
      const lineLength = len + indentation

      if (len) {
        if (lineLength > 80) {
          output.push(indentation + breakLine(text, indentation) + '\n')
        } else {
          output.push(indentation + text.trim() + '\n')
        }
      }
    },

    onclosetag: (name) => {
      if (selfClosing.indexOf(name) < 0) {
        output.push((indent.repeat(--level)) + '</' + name + '>\n')
      } else {
        level--
      }
    }
  }, {
    xmlMode: true,
    lowerCaseTags: false,
  })

  pretty.write(input)
  pretty.end()

  return output.join('')
}
