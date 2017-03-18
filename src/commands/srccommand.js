var settings = require('../settings.js');
var srcapi = require('../srcapi.js');
var twitchapi = require('../twitchapi.js');
var log = require('../mlog.js');

var SrcCommand = function(base) {
  this.p = base;
}

SrcCommand.prototype = {
  execute: function(data, channel, sender) {
    var prop = channel.p.properties;
    if(data[1] == 'refresh' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      srcapi.SrcAPI.getGame(prop._id, prop.game, SrcCommand.refreshCallback);
    } else if(data[1] == 'twitch' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25)) {
      twitchapi.TwitchAPI.updateAll();
    } else {
      if (prop.srcgameid !== '') {
        srcapi.SrcAPI.getGameByID(prop._id, prop.srcgameid, SrcCommand.infoCallback);
      } else {
        return ['[SpeedrunDotCom] Game: Not set, ID: Not set'];
      }
    }
  }
}

SrcCommand.infoCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
  if (channel) {
    var msg = '';
    msg += '[SpeedrunDotCom] Game: ' + data.names.twitch + ' ID: ' + data.id;
    channel.connection.sendMessage(msg, channel);
  }
}

SrcCommand.refreshCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
  if (channel) {
    var msg = '';
    msg += '[SpeedrunDotCom] Manually updated game to ' + data.names.twitch + ' with the game ID ' + data.id;
    channel.connection.sendMessage(msg, channel);
  }
}

module.exports = {
  SrcCommand
}
