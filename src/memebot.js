var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");
var channel = require('./channel.js');

var joinedChannels = [];

// read settings.json
settings.readSettings('./config/settings.json');
settings.readDirs();
util.minit();

// shutdown hook
process.on('exit', function() {
  log.log('About to exit.');
});

for(var channelID in settings.ch) {
  var ch = Object.create(channel.Channel);
  ch.init(channelID);
  joinedChannels.push(ch);
}
