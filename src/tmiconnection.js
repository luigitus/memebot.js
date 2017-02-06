var net = require('net');
var globalSettings = require("./settings.js");
var log = require("./mlog.js");

module.exports = {
  ConnectionHandler: {
    client: new net.Socket(),

    init: function() {
      var obj = this; // bind parrent object so that it can be access

      this.client.connect(globalSettings.ircPort, globalSettings.ircServer, function() {
      	log.log('Connected');
        obj.writeBytes('PASS ' + globalSettings.botPassword);
        obj.writeBytes('NICK ' + globalSettings.botName);
      });
      this.client.on('data', function(data) {
      	log.log('Received: ' + data);
      });

      this.client.on('close', function() {
      	log.log('Connection closed');
      });
    },

    writeBytes: function(message) {
      this.client.write(message + '\r\n');
    }
  }
}
