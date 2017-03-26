var app = require('express')();
var http = require('http').Server(app);
var settings = require('./settings.js');
var io = require('socket.io').listen(http);
var log = require('./mlog.js');
var express = require('express');
var cookieParser = require('cookie-parser');
var twitchapi = require('./twitchapi.js');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');
var RateLimit = require('express-rate-limit');
var fs = require('fs');
var fuzzy = require('fuzzy');

module.exports = {
  emitWSEvent: function(eventtype, eventdata) {
    io.sockets.emit(eventtype, eventdata);
  },

  initweb: function() {
    var obj = this;
    // Websocket
    io.sockets.on('connection', function(socket) {
	    socket.emit('chat', {time: new Date(), text: 'You are connected to the server!'});
	    socket.on('chat', function (data) {
		      io.sockets.emit('chat', {time: new Date(), name: data.name || 'null', text: data.text});
	    });
      socket.on('doggy_finished', function(data) {
        var cmd = settings.getCommandByID(data._id);
        if(cmd == null) {return;}
        cmd.finishedCallback(data);
      });
      socket.on('error', function(err) {
        log.log(err)
      });
    });
    io.sockets.on('error', function(err) {
      log.log(err);
    });

    var limiter = new RateLimit({
      windowMs: 15*60*1000, // 15 minutes
      max: 10000, // limit each IP to 1000 requests per windowMs
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    });
    // deliver website
	  app.use(express.static('./web/public'));
    app.use(cookieParser()); // use this apps cookies like this JSON.parse(req.cookies.login);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(limiter);

    // error handler
    app.use(function (err, req, res, next) {
      log.log(err.stack);
      res.status(500).send('Internal Server Error\n' + err.stack)
    });

    // oauth might be used in the future
    app.oauth = oauthserver({
      model: {}, // See below for specification
      grants: ['password'],
      debug: settings.gs.debug
    });

    app.all('/oauth/token', app.oauth.grant());
    app.use(app.oauth.errorHandler());

    app.get('/test', function (req, res) {
    	res.sendfile('./web/public/test.html');
    });

    app.get('/', function (req, res) {
      res.sendfile('../web/public/index.html');
    });

    app.get('/about', function (req, res) {
      res.sendfile('./web/public/about.html');
    });

    app.get('/getme', function (req, res) {
      res.sendfile('./web/public/get.html');
    });

    app.get('/channellist', function (req, res) {
      res.sendfile('./web/public/channellist.html');
    });

    app.get('/wscmd', function (req, res) {
      res.sendfile('./web/public/wscommand.html');
    });

    app.get('/commandview', function (req, res) {
      res.sendfile('./web/public/commandview.html');
    });

    app.get('/help', function (req, res) {
      res.sendfile('./web/public/help.html');
    });

    app.get('/commandlist', function (req, res) {
      res.sendfile('./web/public/commandlist.html');
    });

    app.get('/newcommand', function (req, res) {
      res.sendfile('./web/public/newcommand.html');
    });

    app.get('/privacy', function (req, res) {
      res.sendfile('./web/public/privacy.html');
    });

    app.get('/license', function (req, res) {
      res.sendfile('./web/public/license.html');
    });

    app.get('/contact', function (req, res) {
      res.sendfile('./web/public/contact.html');
    });

    app.get('/authenticated', function (req, res) {
      if (req.query.code === undefined) {
        log.log('Invalid authentication');
        res.sendfile('500: Internal Server Error');
        return;
      }
      log.log('Request code is ' + req.query.code);
      twitchapi.TwitchAPI.requestAccessToken(req.query.code, function(jsondata) {
        if(typeof data.error !== 'undefined') {
          log.log(data);
          res.sendfile('./web/public/authenticated.html');
        }
        twitchapi.TwitchAPI.getInfoFromOauth(jsondata.access_token, function(channeldata) {
          if(!channeldata.token.valid) {
            res.sendfile('./web/public/authenticated.html');
          } else {
            jsondata._id = channeldata.token.user_id;
            jsondata.username = channeldata.token.user_name;
            res.cookie('login', JSON.stringify(jsondata));
            res.sendfile('./web/public/authenticated.html');
          }
        });
      });
    });

    app.get('/logout', function (req, res) {
      res.clearCookie('login');
      res.sendfile('./web/public/logout.html');
    });

    app.get('/admin', function (req, res) {
      res.sendfile('./web/public/admin.html');
    });

    // api calls are implemented here

    app.get('/api/v1/info', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send({data: settings.build, appinfo: {defaultchannel: settings.gs.defaultchannel,
      defaultchannelid: settings.gs.defaultchannelid,
      clientid: settings.gs.clientid,
      redirecturl: settings.gs.url + settings.gs.redirecturl, baseurl: settings.gs.url,
      scopes: settings.gs.scope
      }, links : {}});
    });

    app.get('/api/v1/checkauth', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          res.send({status: 200, message: 'Authorized', commandpower: cp})
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/automod', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.sendfile('./web/public/data/automod.json');
    });

    // just a twitch api passthrough
    app.get('/api/v1/getchannel', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var channelid = req.query.channelid;
      twitchapi.TwitchAPI.makeChannelRequest(channelid, function(id, data) {
        res.send(data);
      });
    });

    app.get('/api/v1/blog', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }

      var dirList = fs.readdirSync('./web/public/posts');

      var items = parseInt(req.query.items);
      if(!items || items > 255) {
        items = 10;
      }

      var startAt = parseInt(page) * items;
      var itemsPerPage = startAt + items;
      var counter = 0;
      var resData = [];
      var sortedObj = dirList.sort(
      function(a, b) {
        return parseInt(b) - parseInt(a);
      });
      //sortedObj = sortedObj.reverse();

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          var fileParsed = {};
          try {
            fileParsed = JSON.parse(fs.readFileSync('./web/public/posts/' + i));
          } catch(err) {
            log.log(err);
          }
          resData.push(fileParsed);
        }

        counter++;
      }
      res.send({total: sortedObj.length, data: resData, links : {}});
    });

    app.get('/api/v1/channel', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var channel = settings.joinedChannels[req.query.id];
      if(typeof channel !== 'undefined') {
        var datatosend = {};
        try {
          datatosend = JSON.parse(JSON.stringify(channel.p.properties));
        } catch(err) {
          log.log(err);
        }
        datatosend.botoauth = null;
        datatosend.connected = channel.connected;
        res.send({data: datatosend, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/channellist', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var items = parseInt(req.query.items);
      if(!items || items > 255) {
        items = 100;
      }

      var startAt = parseInt(page) * items;
      var itemsPerPage = startAt + items;
      var counter = 0;
      var resData = [];
      var sortedObj = Object.keys(settings.joinedChannels).sort(
      function(a, b) {
        return settings.joinedChannels[a].p.properties.channel > settings.joinedChannels[b].p.properties.channel ? 1 : -1;
      });

      var searchString = decodeURIComponent(req.query.search);
      if(typeof req.query.search !== 'undefined') {
        var options = {
          extract: function(ch) {
            return settings.joinedChannels[ch].p.properties.channel;
          }
        };
        var results = fuzzy.filter(searchString, sortedObj, options);
        sortedObj = results.map(function(ch) {
          return settings.joinedChannels[ch.original].p.properties._id;
        });
      }

      for(var j in sortedObj) {
        var i = sortedObj[j];

        if(counter >= startAt && counter < itemsPerPage) {
          resData.push({links : {channel : settings.gs.url + '/api/v1/channel?id=' +
          settings.joinedChannels[i].p.properties._id},
          name : settings.joinedChannels[i].p.properties.channel,
          _id : settings.joinedChannels[i].p.properties._id,
          isLive : settings.joinedChannels[i].p.properties.isLive,
          });
        }

        counter++;
      }
      res.send({total: sortedObj.length, data: resData, links : {}});
    });

    app.get('/api/v1/user', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var user = settings.users[req.query.id];
      if(typeof user !== 'undefined') {
        res.send({data: user.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/userlist', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var items = parseInt(req.query.items);
      if(!items || items > 255) {
        items = 100;
      }

      var startAt = parseInt(page) * items;
      var itemsPerPage = startAt + items;
      var counter = 0;
      var resData = [];
      var sortedObj = Object.keys(settings.users);

      var searchString = decodeURIComponent(req.query.search);
      if(typeof req.query.search !== 'undefined') {
        var options = {
          extract: function(ch) {
            return settings.users[ch].p.properties.username;
          }
        };
        var results = fuzzy.filter(searchString, sortedObj, options);
        sortedObj = results.map(function(ch) {
          return settings.users[ch.original].p.properties._id;
        });
      }

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          resData.push({links : {user : settings.gs.url + '/api/v1/user?id=' +
          settings.users[i].p.properties._id},
          name : settings.users[i].p.properties.username,
          id : settings.users[i].p.properties._id
          });
        }

        counter++;
      }
      res.send({total: sortedObj.length, data: resData, links : {}});
    });

    app.get('/api/v1/command', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var command = settings.commands[req.query.id];
      if(typeof command !== 'undefined') {
        res.send({data: command.p.properties, links : {}});
      } else {
        res.send({error: 404, message: 'Not found'});
      }
    });

    app.get('/api/v1/commandlist', function(req, res) {
      res.setHeader('Content-Type', 'application/json');

      var page = parseInt(req.query.page);
      var channelID = req.query.channelid;

      if(typeof page === 'undefined' || isNaN(page)) {
        page = 0;
      }
      var items = parseInt(req.query.items);
      if(!items || items > 255) {
        items = 100;
      }

      var startAt = parseInt(page) * items;
      var itemsPerPage = startAt + items;
      var counter = 0;
      var resData = [];
      var commandList = {};
      if(typeof channelID === 'undefined') {
        commandList = settings.commands;
      } else {
        commandList = settings.getCommandsByChannel(channelID);
      }
      var sortedObj = Object.keys(commandList).sort(
      function(a, b) {
        return commandList[a].p.properties.name[0].toLowerCase() > commandList[b].p.properties.name[0].toLowerCase() ? 1 : -1;
      });

      var searchString = decodeURIComponent(req.query.search);
      if(typeof req.query.search !== 'undefined') {
        var options = {
          extract: function(ch) {
            return commandList[ch].p.properties.name[0];
          }
        };
        var results = fuzzy.filter(searchString, sortedObj, options);
        sortedObj = results.map(function(ch) {
          return commandList[ch.original].p.properties._id;
        });
      }

      for(var j in sortedObj) {
        var i = sortedObj[j];
        if(counter >= startAt && counter < itemsPerPage) {
          resData.push({links : {command : settings.gs.url + '/api/v1/command?id=' +
          commandList[i].p.properties._id},
          name: commandList[i].p.properties.name,
          _id: commandList[i].p.properties._id
          });
        }

        counter++;
      }
      res.send({total: sortedObj.length, data: resData, links : {}});
    });



    // api calls with auth
    app.get('/api/v1/executecommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var msg = decodeURIComponent(req.query.message).split(' ');
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var message = obj.createWebMessage(msg, channel, function(message) {
              if(!res.headersSent) {
                res.send({status: 200, data : message, links: {}});
              }
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/removecommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var commandid = req.query.commandid;
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var message = obj.createWebMessage([
              '!command',
              'remove',
              commandid
            ], channel, function(message) {
              res.send({status: 200, data : message, links: {}});
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/addcommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var name = req.query.name;
      var output = req.query.output;
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var message = obj.createWebMessage([
              '!command',
              'add',
              name,
              output,
            ], channel, function(message) {
              res.send({status: 200, data : message, links: {}});
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/editcommand', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var commandid = req.query.commandid;
      var option = req.query.option;
      var newvalue = req.query.newvalue;
      var editoption = decodeURIComponent(req.query.editoption);
      var optionid = req.query.optionid;
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var payload = [
              '!command',
              'edit',
              commandid,
              option,
            ];
            if(option == 'output' || option == 'name' || option == 'types' || option == 'helptext') {
              payload.push(editoption);
              if(editoption == 'edit' || editoption == 'remove') {
                payload.push(optionid);
              }
            }

            payload.push(newvalue);

            var message = obj.createWebMessage(payload, channel, function(message) {
              res.send({status: 200, data : message, links: {}});
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/listcall', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var commandid = req.query.commandid;
      var option = req.query.option;
      var newvalue = req.query.newvalue;
      var listid = req.query.listid;
      var command = settings.getCommandByID(commandid);
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(command == null) { res.send({status: 404, message: 'Command Not Found'}); }
          else if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var payload = [
              command.p.properties.name[0],
              option,
            ];

            if(option == 'edit' || option == 'remove' || option == 'approve' || option == 'deny') {
              payload.push(listid);
            }
            payload.push(newvalue);

            var message = obj.createWebMessage(payload, channel, function(message) {
              if(!res.headersSent) {
                res.send({status: 200, data : message, links: {}});
              }
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/editchannel', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'undefined') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var option = req.query.option;
      var newvalue = req.query.newvalue;
      var editoption = req.query.editoption;
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var payload = [
              '!channel',
              'edit',
              option,
            ];
            if(option == 'undefined') {
              payload.push(editoption);
            }

            payload.push(newvalue);

            var message = obj.createWebMessage(payload, channel, function(message) {
              res.send({status: 200, data : message, links: {}});
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('/api/v1/edituser', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      var token = req.headers['Authorization']
      if(typeof token === 'autoGreetMessage') {
        token = req.query.oauth_token;
      }
      var channelid = req.query.channelid;
      var channel = settings.getChannelByID(channelid);
      var option = req.query.option;
      var newvalue = req.query.newvalue;
      var editoption = req.query.editoption;
      var userid = req.query.userid;
      obj.checkTwitchLogin(token, req.query.channelid, function(status, data, cp) {
        if(status) {
          if(channel == null) { res.send({status: 404, message: 'Channel Not Found'}); } else {
            var payload = [
              '!user',
              'edit',
              userid,
              option,
            ];
            if(option == 'undefined') {
              payload.push(editoption);
            }

            payload.push(newvalue);

            var message = obj.createWebMessage(payload, channel, function(message) {
              res.send({status: 200, data : message, links: {}});
            }, data);
            channel.message(message);
          }
        } else {
          res.send({status: 401, message: 'Unauthorized'});
        }
      });
    });

    app.get('*', function(req, res){
      res.sendfile('./web/public/notfound.html');
    });

    http.listen(settings.gs.expressport, function(){
      log.log('listening on *:' + settings.gs.expressport);
    });
  },

  checkTwitchLogin: function(oauth, channelid, callback) {
    //var cookiejson = JSON.parse(req.cookies.login);
    twitchapi.TwitchAPI.getInfoFromOauth(oauth, function(data) {
      if(data.status >= 400 || !data.token.valid) {
        callback(false, data, -1);
        return;
      }
      twitchapi.TwitchAPI.getUserInfromationForChannel(channelid, data.token.user_id, function(channelid, userid, userdata) {
        if(typeof userdata.badges === 'undefined') {
          userdata.badges = [{id: ''}];
        }
        if(typeof userdata.badges[0] === 'undefined') {
          userdata.badges[0] = {id: ''};
        }

        data.userinformation = userdata;

        if(data.status >= 400 || !data.token.valid) {
          callback(false, data, -1);
          return;
        }
        if(settings.isAdmin(data.token.user_name.toLowerCase()) && data.token.valid) {
          log.log('Permitting login for admin ' + data.token.user_name);
          callback(true, data, settings.commandPower.admin);
          return;
        }

        if(data.token.user_id == channelid && data.token.valid) {
          callback(true, data, settings.commandPower.broadcaster);
          return;
        } else if(data.token.valid && data.userinformation.badges[0].id == 'moderator') {
          callback(true, data, settings.commandPower.mod);
          return;
        } else if(data.token.valid) {
          callback(true, data, settings.commandPower.user);
          return;
        } else {
          callback(false, data, -1);
          return;
        }

        callback(false, data, -1);
      });
    });
  },

  createWebMessage(message, channel, callback, data) {
    // todo use data from login check to load apropriate user and give proper command power
    var user = require('./user');

    var cp = {};
    cp[channel.p.properties._id] = settings.commandPower.user;
    if(data.token.valid && data.userinformation.badges[0].id == 'moderator') {
      cp[channel.p.properties._id] = settings.commandPower.mod;
    }
    if(data.token.user_id == channel.p.properties._id && data.token.valid) {
      cp[channel.p.properties._id] = settings.commandPower.broadcaster;
    }
    if(settings.isAdmin(data.token.user_name.toLowerCase()) && data.token.valid) {
      cp[channel.p.properties._id] = settings.commandPower.admin;
    }

    var tempSender = settings.getUserByID(data.token.user_id);
    if(tempSender != null) {
      tempSender.p.properties.commandpower[channel.p.properties._id] = cp[channel.p.properties._id]
    } else {
      tempSender = settings.loadUser(data.token.user_id, {commandpower: cp});
    }

    return {
      content: message,
      sender: tempSender,
      type: undefined,
      channelName: undefined,
      id: undefined,
      tags: [],
      service: 'webui',
      other: callback
    };
  }
}
