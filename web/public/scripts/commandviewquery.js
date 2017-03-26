var authResponse = {};
var channelid = '';

$(document).ready(function() {
  commandviewquery();
});

function commandviewquery() {
  $('#ccontent').empty();
  $('#status').empty();
  $('#clist').empty();
  $('#sclist').empty();

  $('#ccontent').append('<tr class="header" id="command_settings"><td colspan="2">Command Settings</td></tr>');

  var commandid = getParameterByName('commandid');
  if(typeof commandid === 'undefined') {
    page = 1;
  }

  getAppInfo(function(data, appinfo) {
    $.getJSON("api/v1/command?id=" + encodeURIComponent(commandid), function(data) {
      channelid = data.data.ownerChannelID;
      checkAuth(function(data2) {
        authResponse = data2;
        parseQueryData(data);
      }, data.data.ownerChannelID);
    });
  });
}

function parseQueryData(data) {
  // human readable text for command options
  var optionMap = {
    _id: 'Command ID',
    name: 'Command Name',
    channelID: 'Available in Channels (By ID)',
    ownerChannelID: 'Owner Channel ID',
    cooldownLength: 'Global Cooldown Length (In Seconds)',
    helptext: 'Helptext/Syntax',
    types: 'Command Type',
    output: 'Command Output',
    prefix: 'Command Prefix',
    suffix: 'Command Suffix',
    cost: 'Cost of command (In Points)',
    counter: 'Counter for Counter Command Type',
    locked: 'Command is locked',
    textTrigger: 'Command is text trigger',
    requriedCommandPower: 'Requried command power to access command (0 = Viewer; 25 = Moderator; 50 = Streamer)',
    userCooldownLenght: 'Cooldown Length per user (In Seconds)',
    enabled: 'Command is enabled',
    timesExecuted: 'Command executed',
    formatData: 'Format command output',
    useWhisper: 'Use Whisper',
    hideCommand: 'Hide command from command list',
    isTimer: 'Is command timer',
    timer: 'Execute command after amount of time (In Seconds)',
    chance: 'Chance command is executed (100 = always)',
    cooldownbypasspower: 'Commandpower needed to bypass cooldowns',
    parametres: 'Amount of parametres the command requires (if not met, helptext will show)',
    wscommand: 'Websocket event',
    updatedAt: 'Last time command was saved',
    defaultCooldownHandler: 'Use default cooldown handler',
    createdAt: 'Command was created at: '
  };
  $('#index').append('<li><a href="#options">Options</a></li>')
  $.each(data.data, function(key, val) {
    if(!optionMap[key]) {
      optionMap[key] = key;
    }

    if(key != 'listContent' && key != 'suggestedList') {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        var editAction = '<input id="' + key + '_text" value="' + val + '">' +
        '<input class="remove_button" id='
        + key + ' type="button" value="Update" onclick="editOptionPromt(this.id, \'textarea\');" />';
        if(typeof val === 'boolean') {
          var checked = '';
          if(val) {
            checked = 'checked=true';
          }
          editAction = '<input class="remove_button" id='
          + key + ' type="checkbox" ' + checked + ' onclick="editOptionPromt(this.id, \'check\');" />';
        }

        if(key == '_id' || key == 'channelID' || key == 'ownerChannelID'
        || key == 'createdAt' || key == 'updatedAt' || key == 'timesExecuted' || key == 'disabledIn') {
          editAction = val;//'This cannot be edited!';
        }

        if(key == 'types') {
          function createOption(value, currentValue, text) {
            if(value == currentValue) {
              return '<option value="' + value + '" selected="selected">' + text + '</option>'
            }
            return '<option value="' + value + '">' + text + '</option>'
          }
          editAction = '<select id=' + key
          + ' onChange="editOptionPromt(this.id, \'selector\');">' +
          createOption('default', val, 'Default Command') +
          createOption('list', val, 'List Command') +
          createOption('counter', val, 'Counter Command') +
          createOption('timeout', val, 'Timeout Command') +
          createOption('ban', val, 'Ban Command') +
          createOption('dampe', val, 'Gamble Command (dampe)') +
          + '</select>';
        } else if(key == 'output' || key == 'helptext' || key == 'prefix' || key == 'suffix') {
          var updateButton = '<input class="remove_button" id='
          + key + ' type="button" value="Update" onclick="editOptionPromt(this.id, \'textarea\');" />';

          var addListButton = '<input class="remove_button" id='
          + key + ' type="button" value="List Content"' +
          'onclick="addText(\'#\' + this.id + \'_text\', \'{list}\');" />';

          var addCounterButton = '<input class="remove_button" id='
          + key + ' type="button" value="Counter"' +
          'onclick="addText(\'#\' + this.id + \'_text\', \'{counter}\');" />';

          var addSenderButton = '<input class="remove_button" id='
          + key + ' type="button" value="Sender Name"' +
          'onclick="addText(\'#\' + this.id + \'_text\', \'{sender}\');" />';

          var textValue = val;
          if(key == 'output' || key == 'helptext') {
            textValue = val[0];
          }
          if(!textValue) {
            textValue = '';
          }
          var textArea = '<textarea id=' + key + '_text>' + textValue + '</textarea>';

          editAction = textArea + '</br>' + updateButton + addListButton + addCounterButton +
          addSenderButton;
        } else if(key == 'cooldownLength' || key == 'userCooldownLenght') {

        }

        $('#ccontent').append(
            $('<tr></tr>').append(
              '<td>' + optionMap[key] + '</td>'
            )
            .append('<td>' +
            editAction
             + '</td>')
        );
        //.append('<td id=' + key + '_value>' + val + '</td>')
      } else {
        $('#ccontent').append(
            $('<tr></tr>').append(
              '<td>' + optionMap[key] + '</td>'
            ).append('<td>' + val + '</td>')
        );
      }
    }
  });

  if(checkCommandPower(authResponse.commandpower, 25)) {
    if(data.data.listContent.length > 0) {
      $('#index').append('<li><a href="#list">List Contnet</a></li>')
      .append('<li><a href="#suggestedlist">Suggested List</a></li>');

      $('#new_item')
      .append('<textarea id=new_list_text></textarea></br>')
      .append(
        '<input class="remove_button" id=addlistitem type="button" value="Add New List Item" onclick="newListItemPromt();" />'
      );
    }
  }

  loadListContent(data);
}

