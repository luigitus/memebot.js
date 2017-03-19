var settings = require('../settings.js');
var memebotapi = require('../memebotapi.js');

var DogRaceCommand = function(base) {
  // inherit prototype
  this.p = base;
  this.p.p.setDefaults({contestants : {}, isRacing: false, playBeginning: true, playLoop: true, playEnd: true, cooldownLength: 3600});
  this.p.p.setDefaults({dogList : {
  'blue' : {odds_m: 0, odds_l: 1, payout: 1000, name : ['Steve']},
  'gold' : {odds_m: 900, odds_l: 1000, payout: 2, name : ['Rex']},
  'white' : {odds_m: 800, odds_l: 899, payout: 3, name : ['Dampe']},
  'green' : {odds_m: 650, odds_l: 799, payout: 4, name : ['Swifty']},
  'purple' : {odds_m: 500, odds_l: 649, payout: 5, name : ['AndKnuckles']},
  'pink' : {odds_m: 300, odds_l: 499, payout: 8, name : ['Dank Pank']},
  'red' : {odds_m: 150, odds_l: 299, payout: 9, name : ['Red Blaze']},
  'black' : {odds_m: 100, odds_l: 149, payout: 10, name : ['FrankerB'],
  'brown' : {odds: 2, odds_l: 99, payout: 20, name: ['CorgiDerp', 'Amalthes']}}},
  nextResult: ['blue', 'red'],
  defaultCooldownHandler: false}, true);
}

DogRaceCommand.prototype = {
  execute: function(data, channel, sender) {
    // start actual race!
    if(sender.p.properties._id == '#internal#' && !this.p.p.properties.isRacing) {
      this.p.p.properties.isRacing = true;
      this.determineResults();
      memebotapi.emitWSEvent('doggy_started', this.p.p.properties);
      return ['Doggos are ready to go! CorgiDerp'];
    }
    var bet = parseInt(data[3]);
    if(data[1] == 'join' && !isNaN(bet)) {
      if(bet < 0) {
        return ['{sender}: You cannot enter with negative {currency}! FrankerZ'];
      }
      if(sender.payPoints(channel.p.properties._id, bet)) {
        if(this.p.p.properties.dogList[data[2]] === 'undefined') {
          return ['{sender}: Please specify a valid dog! FrankerZ'];
        }
        if(typeof this.p.p.properties.contestants[sender.p.properties._id] == 'undefined') {
          this.p.p.properties.contestants[sender.p.properties._id] = {betAmount: bet, dog : data[2], username: sender.p.properties.username};
          return ['{sender}: Joined the doggy race! FrankerZ']
        } else {
          return ['{sender}: You have already joined the race! FrankerZ'];
        }
      } else {
        return ['{sender}: You do not have enough {currency}! LilZ'];
      }
    } else if(data[1] == 'start' && !this.p.p.properties.isRacing &&
    settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 25) && this.p.checkCooldown(channel, sender)) {
      this.p.setCooldown(channel, sender);
      this.determineResults();
      this.p.p.properties.isRacing = true;
      memebotapi.emitWSEvent('doggy_started', this.p.p.properties);
      return ['Doggos are ready to go! CorgiDerp'];
    } else if(data[1] == 'reset' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 50)) {
      this.p.p.properties.contestants = {};
      this.p.p.properties.isRacing = false;
      return ['Doggy race reset! CorgiDerp'];
    } else if(data[1] == 'time') {
      return ['Remaining cooldown: ' + (this.p.globalCooldown.cooldownEnd - this.p.p.properties.cooldownLength).toString()];
    } else {
      return ['{sender}: Syntax join <dog> <amount> FrankerZ'];
    }
  },

  determineResults: function() {
    this.p.p.properties.nextResult = [];
    var dogListLen = 0;
    for(var k in this.p.p.properties.dogList) {
      dogListLen++;
    }

    var infinityCounter = 0;
    while(dogListLen != this.p.p.properties.nextResult.length) {
      var nextWin = settings.getRandomInt(0, 1000);
      for(var key in this.p.p.properties.dogList) {
        var value = this.p.p.properties.dogList[key];
        if(value.odds_m <= nextWin && value.odds_l >= nextWin) {
          if(this.p.p.properties.nextResult.indexOf(key) == -1) {
            this.p.p.properties.nextResult.push(key);
            break;
          }
        }
      }
      infinityCounter++;
      if(infinityCounter > 1000) {
        break;
      }
    }
  },

  finishedCallback: function(data) {
    data = this.p.p.properties; // just override it for this case
    this.p.p.properties.contestants = {};
    this.p.p.properties.isRacing = false;
    var channel = settings.getChannelByID(data.ownerChannelID);
    if(channel == null) {
      return;
    }
    for(var i in data.nextResult) {
      for(var key in data.contestants) {
        var user = settings.getUserByID(key);
        if(user == null) {
          return;
        }
        if(data.nextResult[i] == data.contestants[key].dog) {
          if(i == 0) {
            // 1st place
            channel.connection.sendCommand('/w ' + user.p.properties.username + ' You won ' + data.contestants[key].betAmount * data.dogList[data.nextResult[i]].payout + '!',
            channel.p.properties.channel);
            user.receivePoints(data.ownerChannelID, data.contestants[key].betAmount * data.dogList[data.nextResult[i]].payout);
          } else if(i == 1) {
            // 2nd place
            channel.connection.sendCommand('/w ' + user.p.properties.username + ' You won ' + data.contestants[key].betAmount * (data.dogList[data.nextResult[i]].payout / 2) + '!',
            channel.p.properties.channel);
            user.receivePoints(data.ownerChannelID, data.contestants[key].betAmount * (data.dogList[data.nextResult[i]].payout / 2));
          } else if(i == 2) {
            // 3rd place
            channel.connection.sendCommand('/w ' + user.p.properties.username + ' You won ' + data.contestants[key].betAmount + '!',
            channel.p.properties.channel);
            user.receivePoints(data.ownerChannelID, data.contestants[key].betAmount);
          } else {
            channel.connection.sendCommand('/w ' + user.p.properties.username + ' Your dog did not win! LilZ',
            channel.p.properties.channel);
          }
        }
      }
    }
  }
}

module.exports = {
  DogRaceCommand
}
