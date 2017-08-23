# Vue components, HTML/Pug(Jade), CSS/Less/Sass, ES5/ES6/ES7 and JSON code formatter for Sublime Text 2 and 3 via node.js
#### [Sublime Text 3](http://www.sublimetext.com/3)
#### [esformatter](https://www.npmjs.com/package/esformatter)
#### [pug-beautify](https://www.npmjs.com/package/pug-beautify)
#### [JS-beautify](https://github.com/einars/js-beautify)
#### [Node.js download](http://nodejs.org/#download)

## About
This is a Sublime Text 2 and 3 plugin allowing you to format your HTML/Pug(Jade), CSS/Less/Sass, ES5/ES6/ES7 and JSON code. It based on [esformatter](https://www.npmjs.com/package/esformatter)、 [js-beautify](https://www.npmjs.com/package/js-beautify) and [pug-beautify](https://www.npmjs.com/package/pug-beautify). The formatters are written in JavaScript, so you'll need something (node.js) to interpret JavaScript code outside the browser.

This will work with either VUE Components, HTML/Pug(Jade), CSS/LESS/SCSS, ES5/ES6/ES7 and JSON files.

## Installation
First of all, be sure you have [node.js](http://nodejs.org/#download) installed in order to run the beautifier. After you've installed node.js, you will need to setup this plugin.
Each OS has a different `Packages` folder required by Sublime Text. Open it via Preferences -> Browse Packages, and copy this repository contents to the `Sublime-VueNextFormatter` folder there.

### Manually
Make sure you use the right Sublime Text folder. For example, on OS X, packages for version 2 are in `~/Library/Application\ Support/Sublime\ Text\ 2`, while version 3 is labeled `~/Library/Application\ Support/Sublime\ Text\ 3`.

These are for Sublime Text 3:

#### Mac
`git clone https://github.com/luozhihua/sublime-vue-formatter ~/Library/Application\ Support/Sublime\ Text\ 3/Packages/sublime-vue-formatter`

#### Linux
`git clone https://github.com/luozhihua/sublime-vue-formatter ~/.config/sublime-text-3/Packages/sublime-vue-formatter`

#### Windows
`git clone https://github.com/luozhihua/sublime-vue-formatter %APPDATA%/Sublime\ Text\ 3/Packages/sublime-vue-formatter`

## Usage
Tools -> Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and type `vuenextformatter`.

-- or --

`Ctrl+Shift+H` (or `Cmd+Shift+H` if you're on a Mac).

-- or --

Right click in the current buffer and select `Vue Next Formatter` -> `Formatter Code`.

-- or --

Open a VUE Component, HTML, CSS or ES/JavaScript file, pop out the console in Sublime Text from View -> Show Console, and type `view.run_command("vuenextformatter")`.

Writing commands in the console is ugly. Set up your own key combo for this, by going to Preferences -> Key Bindings - User, and adding a command in that array: `{ "keys": ["super+shift+h"], "command": "vuenextformatter" }`. You can use any other command you want, thought most of them are already taken.

## Oh noez, command not found!
If you get an error `sh: node: command not found` or similar, you don't have `node` in the right path. Try setting the absolute path to node in `VueNextFormatter.sublime-settings`.

* `Ctrl+Shift+P` or `Cmd+Shift+P` in Linux/Windows/OS X
* type `vuenextformatter`, select `Set node Path`

Simply using `node` without specifying a path sometimes doesn't work :(

For example, on Linux the path could be in `/home/<user>/.nvm/<node version>/bin/node`.

On Windows, the absolute path to node.exe *must* use forward slashes. Must include nodejs.exe, like so: `C:/Program Files (x86)/Nodejs/node.exe`

### Be very careful on Debian!
Depending on your distribution and default package sources, `apt-get install node` (for example) *will not* install node.js, contrary to all human common sense and popular belief. You want `nodejs` instead. Best thing is to make it yourself from http://nodejs.org/#download.

## Beautify on Save
To beautify your code when saving the document, set the `format_on_save` setting to `true` in `VueNextFormatter.sublime-settings`:

* `Ctrl+Shift+P` or `Cmd+Shift+P` in Linux/Windows/OS X
* type `vuenextformatter`, select `Set Plugin Options`

## Preserving selection after formatting
To stop beautifying only the selected text, set the `format_selection_only` setting to `false` in `VueNextFormatter.sublime-settings`.

## Ignoring certain blocks of code
Parts of code that shouldn't be formatted can be ignored with `beautify preserve` and `beautify ignore` directive comments. This allows you to tell the beautifier to preserve the formtatting of or completely ignore part of a file. The example inputs below will remain changed after beautification.


Use `preserve` when the content is javascript, but you don't want it reformatted.
```js
/* beautify preserve:start */
{
    browserName: 'internet explorer',
    platform:    'Windows 7',
    version:     '8'
}
/* beautify preserve:end */
```

Use `ignore` when the content is not parsable as javascript.
```js
var a = 1;
/* beautify ignore:start */
 {This is some strange{template language{using open-braces?
/* beautify ignore:end */
```

## Using your own .vueformatterrc options
The plugin looks for a `.vueformatterrc` file in the following directories:

1. The same directory as the source file you're prettifying.
2. The source file's parent directories.
3. Your home folder.
4. Your personal Sublime settings folder.

When one is found, it stops searching, and it uses those options along with the default ones.

These are the default options used by this plugin:
```javascript
{
    // The plugin looks for a .jsbeautifyrc file in the same directory as the
    // source file you're prettifying (or any directory above if it doesn't exist,
    // or in your home folder if everything else fails) and uses those options
    // along the default ones.

    // Details: https://github.com/victorporof/Sublime-HTMLPrettify#using-your-own-jsbeautifyrc-options
    // Documentation: https://github.com/einars/js-beautify/
    "vue": {
        "allowed_file_extensions": ["vue"]
    },
    "es": {
        "indent": {
            "value": "  "
        },
        "lineBreak": {
            "before": {
                "FunctionDeclaration": ">=1",
                "FunctionDeclarationOpeningBrace": 0,
                "FunctionDeclarationClosingBrace": 1,
                "ArrayExpressionClosing": 1
            },
            "after": {
                "FunctionDeclaration": ">=1",
                "FunctionDeclarationOpeningBrace": 1,
                "ArrayExpressionOpening": 1,
                "ArrayExpressionComma": 1
            }
        },
        "whiteSpace": {
            "before": {
                "FunctionExpressionOpeningBrace": 1,
                "FunctionExpressionClosingBrace": 1
            },
            "after": {
                "FunctionExpressionOpeningBrace": 1,
                "FunctionExpressionClosingBrace": -1
            }
        },
        // executes plugins in the same order as listed in the Array
        "plugins": [
            "esformatter-dot-notation",
            "esformatter-asi",
            "esformatter-equals",
            "esformatter-quotes",
            "esformatter-braces",
            "esformatter-spaced-lined-comment",
            "esformatter-semicolons",
            "esformatter-remove-trailing-commas",
            "esformatter-parseint"
        ],
        "quotes": {
            "type": "single",
            "avoidEscape": false
        }
    },
    "html": {
        "allowed_file_extensions": ["htm", "html", "xhtml", "shtml", "xml", "svg", "vuetemplate"],
        "brace_style": "collapse", // [collapse|expand|end-expand|none] Put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line, or attempt to keep them where they are
        "end_with_newline": false, // End output with newline
        "indent_char": " ", // Indentation character
        "indent_handlebars": false, // e.g. {{#foo}}, {{/foo}}
        "indent_inner_html": false, // Indent <head> and <body> sections
        "indent_scripts": "keep", // [keep|separate|normal]
        "indent_size": 2, // Indentation size
        "max_preserve_newlines": 0, // Maximum number of line breaks to be preserved in one chunk (0 disables)
        "preserve_newlines": true, // Whether existing line breaks before elements should be preserved (only works before elements, not inside tags or for text)
        "unformatted": ["a", "span", "img", "code", "pre", "sub", "sup", "em", "strong", "b", "i", "u", "strike", "big", "small", "pre", "h1", "h2", "h3", "h4", "h5", "h6"], // List of tags that should not be reformatted
        "wrap_line_length": 0 // Lines should wrap at next opportunity after this number of characters (0 disables)
    },
    "css": {
        "allowed_file_extensions": ["css", "scss", "sass", "less"],
        "end_with_newline": false, // End output with newline
        "indent_char": " ", // Indentation character
        "indent_size": 2, // Indentation size
        "newline_between_rules": true, // Add a new line after every css rule
        "selector_separator": " ",
        "selector_separator_newline": true // Separate selectors with newline or not (e.g. "a,\nbr" or "a, br")
    },
    "js": {
        "allowed_file_extensions": ["js", "json", "jshintrc", "jsbeautifyrc"],

        // Set brace_style
        //  collapse: (old default) Put braces on the same line as control statements
        //  collapse-preserve-inline: (new default) Same as collapse but better support for ES6 destructuring and other features. https://github.com/victorporof/Sublime-HTMLPrettify/issues/231
        //  expand: Put braces on own line (Allman / ANSI style)
        //  end-expand: Put end braces on own line
        //  none: Keep them where they are
        "brace_style": "collapse-preserve-inline",

        "break_chained_methods": false, // Break chained method calls across subsequent lines
        "e4x": false, // Pass E4X xml literals through untouched
        "end_with_newline": false, // End output with newline
        "indent_char": " ", // Indentation character
        "indent_level": 0, // Initial indentation level
        "indent_size": 2, // Indentation size
        "indent_with_tabs": false, // Indent with tabs, overrides `indent_size` and `indent_char`
        "jslint_happy": false, // If true, then jslint-stricter mode is enforced
        "keep_array_indentation": false, // Preserve array indentation
        "keep_function_indentation": false, // Preserve function indentation
        "max_preserve_newlines": 0, // Maximum number of line breaks to be preserved in one chunk (0 disables)
        "preserve_newlines": true, // Whether existing line breaks should be preserved
        "space_after_anon_function": false, // Should the space before an anonymous function's parens be added, "function()" vs "function ()"
        "space_before_conditional": true, // Should the space before conditional statement be added, "if(true)" vs "if (true)"
        "space_in_empty_paren": false, // Add padding spaces within empty paren, "f()" vs "f( )"
        "space_in_paren": false, // Add padding spaces within paren, ie. f( a, b )
        "unescape_strings": false, // Should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"
        "wrap_line_length": 0 // Lines should wrap at next opportunity after this number of characters (0 disables)
    }
}
```

And here's how a `.vueformatterrc` file in your home folder could look like:
```javascript
{
  "html": {
    "indent_char": " ",
    "indent_size": 2
  },
  "js": {
    "indent_char": " ",
    "indent_size": 2
  }
}
```

See documentation for [JS](https://github.com/einars/js-beautify/#options), or [CSS and HTML](https://github.com/einars/js-beautify/#css--html).

A few persistent options are always applied from a `.vueformatterrc` file located in the same directory as the plugin, if not overwritten by your own `.vueformatterrc` file. Those are defined [here](https://github.com/luozhihua/Sublime-VueNextFormatter/blob/master/.vueformatterrc). You can safely add stuff to that json file if you want:

* `Ctrl+Shift+P` or `Cmd+Shift+P` in Linux/Windows/OS X
* type `vuenextformatter`, select `Set Prettify Preferences`

## Specifying your own file extensions
To add different file extensions use `allowed_file_extensions` in the `.vueformatterrc` file:
```javascript
{
  "vue": {
    "allowed_file_extensions": ["vue"]
  },
  "html": {
    "allowed_file_extensions": ["html", "shtml", "aspx", "master", "xml", "xhtml"]
  },
  "css": {
    "allowed_file_extensions": ["css", "scss", "sass", "less"]
  },
  "js": {
    "allowed_file_extensions": ["js", "json", "jshintrc", "vueformatterrc"]
  }
}
```

Thank you!
