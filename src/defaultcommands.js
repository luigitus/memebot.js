var cr = require('./commandreference.js');

// the first 10000 ids are reserved for internal commands
module.exports = [
  {types: ['about'], name: ['!about'], _id: 1, helptext: ['Displays about infomration']},
  {types: ['manager'], name: ['!command'], _id: 2, formatData: false},
  {types: ['default', 'quit'], name: ['!mequit'], output: ['Quitting the bot MrDestructoid'], _id: 3, requriedCommandPower: 100},
  {types: ['save'], name: ['!mesave'], _id: 4, requriedCommandPower: 100},
  {types: ['points'], name: ['!points'], _id: 5, requriedCommandPower: 0},
  {types: ['join'], name: ['!joinme'], _id: 6},
  {types: ['part'], name: ['!partme'], _id: 7, requriedCommandPower: 50},
  {types: ['help'], name: ['!help'], _id: 8, requriedCommandPower: 0},
  {types: ['user'], name: ['!user'], _id: 9, requriedCommandPower: 0},
  {types: ['channel'], name: ['!channel'], _id: 10, requriedCommandPower: 0},
  {types: ['dampe'], name: ['!dampe', '!gamble'], _id: 11, requriedCommandPower: 0, userCooldownLenght: 90},
  {types: ['name'], name: ['!name'], _id: 12, requriedCommandPower: 0},

  {types: ['default'], name: ['!mehug'], _id: 13, requriedCommandPower: 0,
  output: ['{sender} hugs {param1}! How cute! <3'], parametres: 1,
  helptext: ['{sender} hugs nobody! How pathetic!']},

  {types: ['sm'], name: ['!sm'], _id: 14, requriedCommandPower: 100},
  {types: ['calc'], name: ['!calc'], _id: 15, requriedCommandPower: 0},
  {types: ['echo'], name: ['@memebot'], _id: 16, requriedCommandPower: 0, userCooldownLenght: 100},
  {types: ['race'], name: ['!race'], _id: 17, requriedCommandPower: 0},
  {types: ['pyramid'], name: ['!pyramid'], _id: 18, requriedCommandPower: 100},
  {types: ['reconnect'], name: ['!reconnect'], _id: 19, requriedCommandPower: 100}
  //{types: ['wr'], name: ['!wr'], _id: 19, requriedCommandPower: 0},
  //{types: ['src'], name: ['!src'], _id: 20, requriedCommandPower: 0},
]
