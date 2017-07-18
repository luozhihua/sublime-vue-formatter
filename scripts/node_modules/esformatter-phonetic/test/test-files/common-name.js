function hello() {
  var x = true;
  if (true) {
    // DEV: These remain the same name for intention hinting
    let x = false;
  }
}
