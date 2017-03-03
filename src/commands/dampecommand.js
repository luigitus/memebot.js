var sprintf = require("sprintf-js").sprintf;
var settings = require('../settings.js');

var DampeCommand = function(base) {
  // inherit prototype
  this.p = base;
  // new dampe jackpot is shared accross channels (what could possibly go wrong JKStyle)
  this.p.p.setDefaults({mincost : 5, jackpot : 0, winner: '@tgump ,', winamount: 0});
}

DampeCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'jackpot') {
      // set success to false so cooldown won't trigger #hacky
      this.p.p.success = false;
      return [sprintf('{sender}: Current Dampe jackpot: %d {currency}',
      this.p.p.properties.jackpot)];
    } else if(data[1] == 'winner') {
      this.p.p.properties.success = false;
      return [sprintf('{sender}: The last person who won the jackpot was %s. They won %d {currency}.',
      this.p.p.properties.winner, this.p.p.properties.winamount)];
    } else {
      var roll = settings.getRandomInt(0, 100);
      var amount = parseInt(data[1]);
      if(isNaN(amount)) {
        amount = 1;
      }
      if(!sender.payPoints(channel.p.properties._id, amount)) {
        return ['{sender}: Sorry, you do not have enough {currency}!'];
      }

      if(roll <= 1) {
        this.p.p.properties.winner = sender.p.properties.displayName;
        this.p.p.properties.winamount = this.p.properties.jackpot;
        sender.receivePoints(channel.p.properties._id, this.p.p.properties.jackpot)
        var buffer = this.p.p.properties.jackpot;
        channel.p.properties._id, this.p.p.properties.jackpot = 0;
        return [sprintf('{sender}: Dampe found the Jackpot of %d {currency}! Damn, you\'re good',
        buffer)]
      } else if(roll < 20) {
        sender.receivePoints(channel.p.properties._id, amount * 4)
        return [sprintf('{sender}: Dampe found the a lot cash! He quadrupled your bet and gave you a hookshot!')]
      } else if(roll < 45) {
        sender.receivePoints(channel.p.properties._id, amount * 2)
        return [sprintf('{sender}: Dampe found the a lot cash! He doubled your bet!')]
      } else {
        this.p.p.properties.jackpot = this.p.p.properties.jackpot + amount;
        return ['{sender}: Dampe is being a dick and stole all of your {currency}!'];
      }
    }
  }
}

module.exports = {
  DampeCommand
}
