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

  var commandid = getParameterByName('commandid');
  if(typeof commandid === 'undefined') {
    page = 1;
  }

  getAppInfo(function(data, appinfo) {
    $.getJSON("api/v1/command?id=" + encodeURIComponent(commandid), function(data) {
      checkAuth(function(data2) {
        authResponse = data2;
        parseQueryData(data);
      }, data.data.ownerChannelID);
    });
  });
}

function parseQueryData(data) {
  $.each(data.data, function(key, val) {
    if(key != 'listContent' && key != 'suggestedList') {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        $('#ccontent').append(
            $('<tr></tr>').append(
              '<td>' + key + '</td>'
            ).append('<td>' + val + '</td>')
            .append('<td>' +
            '<input class="remove_button" id=' + key + ' type="button" value="Edit Item" onclick="editOptionPromt(this.id);" />'
             + '</td>')
        );
      } else {
        $('#ccontent').append(
            $('<tr></tr>').append(
              '<td>' + key + '</td>'
            ).append('<td>' + val + '</td>')
        );
      }
    }
  });

  if(checkCommandPower(authResponse.commandpower, 25)) {
    $('#ccontent').append(
      '<input class="remove_button" id=addlistitem type="button" value="New List Item" onclick="newListItemPromt();" />'
    );
  }

  if(data.data.listContent.length != 0) {
    if(checkCommandPower(authResponse.commandpower, 25)) {
      $('#clist').append($('<tr></tr>').append(
        '<td>List ID</td>'
      ).append('<td>List Content</td>')
      .append('<td>Edit</td>')
      .append('<td>Remove</td>'));
    } else {
      $('#clist').append($('<tr></tr>').append(
        '<td>List ID</td>'
      ).append('<td>List Content</td>'));
    }

    $.each(data.data.listContent, function(key, val) {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        $('#clist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          ).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Edit" onclick="editListItemPromt(this.id);" />'
          )).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Remove" onclick="removeListItemPromt(this.id);" />'
          ))
        );
      } else {
        $('#clist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          )
        );
      }
    });
  }

  if(data.data.suggestedList.length != 0) {
    if(checkCommandPower(authResponse.commandpower, 25)) {
      $('#sclist').append($('<tr></tr>').append(
        '<td>Suggested List ID</td>'
      ).append('<td>Suggested List Content</td>').append('<td>Approve</td>').append('<td>Deny</td>'));
    } else {
      $('#sclist').append($('<tr></tr>').append(
        '<td>Suggested List ID</td>'
      ).append('<td>Suggested List Content</td>'));
    }

    $.each(data.data.suggestedList, function(key, val) {
      if(checkCommandPower(authResponse.commandpower, 25)) {
        $('#sclist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          ).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Approve" onclick="editSuggestedListItemPromt(this.id);" />'
          )).append($('<td></td>').append(
              '<input class="remove_button" id=' + key + ' type="button" value="Deny" onclick="removeSuggestedListItemPromt(this.id);" />'
          ))
        );
      } else {
        $('#sclist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          )
        );
      }
    });
  }
}
