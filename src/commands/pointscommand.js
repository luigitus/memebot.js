var settings = require('../settings.js');
var sprintf = require("sprintf-js").sprintf;

var PointsCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PointsCommand.prototype = {
  execute: function(data, channel, sender) {
    if(data[1] == 'send') {
      var target = settings.getUserByName(data[2]);
      var pointsToSend = parseFloat(data[3]);
      if(target && !isNaN(pointsToSend)) {
        if(!sender.payPoints(channel.p.properties._id, pointsToSend)) {
          return [sprintf('{sender}: Sorry, you do not have %d {currency}!', pointsToSend)];
        }
        if(isNaN(target.p.properties.points[channel.p.properties._id])) {
          target.p.properties.points[channel.p.properties._id] = 0;
        }
        target.p.properties.points[channel.p.properties._id] += pointsToSend;
        return [sprintf('{sender}: You sent %i to %s!', pointsToSend, data[2])];
      } else {
        return ['{sender}: This user is currently not in chat!'];
      }
    } else if(data[1] == 'set' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 75)) {
      var target = settings.getUserByName(data[2]);
      var pointsToSend = parseFloat(data[3]);
      if(target && !isNaN(pointsToSend)) {
        if(isNaN(target.p.properties.points[channel.p.properties._id])) {
          target.p.properties.points[channel.p.properties._id] = 0;
        }
        target.p.properties.points[channel.p.properties._id] = pointsToSend;
        return [sprintf('{sender}: You set %s\'s {currency} to to %d!', data[2], pointsToSend)];
      }
    } else if(data[1] == 'add' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 75)) {
      var target = settings.getUserByName(data[2]);
      var pointsToSend = parseFloat(data[3]);
      if(target && !isNaN(pointsToSend)) {
        if(isNaN(target.p.properties.points[channel.p.properties._id])) {
          target.p.properties.points[channel.p.properties._id] = 0;
        }
        target.p.properties.points[channel.p.properties._id] += pointsToSend;
        return [sprintf('{sender}: You added %d {currency} to %s\'s wallet!', pointsToSend, data[2])];
      }
    } else if(data[1] == 'remove' && settings.checkCommandPower(sender.commandPower(channel.p.properties._id), 75)) {
      var target = settings.getUserByName(data[2]);
      var pointsToSend = parseFloat(data[3]);
      if(target && !isNaN(pointsToSend)) {
        if(isNaN(target.p.properties.points[channel.p.properties._id])) {
          target.p.properties.points[channel.p.properties._id] = 0;
        }
        target.p.properties.points[channel.p.properties._id] -= pointsToSend;
        return [sprintf('{sender}: You removed %d {currency} from %s\'s wallet!', pointsToSend, data[2])];
      }
    } else {
      return ['{sender}: You have {points} {currency}']
    }
  }
}

module.exports = {
  PointsCommand
}
