var tmi = require("./tmiconnection.js");

module.exports = {
  Channel: {
    connection: null,
    channel: '#unlink2',
    _id: 0,

    init: function(id, c) {
      this.connection = c;
      this._id = id;
      this.connection.init(this);
    },

    connect: function() {
      this.connection.writeBytes('JOIN ' + this.channel);
      this.connection.sendMessage('Hello, I am fake memebot. RitzMitz', this.channel);
    },

    message: function(message) {

    },

    disconnect: function() {

    }
  }
}
