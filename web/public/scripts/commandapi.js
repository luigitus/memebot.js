function removeCommandPopup(commandid) {
  if(confirm('Are you sure?')) {
    var cookie = {};
    cookie = JSON.parse(getCookieByName('login', document.cookie));
    var request = 'api/v1/removecommand?'
    var payload = 'channelid=' + getParameterByName('channelid') +
    '&commandid=' + encodeURIComponent(commandid) + '&oauth_token=' + cookie.access_token;

    $.getJSON(request + payload, function(data) {
      commandquery();
      $('#status').append(data.data[0]);
    });
  }
}

function newCommandPromt() {
  var name = prompt("Please enter new command's name:", '');
  if(name == null) {
    return;
  }
  var output = prompt("Please enter new command's output:", '');
  if(output == null) {
    return;
  }
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/addcommand?'
  var payload = 'channelid=' + getParameterByName('channelid') +
  '&name=' + encodeURIComponent(name) + '&output=' + encodeURIComponent(output) + '&oauth_token=' + cookie.access_token;

  $.getJSON(request + payload, function(data) {
    commandquery();
    $('#status').append(data.data[0]);
  });
}

function editOptionPromt(option) {
  var newValue = prompt("Please enter new value", '');
  if(newValue == null) {
    return;
  }
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/editcommand?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=' + encodeURIComponent(option)
  + '&newvalue=' + encodeURIComponent(newValue)
  + '&oauth_token=' + cookie.access_token;
  if(option == 'output' || option == 'name' || option == 'types' || option == 'helptext') {
    payload = payload + '&editoption=' + encodeURIComponent('edit') + '&optionid=' + '0';
  }

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}

function newListItemPromt() {
  var newValue = prompt("Please enter new item", '');
  if(newValue == null) {
    return;
  }
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/listcall?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=add'
  + '&newvalue=' + encodeURIComponent(newValue)
  + '&oauth_token=' + cookie.access_token;

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}

function editListItemPromt(id) {
  var newValue = prompt("Please enter new item", '');
  if(newValue == null) {
    return;
  }
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/listcall?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=edit'
  + '&newvalue=' + encodeURIComponent(newValue)
  + '&oauth_token=' + cookie.access_token
  + '&listid=' + id;

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}

function removeListItemPromt(id) {
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/listcall?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=remove'
  + '&oauth_token=' + cookie.access_token
  + '&listid=' + id;

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}

function editSuggestedListItemPromt(id) {
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/listcall?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=approve'
  + '&oauth_token=' + cookie.access_token
  + '&listid=' + id;

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}

function removeSuggestedListItemPromt(id) {
  var cookie = {};

  cookie = JSON.parse(getCookieByName('login', document.cookie));
  var request = 'api/v1/listcall?'
  var payload = 'channelid=' + channelid +
  '&commandid=' + getParameterByName('commandid')
  + '&option=deny'
  + '&oauth_token=' + cookie.access_token
  + '&listid=' + id;

  $.getJSON(request + payload, function(data) {
    commandviewquery();
    $('#status').append(data.data[0]);
  });
}
