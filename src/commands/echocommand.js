var settings = require('../settings.js');

var EchoCommand = function(base) {
  // inherit prototype
  this.p = base;
}

EchoCommand.prototype = {
  execute: function(data, channel, sender) {
    var whenIs = ['Never', 'At 8:01 AM CEST', 'Tomorrow', 'WrongDong']
    if(data[1] == 'when' && data[2] == 'is') {
      var roll = settings.getRandomInt(0, whenIs.length);
      return ['@{sender}: ' + whenIs[roll]];
    } else {
      return ['@{sender}: ' + data.slice(1).join(' ')];
    }
  }
}

module.exports = {
  EchoCommand
}
