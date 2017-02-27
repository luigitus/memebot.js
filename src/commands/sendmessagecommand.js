var SendMessageCommand = function(base) {
  // inherit prototype
  this.p = base;
}

SendMessageCommand.prototype = {
  execute: function(data, channel, sender) {
    channel.connection.writeBytes('PRIVMSG ' + data[1] + " : " + data.join(' '));

    return ['{sender}: Message sent!'];
  }
}

module.exports = {
  SendMessageCommand
}
