/*jslint node: true, nomen: true*/

'use strict';

var estraverse = require('estraverse'),
    rocamboleToken = require('rocambole-token'),
    braces = require('esformatter-braces').nodeBefore,
    ctx,
    Context;

Context = function Context() {
    this.constructor.apply(this, arguments);
};

Context.prototype.constructor = function Context(node, parent) {
    this.node(node);
    this.parent(parent);

    this._firstVars = null;
    this._declaredVars = [];

    if (this.node().params) {
        this.node().params.forEach(function (param) {
            this.declareVar({
                id: {
                    type: 'Identifier',
                    name: param.name
                }
            });
        }, this);
    }
};

// Object setter/getter
Context.prototype.node = function (node) {
    if (arguments.length === 1) {
        this._node = node;
    }

    return this._node;
};

Context.prototype.parent = function parent(node) {
    if (arguments.length === 1) {
        this._parent = node;
    }

    return this._parent;
};

Context.prototype.body = function body() {
    return this.node().type === 'Program' ? this.node().body : this.node().body.body;
};

Context.prototype.firstVars = function firstVars(node) {
    if (arguments.length === 1) {
        this._firstVars = node;
    }

    return this._firstVars;
};

// Booelean getter
Context.prototype.isBlock = function isBlock(node) {
    return node.type === 'Program' || node.type === 'BlockStatement';
};

// Booelean getter
Context.prototype.isScopeBlock = function isScopeBlock(node) {
    return node.type === 'Program' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression';
};

Context.prototype.isScopeBlockChild = function isScopeBlockChild(node) {
    if (node.parent.type === 'Program') {
        return true;
    }

    if (node.parent.type === 'BlockStatement' && node.parent.parent === this.node()) {
        return true;
    }

    return false;
};

Context.prototype.isFor = function isFor(node) {
    return node.type === 'ForStatement';
};

Context.prototype.isForin = function isFor(node) {
    return node.type === 'ForInStatement';
};

Context.prototype.isVars = function isVars(node) {
    return node.type === 'VariableDeclaration';
};

Context.prototype.isFirstVars = function isFirstVars(node) {
    return this._firstVars === node;
};

Context.prototype.isVarDeclared = function isVarDeclared(varname) {
    return this._declaredVars.indexOf(varname) !== -1;
};

// Methods
Context.prototype.declareVar = function declareVar(node) {
    if (!this.isVarDeclared(node.id.name)) {
        this._declaredVars.push(node.id.name);
    }
};

Context.prototype.createFirstVars = function () {
    var startToken, endToken;

    // Tokens for variable list
    startToken = rocamboleToken.after(this.node().body.startToken, {
        type: 'Keyword',
        value: 'var'
    });

    endToken = rocamboleToken.after(startToken, {
        type: 'Punctuator',
        value: ';'
    });

    // Create a variable declarations node as the first one
    this.firstVars({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'var',
        parent: this.node(),
        prev: undefined,
        next: undefined,
        depth: this.body().depth + 1,
        startToken: startToken,
        endToken: endToken
    });

    // Set references
    this.firstVars().next = this.body()[0];
    this.body()[0].prev = this.firstVars();

    this.body().unshift(this.firstVars());
};

Context.prototype.addToFirstVars = function addToFirstVars(node) {
    // Skip if it's already declared
    if (this.isVarDeclared(node.id.name)) {
        return;
    }

    var firstVars = this.firstVars(),
        declarations = firstVars.declarations,
        declarationLast = declarations[declarations.length - 1],
        varNode,
        idNode,
        idToken,
        separatorToken;

    if (declarationLast) {
        // Comma token for variable list
        separatorToken = rocamboleToken.after(declarationLast.endToken, {
            type: 'Punctuator',
            value: ','
        });

        // Comma token for variable list
        separatorToken = rocamboleToken.after(separatorToken, {
            type: 'LineBreak',
            value: '\n'
        });

        separatorToken = rocamboleToken.after(separatorToken, {
            type: 'WhiteSpace',
            value: ' '
        });
    } else {
        separatorToken = rocamboleToken.after(firstVars.startToken, {
            type: 'WhiteSpace',
            value: ' '
        });
    }

    // Id token for variable identifier
    idToken = rocamboleToken.after(separatorToken, {
        type: 'Identifier',
        value: node.id.name
    });

    // The variable id node
    idNode = {
        type: 'Identifier',
        name: node.id.name,
        parent: undefined,
        prev: undefined,
        next: undefined,
        depth: firstVars.depth + 2,
        startToken: idToken,
        endToken: idToken
    };

    // The variable declarator node wrapping the identifier
    varNode = {
        type: 'VariableDeclarator',
        id: idNode,
        init: null,
        parent: undefined,
        prev: undefined,
        next: undefined,
        depth: firstVars.depth + 1,
        startToken: idToken,
        endToken: idToken
    };

    if (declarationLast) {
        // Set reference on last declaration
        declarationLast.next = varNode;
        varNode.prev = declarationLast;
    }

    // Set parent reference
    idNode.parent = varNode;
    varNode.parent = firstVars;

    // Add the declaration node to the declarations list
    declarations.push(varNode);

    // Add to declared variables list
    this.declareVar(node);
};

