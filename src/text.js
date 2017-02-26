var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  local: {},

  formatParameters: function(message, data) {
    return message;
  },

  formatList: function(output, item, id, prefix, suffix) {
    var formatted = output;
    if(typeof formatted !== 'undefined') {
      formatted = formatted.replace('{number}', id.toString());
      formatted = formatted.replace('{list}', item);

      formatted = this.formatText(formatted);
    } else {
      formatted = item;
    }
    formatted = prefix + ' ' + formatted + ' ' + suffix;
    return formatted;
  },

  formatText: function(message, local, channel, user, command, data) {
    var d = new Date;
    var dformat = [d.getMonth()+1,
               d.getDate(),
               d.getFullYear()].join('/');
    var timeFormat = [d.getHours(),
    d.getMinutes(),
    d.getSeconds()].join(':');
    if(local) {
      message = message.replace(message, local[message]);
    }

    message = message.replace("{version}", settings.build.version);
    message = message.replace('{appname}', settings.build.appName);
    message = message.replace('{dev}', settings.build.dev);
    message = message.replace('{space}', ' ');
    message = message.replace('{}', ' ');
    message = message.replace('{none}', '');
    message = message.replace('{git}', settings.build.git)
    message = message.replace('{time}', timeFormat);
    message = message.replace('{date}', dformat);
    message = message.replace('{random}', settings.getRandomInt(0));

    if(!(typeof(channel) === 'undefined')) {
      message = message.replace('{currency}', channel.p.properties.currency);
      message = message.replace('{broadcaster}', channel.p.properties.channel.replace('#', ''));
      message = message.replace('{streamer}', channel.p.properties.channel.replace('#', ''));
      message = message.replace('{game}', channel.p.properties.game);
      message = message.replace('{title}', channel.p.properties.title);
    }

    if(!(typeof(command) === 'undefined')) {
      message = message.replace('{counter}', command.p.properties.counter);
    }

    if(!(typeof(user) === 'undefined')) {
      message = message.replace('{sender}', user.p.properties.displayName);
      message = message.replace('{username}', user.p.properties.username);
      message = message.replace('{senderid}', channel.p.properties._id);

      if(!(typeof(channel) === 'undefined')) {
        message = message.replace('{points}', user.p.properties.points[channel.p.properties._id]);
        message = message.replace('{randompoints}', settings.getRandomInt(0,
          user.p.properties.points[channel.p.properties._id]));
      }
    }
    // handle parametres
    if(typeof data !== 'undefined') {
      for(var i = 1; i < data.length; i++) {
        var parametreString = '{param' + i + '}'
        message = message.replace(parametreString, data[i]);
      }
    }

    return message;
  },

  loadLocals: function(file) {
    data = fs.readFileSync(file, 'utf8');
    this.local = JSON.parse(data);
  }
}
