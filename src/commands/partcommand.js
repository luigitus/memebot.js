var PartCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PartCommand.prototype = {
  execute: function(data, channel, sender) {
    channel.part();
    channel.p.properties.shouldJoin = false;
    channel.p.save();
    return ['Parted channel #{sender} :('];
  }
}

module.exports = {
  PartCommand
}
