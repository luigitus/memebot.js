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
      $.each(data.data, function(key, val) {
        if(key != 'listContent' && key != 'suggestedList' && key != 'name') {
          $('#ccontent').append(
              $('<li></li>').append(
                key + ': ' + val
              )
          );
        }
      });
      if(data.data.listContent.length != 0) {
        $.each(data.data.listContent, function(key, val) {
          $('#clist').append(
            $('<tr></tr>').append(
              '<td>' + key + '</td>' + '<td>' + val + '</td>'
            )
          );
        });
      }
      if(data.data.suggestedList.length != 0) {
        $.each(data.data.suggestedList, function(key, val) {
          $('#sclist').append(
            $('<tr></tr>').append(
              '<td>' + key + '</td>' + '<td>' + val + '</td>'
            )
          );
        });
      }

    });
  });
});
