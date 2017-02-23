var cr = require('./commandreference.js');

// the first 10000 ids are reserved for internal commands
module.exports = [
  {types: ['about'], name: ['!about'], _id: 1, helptext: ['Displays about infomration']},
  {types: ['manager'], name: ['!command'], _id: 2},
  {types: ['default', 'quit'], name: ['!mequit'], output: ['Quitting the bot MrDestructoid'], _id: 3, requriedCommandPower: 100},
  {types: ['save'], name: ['!mesave'], _id: 4, requriedCommandPower: 100},
  {types: ['points'], name: ['!points'], _id: 5},
  {types: ['join'], name: ['!mejoin'], _id: 6},
  {types: ['part'], name: ['!mepart'], _id: 7, requriedCommandPower: 50},
  {types: ['help'], name: ['!help'], _id: 8, requriedCommandPower: 0},
  {types: ['user'], name: ['!user'], _id: 9, requriedCommandPower: 0},
  {types: ['channel'], name: ['!channel'], _id: 10, requriedCommandPower: 0}
]
