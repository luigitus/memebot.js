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

    // generic command execute (test)
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

    // doggy race script
    socket.on('doggy_started', function (data) {
      var finishedCounter = 0;
      if(data._id == getParameterByName('id')) {
        if(data.playBeginning) {
          var audio = new Audio('./sounds/private/doggo_start.wav');
          audio.play();
          audio.addEventListener('ended', function() {
            if(data.playLoop) {
              audio = new Audio('./sounds/private/doggo_loop.wav');
              audio.play();
              audio.addEventListener('ended', function() {
                audio.play();
              })
            }
          })
        }
        for(var key in data.dogList) {
          var dog = data.dogList[key];
          $('#content').append($('<div></div>').attr('id', key).append($('<figure></figure>').append(
              '<img id=' + key + '_img ' + 'src="./images/private/' + key + '_doggo.png" style="position:absolute;background-color:transparent;"></img>'
              + '<figcaption>' + dog.name[getRandomInt(0, name.length)] + '</figcaption>' + '</br></br>'
              )
            )
          );
          var index = data.nextResult.indexOf(key)
          var speed = index * 8000;
          if(isNaN(speed) || speed < 8000 || index == -1) {
            speed = 8000;
          }
          console.log(data.nextResult);
          console.log(speed, data.nextResult.indexOf(key));

          var moveMod = 1;

          $("#" + key).css({'padding-bottom' : '1em', 'position' : 'relative', 'height' : '100%', 'width' : '100%'});
          $("#" + key + '_img').css({'transform': 'scaleX(-1)', 'height' : '80%', 'width' : '5%'});
          $( "#" + key ).animate({
            left: '+=' + $(document).width() + 'px'
          },{duration : speed,
            step : function() {
              //$(this).animate({top: '+=' + (1000 * moveMod) + 'px'}, 10);
              //moveMod = moveMod * -1;
          },
          complete: function() {
            finishedCounter++;
            if(finishedCounter >= data.nextResult.length) {
              socket.emit('doggy_finished', data);
              if(typeof audio !== 'undefined') {
                audio.pause();
              }
              if(data.playEnd) {
                var end_audio = new Audio('./sounds/private/doggy_end.mp3');
                end_audio.play();
              }
              $('#content').empty();
            }
          }});
        }
        // tell bot race animation has finished
      }
    }),


    // send message
    function send() {
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
