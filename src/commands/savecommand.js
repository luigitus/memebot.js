var SaveCommand = function(base) {
  // inherit prototype
  this.p = base;
}

SaveCommand.prototype = {
  execute: function(data, channel, sender) {
    var settings = require('../settings.js');
    if(!settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
      return ['{sender}: Unauthorized!']
    }
    settings.saveAll();

    return ['Save all the things PogChamp'];
  }
}

module.exports = {
  SaveCommand
}
