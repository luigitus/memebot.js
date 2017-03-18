var memebotapi = require('../memebotapi.js');

var WebsocketCommand = function(base) {
  // inherit prototype
  this.p = base;
}

WebsocketCommand.prototype = {
  execute: function(data, channel, sender) {
    memebotapi.emitWSEvent(this.p.p.properties.wscommand, this.p.p.properties);
    return [''];
  }
}

module.exports = {
  WebsocketCommand
}
