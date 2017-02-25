var sprintf = require("sprintf-js").sprintf;

var DampeCommand = function(base) {
  // inherit prototype
  this.p = base;
  // new dampe jackpot is shared accross channels (what could possibly go wrong JKStyle)
  this.p.p.setDefaults({mincost : 5, jackpot : 0});
}

DampeCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'jackpot') {
      // set success to false so cooldown won't trigger #hacky
      this.p.p.success = false;
      return [sprintf('{sender}: Current Dampe jackpot: %d {currency}',
      this.p.p.properties.jackpot)];
    } else {
      
    }
  }
}

module.exports = {
  DampeCommand
}
