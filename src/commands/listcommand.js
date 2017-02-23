var ListCommand = function(base) {
  // inherit prototype
  this.p = base;
}

ListCommand.prototype = {
  execute: function(data, channel, sender) {
  }
}

module.exports = {
  ListCommand
}
