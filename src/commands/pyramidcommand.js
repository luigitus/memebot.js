
var PyramidCommand = function(base) {
  // inherit prototype
  this.p = base;
}

PyramidCommand.prototype = {
  execute: function(data, channel, sender) {
    var size = parseInt(data[2]);
    var pyramidOutput = [];
    if(isNaN(size)) {
      size = 2;
    }

    for(var i = 0; i < size; i++) {
      for(var j = 0; j <= i; j++) {
        if(typeof pyramidOutput[j] === 'undefined') {
          pyramidOutput[j] = '';
        }
        pyramidOutput[j] = data[1] + ' ' + pyramidOutput[j];
      }
    }
    return pyramidOutput;
  }
}

module.exports = {
  PyramidCommand
}
