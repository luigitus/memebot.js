var settings = require("./settings.js");
var memebotapi = require("./memebotapi.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = settings
var channel = require('./channel.js');
var text = require('./text.js');
var base = require('./baseobj.js');
var os = require('os');
var command = require('./command.js');
var twitchapi = require('./twitchapi.js');
var srcapi = require('./srcapi.js');
var fs = require('fs');
var importer = require('./import.js');
var discordconnection = require('./discordconnection.js');

// read settings.json
settings.readSettings('./config/settings.json');
text.loadLocals('./config/' + settings.gs.local + '.json');
settings.minit();
settings.readIDs();
memebotapi.initweb();
importer.checkImport();

// setup discord
if (settings.gs.discordtoken !== '') {
  this.discord = new discordconnection.ConnectionHandler();
}

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
        next.command.execute(next.msg.content, next.channel, next.msg.sender, next.callback, next.other);
        delete channel.commandQueue[item];
      }
    }
  }
}, 180);

// twitch api update
setInterval(function() {
  twitchapi.TwitchAPI.updateAll();
}, 1800 * 100);

// speedrun.com api update
setInterval(function() {
  //srcapi.SrcAPI.updateAll();
}, 3600 * 100);

// database backup
setInterval(function() {
  if(!settings.gs.allowBackups) {
    return;
  }
  log.log('Starting database backup!');
  var d = new Date;
  var dformat = [d.getMonth()+1,
             d.getDate(),
             d.getFullYear()].join('-');
  var timeFormat = [d.getHours(),
  d.getMinutes(),
  d.getSeconds()].join('-');

  for(var i in settings.gs.paths) {
    var path = settings.gs.paths[i];

    fs.createReadStream(path)
    .pipe(fs.createWriteStream('./config/backups/' + i + '_' + dformat + '_' + timeFormat + '.backup'));
  }
}, settings.gs.backupInterval * 1000);

// system log update function
setInterval(function() {
  log.log('\nMEM: ' + os.totalmem() + '/' + os.freemem() + ' bytes' +
  '\nOS: ' + os.type() + ' ' + os.release() + ' on ' + os.arch(), log.LOGLEVEL.DEBUG);
}, 60 * 60 * 1000);
