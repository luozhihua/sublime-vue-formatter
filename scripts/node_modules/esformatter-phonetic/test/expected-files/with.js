function hello() {
  // DEV: We assert that `obj` will change but `world`
  //   will not because it was used in a `with`
  var esemsep = {};
  var world = true;
  with (esemsep) {
  console.log(world);
  }
}
