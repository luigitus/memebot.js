var settings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");
//webui.initweb();

// read settings.json
settings.readSettings('./config/settings.json');
var test = Object.create(tmi.ConnectionHandler);
test.init();
