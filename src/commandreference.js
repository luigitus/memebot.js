var command = require('./commands/defaultcommand.js');
var aboutc = require('./commands/aboutcommand.js');

module.exports = {
  default: command.DefaultCommand,
  about: aboutc.AboutCommand
}