function reloadItem(key, value) {
  var commandid = getParameterByName('commandid');
  $.getJSON("api/v1/command?id=" + encodeURIComponent(commandid), function(data) {
      if(key == 'list') {
        loadListContent(data)
      } else {
        $('#' + key + '_value').empty();
        if(value) {
          $('#' + key + '_value').append(value.toString());
        } else {
          $('#' + key + '_value').append(data.data[key].toString());
        }
      }
  });
}

function loadListContent(data) {
  $('#clist').empty();
  $('#sclist').empty();
  if(data.data.listContent.length != 0) {
    if(checkCommandPower(authResponse.commandpower, 25)) {
      $('#clist').append($('<tr class="header"></tr>').append(
        '<td>List ID</td>'
      )
      .append('<td>Edit</td>'));
    } else {
      $('#clist').append($('<tr></tr>').append(
        '<td>List ID</td>'
      ).append('<td>List Content</td>'));
    }

    $.each(data.data.listContent, function(key, val) {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        var editAction = '';
        var updateButton = '<input class="remove_button" id='
        + key + ' type="button" value="Update" onclick="editListItemPromt(this.id);" />';

        var addCounterButton = '<input class="remove_button" id='
        + key + ' type="button" value="Counter"' +
        'onclick="addText(\'#\' + this.id + \'_text_list\', \'{counter}\');" />';

        var addSenderButton = '<input class="remove_button" id='
        + key + ' type="button" value="Sender Name"' +
        'onclick="addText(\'#\' + this.id + \'_text_list\', \'{sender}\');" />';

        var removeButton = '<input class="remove_button" id=' + key + ' type="button" value="Remove" onclick="removeListItemPromt(this.id);" />'

        var textArea = '<textarea id=' + key + '_text_list>' + val.text + '</textarea>';

        editAction = textArea + '</br>' + updateButton + addCounterButton +
        addSenderButton + removeButton;

        $('#clist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>'
          ).append($('<td></td>').append(
              editAction
          ))
        );
      } else {
        $('#clist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val.text + '</td>'
          )
        );
      }
    });
  }

  if(data.data.suggestedList.length != 0) {
    if(checkCommandPower(authResponse.commandpower, 25)) {
      $('#sclist').append($('<tr class="header"></tr>').append(
        '<td>Suggested List ID</td><td>Added By</td>'
      ).append('<td>Suggested List Content</td>').append('<td>Approve</td>').append('<td>Deny</td>'));
    } else {
      $('#sclist').append($('<tr></tr>').append(
        '<td>Suggested List ID</td><td>Added By</td>'
      ).append('<td>Suggested List Content</td>'));
    }

    $.each(data.data.suggestedList, function(key, val) {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        var addedByName = undefined;
        if(val.metaData) {
          addedByName = val.metaData.addedByName;
        }
        $('#sclist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td><td>' + addedByName + '</td>' + '<td>' + val.text + '</td>'
          ).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Approve" onclick="editSuggestedListItemPromt(this.id);" />'
          )).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Deny" onclick="removeSuggestedListItemPromt(this.id);" />'
          ))
        );
      } else {
        $('#sclist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td><td>' + addedByName + '</td>' + '<td>' + val.text + '</td>'
          )
        );
      }
    });
  }
}
