var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");
var text = require('./text.js');

module.exports = {
  ConnectionHandler: {
    client: null,
    messageCount: 0,

    init: function(cb, username, password) {
      this.client = new net.Socket();
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
      	//log.log('\n' + data);
        cb.message(obj.parseTIM(data.toString()));
      });

      this.client.on('close', function() {
      	log.log('Connection closed');
        cb.disconnect();
      });

      // update function
      setInterval(function() {
        obj.messageCount = 0;
      }, 30 * 1000);
    },

    writeBytes: function(message) {
      this.client.write(message + '\n');
    },

    parseTIM: function(rawmessage) {
      rawmessage = rawmessage.replace('\r\n', '');
      var senderName = '';
      var senderID = '';
      var ircTags = {};
      var messageContent = [];

      var ircMessageBuffer = rawmessage.split(' ');
      var messageID = '';
      var messageType = 'UNDEFINED';

      var i = 1;
      var channel = '';

      var hashIndex = rawmessage.indexOf(' #');

      // get channel from message
      if(hashIndex > 0) {
        for(i = hashIndex + 1; i < rawmessage.length; i++) {
          if(rawmessage.charAt(i) != ' ') {
            channel = channel + rawmessage.charAt(i);
          } else {
            break;
          }
        }
      }

      i = 0;
      // handle message
      while(i < ircMessageBuffer.length) {
        var msg = ircMessageBuffer[i];
        if ((msg == "PRIVMSG" || msg == "WHISPER" || msg == "MODE" || msg == "PART"
        || msg == "JOIN" || msg == "CLEARCHAT" || msg == 'PING') && messageType == "UNDEFINED") {
          messageType = msg;
        }
        if(msg.charAt(0) == '@' && i == 0) {
          var tagList = msg.split(';');

          for(var tag in tagList) {
            ircTags[tagList[tag].split('=')[0]] = tagList[tag].split('=')[1];
          }
        } else if(i == 0 || (i == 1 && senderName == '')) {
          var exclaReached = false;
          for(var j = 0; j < msg.length; j++) {
            if(msg.charAt(j) == '!') {
              exclaReached = true;
              break;
            }
            if(msg.charAt(j) != ':') {
              senderName = senderName + msg.charAt(j);
            }
          }

          if(!exclaReached) { senderName = "#internal#"; }
        }
        if((messageType == 'PRIVMSG' || messageType == 'WHISPER') && i > 3) {
          if(i == 4) {
            messageContent[i - 4] = msg.substring(1, msg.length);
          } else {
            messageContent[i - 4] = msg;
          }
        }
        i = i + 1;
      }
      senderID = ircTags['user-id'];

      // todo add users and create sender object here!

      // handle other messages
      if(messageType != 'PRIVMSG' && messageType != 'WHISPER') {
        if(messageType == 'PING') {
          this.writeBytes('PONG :tmi.twitch.tv');
        }
        // todo handle other events here
      } else {
        // todo handle irc tags here
      }

      // todo handle whispers here

      return {
        content: messageContent,
        name: senderName,
        sender: null,
        userID: senderID,
        displayName: ircTags['display-name'],
        type: messageType,
        channeName: channel,
        id: messageID,
        tags: ircTags
      };
    },


    sendMessage: function(message, channel, sender, format, whisper) {
      if(message == '' || channel.properties.silent) {
        return;
      }

      if(format || typeof(format) === 'undefined') {
        message = text.formatText(message, false, channel);
      }

      if(this.messageCount > settings.gs.messageLimit) {
        return;
      }

      this.messageCount++;

      this.writeBytes('PRIVMSG ' + channel.properties.channel + " : " + message);
    }
  }
}
