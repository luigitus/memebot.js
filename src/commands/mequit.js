var QuitCommand = function(base) {
  // inherit prototype
  this.p = base;
}

QuitCommand.prototype = {
  execute: function(data, channel, sender) {
    process.exit();
  }
}

module.exports = {
  QuitCommand
}
