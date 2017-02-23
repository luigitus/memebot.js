var HelpCommand = function(base) {
  // inherit prototype
  this.p = base;
}

HelpCommand.prototype = {
  execute: function(data, channel, sender) {
    var settings = require('../settings.js');

    var cmd = settings.getCommandByName(data[1]);
    if(cmd != null) {
      return cmd.p.properties.helptext;
    }

    return ['Could not find any help information!'];
  }
}

module.exports = {
  HelpCommand
}
