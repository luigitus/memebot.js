var settings = require('../settings.js');

var PartCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PartCommand.prototype = {
  execute: function(data, channel, sender) {
    // force part a channel
    if(typeof data[1] !== 'undefined') {
      if(settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
        var ch = settings.getChannelByName(data[1]);
        if(ch != null) {
          ch.part();
          return ['Parted channel ' + ch.p.properties.channel + ' :('];
        }
      }
    }
    channel.part();
    channel.p.properties.shouldJoin = false;
    channel.p.save();
    return ['Parted channel ' + channel.p.properties.channel + ' :('];
  }
}

module.exports = {
  PartCommand
}
