var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');
var querystring = require('querystring');
var req = require('request');
var limit = require("simple-rate-limiter");
var requestNoLimit;
var request;

var TwitchAPI = function() {

}

TwitchAPI.init = function() {
  if (settings.gs.debug) {
    require('request-debug')(req);
  }
  requestNoLimit = req.defaults({
    baseUrl: 'https://api.twitch.tv',
    headers: {
      'Content-Type': 'application/json',
      'Client-ID': settings.gs.clientid,
      'Accept': 'application/vnd.twitchtv.v5+json'
    },
    json: true
  });
  request = limit(requestNoLimit).to(1).per(1000).withFuzz(0.5);
}

TwitchAPI.updateAll = function() {
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    this.makeStreamsRequest(channel.p.properties._id, this.streamsCallback);
  }
}

TwitchAPI.requestAccessToken = function(authcode, callback) {
  var formData = {
        client_id: settings.gs.clientid,
        client_secret: settings.gs.clientsecret,
        grant_type: 'authorization_code',
        redirect_uri: settings.gs.url + settings.gs.redirecturl,
        code: authcode
      };
  var requestToken = requestNoLimit.defaults({
    form: formData
  });
  requestToken.post('/kraken/oauth2/token', function(err, response, body) {
     if (err) {
      log.log('[TwitchAPI] error: ' + error);
      callback(err);
    } else {
      callback(body);
    }
  });
}

TwitchAPI.getInfoFromOauth = function(oauth, callback) {
  var requestWithToken = requestNoLimit.defaults({
    headers: {'Authorization': 'OAuth ' + oauth}
  });

  requestWithToken('/kraken', function(error, response, body) {
    if (error !== null) {
      log.log('[TwitchAPI] error: ' + error);
    }
    try {
      callback(body);
    } catch(err) {
      log.log(err + ' ' + data);
    }
  });
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
  var channel = settings.getChannelByID(id);
  if(data.stream == null) {
    channel.p.properties.isLive = false;
    // channel is not live. SAD. Get the data from the channel endpoint instead.
    TwitchAPI.makeChannelRequest(id, TwitchAPI.channelCallback);
  } else {
    channel.p.properties.isLive = true;
    // One great thing about Twitchs Stream endpoint is that we also get the
    // channel data when the channel is live. Lets use that data instead of
    // making another API call!
    TwitchAPI.channelCallback(id, data.stream.channel);
  }
}

TwitchAPI.channelCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
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
