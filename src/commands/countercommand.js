var CounterCommand = function(base) {
  // inherit prototype
  this.p = base;
}

CounterCommand.prototype = {
  execute: function(data, channel, sender) {
    var amount = 1;
    if(typeof data[2] !== 'undefined') {
      amount = parseInt(data[2]);
    }
    if(isNaN(amount)) {
      amount = 1;
    }
    if(data[1] == '+' &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      this.p.p.properties.counter += amount;
    } else if(data[1] == '-' &&
    this.p.p.properties.ownerChannelID == channel.p.properties._id) {
      this.p.p.properties.counter -= amount;
    }

    return this.p.p.properties.output;
  }
}

module.exports = {
  CounterCommand
}
