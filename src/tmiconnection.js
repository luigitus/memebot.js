var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");
var text = require('./text.js');
var util = require('./utility.js');
var user = require('./user.js');

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
      /*
      join and part are pretty much ignored for now
      because neither seem to be broadcasting the user-id which is used to identify users
      in memebot.js.
      As soon as join/part actually do transmit those I will use them to
      add users to the user list.
      My current workaround is to just add users as soon as they send a message
      if they do not appear in the user list as of that time. Users will part after
      a certain amount of inactivity (e.g. 1 hour).
      If a user has parted from every channel, the user object will be freeed.
      */
      var senderObject = null;

      // check if user is in list, if not create it
      if(!(senderID in util.users) && typeof(senderID) != 'undefined') {
        var newUser = Object.create(user.User);
        newUser.init(senderID);
        util.users[senderID] = newUser;
        newUser.p.properties.username = senderName;
        newUser.p.properties.displayName = ircTags['display-name'];
        senderObject = newUser;
      } else {
        senderObject = util.users[senderID];
      }

      if(senderObject) {
        // check if user is marked as being in this channel
        if(!(channel in senderObject.inChannels)) {
          senderObject.inChannels.push(channel);
        }
      }

      if(messageType != 'PRIVMSG' && messageType != 'WHISPER') {
        if(messageType == 'PING') {
          this.writeBytes('PONG :tmi.twitch.tv');
        } else if(messageType == 'JOIN') {
        } else if(messageType == 'PART') {
        }
        // todo handle other events here
      } else {
        // todo handle irc tags here
      }

      // todo handle whispers here

      return {
        content: messageContent,
        sender: senderObject,
        type: messageType,
        channeName: channel,
        id: messageID,
        tags: ircTags
      };
    },


    sendMessage: function(message, channel, sender, format, whisper) {
      if(message == '' || channel.p.properties.silent) {
        return;
      }

      if(format || typeof(format) === 'undefined') {
        message = text.formatText(message, false, channel, sender);
      }

      if(this.messageCount > settings.gs.messageLimit) {
        return;
      }

      this.messageCount++;

      this.writeBytes('PRIVMSG ' + channel.p.properties.channel + " : " + message);
    }
  }
}
