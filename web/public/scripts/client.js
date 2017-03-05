var imageCounter = 0;

$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
    socket.on('chat', function (data) {
      var time = new Date(data.time);
      $('#echolist').append(
        $('<li></li>').append(
          // time
          $('<span>').text('[' +
              (time.getHours() < 10 ? '0' + time.getHours() : time.getHours())
              + ':' +
              (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
              + '] '
          ),
          // Name
          $('<b>').text(typeof(data.name) != 'undefined' ? data.name + ': ' : ''),
          // Text
          $('<span>').text(data.text)
        )
      );
      // scroll down
      $('body').scrollTop($('body')[0].scrollHeight);
    });
    socket.on('executed', function (data) {
      // do stuff
      if(data._id == getParameterByName('id')) {
        // test
        if(data.name[0] == 'SlipperyCocks') {
          var height = $(window).height();
          var width = $(window).width();
          $('#content').append(
            '<img id=' + imageCounter + ' src="./images/private/1.png" style="position:absolute;background-color:transparent;">'
          )
          var x = getRandomInt(0, width);
          var y = getRandomInt(0, height);
          console.log(x, y);
          $("#" + imageCounter).css({ 'left': x + 'px', 'top': y + 'px' });
          imageCounter++;
        }
      }
    });
    // send message
    function send(){
      // read input
      var name = $('#name').val();
      var text = $('#text').val();
      // send socket
      socket.emit('chat', { name: name, text: text });
      // clear text field
      $('#text').val('');
    }
    // click
    $('#send').click(send);
    // enter key
    $('#text').keypress(function (e) {
      if (e.which == 13) {
          send();
      }
    });
});
