var settings = require('./settings.js');
var fs = require('fs');

module.exports = {
  local: {},

  replaceAll: function(input, toReplace, data) {
    if(typeof input === 'undefined') {
      input = '';
    }
    var formatted = input;
    // counter just in case
    var counter = 0;

    while(input.search(toReplace) != -1) {
      formatted = formatted.replace(toReplace, data);
      if(counter > 50) {
        break;
      }
      counter++;
    }

    return formatted;
  },

  formatParameters: function(message, data) {
    return message;
  },

  formatList: function(output, item, id, prefix, suffix, channel, user, command, data) {
    var formatted = output;
    if(typeof formatted !== 'undefined' && formatted.search('{list}') != -1) {
      formatted = this.replaceAll(formatted, '{number}', id.toString());
      formatted = this.replaceAll(formatted, '{list}', item);
      formatted = this.formatText(formatted, false, channel, user, command, data);
    } else {
      formatted = item;
    }
    if(prefix != '') {
      formatted = prefix + ' ' + formatted;
    }
    if(suffix != '') {
      formatted = formatted + ' ' + suffix;
    }
    return formatted;
  },

  formatText: function(message, local, channel, user, command, data) {
    var d = new Date;
    var dformat = [d.getMonth()+1,
               d.getDate(),
               d.getFullYear()].join('/');
    var timeFormat = [d.getHours(),
    d.getMinutes(),
    d.getSeconds()].join(':');
    if(local) {
      message = message.replace(message, local[message]);
    }

    message = this.replaceAll(message, "{version}", settings.build.version);
    message = this.replaceAll(message, '{appname}', settings.build.appName);
    message = this.replaceAll(message, '{dev}', settings.build.dev);
    message = this.replaceAll(message, '{space}', ' ');
    message = this.replaceAll(message, '{}', ' ');
    message = this.replaceAll(message, '{none}', '');
    message = this.replaceAll(message, '{git}', settings.build.git)
    message = this.replaceAll(message, '{time}', timeFormat);
    message = this.replaceAll(message, '{date}', dformat);
    message = this.replaceAll(message, '{BUTT}', '💩');
    message = this.replaceAll(message, '{url}', settings.gs.url);

    var randomUserName = '';
    message = this.replaceAll(message, '{randomuser}', randomUserName);

    if(!(typeof(channel) === 'undefined')) {
      message = this.replaceAll(message, '{currency}', channel.p.properties.currency);
      message = this.replaceAll(message, '{broadcaster}', channel.p.properties.channel.replace('#', ''));
      message = this.replaceAll(message, '{streamer}', channel.p.properties.channel.replace('#', ''));
      message = this.replaceAll(message, '{game}', channel.p.properties.game);
      message = this.replaceAll(message, '{title}', channel.p.properties.title);
    }

    if(!(typeof(command) === 'undefined')) {
      message = this.replaceAll(message, '{counter}', command.p.properties.counter);
      message = this.replaceAll(message, '{first}', 0);
      message = this.replaceAll(message, '{last}', command.p.properties.listContent.length - 1);
      message = this.replaceAll(message, '{suggestedFirst}', 0);
      message = this.replaceAll(message, '{suggestedLast}', command.p.properties.suggestedList.length - 1);
    }

    if(!(typeof(user) === 'undefined')) {
      message = this.replaceAll(message, '{sender}', user.p.properties.displayName);
      message = this.replaceAll(message, '{username}', user.p.properties.username);
      message = this.replaceAll(message, '{senderid}', channel.p.properties._id);

      if(!(typeof(channel) === 'undefined')) {
        message = this.replaceAll(message, '{points}', user.getPoints(channel.p.properties._id));
        message = this.replaceAll(message, '{randompoints}', settings.getRandomInt(0,
          user.p.properties.points[channel.p.properties._id]));
      }
    }



    // handle parametres
    if(typeof data !== 'undefined') {
      for(var i = 1; i < data.length; i++) {
        var parametreString = '{param' + i + '}'
        message = this.replaceAll(message, parametreString, data[i]);
      }
    }

    // try parsing as expression
    var found = message.match('(\\{.*?\\})');
    for(var i in found) {
      if(typeof found[i] !== 'string') {continue;}
      var toEval = found[i].replace('{', '');
      toEval = toEval.replace('}', '');

      var result = settings.evalExpression(toEval);
      if(result.status) {
        message = message.replace(found[i], result.e);
      }
    }

    return message;
  },

  loadLocals: function(file) {
    data = fs.readFileSync(file, 'utf8');
    this.local = JSON.parse(data);
  }
}
