var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  local: {},

  formatParameters: function(message, data) {
    return message;
  },

  formatText: function(message, local, channel, user) {
    if(local) {
      message = message.replace(message, local[message]);
    }

    message = message.replace("{version}", settings.build.version);
    message = message.replace('{appname}', settings.build.appName);
    message =message.replace('{dev}', settings.build.dev);
    message = message.replace('{space}', ' ');
    message = message.replace('{}', ' ');
    message = message.replace('{none}', '');
    message = message.replace('{git}', settings.build.git)

    if(!(typeof(channel) === 'undefined')) {
      message = message.replace('{currency}', channel.p.properties.currency);
    }

    if(!(typeof(user) === 'undefined')) {
      message = message.replace('{sender}', user.p.properties.displayName);
      message = message.replace('{username}', user.p.properties.username);
      if(!(typeof(channel) === 'undefined')) {
        message = message.replace('{points}', user.p.properties.points[channel.p.properties._id]);
      }
    }
    return message;
  },

  loadLocals: function(file) {
    data = fs.readFileSync(file, 'utf8');
    this.local = JSON.parse(data);
  }
}
