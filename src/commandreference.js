var command = require('./command.js');
var aboutc = require('./aboutcommand.js');

module.exports {
  default: command.Command,
  about: aboutc.AboutCommand
}
