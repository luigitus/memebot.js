var SaveCommand = function(base) {
  // inherit prototype
  this.p = base;
}

SaveCommand.prototype = {
  execute: function(data, channel, sender) {
    var settings = require('../settings.js');
    settings.saveAll();
    
    return ['Save all the things PogChamp'];
  }
}

module.exports = {
  SaveCommand
}
