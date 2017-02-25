var settings = require('../settings.js');

var JoinCommand = function(base) {
  // inherit prototype
  this.p = base;
}

JoinCommand.prototype = {
  execute: function(data, channel, sender) {
    var settings = require("../settings.js");
    var channelToJoin = '#' + sender.p.properties.username;

    // force join a channel
    if(typeof data[1] !== 'undefined') {
      if(settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 100)) {
        var channelToJoin = data[1];
      }
    }

    var ch = settings.getChannelByName(channelToJoin);
    if(ch != null) {
      if(!ch.p.properties.shouldJoin) {
        ch.p.properties.shouldJoin = true;
        ch.p.save();
        ch.join();
        return ['Returned to channel #{sender} FrankerZ'];
      } else {
        return ['I\'m already in this channel #{sender} DansGame'];
      }
    } else {
      /*var newChannelID = 1;
      while(newChannelID in settings.joinedChannels) {
        newChannelID = settings.getRandomInt(1000);
      }*/

      // channel id is always the same as the sender's id
      settings.joinChannel(sender.p.properties._id, {channel: channelToJoin});
      return ['Joined channel #{sender} :D'];
    }
  }
}

module.exports = {
  JoinCommand
}
