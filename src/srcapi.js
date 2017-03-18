var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');
var req = require('request');
var request = req.defaults({
  baseUrl: 'https://www.speedrun.com/api/v1',
  headers: {
    'User-Agent': settings.build.appName + '/' + settings.build.version
  },
  json: true
});

var DEBUG = false;

var SrcAPI = function() {

}

SrcAPI.getRun = function(query, callback) {

}

SrcAPI.updateAll = function() {
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    if (channel.p.properties.game !== '') {
      this.getGame(channel.p.properties._id, channel.p.properties.game, this.gameCallback);
    }
  }
}

SrcAPI.getGame = function(id, query, callback) {
  request('/games?name=' + escape(query) + '&embed=categories&max=1',
   function(error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }
    if (DEBUG) {
      log.log('statusCode: ' + response && response.statusCode);
      log.log('body: ' + body.data[0].names.twitch);
    }
    SrcAPI.gameCallback(id, body.data[0]);
    if (callback) {
      log.log('[SrcAPI] Return data to Callback');
      callback(id, body.data[0]);
    } else {
      log.log('[SrcAPI] No callback.');
    }
  });
}

SrcAPI.getGameByID = function(id, gameid, callback, update) {
  request('/games/' + gameid + '?embed=categories&max=1',
   function (error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }
    if (DEBUG) {
      log.log('statusCode: ' + response && response.statusCode);
      log.log('body: ' + body.data.names.twitch);
    }
    if (update) {
      log.log('[SrcAPI] update game id');
      SrcAPI.gameCallback(id, body.data);
    }
    if (callback) {
      callback(id, body.data);
    }
  });
}

/*
SrcAPI.getGame = function(id, query, callback) {
  var options = {
    host: 'www.speedrun.com',
    method: 'GET',
    path: '/api/v1/games?name=' + escape(query) + '&embed=categories&max=1',
    headers: {
      'Content-Type' : 'application/json',
      'User-Agent' : settings.build.appName + '/' + settings.build.version
    },
    json: true
  };

  log.log(options.path);

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var body = "";
    res.on('data', function(data) {
      body += data;
    });
    res.on('end', function() {
      if (body !== '') {
        log.log('Body: ' + body);
        var data = JSON.parse(body).data;
        if (data.length > 0) {
          //SrcAPI.gameCallback(id, data[0]);
          callback(data[0]);
        } else {
          log.log('[SrcAPI] Game not found.')
        }
      }
    });
    res.on('error', function(err) {
      log.log(err);
    });
  });
  req.end();
}

*/

SrcAPI.getUser = function(id, query) {
  var channel = settings.getChannelByID(id);
  if (channel.p.properties.srcuserid !== '') {
    return channel.p.properties.srcuserid;
  }
  var options = {
    host: 'www.speedrun.com',
    method: 'GET',
    path: '/api/v1/users?twitch=' + query,
    headers: {
      'Content-Type' : 'application/json',
      'User-Agent' : settings.build.appName + '/' + settings.build.version
    },
    json: true
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var body = "";
    res.on('data', function(data) {
      body += data;
    });
    res.on('end', function() {
      if (body !== "") {
        var data = JSON.parse(body).data;
        if (data.length > 0) {
          SrcAPI.userCallback(id, data[0]);
        } else {
          log.log('[SrcAPI] User not found.');
        }
      }
    });
    res.on('error', function(err) {
      log.log(err);
    });
  });
  req.end();
}

SrcAPI.getRecord = function(channel, callback) {
  var options = {
    host: 'www.speedrun.com',
    method: 'GET',
    path: '/api/v1/users?twitch=' + query,
    headers: {
      'Content-Type' : 'application/json',
      'User-Agent' : settings.build.appName + '/' + settings.build.version
    },
    json: true
  };
  callback(channel, 'something')
}

SrcAPI.gameCallback = function(id, data) {
  log.log('channel id: ' + id);
  log.log('[SrcAPI] Game: ' + data.names.twitch + ' ID: ' + data.id);
  var channel = settings.getChannelByID(id);
  channel.p.properties.srcgameid = data.id;
}

SrcAPI.userCallback = function(id, data) {
  log.log('[SrcAPI] User ID: ' + data.id);
  var channel = settings.getChannelByID(id);
  channel.p.properties.srcuserid = data.id;
}

SrcAPI.prototype = {
}

module.exports = {
  SrcAPI
}
