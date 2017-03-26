var settings = require('./settings.js');
var https = require('https');
var log = require('./mlog.js');
var req = require('request');
var limit = require("simple-rate-limiter");
var requestNoLimit;
var request;

var SrcAPI = function() {

}

SrcAPI.init = function() {
  if (settings.gs.debug) {
    require('request-debug')(req);
  }
  requestNoLimit = req.defaults({
    baseUrl: 'https://www.speedrun.com/api/v1',
    headers: {
      'User-Agent': settings.build.appName + '/' + settings.build.version
    },
    json: true
  });
  request = limit(requestNoLimit).to(2).per(2000).withFuzz(0.5);
}

SrcAPI.getRun = function(query, callback) {

}

SrcAPI.updateAll = function() {
  for(var i in settings.joinedChannels) {
    var channel = settings.joinedChannels[i];
    if (channel.p.properties.game !== '') {
      this.getGame(channel.p.properties._id, channel.p.properties.game,
         this.gameCallback);
    }
    if (channel.p.properties.srcuserid === '') {
      this.getUser(channel.p.properties._id, channel.p.properties.channel.substring(1));
    }
  }
}

SrcAPI.getGame = function(id, query, update, callback, channel, sender, command, data) {
  var path = '/games?name=' + escape(query) + '&max=1&embed=categories';
  request(path, function(error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }
    if (body.data.length > 0) {
      var game = body.data[0];
      SrcAPI.gameCallback(id, game);
      if (callback) {
        callback(['[SpeedrunDotCom] Manually updated game to '
        + game.names.twitch + ' with the game ID '
        + game.id], channel, sender, command, data);
      }
    } else {
      if (response && response.statusCode === 200) {
        // We only want to overwrite to a empty game if we get a proper response
        SrcAPI.gameCallback(id, null);
        if (callback) {
          callback(['[SpeedrunDotCom] Couldn\'t find game on SpeedrunDotCom,' +
           'game specific WR and PB commands disabled.'],
            channel, sender, command, data);
        }
      } else {
        if (callback) {
          callback(['[SpeedrunDotCom] API error, couldn\'t update game manually'],
           channel, sender, command, data);
        }
      }
    }
  });
}

SrcAPI.getGameByID = function(id, gameid, update, callback) {
  var path = '/games/' + gameid + '?max=1&embed=categories';
  request(path, function (error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }
    if (body.data.length > 0) {
      if (response && response.statusCode === 404) {
        // Invalid game id, clear it from the channel
        SrcAPI.gameCallback(id, null);
        return;
      }
      if (update) {
        log.log('[SrcAPI] update game id');
        SrcAPI.gameCallback(id, body.data[0]);
      }
      if (callback) {
        callback(id, body.data[0]);
      }
    }
  });
}

SrcAPI.getUser = function(id, query) {
  var channel = settings.getChannelByID(id);
  if (channel.p.properties.srcuserid !== '') {
    return channel.p.properties.srcuserid;
  }
  request('/users?twitch=' + query, function (error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }

    if (body.data.length > 0) {
    log.log('[SrcAPI] found user id');
      SrcAPI.userCallback(id, body.data[0]);
    }
  });
}

SrcAPI.getRecord = function(gameid, categoryid, callback) {
  if (gameid === '' || categoryid === '') {
    return;
  }
  request('/leaderboards/' + gameid + '/category/' + categoryid + '?top=1&embed=players',
  function (error, response, body) {
    if (error !== null) {
      log.log('error: ' + error);
    }
    if (body.data !== null) {
      
    }
  });
}

SrcAPI.gameCallback = function(id, data) {
  var channel = settings.getChannelByID(id);
  if (data !== null) {
    channel.p.properties.srcgameid = data.id;
    var categories = data.categories.data;
    var title = channel.p.properties.title;
    for(var i in categories) {
      var category = categories[i];
      if (category.type === 'per-game') {
        var name = category.name.replace(/[`~!@#$^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        log.log("Current category is: " + name, log.LOGLEVEL.DEBUG);
        if (title.indexOf(name) >= 0) {
          log.log('Found category: ' + category.name, log.LOGLEVEL.DEBUG);
          channel.p.properties.srccategoryid = category.id;
          break;
        }
        // Lets do some stupid abbreviation stuff
        try {
          var abbrev = category.name.match(/\b([A-Z])/g).join('');
          if (title.indexOf(abbrev) >= 0) {
            log.log('Found category: ' + category.name, log.LOGLEVEL.DEBUG);
            channel.p.properties.srccategoryid = category.id;
            break;
          }
        } catch(err) {}
      }
    }
  } else {
    channel.p.properties.srcgameid = '';
  }
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
