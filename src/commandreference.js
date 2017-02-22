var command = require('./commands/defaultcommand.js');
var aboutc = require('./commands/aboutcommand.js');
var manager = require('./commands/commandmanager.js');
var quit = require('./commands/mequit.js');
var save = require('./commands/savecommand.js');
var points = require('./commands/pointscommand.js');

module.exports = {
  default: command.DefaultCommand,
  about: aboutc.AboutCommand,
  manager: manager.CommandManager,
  quit: quit.QuitCommand,
  save: save.SaveCommand,
  points: points.PointsCommand,
  join: require('./commands/joincommand.js').JoinCommand,
  part: require('./commands/partcommand.js').PartCommand
}
