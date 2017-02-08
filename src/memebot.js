var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");
var channel = require('./channel.js');
var text = require('./text.js');
var base = require('./baseobj.js');
var os = require('os');
var command = require('./command.js');

// read settings.json
settings.readSettings('./config/settings.json');
settings.readDirs();
util.minit();
text.loadLocals(settings.gs.paths.config + '/' + settings.gs.local + '.json');

// shutdown hook
process.on('exit', function() {
  log.log('About to exit.');
  for(var key in util.joinedChannels) {
    util.joinedChannels[key].save();
  }
});

// general update function
setInterval(function() {
}, 60 * 60);

// system log update function
setInterval(function(){
  log.log('\nMEM: ' + os.totalmem() + '/' + os.freemem() + ' bytes' +
  '\nOS: ' + os.type() + ' ' + os.release() + ' on ' + os.arch(), log.LOGLEVEL.DEBUG);
}, 60 * 60 * 1000);


for(var channelID in settings.ch) {
  joinChannel(channelID);
}

for(var commandID in settings.commands) {
  loadCommand(commandID);
}

function joinChannel(channelID) {
  var ch = Object.create(channel.Channel);
  ch.init(channelID);
  util.joinedChannels[channelID] = ch;
}

function loadCommand(commandID) {
  var cmd = Object.create(command.Command);
  cmd.init(commandID);
  util.commands[commandID] = cmd;
}
