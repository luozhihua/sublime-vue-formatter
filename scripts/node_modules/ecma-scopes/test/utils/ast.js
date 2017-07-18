// Load in dependencies
var _ = require('underscore');
var astw = require('astw');

// Define AST utilities
exports.findFirst = function (ast, requisites) {
  // Walk the AST looking for a matching node
  var retVal = null;
  var comparator = _.matches(requisites);
  astw(ast)(function compareNode (node) {
    // If we have found our retVal, do nothing
    if (retVal) {
      return;
    }

    // If we find a node that matches our requisites, save it and
    if (comparator(node)) {
      retVal = node;
      return;
    }
  });

  // Return the result
  return retVal;
};

exports.findParentsUntil = function (node, requisites) {
  // Walk its parents until we resolve a function
  var retArr = [];
  var comparator = _.matches(requisites);
  node = node.parent;
  while (node) {
    // Save the parent node
    retArr.push(node);

    // If the node matches our requisites, stop
    if (comparator(node)) {
      break;
    }

    // Resolve the next node
    node = node.parent;
  }

  // Return our array of parents
  return retArr;
};
