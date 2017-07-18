try {
  throw new Error('Something happened');
} catch (block) {
  // Ignore error

  // Define junk lexical to skip annoying part
  var lexical;
}
