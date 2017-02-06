var globalSettings = require("./settings.js");
var webui = require("./webui.js");
var tmi = require("./tmiconnection.js");
var log = require("./mlog.js");
var util = require("./utility.js");

console.log("Hello World! " + globalSettings.ircServer);
//webui.initweb();
var test = Object.create(tmi.ConnectionHandler);
test.init();
console.log(util.parseCliArgs());
