var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');
var querystring = require('querystring');
var req = require('request');
var request = req.defaults({
  baseUrl: 'https://api.twitch.tv',
  headers: {
    'Content-Type': 'application/json',
    'Client-ID': settings.gs.clientid,
    'Accept': 'application/vnd.twitchtv.v5+json'
  },
  json: true
});

var TwitchAPI = function() {

}

TwitchAPI.updateAll = function() {
  log.log(settings.gs.clientid);
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    //this.makeChannelRequest(channel.p.properties._id, this.channelCallback);
    this.makeStreamsRequest(channel.p.properties._id, this.streamsCallback);
  }
}

TwitchAPI.requestAccessToken = function(authcode, callback) {
  var body = querystring.stringify({
        client_id: settings.gs.clientid,
        client_secret: settings.gs.clientsecret,
        grant_type: 'authorization_code',
        redirect_uri: settings.gs.url + settings.gs.redirecturl,
        code: authcode
      });
  var options = {
    host: 'api.twitch.tv',
    method: 'POST',
    path: '/kraken/oauth2/token',
    headers: {
    'Content-Length' : Buffer.byteLength(body)
    },
    json: true
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        callback(data);
      });
    res.on('error', function(err) {
      log.log(err);
      callback(err);
    });
  });
  req.write(body);
  req.end();
}

TwitchAPI.getInfoFromOauth = function(oauth, callback) {
  var options = {
    host: 'api.twitch.tv',
    method: 'GET',
    path: '/kraken?oauth_token=' + encodeURIComponent(oauth),
    headers: {
      'Content-Type' : 'application/json',
      'Client-ID' : settings.gs.clientid,
      'Accept' : 'application/vnd.twitchtv.v5+json',
    },
    json: true
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        callback(data);
      });
    res.on('error', function(err) {
      log.log(err);
      callback(err);
    });
  });
  req.end();
}

TwitchAPI.getChannelFromOauth = function(oauth, callback) {
  var options = {
    host: 'api.twitch.tv',
    method: 'GET',
    path: '/kraken/channel',
    headers: {
      'Content-Type' : 'application/json',
      'Client-ID' : settings.gs.clientid,
      'Accept' : 'application/vnd.twitchtv.v3+json',
      'Authorization' : 'OAuth ' + oauth
    },
    json: true
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        callback(data);
      });
    res.on('error', function(err) {
      log.log(err);
      callback(err);
    });
  });
  req.end();
}

TwitchAPI.getUserInformationFromName = function(username, datatopass, callback) {
  var path;
  if(typeof username === 'string') {
    path = '/kraken/users?login=' + username;
  } else {
    path = '/kraken/users?login=' + username.join(',');
  }
  request(path, function(error, response, body) {
    if (error !== null) {
      log.log('[TwitchAPI] error: ' + error);
    }
    try {
      callback(username, body, datatopass);
    } catch(err) {
      log.log(err + ' ' + data);
    }
  });
}

TwitchAPI.makeStreamsRequest = function(id, callback) {
  var options = baseRequest.defaults({
    headers: {special: 'special value'}
  });
  request('/kraken/streams/' + id, function(error, response, body) {
    if (error !== null) {
      log.log('[TwitchAPI] error: ' + error);
    }
    try {
      callback(id, body);
    } catch(err) {
      log.log(err + ' ' + data);
    }
  });
}

TwitchAPI.makeChannelRequest = function(id, callback) {
  request('/kraken/channels/' + id, function(error, response, body) {
    if (error !== null) {
      log.log('[TwitchAPI] error: ' + error);
    }
    try {
      callback(id, body);
    } catch(err) {
      log.log(err + ' ' + data);
    }
  });
}

TwitchAPI.streamsCallback = function(id, data) {
  log.log('streamsCallback ' + JSON.stringify(data));
  if(data.stream == null) {
    var channel = settings.getChannelByID(id);
    channel.p.properties.isLive = false;
    // channel is not live. SAD. Get the data from the channel endpoint instead.
    TwitchAPI.makeChannelRequest(id, TwitchAPI.channelCallback);
  } else {
    var channel = settings.getChannelByID(id);
    channel.p.properties.isLive = true;
    // One great thing about Twitchs Stream endpoint is that we also get the
    // channel data when the channel is live. Lets use that data instead of
    // making another API call!
    channel.p.properties.title = data.stream.channel.status;
    channel.p.properties.game = data.stream.channel.game;

    // check if name still matches #namechange
    if(channel.p.properties.channel != ('#' + data.stream.channel.name)) {
      channel.p.properties.channel = ('#' + data.stream.channel.name);
      channel.part();
      channel.reJoin();
    }
  }
}

TwitchAPI.channelCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
  log.log('channelCallback ' + JSON.stringify(data));
  if(channel) {
    channel.p.properties.title = data.status;
    channel.p.properties.game = data.game;

    // check if name still matches #namechange
    if(channel.p.properties.channel != ('#' + data.name)) {
      channel.p.properties.channel = ('#' + data.name);
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
