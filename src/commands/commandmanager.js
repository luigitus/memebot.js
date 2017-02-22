var settings = require('../settings.js');

var CommandManager = function(base) {
  // inherit prototype
  this.p = base;
}

CommandManager.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'lc') {
      var list = 0;
      if(typeof data[2] === 'number') {
        list = data[2];
      }
      var retList = '';
      var i = list * 10;
      var counter = 0;
      for(var cmdID in settings.commands) {
        var cmd = settings.commands[cmdID];

        if(i >= list * 10 + 10) {
          break;
        } else if(i < counter) {
          continue;
        }

        if(cmd.p.properties.channelID.indexOf(channel.p.properties.ownerChannelID) != -1
        || cmd.p.properties.channelID.indexOf('#all#') != -1) {
          retList = retList + cmd.p.properties.name + ' >> ';
          i++;
        }
        counter++;
      }

      return [retList];
    }
  }
}

module.exports = {
  CommandManager
}
