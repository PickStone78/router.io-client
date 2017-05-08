const $ = require("jquery");
const router = require("../../../router.io.client")('http://localhost:3000');

var publishChannel = router.publish('test');

var subscribeChannel = router.subscribe('test', function(data) {
  $('#messages').append($('<li>').text(data));
});

$(document).ready(function() {
  $('#btn').click(function() {
    var message = $('#m').val();
    console.log(message);
    publishChannel.then((channel) => {
      channel.push(message);
    });

    $('#m').val('');
  });
});
