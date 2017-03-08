var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');
var querystring = require('querystring');

var TwitchAPI = function() {

}

TwitchAPI.updateAll = function() {
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    this.makeChannelRequest(channel.p.properties._id, this.channelCallback);
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
  var options = {
    host: 'api.twitch.tv',
    method: 'GET',
    headers: {
    'Content-Type' : 'application/json',
    'Client-ID' : settings.gs.clientid,
    'Accept' : 'application/vnd.twitchtv.v5+json'
    },
    json: true
  };
  if(typeof username === 'string') {
    options.path = '/kraken/users?login=' + username;
  } else {
    options.path = '/kraken/users?login=' + username.join(',');
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        try {
          callback(username, JSON.parse(data), datatopass);
        } catch(err) {
          log.log(err + ' ' + data);
        }
      });
      res.on('error', function(err) {
        log.log(err);
      });
  });
  req.end();
},

TwitchAPI.makeStreamsRequest = function(id, callback) {
  var options = {
    host: 'api.twitch.tv',

    method: 'GET',
    headers: {
    'Content-Type' : 'application/json',
    'Client-ID' : settings.gs.clientid,
    'Accept' : 'application/vnd.twitchtv.v5+json'
    },
    json: true
  };

  if(typeof id === 'string') {
    options.path = '/kraken/streams/?channel=' + id;
  } else {
    options.path = '/kraken/streams/?channel=' + id.join(',');
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        try {
          callback(id, JSON.parse(data));
        } catch(err) {
          log.log(err + ' ' + data);
        }
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
        try {
          callback(id, JSON.parse(data));
        } catch(err) {
          log.log(err + ' ' + data);
        }
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
    if(channel.p.properties.channel != ('#' + data.name.toLowerCase())) {
      channel.p.properties.channel = ('#' + data.name.toLowerCase());
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
