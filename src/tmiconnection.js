var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");

module.exports = {
  ConnectionHandler: {
    client: new net.Socket(),

    init: function() {
      var obj = this; // bind parrent object so that it can be access

      this.client.connect(settings.gs.ircPort, settings.gs.ircServer, function() {
      	log.log('Connected');
        obj.writeBytes('PASS ' + settings.gs.botPassword);
        obj.writeBytes('NICK ' + settings.gs.botName);
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
