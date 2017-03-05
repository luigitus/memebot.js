var net = require('net');
var settings = require("./settings.js");
var log = require("./mlog.js");
var text = require('./text.js');
var user = require('./user.js');

var ConnectionHandler = function(cb, username, password) {
  this.client = new net.Socket();
  var obj = this; // bind parrent object so that it can be access

  this.client.connect(settings.gs.ircPort, settings.gs.ircServer, function() {
    if(typeof username === 'undefined' || typeof password === 'undefined' || username == '' || password == '') {
      log.log('Connected: logging in as ' + settings.gs.botName + ' on ' +
      settings.gs.ircServer + ":" + settings.gs.ircPort);
      obj.writeBytes('PASS ' + settings.gs.botPassword);
      obj.writeBytes('NICK ' + settings.gs.botName);
    } else {
      log.log('Connected: logging in as ' + username  + ' on ' +
      settings.gs.ircServer + ":" + settings.gs.ircPort);
      obj.writeBytes('PASS ' + password);
      obj.writeBytes('NICK ' + username);
    }

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
}

ConnectionHandler.prototype = {
  client: null,
  messageCount: 0,

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
    if(!(senderID in settings.users) && typeof(senderID) != 'undefined') {
      var newUser = settings.loadUser(senderID,
        {_id: senderID, username: senderName, displayName: ircTags['display-name']});
      senderObject = newUser;
    } else if(typeof(senderID) != 'undefined'){
      senderObject = settings.users[senderID];
    } else {
      senderObject = null;
    }

    if(senderObject != null) {
      // check if user is marked as being in this channel
      if(senderObject.inChannels.indexOf(settings.getChannelByName(channel).p.properties._id) == -1) {
        senderObject.inChannels.push(settings.getChannelByName(channel).p.properties._id);
        senderObject.shouldSendGreet[settings.getChannelByName(channel).p.properties._id] = true;
      }
      senderObject.p.properties.displayName = ircTags['display-name'];
      senderObject.p.properties.username = senderName;
      if(senderObject.p.isLoaded) {
        if(ircTags['user-type'] == 'mod') {
          senderObject.p.properties.commandpower[settings.getChannelByName(channel).p.properties._id] = settings.commandPower.mod;
        } else if('#' + senderObject.p.properties.username == channel) {
          senderObject.p.properties.commandpower[settings.getChannelByName(channel).p.properties._id] = settings.commandPower.broadcaster;
        } else {
          senderObject.p.properties.commandpower[settings.getChannelByName(channel).p.properties._id] = settings.commandPower.user;
        }

        // global mods/admins
        for(var i in settings.gs.moderators) {
          if(settings.gs.moderators[i] == senderObject.p.properties.username) {
            senderObject.p.properties.commandpower[settings.getChannelByName(channel).p.properties._id] = settings.commandPower.moderator;
          }
        }
        for(var i in settings.gs.admins) {
          if(settings.gs.admins[i] == senderObject.p.properties.username) {
            senderObject.p.properties.commandpower[settings.getChannelByName(channel).p.properties._id] = settings.commandPower.admin;
          }
        }
      }


    }

    if(messageType != 'PRIVMSG' && messageType != 'WHISPER') {
      if(messageType == 'PING') {
        this.writeBytes('PONG :tmi.twitch.tv');
      } else if(messageType == 'JOIN') {
      } else if(messageType == 'PART') {
      } else if(messageType == 'CLEARCHAT') {
        
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


  sendMessage: function(message, channel, sender, command, data, format, whisper) {
    if(message == '' || channel.p.properties.silent) {
      return;
    }

    if(format || typeof(format) === 'undefined') {
      var bannedStrings = ['.ban', '!ban', '.timeout', '/timeout', '/color', '.color'];
      if(!whisper) {
        bannedStrings.push('/w');
        bannedStrings.push('.w');
      }
      for(var i = 0; i < bannedStrings.length; i++) {
        if(message.startsWith(bannedStrings[i])) {
          message = message.replace(bannedStrings[i], '[]');
        }
      }

      message = text.formatText(message, false, channel, sender, command, data);
    }

    if(this.messageCount > settings.gs.messageLimit) {
      return;
    }

    this.messageCount++;

    this.writeBytes('PRIVMSG ' + channel.p.properties.channel + " : " + message);
  }
}

module.exports = {
  ConnectionHandler
}
