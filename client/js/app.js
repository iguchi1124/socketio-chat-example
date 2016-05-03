var $ = require("jquery");
var io = require("socket.io-client");
var socket = io();

require("style!css!less!../css/app.less");

$("#app").html(require("jade!../jade/lobby.jade"));

$('form').submit(function(){
  socket.emit('username', $('#username').val());

  $('#username').val('');
  return false;
});

socket.on('entered', function(name){
  $("#app").html(require("jade!../jade/app.jade"));
  $('#messages').append($('<li>').text(name + ' joined room.'));

  $('form').submit(function(){
    socket.emit('message', $('#new-message').val());

    $('#new-message').val('');
    return false;
  });

  socket.on('message', function(msg) {
    $('#messages').append($('<li>').text(name + ': ' + msg));
  });
})
