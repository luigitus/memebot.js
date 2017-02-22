var cr = require('./commandreference.js');

// the first 10000 ids are reserved for internal commands
module.exports = [
  {types: ['about'], name: ['!about'], _id: 1},
  {types: ['manager'], name: ['!command'], _id: 2},
  {types: ['default', 'quit'], name: ['!mequit'], output: ['Quitting the bot MrDestructoid'], _id: 3, requriedCommandPower: 100},
  {types: ['save'], name: ['!mesave'], _id: 4, requriedCommandPower: 100},
  {types: ['points'], name: ['!points'], _id: 5},
  {types: ['join'], name: ['!mejoin'], _id: 6},
  {types: ['part'], name: ['!mepart'], _id: 7, requriedCommandPower: 50}
]
