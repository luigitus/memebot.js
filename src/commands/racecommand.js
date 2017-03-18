
var RaceCommand = function(base) {
  // inherit prototype
  this.p = base;
}

RaceCommand.prototype = {
  execute: function(data, channel, sender) {
    return ['Coming soon!'];
  }
}

module.exports = {
  RaceCommand
}
