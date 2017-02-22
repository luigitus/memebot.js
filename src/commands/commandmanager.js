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
    } else if(data[1] == 'add' &&
    settings.checkCommandPower(sender.p.properties.commandpower[channel.p.properties._id], 25)) {
      var newID = settings.getRandomInt(1000);
      while(newID in settings.commands) {
        newID = settings.getRandomInt(1000);
      }
      var output = '';
      for(var i = 3; i < data.length; i++) {
        output = output + data[i] + ' ';
      }

      settings.loadCommand(newID, {name: [data[2]], ownerChannelID: channel.p.properties._id,
      channelID: [channel.p.properties._id], output: [output]});
      
      return ['Added command'];
    } else if(data[1] == 'remove' &&
    settings.checkCommandPower(sender.p.properties.commandpower[channel.p.properties._id], 25)) {
      var exists = false;
      // check if command exists for this channel; only first name is valid in this case
      for(var i in settings.commands) {
        var cmd = settings.commands[i];
        if(cmd.p.properties.name[0] == data[2] && cmd.p.properties.ownerChannelID == channel.p.properties._id) {
          delete settings.commands[i];
        }
      }

      return ['Removed command(s)'];
    }
  }
}

module.exports = {
  CommandManager
}
