module.exports = {
  parseCliArgs: function() {
    var args = [];

    process.argv.forEach(function (val, index, array) {
      args.push(val);
    });

    return args;
  }
}
