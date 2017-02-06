var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");

module.exports = {
  ConnectionHandler: {
    client: new net.Socket(),

    init: function(cb) {
      var obj = this; // bind parrent object so that it can be access

      this.client.connect(settings.gs.ircPort, settings.gs.ircServer, function() {
      	log.log('Connected: logging in as ' + settings.gs.botName);
        obj.writeBytes('PASS ' + settings.gs.botPassword);
        obj.writeBytes('NICK ' + settings.gs.botName);

        obj.writeBytes('CAP REQ :twitch.tv/membership');
        obj.writeBytes('CAP REQ :twitch.tv/commands');
        obj.writeBytes('CAP REQ :twitch.tv/tags');
        //obj.writeBytes('JOIN #unlink2');
        cb.connect();
      });

      this.client.on('data', function(data) {
      	log.log('\n' + data);
        cb.message(data);
      });

      this.client.on('close', function() {
      	log.log('Connection closed');
        cb.disconnect();
      });
    },

    writeBytes: function(message) {
      this.client.write(message + '\n');
    },

    sendMessage: function(message, channel, sender, whisper) {
      if(message == '') {
        return;
      }

      this.writeBytes('PRIVMSG ' + channel + " : " + message);
    }
  }
}
