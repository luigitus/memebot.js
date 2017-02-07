var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");
var channel = require('./channel.js');
var text = require('./text.js');

var joinedChannels = [];
var commands = [];
var users = [];

// read settings.json
settings.readSettings('./config/settings.json');
settings.readDirs();
util.minit();
text.loadLocals(settings.gs.paths.config + '/' + settings.gs.local + '.json');

// shutdown hook
process.on('exit', function() {
  log.log('About to exit.');
  for(var i = 0; i < joinedChannels.length; i++) {
    joinedChannels[i].save();
  }
});

// general update function
setInterval(function(){
  for(var i = 0; i < joinedChannels.length; i++) {
    if(!joinedChannels[i].connected) {
      joinChannel(joinedChannels[i].properties.id);
      delete joinedChannels[i];
    }
  }
}, 60 * 60);

for(var channelID in settings.ch) {
  joinChannel(channelID);
}

function joinChannel(channelID) {
  var ch = Object.create(channel.Channel);
  ch.init(channelID);
  joinedChannels.push(ch);
}