Context.prototype.declaratorToAssignment = function declaratorToAssignment(node) {
    var vars = node.parent,
        commaToken;

    if (this.isForin(vars.parent)) {
        return;
    }

    if (this.isFor(vars.parent)) {
        // Convert to assignment
        node.type = 'AssignmentExpression';
        node.operator = '=';
        node.left = node.id;
        node.right = node.init;

        delete node.id;
        delete node.init;
        delete node.range;
    } else {
        // Convert to assignment
        node.type = 'AssignmentExpression';
        node.operator = '=';
        node.left = node.id;
        node.right = node.init;

        delete node.id;
        delete node.init;
        delete node.range;

        // Convert `,` to `;`
        commaToken = rocamboleToken.findNextNonEmpty(node.endToken);

        if (commaToken.value === ',') {
            commaToken.value = ';';
        }
    }
};

Context.prototype.declarationUnwrap = function declarationUnwrap(node) {
    // Ensure block before unwrap declarations
    if (!this.isBlock(node.parent)) {
        braces(node.parent);
    }

    var declarations = node.declarations.filter(function (assignment) {
            return assignment.right ? true : false;
        }),
        declarationFirst = declarations[0],
        declarationLast = declarations[declarations.length - 1],
        parent = node.parent.type === 'SwitchCase' ? node.parent.consequent : node.parent.body,
        index = parent.indexOf(node),
        args;

    if (declarations.length) {
        // Set new start references
        declarationFirst.startToken.prev = node.startToken.prev;
        node.startToken.prev.next = declarationFirst.startToken;

        // Set new end reference
        declarationLast.endToken.next = node.endToken.next;
        if (node.endToken.next) {
            node.endToken.next.prev = declarationLast.endToken;
        }

        // Set end token `;`
        if ((rocamboleToken.findNextNonEmpty(declarationLast.endToken) || {}).value !== ';') {
            rocamboleToken.after(declarationLast.endToken, {
                type: 'Punctuator',
                value: ';'
            });
        }
    } else {
        node.startToken.prev.next = node.endToken.next;
        node.endToken.next.prev = node.startToken.prev;

        declarations = [];
    }

    // Set new parent and level for each assignment
    declarations.forEach(function (declaration) {
        declaration.depth = declaration.depth - 1;
        declaration.parent = parent;
    });

    // Replace declarations with assignments
    args = [].concat(declarations);
    args.unshift(1);
    args.unshift(index);
    parent.splice.apply(parent, args);
};

Context.prototype.declarationToIdentifier = function declarationToIdentifier(node) {
    var prevToken = rocamboleToken.findPrevNonEmpty(node.startToken),
        forin = node.parent;

    // Set identifier as left
    forin.left = node.declarations.shift().id;

    // Update references
    forin.left.startToken.prev = prevToken;
    prevToken.next = forin.left.startToken;
};

Context.prototype.declarationToSequence = function declarationToSequence(node) {
    var prevToken = node.startToken.prev,
        startToken = rocamboleToken.findNextNonEmpty(node.startToken);

    prevToken.next = startToken;
    startToken.prev = prevToken;

    node.type = 'SequenceExpression';
    node.expressions = node.declarations;
    node.startToken = startToken;

    delete node.declarations;
    delete node.kind;
    delete node.range;
};

// Static method
Context.traverse = function traverse() {
    var ctx = new Context({});

    return {
        enter: function (node) {
            if (ctx.isScopeBlock(node)) {
                // Enter the current scope block and create a new scope context
                ctx = new Context(node, ctx);
            } else if (ctx.isVars(node)) {
                // For variable declarations

                if (!ctx.firstVars()) {
                    // Init first variable declarations

                    if (ctx.isScopeBlockChild(node)) {
                        // Set current as first one if it's direct child (not in a for statement for example)
                        ctx.firstVars(node);
                    } else {
                        // Create one
                        ctx.createFirstVars();
                    }
                }

                if (ctx.isFirstVars(node)) {
                    // Set variables as declared if declaration is first one
                    node.declarations.forEach(ctx.declareVar, ctx);
                } else {
                    // Add declarations to first declarations
                    node.declarations.forEach(ctx.addToFirstVars, ctx);

                    // Add declarations to first declarations
                    node.declarations.forEach(ctx.declaratorToAssignment, ctx);

                    if (ctx.isFor(node.parent)) {
                        ctx.declarationToSequence(node);
                    } else if (ctx.isForin(node.parent)) {
                        ctx.declarationToIdentifier(node);
                    } else {
                        ctx.declarationUnwrap(node);
                    }
                }
            }
        },
        leave: function (node) {
            if (ctx.isScopeBlock(node)) {
                // Leave the current scope block and go to parent scope context
                ctx = ctx.parent();
            }
        }
    };
};

// Export the plugin
module.exports = {
    transformBefore: function (ast) {
        estraverse.traverse(ast, Context.traverse());
    }
};
