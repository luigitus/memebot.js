var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");
var channel = require('./channel.js');

// read settings.json
settings.readSettings('./config/settings.json');
util.minit();

// shutdown hook
process.on('exit', function() {
  log.log('About to exit.');
});

var ch = Object.create(channel.Channel);
ch.init(0, Object.create(tmi.ConnectionHandler));
