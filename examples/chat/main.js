const $ = require("jquery");
const router = require("../../../router.io-client")('http://localhost:3000');

router.on('publish', (data) => {
  console.log(`Constructed published channel: "${data}"`);
});

router.on('subscribe', (data) => {
  console.log(`Constructed subscribe channel: "${data}"`);
});

var publishChannel = router.publish('test');
publishChannel.on('push', (data) => {
  console.log(`Pushed: "${data}"`);
});

var subscribeChannel = router.subscribe('test', function(data) {
  $('#messages').append($('<li>').text(data));
});

$(document).ready(function() {
  $('#btn').click(function() {
    var message = $('#m').val();
    console.log(message);
    publishChannel.push(message);

    $('#m').val('');
  });
});
