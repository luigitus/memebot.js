var settings = require('../settings.js');
var srcapi = require('../srcapi.js');

var WorldRecordCommand = function(base) {
  this.p = base;
}

WorldRecordCommand.prototype = {
  execute: function(data, channel, sender) {
    //return ['test ' + srcapi.SrcAPI.getGame(1234567, 'Super Mario Bros.', WorldRecordCommand.recordCallback)];
    //srcapi.SrcAPI.getRecord(channel, WorldRecordCommand.recordCallback);
    var prop = channel.p.properties;
    srcapi.SrcAPI.getGame(prop._id, prop.game, 'meme');
  }
}


WorldRecordCommand.recordCallback = function(channel, data) {
  var msg = '';
  msg += 'this is just a test.';
  channel.connection.sendMessage(msg, channel);
}

module.exports = {
  WorldRecordCommand
}
