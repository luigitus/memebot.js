var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');

var TwitchAPI = function() {

}

TwitchAPI.updateAll = function() {
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    this.makeChannelRequest(channel.p.properties._id, this.channelCallback);
    this.makeStreamsRequest(channel.p.properties._id, this.streamsCallback);
  }
}

TwitchAPI.makeStreamsRequest = function(id, callback) {
  var options = {
    host: 'api.twitch.tv',
    path: '/kraken/streams/?channel=' + id,
    method: 'GET',
    headers: {'Content-Type' : 'application/json',
    'Client-ID' : settings.gs.clientid,
    'Accept' : 'application/vnd.twitchtv.v5+json'
    },
    json: true
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        callback(id, JSON.parse(data));
      });
      res.on('error', function(err) {
        log.log(err);
      });
  });
  req.end();
}

TwitchAPI.makeChannelRequest = function(id, callback) {
  var options = {
    host: 'api.twitch.tv',
    path: '/kraken/channels/' + id,
    method: 'GET',
    headers: {'Content-Type' : 'application/json',
    'Client-ID' : settings.gs.clientid,
    'Accept' : 'application/vnd.twitchtv.v5+json'
    },
    json: true
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        callback(id, JSON.parse(data));
      });
      res.on('error', function(err) {
        log.log(err);
      });
  });
  req.end();
}

TwitchAPI.streamsCallback = function(id, data) {
  if(data._total == 0) {
    var channel = settings.getChannelByID(id);
    channel.p.properties.isLive = false;
  } else {
    var channel = settings.getChannelByID(id);
    channel.p.properties.isLive = true;
  }
}

TwitchAPI.channelCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
  if(channel) {
    channel.p.properties.title = data.status;
    channel.p.properties.game = data.game;

    // check if name still matches #namechange
    if(channel.p.properties.channel != ('#' + data.display_name.toLowerCase())) {
      channel.p.properties.channel = ('#' + data.display_name.toLowerCase());
      channel.part();
      channel.reJoin();
    }
  }
}

TwitchAPI.prototype = {
}

module.exports = {
  TwitchAPI
}
