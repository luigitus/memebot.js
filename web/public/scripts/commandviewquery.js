$(document).ready(function() {
  var commandid = getParameterByName('commandid');
  if(typeof commandid === 'undefined') {
    page = 1;
  }
  getAppInfo(function(data, appinfo) {
    $.getJSON("api/v1/command?id=" + encodeURIComponent(commandid), function(data) {
      $('#ccontent').append(
          $('<li></li>').append(
            'Names: ' + data.data.name
          )
      );
      $('#ccontent').append(
          $('<li></li>').append(
            'ID: ' + data.data._id
          )
      );
      $('#ccontent').append(
          $('<li></li>').append(
            'Global Cooldown: ' + data.data.cooldownLength
          )
      );
      $('#ccontent').append(
          $('<li></li>').append(
            'Cooldown per user: ' + data.data.userCooldownLenght
          )
      );
      $('#ccontent').append(
          $('<li></li>').append(
            'Needed command power: ' + data.data.requriedCommandPower
          )
      );
      $.each(data.data.listContent, function(key, val) {
        $('#clist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          )
        );
      });
      $.each(data.data.suggestedList, function(key, val) {
        $('#sclist').append(
          $('<tr></tr>').append(
            '<td>' + key + '</td>' + '<td>' + val + '</td>'
          )
        );
      });
    });
  });
});
