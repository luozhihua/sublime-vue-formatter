function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var obj = {};
  var world = true;
  with (obj) {
    console.log(world);
  }
}
