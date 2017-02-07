var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  local: {},

  formatText: function(message, local, channel, user) {
    if(local) {
      message = message.replace(message, local[message]);
    }

    message.replace("{version}", settings.build.version);
    message.replace('{appname}', settings.build.appname);
    message.replace('{dev}', settings.build.dev);
    message.replace('{space}', ' ');
    message.replace('{}', ' ');
    message.replace('{none}', '');
    message.replace('{currency}', channel.properties.currency);

    return message;
  },

  loadLocals: function(file) {
    data = fs.readFileSync(file, 'utf8');
    this.local = JSON.parse(data);
  }
}
