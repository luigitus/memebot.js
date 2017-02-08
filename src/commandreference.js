var command = require('./defaultcommand.js');
var aboutc = require('./aboutcommand.js');

module.exports = {
  default: command.DefaultCommand,
  about: aboutc.AboutCommand
}
