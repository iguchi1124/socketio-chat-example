var $ = require("jquery");

require("style!css!less!../css/app.less");
$("#app").html(require("jade!../jade/app.jade"));

var io = require("socket.io-client");
var socket = io();

$('form').submit(function(){
  socket.emit('message', $('#new-message').val());

  $('#new-message').val('');
  return false;
});

socket.on('message', function(msg) {
  $('#messages').append($('<li>').text(msg));
});
