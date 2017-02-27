$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
    socket.on('chat', function (data) {
        var time = new Date(data.time);
        $('#sitecontent').append(
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
                $('<span>').text(data.text))
        );
        // scroll down
        $('body').scrollTop($('body')[0].scrollHeight);
    });
    // send message
    function senden(){
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
            senden();
        }
    });
});
