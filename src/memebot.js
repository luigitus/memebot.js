var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = settings
var channel = require('./channel.js');
var text = require('./text.js');
var base = require('./baseobj.js');
var os = require('os');
var command = require('./command.js');
var twitchapi = require('./twitchapi.js');

// read settings.json
settings.readSettings('./config/settings.json');
text.loadLocals('./config/' + settings.gs.local + '.json');
settings.minit();
settings.readIDs();
webui.initweb();

// shutdown hook
process.on('exit', function() {
  log.log('About to exit.');
  settings.saveAll();
});

// general update function
setInterval(function() {
  // handle all command queues
  for(var key in settings.joinedChannels) {
    var channel = settings.joinedChannels[key];
    for(var item in channel.commandQueue) {
      var next = channel.commandQueue[item];
      if(next.msg.sender.p.isLoaded) {
        next.command.execute(next.msg.content, next.channel, next.msg.sender, next.channel.commandCallback);
        delete channel.commandQueue[item];
      }
    }
  }
}, 180);

// twitch api update
setInterval(function() {
  twitchapi.TwitchAPI.updateAll();
}, 1800 * 100);

// system log update function
setInterval(function() {
  log.log('\nMEM: ' + os.totalmem() + '/' + os.freemem() + ' bytes' +
  '\nOS: ' + os.type() + ' ' + os.release() + ' on ' + os.arch(), log.LOGLEVEL.DEBUG);
}, 60 * 60 * 1000);
